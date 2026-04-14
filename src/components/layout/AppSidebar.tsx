import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, ClipboardCheck, FileText, DollarSign, BookOpen, LogOut, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/students", label: "Students", icon: Users },
  { to: "/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/exams", label: "Examinations", icon: FileText },
  { to: "/fees", label: "Fee Collection", icon: DollarSign },
  { to: "/library", label: "Library", icon: BookOpen },
];

export const AppSidebar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sidebar-primary-foreground font-bold text-lg leading-tight">SchoolSphere</h1>
          <p className="text-sidebar-foreground text-xs opacity-60">Pro Management</p>
        </div>
      </div>
      <nav className="flex-1 px-3 space-y-1 mt-4">
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-xs font-bold">
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <span className="text-sidebar-foreground text-sm truncate">{user?.email || "User"}</span>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
