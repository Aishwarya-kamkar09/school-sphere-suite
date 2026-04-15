import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";

const emptyForm = { class: "", section: "A", subject: "", title: "", description: "", due_date: "", assigned_by: "" };

const Homework = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const qc = useQueryClient();
  const { isTeacher } = useUserRole();

  const { data: homework = [] } = useQuery({
    queryKey: ["homework"],
    queryFn: async () => {
      const { data } = await supabase.from("homework").select("*").order("due_date", { ascending: false });
      return data || [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const { error } = await supabase.from("homework").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homework"] });
      toast.success("Homework added");
      setOpen(false); setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("homework").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["homework"] }); toast.success("Deleted"); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Homework</h1>
          {isTeacher && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Homework</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Homework</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(form); }} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Class</Label><Input value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} required /></div>
                    <div><Label>Section</Label><Input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} /></div>
                  </div>
                  <div><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required /></div>
                  <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
                  <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                  <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required /></div>
                  <div><Label>Assigned By</Label><Input value={form.assigned_by} onChange={(e) => setForm({ ...form, assigned_by: e.target.value })} /></div>
                  <Button type="submit" className="w-full" disabled={addMutation.isPending}>Add Homework</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader><TableRow><TableHead>Class</TableHead><TableHead>Subject</TableHead><TableHead>Title</TableHead><TableHead>Due Date</TableHead><TableHead>Assigned By</TableHead><TableHead>Status</TableHead>{isTeacher && <TableHead>Actions</TableHead>}</TableRow></TableHeader>
              <TableBody>
                {homework.map((h: any) => (
                  <TableRow key={h.id}>
                    <TableCell>{h.class}-{h.section}</TableCell>
                    <TableCell>{h.subject}</TableCell>
                    <TableCell className="font-medium">{h.title}</TableCell>
                    <TableCell>{h.due_date}</TableCell>
                    <TableCell>{h.assigned_by || "-"}</TableCell>
                    <TableCell><Badge variant={h.due_date < new Date().toISOString().split("T")[0] ? "secondary" : "default"}>{h.status}</Badge></TableCell>
                    {isTeacher && (
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(h.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

export default Homework;
