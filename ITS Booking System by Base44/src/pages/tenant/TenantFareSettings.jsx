import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, PoundSterling, Zap, Clock, MapPin, Info, Moon, Car } from "lucide-react";
import { toast } from "sonner";

export default function TenantFareSettings() {
  const { tenant, slug } = useOutletContext();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    // UK-style fare fields
    flag_fall: tenant.flag_fall ?? tenant.base_fare ?? 3.00,        // Hire charge / flag fall
    cost_per_mile: tenant.cost_per_mile ?? 2.80,                    // Standard per-mile rate
    cost_per_km: tenant.cost_per_km ?? 1.74,                        // Per-km (1 mile = 1.60934 km)
    waiting_rate_per_min: tenant.waiting_rate_per_min ?? 0.30,      // Waiting/traffic time rate
    hourly_rate: tenant.hourly_rate ?? 55,                          // As-directed hourly rate
    night_premium: tenant.night_premium ?? 0.20,                    // Night surcharge % (0.2 = 20%)
    surge_multiplier: tenant.surge_multiplier ?? 1.5,               // Peak time multiplier
    surge_start_hour: tenant.surge_start_hour ?? 22,
    surge_end_hour: tenant.surge_end_hour ?? 5,
    currency: tenant.currency ?? "GBP",
    currency_symbol: tenant.currency_symbol ?? "£",
    // Base fare kept for compatibility
    base_fare: tenant.flag_fall ?? tenant.base_fare ?? 3.00,
  });

  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    // Save both UK fields + legacy fields for compatibility
    mutation.mutate({
      ...form,
      base_fare: form.flag_fall,  // keep legacy field in sync
    });
  };

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Tenant.update(tenant.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-admin", slug] });
      toast.success("Fare settings saved!");
    },
  });

  // Live preview — 3 miles, 12 min trip (typical UK city run)
  const previewMiles = 3;
  const previewMins = 12;
  const previewFlagFall = parseFloat(form.flag_fall) || 0;
  const previewDist = previewMiles * (parseFloat(form.cost_per_mile) || 0);
  const previewTime = previewMins * (parseFloat(form.waiting_rate_per_min) || 0);
  const previewSubtotal = previewFlagFall + previewDist + previewTime;
  const nightTotal = previewSubtotal * (1 + (parseFloat(form.night_premium) || 0));

  return (
    <div className="p-6 lg:p-8 max-w-[900px] mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">Fare Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">UK/Europe private hire pricing model</p>
        </div>
        <Button onClick={handleSave} disabled={mutation.isPending} className="gap-2">
          <Save className="w-4 h-4" /> {mutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* UK Fare Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-semibold mb-1">UK Private Hire Fare Model</p>
          <p>Standard UK minicab/private hire pricing: <strong>Hire Charge (flag fall)</strong> + <strong>Per Mile Rate</strong> + <strong>Waiting Time</strong>. Night premium and surge multipliers are applied on top. This mirrors how Addison Lee, local minicab firms, and PCO operators charge.</p>
        </div>
      </div>

      {/* Currency */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2"><PoundSterling className="w-4 h-4 text-primary" />Currency</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Currency Code</Label>
            <Input value={form.currency} onChange={e => u("currency", e.target.value)} placeholder="GBP" className="mt-1" />
          </div>
          <div>
            <Label>Currency Symbol</Label>
            <Input value={form.currency_symbol} onChange={e => u("currency_symbol", e.target.value)} placeholder="£" className="mt-1" />
          </div>
        </div>
      </div>

      {/* Core Tariff */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-5">
        <h3 className="font-semibold flex items-center gap-2"><Car className="w-4 h-4 text-primary" />Tariff Rates</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-4 border border-border/50 rounded-xl space-y-2 bg-muted/20">
            <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Hire Charge (Flag Fall)</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">{form.currency_symbol}</span>
              <Input type="number" step="0.10" min="0" value={form.flag_fall} onChange={e => u("flag_fall", +e.target.value)} className="text-lg font-bold" />
            </div>
            <p className="text-xs text-muted-foreground">Flat charge at the start of every journey (UK standard: £2.60–£4.00)</p>
          </div>

          <div className="p-4 border border-border/50 rounded-xl space-y-2 bg-muted/20">
            <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Rate Per Mile</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">{form.currency_symbol}/mile</span>
              <Input type="number" step="0.05" min="0" value={form.cost_per_mile} onChange={e => {
                u("cost_per_mile", +e.target.value);
                u("cost_per_km", parseFloat((+e.target.value / 1.60934).toFixed(4)));
              }} className="text-lg font-bold" />
            </div>
            <p className="text-xs text-muted-foreground">Per mile charge (UK average: £1.80–£3.50). Equivalent: {form.currency_symbol}{(form.cost_per_km || 0).toFixed(2)}/km</p>
          </div>

          <div className="p-4 border border-border/50 rounded-xl space-y-2 bg-muted/20">
            <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Waiting / Traffic Time</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">{form.currency_symbol}/min</span>
              <Input type="number" step="0.05" min="0" value={form.waiting_rate_per_min} onChange={e => u("waiting_rate_per_min", +e.target.value)} className="text-lg font-bold" />
            </div>
            <p className="text-xs text-muted-foreground">Charged per minute during traffic stops, waiting, slow travel (UK: £0.20–£0.50/min)</p>
          </div>

          <div className="p-4 border border-border/50 rounded-xl space-y-2 bg-muted/20">
            <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">As-Directed Hourly Rate</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">{form.currency_symbol}/hr</span>
              <Input type="number" step="1" min="0" value={form.hourly_rate} onChange={e => u("hourly_rate", +e.target.value)} className="text-lg font-bold" />
            </div>
            <p className="text-xs text-muted-foreground">For bookings on an hourly "as-directed" basis (UK: £45–£80/hr)</p>
          </div>
        </div>
      </div>

      {/* Night Premium */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2"><Moon className="w-4 h-4 text-indigo-500" />Night Premium</h3>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 text-xs text-indigo-700 dark:text-indigo-300 flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          Night premium adds a percentage to the total fare during late-night/early-morning hours. Standard UK: 20–25% after 10pm. Set to 0 to disable.
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Night Premium (%)</Label>
            <Input type="number" step="0.05" min="0" max="1" value={form.night_premium} onChange={e => u("night_premium", +e.target.value)} className="mt-1" />
            <p className="text-xs text-muted-foreground mt-1">e.g. 0.20 = 20% extra. 0 = disabled</p>
          </div>
          <div>
            <Label>Night Rate Start</Label>
            <Input type="number" min="0" max="23" value={form.surge_start_hour} onChange={e => u("surge_start_hour", +e.target.value)} className="mt-1" />
            <p className="text-xs text-muted-foreground mt-1">e.g. 22 = 10:00 PM</p>
          </div>
          <div>
            <Label>Night Rate End</Label>
            <Input type="number" min="0" max="23" value={form.surge_end_hour} onChange={e => u("surge_end_hour", +e.target.value)} className="mt-1" />
            <p className="text-xs text-muted-foreground mt-1">e.g. 6 = 6:00 AM</p>
          </div>
        </div>
      </div>

      {/* Surge */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" />Peak Demand Multiplier</h3>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          Applied during peak hours (Friday/Saturday nights, bank holidays). Set to 1 to disable. This multiplies the entire fare.
        </div>
        <div>
          <Label>Peak Multiplier</Label>
          <Input type="number" step="0.1" min="1" max="5" value={form.surge_multiplier} onChange={e => u("surge_multiplier", +e.target.value)} className="mt-1 max-w-xs" />
          <p className="text-xs text-muted-foreground mt-1">e.g. 1.5 = 50% extra on peak hours. 1 = no surge</p>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-card rounded-2xl border border-border/50 p-6">
        <h3 className="font-semibold flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-primary" />Live Fare Preview</h3>
        <p className="text-xs text-muted-foreground mb-4">Sample: {previewMiles} miles, {previewMins} min journey</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-muted/60 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Hire Charge</p>
            <p className="font-bold text-lg">{form.currency_symbol}{previewFlagFall.toFixed(2)}</p>
          </div>
          <div className="bg-muted/60 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Distance ({previewMiles}mi)</p>
            <p className="font-bold text-lg">{form.currency_symbol}{previewDist.toFixed(2)}</p>
          </div>
          <div className="bg-muted/60 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Time ({previewMins}min)</p>
            <p className="font-bold text-lg">{form.currency_symbol}{previewTime.toFixed(2)}</p>
          </div>
          <div className="bg-muted/60 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Night (+{(form.night_premium * 100).toFixed(0)}%)</p>
            <p className="font-bold text-lg">{form.currency_symbol}{nightTotal.toFixed(2)}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl text-center" style={{ background: (tenant.primary_color || "#d4a017") + "20", border: `1px solid ${(tenant.primary_color || "#d4a017")}40` }}>
            <p className="text-sm text-muted-foreground">Daytime Total</p>
            <p className="text-3xl font-bold mt-1" style={{ color: tenant.primary_color || "#d4a017" }}>{form.currency_symbol}{previewSubtotal.toFixed(2)}</p>
          </div>
          <div className="p-4 rounded-xl text-center bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700">
            <p className="text-sm text-muted-foreground">Night Rate Total</p>
            <p className="text-3xl font-bold mt-1 text-indigo-600">{form.currency_symbol}{nightTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}