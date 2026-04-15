import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const SettingsPage = () => {
  const qc = useQueryClient();
  const { data: info } = useQuery({
    queryKey: ["school-info"],
    queryFn: async () => {
      const { data } = await supabase.from("school_info").select("*").limit(1).single();
      return data;
    },
  });

  const [form, setForm] = useState({ name: "", address: "", email: "", phone: "" });

  useEffect(() => {
    if (info) setForm({ name: info.name || "", address: info.address || "", email: info.email || "", phone: info.phone || "" });
  }, [info]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (info?.id) {
        const { error } = await supabase.from("school_info").update(data).eq("id", info.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("school_info").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["school-info"] }); toast.success("Settings saved"); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in max-w-2xl">
        <h1 className="text-3xl font-bold">General Settings</h1>
        <Card>
          <CardHeader><CardTitle>School Information</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <div><Label>School Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <Button type="submit" disabled={saveMutation.isPending}>Save Settings</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
