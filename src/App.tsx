import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import Exams from "./pages/Exams";
import Fees from "./pages/Fees";
import Library from "./pages/Library";
import Classes from "./pages/Classes";
import Subjects from "./pages/Subjects";
import Employees from "./pages/Employees";
import Salary from "./pages/Salary";
import Timetable from "./pages/Timetable";
import Homework from "./pages/Homework";
import Accounts from "./pages/Accounts";
import SettingsPage from "./pages/Settings";
import Reports from "./pages/Reports";
import { WhatsApp, SMS, LiveClass, OnlineStore, QuestionPaper, ClassTests, BehaviorSkills, Certificates, Messaging } from "./pages/PlaceholderPages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!session) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const P = ({ children }: { children: React.ReactNode }) => <ProtectedRoute>{children}</ProtectedRoute>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<P><Dashboard /></P>} />
            <Route path="/settings" element={<P><SettingsPage /></P>} />
            <Route path="/classes" element={<P><Classes /></P>} />
            <Route path="/subjects" element={<P><Subjects /></P>} />
            <Route path="/students" element={<P><Students /></P>} />
            <Route path="/employees" element={<P><Employees /></P>} />
            <Route path="/attendance" element={<P><Attendance /></P>} />
            <Route path="/timetable" element={<P><Timetable /></P>} />
            <Route path="/homework" element={<P><Homework /></P>} />
            <Route path="/exams" element={<P><Exams /></P>} />
            <Route path="/question-paper" element={<P><QuestionPaper /></P>} />
            <Route path="/class-tests" element={<P><ClassTests /></P>} />
            <Route path="/reports" element={<P><Reports /></P>} />
            <Route path="/certificates" element={<P><Certificates /></P>} />
            <Route path="/accounts" element={<P><Accounts /></P>} />
            <Route path="/fees" element={<P><Fees /></P>} />
            <Route path="/salary" element={<P><Salary /></P>} />
            <Route path="/behavior" element={<P><BehaviorSkills /></P>} />
            <Route path="/library" element={<P><Library /></P>} />
            <Route path="/messaging" element={<P><Messaging /></P>} />
            <Route path="/whatsapp" element={<P><WhatsApp /></P>} />
            <Route path="/sms" element={<P><SMS /></P>} />
            <Route path="/live-class" element={<P><LiveClass /></P>} />
            <Route path="/online-store" element={<P><OnlineStore /></P>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
