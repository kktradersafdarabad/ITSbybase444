import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, MapPin, ArrowRight } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { motion } from "framer-motion";

export default function Routes() {
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: routes = [] } = useQuery({
    queryKey: ["routes"],
    queryFn: () => base44.entities.Route.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Route.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["routes"] }),
  });

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <PageHeader title="Flat Rate Routes" subtitle="Fixed pricing routes like airport transfers" actions={
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="gap-2"><Plus className="w-4 h-4" /> Add Route</Button>
      } />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl border border-border/50 p-5 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span className="truncate">{r.pickup_area}</span>
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="truncate">{r.dropoff_area}</span>
            </div>
            <h3 className="font-bold text-lg">{r.name}</h3>
            {r.description && <p className="text-sm text-muted-foreground mt-1">{r.description}</p>}
            <div className="flex items-center justify-between mt-4">
              <div>
                <span className="text-2xl font-bold text-primary">${r.flat_rate}</span>
                <span className="text-sm text-muted-foreground ml-1">flat rate</span>
              </div>
              <span className="text-sm text-muted-foreground">{r.distance_km} km</span>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditing(r); setShowForm(true); }}>
                <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(r.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {showForm && <RouteFormModal route={editing} onClose={() => setShowForm(false)} />}
    </div>
  );
}

function RouteFormModal({ route, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: route?.name || "", pickup_area: route?.pickup_area || "", dropoff_area: route?.dropoff_area || "",
    distance_km: route?.distance_km || 0, flat_rate: route?.flat_rate || 0, description: route?.description || "",
    is_active: route?.is_active !== false,
  });
  const mutation = useMutation({
    mutationFn: (data) => route ? base44.entities.Route.update(route.id, data) : base44.entities.Route.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["routes"] }); onClose(); },
  });
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{route ? "Edit Route" : "Add Route"}</DialogTitle></DialogHeader>
        <form onSubmit={e => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
          <div><Label>Route Name</Label><Input value={form.name} onChange={e => update("name", e.target.value)} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Pickup Area</Label><Input value={form.pickup_area} onChange={e => update("pickup_area", e.target.value)} required /></div>
            <div><Label>Dropoff Area</Label><Input value={form.dropoff_area} onChange={e => update("dropoff_area", e.target.value)} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Distance (km)</Label><Input type="number" value={form.distance_km} onChange={e => update("distance_km", +e.target.value)} /></div>
            <div><Label>Flat Rate ($)</Label><Input type="number" step="0.01" value={form.flat_rate} onChange={e => update("flat_rate", +e.target.value)} required /></div>
          </div>
          <div><Label>Description</Label><Input value={form.description} onChange={e => update("description", e.target.value)} /></div>
          <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => update("is_active", v)} /><Label>Active</Label></div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : route ? "Update" : "Create"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}