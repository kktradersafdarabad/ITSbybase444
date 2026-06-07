import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Tag, Percent, DollarSign } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { motion } from "framer-motion";

export default function Promos() {
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: promos = [] } = useQuery({
    queryKey: ["promos"],
    queryFn: () => base44.entities.PromoCode.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PromoCode.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["promos"] }),
  });

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <PageHeader title="Promo Codes" subtitle="Manage discounts and promotional offers" actions={
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="gap-2"><Plus className="w-4 h-4" /> Add Promo</Button>
      } />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl border border-border/50 p-5 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                <span className="font-mono font-bold text-lg">{p.code}</span>
              </div>
              {!p.is_active && <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Inactive</span>}
            </div>
            <div className="flex items-center gap-2 mb-2">
              {p.discount_type === "percentage" ? <Percent className="w-4 h-4 text-primary" /> : <DollarSign className="w-4 h-4 text-primary" />}
              <span className="text-2xl font-bold">
                {p.discount_type === "percentage" ? `${p.discount_value}%` : `$${p.discount_value}`}
              </span>
              <span className="text-sm text-muted-foreground">off</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Uses: {p.current_uses || 0} / {p.max_uses || "∞"}</p>
              {p.expires_at && <p>Expires: {p.expires_at}</p>}
              {p.min_booking_amount > 0 && <p>Min booking: ${p.min_booking_amount}</p>}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditing(p); setShowForm(true); }}>
                <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(p.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {showForm && <PromoFormModal promo={editing} onClose={() => setShowForm(false)} />}
    </div>
  );
}

function PromoFormModal({ promo, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    code: promo?.code || "", discount_type: promo?.discount_type || "percentage",
    discount_value: promo?.discount_value || 10, max_uses: promo?.max_uses || 100,
    min_booking_amount: promo?.min_booking_amount || 0, expires_at: promo?.expires_at || "",
    is_active: promo?.is_active !== false,
  });
  const mutation = useMutation({
    mutationFn: (data) => promo ? base44.entities.PromoCode.update(promo.id, data) : base44.entities.PromoCode.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["promos"] }); onClose(); },
  });
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{promo ? "Edit Promo" : "Add Promo"}</DialogTitle></DialogHeader>
        <form onSubmit={e => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
          <div><Label>Promo Code</Label><Input value={form.code} onChange={e => update("code", e.target.value.toUpperCase())} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={form.discount_type} onValueChange={v => update("discount_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Value</Label><Input type="number" step="0.01" value={form.discount_value} onChange={e => update("discount_value", +e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Max Uses</Label><Input type="number" value={form.max_uses} onChange={e => update("max_uses", +e.target.value)} /></div>
            <div><Label>Min Booking ($)</Label><Input type="number" step="0.01" value={form.min_booking_amount} onChange={e => update("min_booking_amount", +e.target.value)} /></div>
          </div>
          <div><Label>Expires At</Label><Input type="date" value={form.expires_at} onChange={e => update("expires_at", e.target.value)} /></div>
          <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => update("is_active", v)} /><Label>Active</Label></div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : promo ? "Update" : "Create"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}