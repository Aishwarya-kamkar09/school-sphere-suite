import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, ClipboardCheck, FileText, DollarSign, BookOpen,
  LogOut, GraduationCap, Settings, BookOpenCheck, Briefcase, Wallet,
  Clock, PenTool, Star, ShoppingCart, MessageSquare, Mail, Video,
  FileQuestion, FlaskConical, BarChart3, Award, X, ChevronDown, ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useState } from "react";

type LinkItem = {
  to: string;
  label: string;
  icon: any;
  teacherOnly?: boolean;
};

type LinkGroup = {
  label: string;
  items: LinkItem[];
};

const linkGroups: LinkGroup[] = [
  {
    label: "Main",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/settings", label: "General Settings", icon: Settings, teacherOnly: true },
    ],
  },
  {
    label: "Academics",
    items: [
      { to: "/classes", label: "Classes", icon: BookOpenCheck },
      { to: "/subjects", label: "Subjects", icon: FlaskConical },
      { to: "/students", label: "Students", icon: Users },
      { to: "/attendance", label: "Attendance", icon: ClipboardCheck },
      { to: "/timetable", label: "Timetable", icon: Clock },
      { to: "/homework", label: "Homework", icon: PenTool },
    ],
  },
  {
    label: "Examinations",
    items: [
      { to: "/exams", label: "Exams", icon: FileText },
      { to: "/question-paper", label: "Question Paper", icon: FileQuestion },
      { to: "/class-tests", label: "Class Tests", icon: FlaskConical },
      { to: "/reports", label: "Reports", icon: BarChart3 },
      { to: "/certificates", label: "Certificates", icon: Award },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/accounts", label: "Accounts", icon: Wallet, teacherOnly: true },
      { to: "/fees", label: "Fees", icon: DollarSign },
      { to: "/salary", label: "Salary", icon: Briefcase, teacherOnly: true },
    ],
  },
  {
    label: "HR & Staff",
    items: [
      { to: "/employees", label: "Employees", icon: Briefcase, teacherOnly: true },
      { to: "/behavior", label: "Behaviour & Skills", icon: Star },
    ],
  },
  {
    label: "Library",
    items: [
      { to: "/library", label: "Library", icon: BookOpen },
    ],
  },
  {
    label: "Communication",
    items: [
      { to: "/messaging", label: "Messaging", icon: MessageSquare },
      { to: "/whatsapp", label: "WhatsApp", icon: MessageSquare },
      { to: "/sms", label: "SMS Services", icon: Mail },
    ],
  },
  {
    label: "Online",
    items: [
      { to: "/live-class", label: "Live Class", icon: Video },
      { to: "/online-store", label: "Online Store & POS", icon: ShoppingCart },
    ],
  },
];

export const AppSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { isTeacher } = useUserRole();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    linkGroups.forEach((g) => { initial[g.label] = true; });
    return initial;
  });

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col z-50 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sidebar-primary-foreground font-bold text-base leading-tight">SchoolSphere</h1>
            <p className="text-sidebar-foreground text-[10px] opacity-60">Pro Management</p>
          </div>
        </div>
        <button onClick={onClose} className="md:hidden text-sidebar-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 space-y-1 mt-2 scrollbar-thin">
        {linkGroups.map((group) => {
          const visibleItems = group.items.filter((item) => !item.teacherOnly || isTeacher);
          if (visibleItems.length === 0) return null;
          const isExpanded = expandedGroups[group.label];

          return (
            <div key={group.label}>
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground/80"
              >
                {group.label}
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
              {isExpanded && visibleItems.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2 mb-2 px-2">
          <div className="w-7 h-7 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-xs font-bold">
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sidebar-foreground text-xs truncate block">{user?.email || "User"}</span>
            <span className="text-sidebar-foreground/50 text-[10px]">{isTeacher ? "Teacher" : "Student"}</span>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-sidebar-foreground hover:bg-sidebar-accent w-full transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
