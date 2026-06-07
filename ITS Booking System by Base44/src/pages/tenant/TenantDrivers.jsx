import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Star, Phone, Mail, Pencil, Trash2, Send, Copy, Check, Lock } from "lucide-react";
import { canAddDriver, getPlanLimits } from "@/lib/planLimits";
import StatusBadge from "@/components/shared/StatusBadge";
import DriverFormModal from "@/components/drivers/DriverFormModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function TenantDrivers() {
  const { tenant, slug, primaryColor } = useOutletContext();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [sendUrlDriver, setSendUrlDriver] = useState(null);

  const { data: drivers = [] } = useQuery({
    queryKey: ["tenant-drivers-page", tenant.id],
    queryFn: () => base44.entities.Driver.filter({ tenant_id: tenant.id }),
    enabled: !!tenant?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Driver.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenant-drivers-page", tenant.id] }),
  });

  const planLimits = getPlanLimits(tenant.plan);
  const canAdd = canAddDriver(tenant.plan, drivers.length);

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Drivers</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {drivers.length} driver{drivers.length !== 1 ? "s" : ""}
            {planLimits.maxDrivers && <span className="text-muted-foreground"> / {planLimits.maxDrivers} max on {planLimits.label} plan</span>}
          </p>
        </div>
        <Button onClick={() => { if (!canAdd) return; setEditing(null); setShowForm(true); }} className="gap-2" disabled={!canAdd} title={!canAdd ? `Driver limit reached on ${planLimits.label} plan` : ""}>
          {canAdd ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4" />} Add Driver
        </Button>
      </div>
      {!canAdd && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
          <Lock className="w-4 h-4 flex-shrink-0" />
          You have reached the driver limit for your <strong>{planLimits.label}</strong> plan. Please upgrade to add more drivers.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {drivers.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl border border-border/50 p-5 hover:shadow-lg transition-all">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                {d.full_name?.charAt(0) || "?"}
              </div>
              <div>
                <h3 className="font-semibold">{d.full_name}</h3>
                <StatusBadge status={d.status || "offline"} />
              </div>
            </div>
            <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
              {d.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{d.phone}</div>}
              <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /><span className="truncate text-xs">{d.email}</span></div>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-border/50 text-sm mb-3">
              <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-primary fill-primary" /><span className="font-semibold">{d.rating?.toFixed(1) || "—"}</span></div>
              <span className="text-muted-foreground">{d.total_trips || 0} trips</span>
            </div>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs" onClick={() => setSendUrlDriver(d)}>
                <Send className="w-3 h-3" /> Send URL
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setEditing(d); setShowForm(true); }}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(d.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {drivers.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <span className="text-4xl">👤</span>
          <p className="mt-4">No drivers yet. Add your first driver.</p>
        </div>
      )}

      {showForm && <DriverFormModal driver={editing} tenantId={tenant.id} onClose={() => setShowForm(false)} />}
      {sendUrlDriver && <SendDriverUrlModal driver={sendUrlDriver} tenant={tenant} slug={slug} primaryColor={primaryColor} onClose={() => setSendUrlDriver(null)} />}
    </div>
  );
}

function SendDriverUrlModal({ driver, tenant, slug, primaryColor, onClose }) {
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const driverUrl = `${window.location.origin}/driver/${slug}`;

  const copyUrl = () => { navigator.clipboard.writeText(driverUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); toast.success("Copied!"); };

  const sendEmail = async () => {
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: driver.email,
      subject: `Your Driver App Access – ${tenant.business_name}`,
      from_name: tenant.business_name,
      body: `<!DOCTYPE html><html><body style="font-family:Inter,sans-serif;background:#f5f5f5;margin:0;padding:20px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;">
    <div style="background:${primaryColor};padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;">${tenant.business_name}</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">🚗 Driver App Access</p>
    </div>
    <div style="padding:32px;">
      <p>Hi <strong>${driver.full_name}</strong>,</p>
      <p>You've been registered as a driver. Click the button below to access your driver app:</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${driverUrl}" style="display:inline-block;background:${primaryColor};color:#fff;padding:14px 32px;border-radius:8px;font-weight:bold;text-decoration:none;">Open Driver App →</a>
      </div>
      <p style="color:#888;font-size:13px;">Sign in with: <strong>${driver.email}</strong></p>
    </div>
  </div></body></html>`
    });
    setSending(false);
    toast.success(`Driver app URL sent to ${driver.email}!`);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Send Driver App URL</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center font-bold">{driver.full_name?.[0]}</div>
            <div><p className="font-semibold text-sm">{driver.full_name}</p><p className="text-xs text-muted-foreground">{driver.email}</p></div>
          </div>
          <div>
            <p className="text-sm font-medium mb-1.5">Driver App URL</p>
            <div className="flex gap-2">
              <code className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs break-all">{driverUrl}</code>
              <Button variant="outline" size="sm" onClick={copyUrl}>{copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}</Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={sendEmail} disabled={sending} className="flex-1 gap-2"><Send className="w-4 h-4" />{sending ? "Sending..." : "Send Email"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}