import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Car } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import VehicleFormModal from "@/components/fleet/VehicleFormModal";
import { motion } from "framer-motion";

export default function TenantFleet() {
  const { tenant } = useOutletContext();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: vehicles = [] } = useQuery({
    queryKey: ["tenant-vehicles", tenant.id],
    queryFn: () => base44.entities.Vehicle.filter({ tenant_id: tenant.id }),
    enabled: !!tenant?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Vehicle.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenant-vehicles", tenant.id] }),
  });

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Fleet</h1>
          <p className="text-muted-foreground text-sm mt-1">{vehicles.length} vehicles</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Add Vehicle
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {vehicles.map((v, i) => (
          <motion.div key={v.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl border border-border/50 p-5 hover:shadow-lg transition-all">
            <div className="aspect-video rounded-xl bg-muted mb-4 overflow-hidden">
              {v.image_url
                ? <img src={v.image_url} alt={v.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><Car className="w-10 h-10 text-muted-foreground opacity-40" /></div>
              }
            </div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold">{v.name}</h3>
                <p className="text-xs text-muted-foreground capitalize">{v.category} · {v.model}</p>
              </div>
              <StatusBadge status={v.is_active !== false ? "available" : "offline"} />
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground mb-4">
              <span>👤 {v.max_passengers} pax</span>
              <span>🧳 {v.max_luggage} bags</span>
              <span className="font-semibold text-foreground">${v.base_fare}/base</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditing(v); setShowForm(true); }}>
                <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(v.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Car className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No vehicles yet. Add your first vehicle.</p>
        </div>
      )}

      {showForm && <VehicleFormModal vehicle={editing} tenantId={tenant.id} onClose={() => setShowForm(false)} onSaved={() => queryClient.invalidateQueries({ queryKey: ["tenant-vehicles", tenant.id] })} />}
    </div>
  );
}