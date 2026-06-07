import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Pencil, LayoutDashboard, Car, Link2, Code } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function TenantDetailDrawer({ tenant, onClose, onEdit }) {
  const appUrl = window.location.origin;
  const bookingUrl = `${appUrl}/book/${tenant.slug}`;
  const driverUrl = `${appUrl}/driver/${tenant.slug}`;
  const dashboardUrl = `/admin/tenants/${tenant.slug}`;

  const iframeCode = `<iframe src="${bookingUrl}" width="100%" height="700px" frameborder="0" style="border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.12);" title="Book a Ride"></iframe>`;
  const buttonCode = `<a href="${bookingUrl}" target="_blank" style="display:inline-block;background:${tenant.primary_color || "#d4a017"};color:#fff;padding:14px 32px;border-radius:8px;font-weight:bold;text-decoration:none;font-family:sans-serif;">Book Your Ride</a>`;

  const copy = (text, label) => { navigator.clipboard.writeText(text); toast.success(`${label} copied!`); };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: tenant.primary_color || "#d4a017" }}>
                {tenant.business_name?.[0]}
              </div>
              <span>{tenant.business_name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Dashboard CTA */}
        <Link to={dashboardUrl} onClick={onClose}>
          <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/30 rounded-xl hover:bg-primary/15 transition-colors cursor-pointer">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <div>
              <p className="font-semibold text-primary">Open Tenant Dashboard</p>
              <p className="text-xs text-muted-foreground">Manage bookings, form builder, embed codes & settings</p>
            </div>
            <ExternalLink className="w-4 h-4 text-primary ml-auto" />
          </div>
        </Link>

        <div className="space-y-4">
          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Owner</p>
              <p className="font-medium">{tenant.owner_name || "—"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{tenant.owner_email}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Plan & Status</p>
              <p className="font-medium capitalize">{tenant.plan}</p>
              <p className={`text-xs mt-0.5 capitalize ${tenant.status === "active" ? "text-emerald-600" : "text-red-500"}`}>{tenant.status}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Monthly Fee</p>
              <p className="font-semibold">${tenant.monthly_fee || 0}/mo</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Payment Status</p>
              <p className={`font-medium capitalize ${tenant.payment_status === "paid" ? "text-emerald-600" : "text-amber-600"}`}>{tenant.payment_status || "pending"}</p>
              {tenant.next_payment_date && <p className="text-xs text-muted-foreground mt-0.5">Due: {tenant.next_payment_date}</p>}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2"><Link2 className="w-4 h-4 text-primary" /> Booking URL</h4>
            <div className="flex gap-2">
              <code className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs break-all">{bookingUrl}</code>
              <Button variant="outline" size="sm" onClick={() => copy(bookingUrl, "URL")}><Copy className="w-3.5 h-3.5" /></Button>
              <Button variant="outline" size="sm" onClick={() => window.open(bookingUrl, "_blank")}><ExternalLink className="w-3.5 h-3.5" /></Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2"><Car className="w-4 h-4 text-primary" /> Driver App URL</h4>
            <div className="flex gap-2">
              <code className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs break-all">{driverUrl}</code>
              <Button variant="outline" size="sm" onClick={() => copy(driverUrl, "Driver URL")}><Copy className="w-3.5 h-3.5" /></Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2"><Code className="w-4 h-4 text-primary" /> iFrame Embed</h4>
            <div className="relative">
              <pre className="bg-muted rounded-lg px-3 py-2 text-xs overflow-x-auto whitespace-pre-wrap">{iframeCode}</pre>
              <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={() => copy(iframeCode, "iFrame code")}><Copy className="w-3 h-3" /></Button>
            </div>
          </div>

          {tenant.notes && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">{tenant.notes}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}