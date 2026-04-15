import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Reports = () => {
  const { data: students = [] } = useQuery({
    queryKey: ["students-all"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*").order("full_name");
      return data || [];
    },
  });

  const { data: grades = [] } = useQuery({
    queryKey: ["all-grades"],
    queryFn: async () => {
      const { data } = await supabase.from("grades").select("*, exams(name, subject, total_marks)");
      return data || [];
    },
  });

  const studentGrades = students.map((s: any) => {
    const sGrades = grades.filter((g: any) => g.student_id === s.id);
    const avg = sGrades.length > 0 ? sGrades.reduce((sum: number, g: any) => sum + (g.marks_obtained / (g.exams?.total_marks || 100)) * 100, 0) / sGrades.length : 0;
    return { ...s, gradeCount: sGrades.length, avgPercentage: avg };
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Card>
          <CardHeader><CardTitle>Student Performance Overview</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>USN</TableHead><TableHead>Class</TableHead><TableHead>Exams Taken</TableHead><TableHead>Avg %</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
              <TableBody>
                {studentGrades.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.full_name}</TableCell>
                    <TableCell>{s.usn}</TableCell>
                    <TableCell>{s.class}-{s.section}</TableCell>
                    <TableCell>{s.gradeCount}</TableCell>
                    <TableCell>{s.avgPercentage.toFixed(1)}%</TableCell>
                    <TableCell>
                      <Badge variant={s.avgPercentage >= 60 ? "default" : s.avgPercentage >= 35 ? "secondary" : "destructive"}>
                        {s.avgPercentage >= 90 ? "A+" : s.avgPercentage >= 80 ? "A" : s.avgPercentage >= 70 ? "B+" : s.avgPercentage >= 60 ? "B" : s.avgPercentage >= 50 ? "C" : s.avgPercentage >= 35 ? "D" : "F"}
                      </Badge>
                    </TableCell>
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

export default Reports;
