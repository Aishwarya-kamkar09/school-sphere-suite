import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Timetable = () => {
  const [classFilter, setClassFilter] = useState("10");
  const [sectionFilter, setSectionFilter] = useState("A");

  const { data: timetable = [] } = useQuery({
    queryKey: ["timetable", classFilter, sectionFilter],
    queryFn: async () => {
      const { data } = await supabase.from("timetable").select("*").eq("class", classFilter).eq("section", sectionFilter).order("period");
      return data || [];
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-3xl font-bold">Timetable</h1>
          <div className="flex gap-2">
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["1","2","3","5","9","10"].map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["A","B","C"].map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {days.map((day) => {
          const daySchedule = timetable.filter((t: any) => t.day === day);
          if (daySchedule.length === 0) return null;
          return (
            <Card key={day}>
              <CardHeader className="pb-2"><CardTitle>{day}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Period</TableHead><TableHead>Time</TableHead><TableHead>Subject</TableHead><TableHead>Teacher</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {daySchedule.map((t: any) => (
                      <TableRow key={t.id}>
                        <TableCell><Badge>{t.period}</Badge></TableCell>
                        <TableCell>{t.start_time} - {t.end_time}</TableCell>
                        <TableCell className="font-medium">{t.subject}</TableCell>
                        <TableCell>{t.teacher || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
        {timetable.length === 0 && <p className="text-muted-foreground text-center py-8">No timetable entries found for this class.</p>}
      </div>
    </AppLayout>
  );
};

export default Timetable;
