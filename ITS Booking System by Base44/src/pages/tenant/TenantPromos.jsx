import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Tag, Pencil, Trash2, Percent, DollarSign, Users, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";

function PromoCard({ p, onEdit, onDelete }) {
  const isExpired = p.expires_at && new Date(p.expires_at) < new Date();
  const isMaxed = p.max_uses && (p.current_uses || 0) >= p.max_uses;
  const statusActive = p.is_active !== false && !isExpired && !isMaxed;

  const usePct = p.max_uses ? Math.round(((p.current_uses || 0) / p.max_uses) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border/50 p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Tag className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold font-mono text-lg tracking-wider">{p.code}</span>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
          statusActive ? "bg-emerald-100 text-emerald-700" :
          isExpired ? "bg-orange-100 text-orange-700" :
          isMaxed ? "bg-purple-100 text-purple-700" :
          "bg-gray-100 text-gray-500"
        }`}>
          {isExpired ? "Expired" : isMaxed ? "Limit Reached" : statusActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Discount */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-lg">
          {p.discount_type === "percentage"
            ? <><Percent className="w-3.5 h-3.5 text-primary" /><span className="font-bold text-primary">{p.discount_value}% OFF</span></>
            : <><DollarSign className="w-3.5 h-3.5 text-primary" /><span className="font-bold text-primary">${p.discount_value} OFF</span></>
          }
        </div>
        {p.min_booking_amount > 0 && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Min ${p.min_booking_amount}</span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>Uses: <strong>{p.current_uses || 0}/{p.max_uses || "∞"}</strong></span>
        </div>
        {p.max_uses_per_user && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Per user: <strong>{p.max_uses_per_user}</strong></span>
          </div>
        )}
        {p.expires_at && (
          <div className={`flex items-center gap-1.5 col-span-2 ${isExpired ? "text-orange-600" : "text-muted-foreground"}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{isExpired ? "Expired" : "Expires"}: <strong>{p.expires_at}</strong></span>
          </div>
        )}
      </div>

      {/* Usage bar */}
      {p.max_uses > 0 && (
        <div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(usePct, 100)}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{usePct}% used</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-border/40">
        <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => onEdit(p)}>
          <Pencil className="w-3.5 h-3.5" /> Edit
        </Button>
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDelete(p.id)}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

export default function TenantPromos() {
  const { tenant } = useOutletContext();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: promos = [] } = useQuery({
    queryKey: ["tenant-promos", tenant.id],
    queryFn: () => base44.entities.PromoCode.filter({ tenant_id: tenant.id }, "-created_date"),
    enabled: !!tenant?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PromoCode.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tenant-promos", tenant.id] }); toast.success("Promo deleted"); },
  });

  const active = promos.filter(p => p.is_active !== false && !(p.expires_at && new Date(p.expires_at) < new Date()) && !(p.max_uses && (p.current_uses || 0) >= p.max_uses));

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Promo Codes</h1>
          <p className="text-muted-foreground text-sm mt-1">{active.length} active · {promos.length} total</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Add Promo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Active Codes", value: active.length, color: "text-emerald-600" },
          { label: "Total Uses", value: promos.reduce((s, p) => s + (p.current_uses || 0), 0), color: "text-blue-600" },
          { label: "Total Codes", value: promos.length, color: "text-purple-600" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border/50 p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {promos.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Tag className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No promo codes yet</p>
          <p className="text-sm mt-1">Create your first promo to offer discounts to customers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {promos.map((p) => (
            <PromoCard key={p.id} p={p}
              onEdit={(p) => { setEditing(p); setShowForm(true); }}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <PromoFormModal
          promo={editing}
          tenantId={tenant.id}
          onClose={() => { setShowForm(false); setEditing(null); }}
          queryClient={queryClient}
        />
      )}
    </div>
  );
}

function PromoFormModal({ promo, tenantId, onClose, queryClient }) {
  const [form, setForm] = useState({
    code: promo?.code || "",
    discount_type: promo?.discount_type || "percentage",
    discount_value: promo?.discount_value || "",
    min_booking_amount: promo?.min_booking_amount || "",
    max_uses: promo?.max_uses || "",
    max_uses_per_user: promo?.max_uses_per_user || "",
    current_uses: promo?.current_uses || 0,
    expires_at: promo?.expires_at || "",
    is_active: promo?.is_active !== false,
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      // Clean up empty string fields to avoid type issues
      const clean = {
        ...data,
        discount_value: parseFloat(data.discount_value) || 0,
        min_booking_amount: data.min_booking_amount !== "" ? parseFloat(data.min_booking_amount) || 0 : 0,
        max_uses: data.max_uses !== "" ? parseInt(data.max_uses) || 0 : 0,
        max_uses_per_user: data.max_uses_per_user !== "" ? parseInt(data.max_uses_per_user) || 0 : 0,
        expires_at: data.expires_at || null,
      };
      return promo
        ? base44.entities.PromoCode.update(promo.id, clean)
        : base44.entities.PromoCode.create({ ...clean, tenant_id: tenantId, current_uses: 0 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-promos", tenantId] });
      toast.success(promo ? "Promo updated!" : "Promo created!");
      onClose();
    },
  });

  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    u("code", code);
  };

  // Preview discount
  const sampleFare = 100;
  const discountPreview = form.discount_value
    ? form.discount_type === "percentage"
      ? (sampleFare * (form.discount_value / 100)).toFixed(2)
      : Math.min(parseFloat(form.discount_value) || 0, sampleFare).toFixed(2)
    : 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            {promo ? "Edit Promo Code" : "Create Promo Code"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Code */}
          <div>
            <Label>Promo Code *</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={form.code}
                onChange={e => u("code", e.target.value.toUpperCase().replace(/\s/g, ""))}
                placeholder="SAVE20"
                className="font-mono tracking-widest"
              />
              <Button variant="outline" type="button" onClick={generateCode} className="shrink-0">Auto</Button>
            </div>
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Discount Type *</Label>
              <Select value={form.discount_type} onValueChange={v => u("discount_type", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Discount Value *</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {form.discount_type === "percentage" ? "%" : "$"}
                </span>
                <Input
                  type="number" min="0"
                  max={form.discount_type === "percentage" ? 100 : undefined}
                  value={form.discount_value}
                  onChange={e => u("discount_value", +e.target.value)}
                  className="pl-7"
                  placeholder={form.discount_type === "percentage" ? "20" : "15"}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {form.discount_value > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              <span className="text-sm">
                On a <strong>$100</strong> booking → customer saves <strong className="text-primary">${discountPreview}</strong>
                {form.min_booking_amount > 0 && ` · Min booking: $${form.min_booking_amount}`}
              </span>
            </div>
          )}

          {/* Minimum booking amount */}
          <div>
            <Label>Minimum Booking Amount ($)</Label>
            <Input
              type="number" min="0"
              value={form.min_booking_amount}
              onChange={e => u("min_booking_amount", +e.target.value)}
              placeholder="0 = no minimum"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Promo only applies if booking total is at or above this amount</p>
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Total Uses Limit</Label>
              <Input
                type="number" min="0"
                value={form.max_uses}
                onChange={e => u("max_uses", +e.target.value)}
                placeholder="Unlimited"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Uses Per Customer</Label>
              <Input
                type="number" min="0"
                value={form.max_uses_per_user}
                onChange={e => u("max_uses_per_user", +e.target.value)}
                placeholder="Unlimited"
                className="mt-1"
              />
            </div>
          </div>

          {/* Expiration */}
          <div>
            <Label>Expiration Date</Label>
            <Input
              type="date"
              value={form.expires_at}
              onChange={e => u("expires_at", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="mt-1"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">Enable or disable this promo code</p>
            </div>
            <Switch checked={form.is_active} onCheckedChange={v => u("is_active", v)} />
          </div>

          <Button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending || !form.code || form.discount_value === "" || parseFloat(form.discount_value) <= 0}
            className="w-full h-11"
          >
            {mutation.isPending ? "Saving..." : promo ? "Update Promo Code" : "Create Promo Code"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}