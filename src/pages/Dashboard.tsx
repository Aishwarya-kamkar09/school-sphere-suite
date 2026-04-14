import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardCheck, BookOpen, DollarSign, GraduationCap, AlertTriangle } from "lucide-react";

const Dashboard = () => {
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

  const stats = [
    { label: "Total Students", value: students ?? 0, icon: Users, color: "bg-primary" },
    { label: "Present Today", value: todayAttendance ?? 0, icon: ClipboardCheck, color: "bg-success" },
    { label: "Library Books", value: bookCount ?? 0, icon: BookOpen, color: "bg-accent" },
    { label: "Pending Fees", value: pendingFees ?? 0, icon: DollarSign, color: "bg-warning" },
    { label: "Overdue Books", value: overdueBooks ?? 0, icon: AlertTriangle, color: "bg-destructive" },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {schoolInfo?.name || "SchoolSphere Pro"}
            </h1>
            <p className="text-muted-foreground">{schoolInfo?.address || "Welcome to your school management dashboard"}</p>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-primary-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
