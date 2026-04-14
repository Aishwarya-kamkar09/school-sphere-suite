import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Attendance = () => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [classFilter, setClassFilter] = useState("all");
  const qc = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ["students-for-attendance", classFilter],
    queryFn: async () => {
      let q = supabase.from("students").select("*").eq("status", "active").order("full_name");
      if (classFilter !== "all") q = q.eq("class", classFilter);
      const { data } = await q;
      return data || [];
    },
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ["attendance", date],
    queryFn: async () => {
      const { data } = await supabase.from("attendance").select("*").eq("date", date);
      return data || [];
    },
  });

  const markMutation = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: string; status: string }) => {
      const existing = attendance.find((a) => a.student_id === studentId);
      if (existing) {
        const { error } = await supabase.from("attendance").update({ status }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("attendance").insert({ student_id: studentId, date, status });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance", date] });
      qc.invalidateQueries({ queryKey: ["today-attendance"] });
      toast.success("Attendance updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const getStatus = (studentId: string) => attendance.find((a) => a.student_id === studentId)?.status || "unmarked";

  const classes = [...new Set(students.map((s) => s.class))].sort();

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold">Attendance</h1>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4 flex-wrap">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-48" />
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="All Classes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((c) => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Badge variant="secondary">{attendance.filter((a) => a.status === "present").length} / {students.length} present</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No students found. Add students first.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>USN</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => {
                    const st = getStatus(s.id);
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.full_name}</TableCell>
                        <TableCell>{s.usn}</TableCell>
                        <TableCell>{s.class}-{s.section}</TableCell>
                        <TableCell>
                          <Badge variant={st === "present" ? "default" : st === "absent" ? "destructive" : "secondary"}>
                            {st}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {["present", "absent", "late"].map((status) => (
                              <Button
                                key={status}
                                size="sm"
                                variant={st === status ? "default" : "outline"}
                                onClick={() => markMutation.mutate({ studentId: s.id, status })}
                                disabled={markMutation.isPending}
                              >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Attendance;
