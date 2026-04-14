import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

export const AppLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-background">
    <AppSidebar />
    <main className="ml-64 p-8">{children}</main>
  </div>
);
