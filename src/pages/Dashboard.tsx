import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Users, ClipboardCheck, BookOpen, DollarSign, GraduationCap,
  AlertTriangle, TrendingUp, TrendingDown, Briefcase, Award
} from "lucide-react";

const Dashboard = () => {
  const { isTeacher } = useUserRole();

  const { data: students } = useQuery({
    queryKey: ["students-count"],
    queryFn: async () => {
      const { count } = await supabase.from("students").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: schoolInfo } = useQuery({
    queryKey: ["school-info"],
    queryFn: async () => {
      const { data } = await supabase.from("school_info").select("*").limit(1).single();
      return data;
    },
  });

  const { data: todayAttendance } = useQuery({
    queryKey: ["today-attendance"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { count } = await supabase.from("attendance").select("*", { count: "exact", head: true }).eq("date", today).eq("status", "present");
      return count || 0;
    },
  });

  const { data: bookCount } = useQuery({
    queryKey: ["books-count"],
    queryFn: async () => {
      const { count } = await supabase.from("library_books").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: pendingFees } = useQuery({
    queryKey: ["pending-fees"],
    queryFn: async () => {
      const { count } = await supabase.from("fees").select("*", { count: "exact", head: true }).eq("status", "pending");
      return count || 0;
    },
  });

  const { data: overdueBooks } = useQuery({
    queryKey: ["overdue-books"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { count } = await supabase.from("book_issues").select("*", { count: "exact", head: true }).eq("status", "issued").lt("due_date", today);
      return count || 0;
    },
  });

  const { data: employeeCount } = useQuery({
    queryKey: ["employees-count"],
    queryFn: async () => {
      const { count } = await supabase.from("employees").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: todayIncome } = useQuery({
    queryKey: ["today-income"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase.from("accounts").select("amount").eq("type", "income").eq("date", today);
      return (data || []).reduce((sum, r) => sum + Number(r.amount), 0);
    },
  });

  const { data: todayExpense } = useQuery({
    queryKey: ["today-expense"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase.from("accounts").select("amount").eq("type", "expense").eq("date", today);
      return (data || []).reduce((sum, r) => sum + Number(r.amount), 0);
    },
  });

  const { data: totalIncome } = useQuery({
    queryKey: ["total-income"],
    queryFn: async () => {
      const { data } = await supabase.from("accounts").select("amount").eq("type", "income");
      return (data || []).reduce((sum, r) => sum + Number(r.amount), 0);
    },
  });

  const { data: totalExpense } = useQuery({
    queryKey: ["total-expense"],
    queryFn: async () => {
      const { data } = await supabase.from("accounts").select("amount").eq("type", "expense");
      return (data || []).reduce((sum, r) => sum + Number(r.amount), 0);
    },
  });

  const stats = [
    { label: "Total Students", value: students ?? 0, icon: Users, color: "bg-primary" },
    { label: "Present Today", value: todayAttendance ?? 0, icon: ClipboardCheck, color: "bg-success" },
    { label: "Library Books", value: bookCount ?? 0, icon: BookOpen, color: "bg-accent" },
    { label: "Pending Fees", value: pendingFees ?? 0, icon: DollarSign, color: "bg-warning" },
    { label: "Overdue Books", value: overdueBooks ?? 0, icon: AlertTriangle, color: "bg-destructive" },
    { label: "Employees", value: employeeCount ?? 0, icon: Briefcase, color: "bg-primary" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {schoolInfo?.name || "SchoolSphere Pro"}
            </h1>
            <p className="text-muted-foreground text-sm">{schoolInfo?.address || "Welcome to your school management dashboard"}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Role: {isTeacher ? "Teacher / Admin" : "Student"} • {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <GraduationCap className="w-8 h-8 text-primary" />
        </div>

        {/* Student Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 text-primary-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Finance Overview - Teacher only */}
        {isTeacher && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-success">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" /> Today's Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">₹{(todayIncome ?? 0).toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-destructive">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-destructive" /> Today's Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">₹{(todayExpense ?? 0).toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Total Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{(totalIncome ?? 0).toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-warning">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-warning" /> Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{(totalExpense ?? 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Net: ₹{((totalIncome ?? 0) - (totalExpense ?? 0)).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
