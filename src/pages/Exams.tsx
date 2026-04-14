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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

const emptyExam = { name: "", class: "", section: "", subject: "", date: "", total_marks: 100 };

const Exams = () => {
  const [open, setOpen] = useState(false);
  const [gradesOpen, setGradesOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyExam);
  const qc = useQueryClient();

  const { data: exams = [] } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const { data } = await supabase.from("exams").select("*").order("date", { ascending: false });
      return data || [];
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students-all"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*").eq("status", "active").order("full_name");
      return data || [];
    },
  });

  const { data: grades = [] } = useQuery({
    queryKey: ["grades", selectedExam],
    queryFn: async () => {
      if (!selectedExam) return [];
      const { data } = await supabase.from("grades").select("*").eq("exam_id", selectedExam);
      return data || [];
    },
    enabled: !!selectedExam,
  });

  const examMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const payload = { ...data, total_marks: Number(data.total_marks) };
      if (editing) {
        const { error } = await supabase.from("exams").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("exams").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exams"] });
      toast.success(editing ? "Exam updated" : "Exam created");
      setOpen(false);
      setEditing(null);
      setForm(emptyExam);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteExam = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("exams").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["exams"] }); toast.success("Exam deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const gradeMutation = useMutation({
    mutationFn: async ({ examId, studentId, marks }: { examId: string; studentId: string; marks: number }) => {
      const exam = exams.find((e) => e.id === examId);
      const grade = marks >= (exam?.total_marks || 100) * 0.9 ? "A+" : marks >= (exam?.total_marks || 100) * 0.8 ? "A" : marks >= (exam?.total_marks || 100) * 0.7 ? "B+" : marks >= (exam?.total_marks || 100) * 0.6 ? "B" : marks >= (exam?.total_marks || 100) * 0.5 ? "C" : marks >= (exam?.total_marks || 100) * 0.35 ? "D" : "F";
      const existing = grades.find((g) => g.student_id === studentId);
      if (existing) {
        const { error } = await supabase.from("grades").update({ marks_obtained: marks, grade }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("grades").insert({ exam_id: examId, student_id: studentId, marks_obtained: marks, grade });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grades", selectedExam] });
      toast.success("Grade saved");
    },
    onError: (e) => toast.error(e.message),
  });

  const examStudents = selectedExam ? students.filter((s) => {
    const exam = exams.find((e) => e.id === selectedExam);
    return exam && s.class === exam.class && (!exam.section || s.section === exam.section);
  }) : [];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Examinations</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditing(null); setForm(emptyExam); }}><Plus className="w-4 h-4 mr-2" />Create Exam</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Edit" : "Create"} Exam</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); examMutation.mutate(form); }} className="space-y-3">
                <div><Label>Exam Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Class</Label><Input value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} required /></div>
                  <div><Label>Section</Label><Input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} /></div>
                </div>
                <div><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
                  <div><Label>Total Marks</Label><Input type="number" value={form.total_marks} onChange={(e) => setForm({ ...form, total_marks: Number(e.target.value) })} required /></div>
                </div>
                <Button type="submit" className="w-full" disabled={examMutation.isPending}>{editing ? "Update" : "Create"} Exam</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="exams">
          <TabsList>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="grades" disabled={!selectedExam}>Enter Grades</TabsTrigger>
          </TabsList>
          <TabsContent value="exams">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total Marks</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.name}</TableCell>
                        <TableCell>{exam.subject}</TableCell>
                        <TableCell>{exam.class}{exam.section ? `-${exam.section}` : ""}</TableCell>
                        <TableCell>{exam.date}</TableCell>
                        <TableCell>{exam.total_marks}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => { setSelectedExam(exam.id); }}><Eye className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => {
                              setEditing(exam);
                              setForm({ name: exam.name, class: exam.class, section: exam.section || "", subject: exam.subject, date: exam.date, total_marks: exam.total_marks });
                              setOpen(true);
                            }}><Pencil className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => deleteExam.mutate(exam.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="grades">
            <Card>
              <CardHeader>
                <CardTitle>Grades for: {exams.find((e) => e.id === selectedExam)?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>USN</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examStudents.map((s) => {
                      const g = grades.find((gr) => gr.student_id === s.id);
                      return (
                        <TableRow key={s.id}>
                          <TableCell>{s.full_name}</TableCell>
                          <TableCell>{s.usn}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-20"
                              defaultValue={g?.marks_obtained ?? ""}
                              min={0}
                              max={exams.find((e) => e.id === selectedExam)?.total_marks || 100}
                              onBlur={(e) => {
                                const marks = Number(e.target.value);
                                if (!isNaN(marks) && selectedExam) gradeMutation.mutate({ examId: selectedExam, studentId: s.id, marks });
                              }}
                            />
                          </TableCell>
                          <TableCell><Badge variant={g?.grade === "F" ? "destructive" : "default"}>{g?.grade || "-"}</Badge></TableCell>
                          <TableCell>{g ? "✓ Saved" : "Pending"}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Exams;
