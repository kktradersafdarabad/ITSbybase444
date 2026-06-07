import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function TenantRoutes() {
  const { tenant } = useOutletContext();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: routes = [] } = useQuery({
    queryKey: ["tenant-routes", tenant.id],
    queryFn: () => base44.entities.Route.filter({ tenant_id: tenant.id }),
    enabled: !!tenant?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Route.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tenant-routes", tenant.id] }); toast.success("Route deleted"); },
  });

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Routes</h1>
          <p className="text-muted-foreground text-sm mt-1">Flat-rate routes</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Add Route
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold">{r.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.is_active !== false ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                {r.is_active !== false ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-emerald-500" />{r.pickup_area}</div>
              <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-red-500" />{r.dropoff_area}</div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-xs">{r.distance_km ? `${r.distance_km} km` : "Distance varies"}</span>
              <span className="font-bold text-lg">${r.flat_rate}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditing(r); setShowForm(true); }}><Pencil className="w-3.5 h-3.5 mr-1" /> Edit</Button>
              <Button variant="outline" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </motion.div>
        ))}
      </div>
      {routes.length === 0 && <div className="text-center py-20 text-muted-foreground"><MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" /><p>No routes yet.</p></div>}
      {showForm && <RouteFormModal route={editing} tenantId={tenant.id} onClose={() => setShowForm(false)} queryClient={queryClient} />}
    </div>
  );
}

function RouteFormModal({ route, tenantId, onClose, queryClient }) {
  const [form, setForm] = useState({
    name: route?.name || "", pickup_area: route?.pickup_area || "",
    dropoff_area: route?.dropoff_area || "", distance_km: route?.distance_km || "",
    flat_rate: route?.flat_rate || "", is_active: route?.is_active !== false,
  });
  const mutation = useMutation({
    mutationFn: (data) => route ? base44.entities.Route.update(route.id, data) : base44.entities.Route.create({ ...data, tenant_id: tenantId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tenant-routes", tenantId] }); toast.success("Route saved!"); onClose(); },
  });
  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{route ? "Edit Route" : "Add Route"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Route Name</Label><Input value={form.name} onChange={e => u("name", e.target.value)} placeholder="Airport Transfer" /></div>
          <div><Label>Pickup Area</Label><Input value={form.pickup_area} onChange={e => u("pickup_area", e.target.value)} /></div>
          <div><Label>Dropoff Area</Label><Input value={form.dropoff_area} onChange={e => u("dropoff_area", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Distance (km)</Label><Input type="number" value={form.distance_km} onChange={e => u("distance_km", +e.target.value)} /></div>
            <div><Label>Flat Rate ($)</Label><Input type="number" value={form.flat_rate} onChange={e => u("flat_rate", +e.target.value)} /></div>
          </div>
          <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !form.name || !form.flat_rate} className="w-full">
            {mutation.isPending ? "Saving..." : "Save Route"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}