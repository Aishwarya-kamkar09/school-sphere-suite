import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

const Salary = () => {
  const [month, setMonth] = useState("2026-04");
  const qc = useQueryClient();

  const { data: salaries = [] } = useQuery({
    queryKey: ["salary", month],
    queryFn: async () => {
      const { data } = await supabase.from("salary").select("*, employees(full_name, designation, department)").eq("month", month).order("created_at");
      return data || [];
    },
  });

  const payMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("salary").update({ status: "paid", paid_date: new Date().toISOString().split("T")[0] }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["salary"] }); toast.success("Salary paid"); },
    onError: (e) => toast.error(e.message),
  });

  const totalPaid = salaries.filter((s: any) => s.status === "paid").reduce((sum: number, s: any) => sum + Number(s.amount), 0);
  const totalPending = salaries.filter((s: any) => s.status === "pending").reduce((sum: number, s: any) => sum + Number(s.amount), 0);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Salary Management</h1>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2026-04">April 2026</SelectItem>
              <SelectItem value="2026-03">March 2026</SelectItem>
              <SelectItem value="2026-02">February 2026</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Paid</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-success">₹{totalPaid.toLocaleString()}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-warning">₹{totalPending.toLocaleString()}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Records</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{salaries.length}</div></CardContent></Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Designation</TableHead><TableHead>Department</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Paid Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {salaries.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.employees?.full_name}</TableCell>
                    <TableCell>{s.employees?.designation}</TableCell>
                    <TableCell>{s.employees?.department}</TableCell>
                    <TableCell>₹{Number(s.amount).toLocaleString()}</TableCell>
                    <TableCell><Badge variant={s.status === "paid" ? "default" : "destructive"}>{s.status}</Badge></TableCell>
                    <TableCell>{s.paid_date || "-"}</TableCell>
                    <TableCell>
                      {s.status === "pending" && (
                        <Button size="sm" onClick={() => payMutation.mutate(s.id)} disabled={payMutation.isPending}>
                          <CheckCircle className="w-4 h-4 mr-1" />Pay
                        </Button>
                      )}
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

export default Salary;
