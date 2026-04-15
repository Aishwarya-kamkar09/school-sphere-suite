import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUserRole() {
  const { user } = useAuth();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      return (data || []).map((r: any) => r.role);
    },
    enabled: !!user?.id,
  });

  return {
    roles,
    isTeacher: roles.includes("teacher") || roles.includes("admin"),
    isStudent: roles.includes("student"),
    isAdmin: roles.includes("admin"),
    isLoading,
  };
}
