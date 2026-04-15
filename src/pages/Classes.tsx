import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";

const emptyForm = { name: "", section: "A", capacity: 40, class_teacher: "" };

const Classes = () => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const qc = useQueryClient();
  const { isTeacher } = useUserRole();

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data } = await supabase.from("classes").select("*").order("name");
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const payload = { ...data, capacity: Number(data.capacity) };
      if (editing) {
        const { error } = await supabase.from("classes").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("classes").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["classes"] });
      toast.success(editing ? "Class updated" : "Class added");
      setOpen(false); setEditing(null); setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("classes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["classes"] }); toast.success("Class deleted"); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Classes</h1>
          {isTeacher && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditing(null); setForm(emptyForm); }}><Plus className="w-4 h-4 mr-2" />Add Class</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Class</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-3">
                  <div><Label>Class Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                  <div><Label>Section</Label><Input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} required /></div>
                  <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></div>
                  <div><Label>Class Teacher</Label><Input value={form.class_teacher} onChange={(e) => setForm({ ...form, class_teacher: e.target.value })} /></div>
                  <Button type="submit" className="w-full" disabled={saveMutation.isPending}>{editing ? "Update" : "Add"} Class</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader><TableRow><TableHead>Class</TableHead><TableHead>Section</TableHead><TableHead>Capacity</TableHead><TableHead>Class Teacher</TableHead>{isTeacher && <TableHead>Actions</TableHead>}</TableRow></TableHeader>
              <TableBody>
                {classes.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">Class {c.name}</TableCell>
                    <TableCell>{c.section}</TableCell>
                    <TableCell>{c.capacity}</TableCell>
                    <TableCell>{c.class_teacher || "-"}</TableCell>
                    {isTeacher && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setForm({ name: c.name, section: c.section, capacity: c.capacity, class_teacher: c.class_teacher || "" }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Classes;
