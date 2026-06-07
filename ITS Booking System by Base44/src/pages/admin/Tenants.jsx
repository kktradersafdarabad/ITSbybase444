import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";
import { Plus, Pencil, Trash2, ExternalLink, Copy, CheckCircle, Users, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import TenantFormModal from "@/components/tenants/TenantFormModal";
import TenantDetailDrawer from "@/components/tenants/TenantDetailDrawer";
import { toast } from "sonner";

const planColors = {
  trial: "bg-gray-100 text-gray-700",
  basic: "bg-blue-100 text-blue-700",
  pro: "bg-purple-100 text-purple-700",
  enterprise: "bg-amber-100 text-amber-800",
};

const statusColors = {
  active: "bg-emerald-100 text-emerald-700",
  suspended: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
};

export default function Tenants() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTenant, setEditTenant] = useState(null);
  const [detailTenant, setDetailTenant] = useState(null);

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => base44.entities.Tenant.list("-created_date"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Tenant.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tenants"] }); toast.success("Tenant deleted"); },
  });

  const filtered = tenants.filter(t =>
    t.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.owner_email?.toLowerCase().includes(search.toLowerCase())
  );

  const appUrl = window.location.origin;

  const copyLink = (slug) => {
    navigator.clipboard.writeText(`${appUrl}/book/${slug}`);
    toast.success("Booking URL copied!");
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Tenants"
        subtitle={`${tenants.length} customers registered`}
        actions={
          <Button onClick={() => { setEditTenant(null); setShowForm(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Add Tenant
          </Button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {["active", "trial", "suspended", "pro"].map(s => (
          <div key={s} className="bg-card rounded-xl border border-border/50 p-4">
            <p className="text-xs text-muted-foreground capitalize">{s}</p>
            <p className="text-2xl font-bold mt-1">
              {tenants.filter(t => t.status === s || t.plan === s).length}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="max-w-sm" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Business</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden md:table-cell">Owner</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden lg:table-cell">Plan</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden lg:table-cell">Monthly Fee</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden xl:table-cell">Payment</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setDetailTenant(t)}
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold">{t.business_name}</div>
                    <div className="text-xs text-muted-foreground font-mono">/book/{t.slug}</div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <div>{t.owner_name}</div>
                    <div className="text-xs text-muted-foreground">{t.owner_email}</div>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${planColors[t.plan] || "bg-muted text-muted-foreground"}`}>
                      {t.plan || "trial"}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell font-semibold">${(t.monthly_fee || 0).toFixed(0)}/mo</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[t.status] || "bg-muted text-muted-foreground"}`}>
                      {t.status || "active"}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden xl:table-cell">
                    <span className={`text-xs font-medium ${t.payment_status === "paid" ? "text-emerald-600" : t.payment_status === "overdue" ? "text-red-600" : "text-amber-600"}`}>
                      {t.payment_status || "pending"}
                    </span>
                    {t.next_payment_date && <div className="text-xs text-muted-foreground">Due: {t.next_payment_date}</div>}
                  </td>
                  <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/admin/tenants/${t.slug}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Open tenant dashboard">
                          <LayoutDashboard className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyLink(t.slug)} title="Copy booking URL">
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(`/book/${t.slug}`, "_blank")} title="Open booking form">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setEditTenant(t); setShowForm(true); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(t.id); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No tenants found</p>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <TenantFormModal
          tenant={editTenant}
          onClose={() => { setShowForm(false); setEditTenant(null); }}
        />
      )}

      {detailTenant && (
        <TenantDetailDrawer
          tenant={detailTenant}
          onClose={() => setDetailTenant(null)}
          onEdit={() => { setEditTenant(detailTenant); setShowForm(true); setDetailTenant(null); }}
        />
      )}
    </div>
  );
}