import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Star, Phone, Mail, Pencil, Trash2, Send, Car, Copy, Check } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import DriverFormModal from "@/components/drivers/DriverFormModal";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Drivers() {
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [sendUrlDriver, setSendUrlDriver] = useState(null);
  const queryClient = useQueryClient();

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers"],
    queryFn: () => base44.entities.Driver.list(),
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => base44.entities.Tenant.list("-created_date"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Driver.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drivers"] }),
  });

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <PageHeader 
        title="Driver Management" 
        subtitle={`${drivers.length} drivers`}
        actions={
          <Button onClick={() => { setEditing(null); setShowForm(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Add Driver
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {drivers.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl border border-border/50 p-5 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {d.full_name?.charAt(0) || "?"}
                </div>
                <div>
                  <h3 className="font-semibold">{d.full_name}</h3>
                  <StatusBadge status={d.status || "offline"} />
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              {d.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{d.phone}</div>}
              <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /><span className="truncate">{d.email}</span></div>
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="font-semibold">{d.rating?.toFixed(1) || "—"}</span>
              </div>
              <span className="text-muted-foreground">{d.total_trips || 0} trips</span>
              <span className="text-muted-foreground ml-auto font-semibold">${(d.total_earnings || 0).toLocaleString()}</span>
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1 text-xs"
                onClick={() => setSendUrlDriver(d)}
              >
                <Send className="w-3 h-3" /> Send App URL
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setEditing(d); setShowForm(true); }}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(d.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {showForm && <DriverFormModal driver={editing} onClose={() => setShowForm(false)} />}

      {sendUrlDriver && (
        <SendDriverUrlModal
          driver={sendUrlDriver}
          tenants={tenants}
          onClose={() => setSendUrlDriver(null)}
        />
      )}
    </div>
  );
}

function SendDriverUrlModal({ driver, tenants, onClose }) {
  const [selectedSlug, setSelectedSlug] = useState(tenants[0]?.slug || "");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const appUrl = window.location.origin;

  const driverUrl = selectedSlug ? `${appUrl}/driver/${selectedSlug}` : "";

  const copyUrl = () => {
    navigator.clipboard.writeText(driverUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("URL copied!");
  };

  const sendEmail = async () => {
    if (!driver.email || !driverUrl) return;
    setSending(true);
    const tenant = tenants.find(t => t.slug === selectedSlug);
    await base44.integrations.Core.SendEmail({
      to: driver.email,
      subject: `Your Driver App Access – ${tenant?.business_name || "Driver Portal"}`,
      from_name: tenant?.business_name || "Driver App",
      body: `
<!DOCTYPE html>
<html>
<body style="font-family:Inter,sans-serif;background:#f5f5f5;margin:0;padding:20px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
    <div style="background:${tenant?.primary_color || "#d4a017"};padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">${tenant?.business_name || "Driver App"}</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">🚗 Your Driver App Access</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#111;font-size:16px;margin-top:0;">Hi <strong>${driver.full_name}</strong>,</p>
      <p style="color:#444;font-size:14px;">You've been added as a driver. Use the link below to access your driver app:</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${driverUrl}" style="display:inline-block;background:${tenant?.primary_color || "#d4a017"};color:#fff;padding:14px 32px;border-radius:8px;font-weight:bold;text-decoration:none;font-family:sans-serif;font-size:15px;">
          Open Driver App →
        </a>
      </div>
      <p style="color:#888;font-size:13px;word-break:break-all;">${driverUrl}</p>
      <div style="background:#f9f9f9;border-radius:12px;padding:16px;margin-top:20px;">
        <p style="color:#444;font-size:13px;margin:0;"><strong>How it works:</strong></p>
        <ul style="color:#666;font-size:13px;margin:8px 0 0;padding-left:20px;">
          <li>Open the link on your phone</li>
          <li>Sign in with this email address: <strong>${driver.email}</strong></li>
          <li>View your assigned jobs, update status, and track earnings</li>
        </ul>
      </div>
    </div>
  </div>
</body>
</html>`.trim(),
    });
    setSending(false);
    toast.success(`Driver app URL sent to ${driver.email}!`);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" /> Send Driver App URL
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
              {driver.full_name?.[0]}
            </div>
            <div>
              <p className="font-semibold text-sm">{driver.full_name}</p>
              <p className="text-xs text-muted-foreground">{driver.email}</p>
            </div>
          </div>

          {tenants.length > 1 && (
            <div>
              <label className="text-sm font-medium block mb-1.5">Select Tenant / Business</label>
              <Select value={selectedSlug} onValueChange={setSelectedSlug}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tenant..." />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map(t => (
                    <SelectItem key={t.id} value={t.slug}>{t.business_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {driverUrl && (
            <div>
              <label className="text-sm font-medium block mb-1.5">Driver App URL</label>
              <div className="flex gap-2">
                <code className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs break-all">{driverUrl}</code>
                <Button variant="outline" size="sm" onClick={copyUrl}>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-xs text-blue-800 dark:text-blue-300 space-y-1">
            <p><strong>The driver will receive an email with:</strong></p>
            <p>• Their personal driver app link</p>
            <p>• Login instructions (using their email)</p>
            <p>• How to view jobs and update statuses</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={sendEmail} disabled={sending || !driverUrl || !driver.email} className="flex-1 gap-2">
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : "Send Email to Driver"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}