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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Receipt, DollarSign, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const Fees = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ student_id: "", fee_type: "Tuition", amount: "", due_date: "" });
  const [receiptView, setReceiptView] = useState<any>(null);
  const qc = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ["students-all"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*").order("full_name");
      return data || [];
    },
  });

  const { data: fees = [] } = useQuery({
    queryKey: ["fees", search],
    queryFn: async () => {
      const { data } = await supabase.from("fees").select("*, students(full_name, usn, class, section)").order("due_date", { ascending: false });
      if (!data) return [];
      if (search.trim()) {
        return data.filter((f: any) =>
          f.students?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          f.students?.usn?.toLowerCase().includes(search.toLowerCase())
        );
      }
      return data;
    },
  });

  const addFee = useMutation({
    mutationFn: async (data: typeof form) => {
      const { error } = await supabase.from("fees").insert({
        student_id: data.student_id,
        fee_type: data.fee_type,
        amount: Number(data.amount),
        due_date: data.due_date,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fees"] });
      qc.invalidateQueries({ queryKey: ["pending-fees"] });
      toast.success("Fee added");
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const markPaid = useMutation({
    mutationFn: async (feeId: string) => {
      const receipt = `RCP-${Date.now().toString(36).toUpperCase()}`;
      const { error } = await supabase.from("fees").update({
        status: "paid",
        paid_date: new Date().toISOString().split("T")[0],
        receipt_number: receipt,
      }).eq("id", feeId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fees"] });
      qc.invalidateQueries({ queryKey: ["pending-fees"] });
      toast.success("Payment recorded");
    },
    onError: (e) => toast.error(e.message),
  });

  const totalPending = fees.filter((f: any) => f.status === "pending").reduce((sum: number, f: any) => sum + Number(f.amount), 0);
  const totalPaid = fees.filter((f: any) => f.status === "paid").reduce((sum: number, f: any) => sum + Number(f.amount), 0);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Fee Collection</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Fee</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Fee</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); addFee.mutate(form); }} className="space-y-3">
                <div>
                  <Label>Student</Label>
                  <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                    <SelectContent>
                      {students.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name} ({s.usn})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Fee Type</Label><Input value={form.fee_type} onChange={(e) => setForm({ ...form, fee_type: e.target.value })} required /></div>
                <div><Label>Amount (₹)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
                <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required /></div>
                <Button type="submit" className="w-full" disabled={addFee.isPending}>Add Fee</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Collected</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-success">₹{totalPaid.toLocaleString()}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending Amount</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-warning">₹{totalPending.toLocaleString()}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Records</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{fees.length}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by student name or USN..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.map((f: any) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.students?.full_name}</TableCell>
                    <TableCell>{f.students?.class}-{f.students?.section}</TableCell>
                    <TableCell>{f.fee_type}</TableCell>
                    <TableCell>₹{Number(f.amount).toLocaleString()}</TableCell>
                    <TableCell>{f.due_date}</TableCell>
                    <TableCell>
                      <Badge variant={f.status === "paid" ? "default" : "destructive"}>
                        {f.status === "paid" ? "Paid" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>{f.receipt_number || "-"}</TableCell>
                    <TableCell>
                      {f.status === "pending" && (
                        <Button size="sm" onClick={() => markPaid.mutate(f.id)} disabled={markPaid.isPending}>
                          <CheckCircle className="w-4 h-4 mr-1" />Pay
                        </Button>
                      )}
                      {f.status === "paid" && (
                        <Button size="sm" variant="outline" onClick={() => setReceiptView(f)}>
                          <Receipt className="w-4 h-4 mr-1" />Receipt
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={!!receiptView} onOpenChange={() => setReceiptView(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Fee Receipt</DialogTitle></DialogHeader>
            {receiptView && (
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="text-center border-b pb-3">
                  <h2 className="text-lg font-bold">SchoolSphere Pro</h2>
                  <p className="text-sm text-muted-foreground">Fee Receipt</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Receipt No:</span> {receiptView.receipt_number}</div>
                  <div><span className="text-muted-foreground">Date:</span> {receiptView.paid_date}</div>
                  <div><span className="text-muted-foreground">Student:</span> {receiptView.students?.full_name}</div>
                  <div><span className="text-muted-foreground">USN:</span> {receiptView.students?.usn}</div>
                  <div><span className="text-muted-foreground">Fee Type:</span> {receiptView.fee_type}</div>
                  <div><span className="text-muted-foreground">Amount:</span> ₹{Number(receiptView.amount).toLocaleString()}</div>
                </div>
                <div className="text-center pt-3 border-t">
                  <Badge>PAID</Badge>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Fees;
