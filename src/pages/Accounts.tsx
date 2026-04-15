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
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

const Accounts = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "income", category: "", amount: "", description: "", date: new Date().toISOString().split("T")[0] });
  const qc = useQueryClient();

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data } = await supabase.from("accounts").select("*").order("date", { ascending: false });
      return data || [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const { error } = await supabase.from("accounts").insert({ ...data, amount: Number(data.amount) });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["today-income"] });
      qc.invalidateQueries({ queryKey: ["today-expense"] });
      toast.success("Transaction added");
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const totalIncome = accounts.filter((a: any) => a.type === "income").reduce((sum: number, a: any) => sum + Number(a.amount), 0);
  const totalExpense = accounts.filter((a: any) => a.type === "expense").reduce((sum: number, a: any) => sum + Number(a.amount), 0);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Accounts</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Transaction</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Transaction</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(form); }} className="space-y-3">
                <div className="flex gap-2">
                  <Button type="button" variant={form.type === "income" ? "default" : "outline"} onClick={() => setForm({ ...form, type: "income" })}>Income</Button>
                  <Button type="button" variant={form.type === "expense" ? "default" : "outline"} onClick={() => setForm({ ...form, type: "expense" })}>Expense</Button>
                </div>
                <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></div>
                <div><Label>Amount (₹)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
                <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
                <Button type="submit" className="w-full" disabled={addMutation.isPending}>Add</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-success"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><TrendingUp className="w-4 h-4" />Total Income</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-success">₹{totalIncome.toLocaleString()}</div></CardContent></Card>
          <Card className="border-l-4 border-l-destructive"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><TrendingDown className="w-4 h-4" />Total Expenses</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">₹{totalExpense.toLocaleString()}</div></CardContent></Card>
          <Card className="border-l-4 border-l-primary"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Net Balance</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">₹{(totalIncome - totalExpense).toLocaleString()}</div></CardContent></Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader>
              <TableBody>
                {accounts.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.date}</TableCell>
                    <TableCell><Badge variant={a.type === "income" ? "default" : "destructive"}>{a.type}</Badge></TableCell>
                    <TableCell className="font-medium">{a.category}</TableCell>
                    <TableCell>{a.description || "-"}</TableCell>
                    <TableCell className={a.type === "income" ? "text-success font-bold" : "text-destructive font-bold"}>
                      {a.type === "income" ? "+" : "-"}₹{Number(a.amount).toLocaleString()}
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

export default Accounts;
