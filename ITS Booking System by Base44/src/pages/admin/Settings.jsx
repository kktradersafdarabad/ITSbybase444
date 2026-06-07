import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Building2, DollarSign, Palette, Globe } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  const queryClient = useQueryClient();
  const { data: settingsList = [] } = useQuery({
    queryKey: ["settings"],
    queryFn: () => base44.entities.CompanySettings.list(),
  });

  const settings = settingsList[0] || {};
  const [form, setForm] = useState({});

  useEffect(() => {
    if (settings.id) setForm(settings);
  }, [settings.id]);

  const mutation = useMutation({
    mutationFn: (data) => settings.id 
      ? base44.entities.CompanySettings.update(settings.id, data) 
      : base44.entities.CompanySettings.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["settings"] }); toast.success("Settings saved!"); },
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="p-6 lg:p-8 max-w-[1000px] mx-auto">
      <PageHeader title="Settings" subtitle="Configure your business and pricing" />

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="company" className="gap-2"><Building2 className="w-4 h-4" /> Company</TabsTrigger>
          <TabsTrigger value="pricing" className="gap-2"><DollarSign className="w-4 h-4" /> Pricing</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2"><Palette className="w-4 h-4" /> Theme</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Company Name</Label><Input value={form.company_name || ""} onChange={e => update("company_name", e.target.value)} /></div>
            <div><Label>Logo URL</Label><Input value={form.logo_url || ""} onChange={e => update("logo_url", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Contact Email</Label><Input value={form.contact_email || ""} onChange={e => update("contact_email", e.target.value)} /></div>
            <div><Label>Contact Phone</Label><Input value={form.contact_phone || ""} onChange={e => update("contact_phone", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Currency Code</Label><Input value={form.currency || "USD"} onChange={e => update("currency", e.target.value)} /></div>
            <div><Label>Currency Symbol</Label><Input value={form.currency_symbol || "$"} onChange={e => update("currency_symbol", e.target.value)} /></div>
          </div>
          <div>
            <Label>Language</Label>
            <Select value={form.language || "en"} onValueChange={v => update("language", v)}>
              <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ur">Urdu</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><Label>Base Fare ($)</Label><Input type="number" step="0.01" value={form.base_fare || 0} onChange={e => update("base_fare", +e.target.value)} /></div>
            <div><Label>Cost/KM ($)</Label><Input type="number" step="0.01" value={form.cost_per_km || 0} onChange={e => update("cost_per_km", +e.target.value)} /></div>
            <div><Label>Cost/Min ($)</Label><Input type="number" step="0.01" value={form.cost_per_minute || 0} onChange={e => update("cost_per_minute", +e.target.value)} /></div>
            <div><Label>Hourly Rate ($)</Label><Input type="number" step="0.01" value={form.hourly_rate || 0} onChange={e => update("hourly_rate", +e.target.value)} /></div>
          </div>
          <Separator />
          <h3 className="font-semibold">Surge Pricing</h3>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Multiplier</Label><Input type="number" step="0.1" value={form.surge_multiplier || 1} onChange={e => update("surge_multiplier", +e.target.value)} /></div>
            <div><Label>Start Hour (24h)</Label><Input type="number" min="0" max="23" value={form.surge_start_hour || 0} onChange={e => update("surge_start_hour", +e.target.value)} /></div>
            <div><Label>End Hour (24h)</Label><Input type="number" min="0" max="23" value={form.surge_end_hour || 0} onChange={e => update("surge_end_hour", +e.target.value)} /></div>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Primary Color</Label><Input type="color" value={form.primary_color || "#d4a017"} onChange={e => update("primary_color", e.target.value)} className="h-12" /></div>
            <div>
              <Label>Border Radius</Label>
              <Select value={form.border_radius || "rounded"} onValueChange={v => update("border_radius", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="rounded">Rounded</SelectItem>
                  <SelectItem value="pill">Pill</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="gap-2">
          <Save className="w-4 h-4" /> {mutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}