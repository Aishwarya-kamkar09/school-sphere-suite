import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Student = {
  id: string;
  full_name: string;
  admission_no: string;
  usn: string;
  class: string;
  section: string;
  roll_number: string;
  parent_name: string | null;
  parent_email: string | null;
  status: string;
};

const emptyForm = { full_name: "", admission_no: "", usn: "", class: "", section: "", roll_number: "", parent_name: "", parent_email: "", status: "active" };

const Students = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyForm);
  const qc = useQueryClient();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students", search],
    queryFn: async () => {
      let q = supabase.from("students").select("*").order("full_name");
      if (search.trim()) {
        q = q.or(`full_name.ilike.%${search}%,usn.ilike.%${search}%,admission_no.ilike.%${search}%`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data as Student[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (editing) {
        const { error } = await supabase.from("students").update(data).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("students").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["students-count"] });
      toast.success(editing ? "Student updated" : "Student added");
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["students-count"] });
      toast.success("Student deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (s: Student) => {
    setEditing(s);
    setForm({ full_name: s.full_name, admission_no: s.admission_no, usn: s.usn, class: s.class, section: s.section, roll_number: s.roll_number, parent_name: s.parent_name || "", parent_email: s.parent_email || "", status: s.status });
    setOpen(true);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Students</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Student</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Student</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>Full Name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /></div>
                <div><Label>Admission No</Label><Input value={form.admission_no} onChange={(e) => setForm({ ...form, admission_no: e.target.value })} required /></div>
                <div><Label>USN</Label><Input value={form.usn} onChange={(e) => setForm({ ...form, usn: e.target.value })} required /></div>
                <div><Label>Class</Label><Input value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} required /></div>
                <div><Label>Section</Label><Input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} required /></div>
                <div><Label>Roll Number</Label><Input value={form.roll_number} onChange={(e) => setForm({ ...form, roll_number: e.target.value })} required /></div>
                <div><Label>Status</Label><Input value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} /></div>
                <div><Label>Parent Name</Label><Input value={form.parent_name} onChange={(e) => setForm({ ...form, parent_name: e.target.value })} /></div>
                <div><Label>Parent Email</Label><Input type="email" value={form.parent_email} onChange={(e) => setForm({ ...form, parent_email: e.target.value })} /></div>
                <div className="col-span-2"><Button type="submit" className="w-full" disabled={saveMutation.isPending}>{editing ? "Update" : "Add"} Student</Button></div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by name, USN or admission no..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Badge variant="secondary">{students.length} students</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground py-8 text-center">Loading...</p>
            ) : students.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No students found</p>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>USN</TableHead>
                      <TableHead>Admission No</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Roll</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.full_name}</TableCell>
                        <TableCell>{s.usn}</TableCell>
                        <TableCell>{s.admission_no}</TableCell>
                        <TableCell>{s.class}</TableCell>
                        <TableCell>{s.section}</TableCell>
                        <TableCell>{s.roll_number}</TableCell>
                        <TableCell>{s.parent_name || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Students;
