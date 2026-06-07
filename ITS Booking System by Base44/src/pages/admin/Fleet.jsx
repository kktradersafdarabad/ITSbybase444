import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Car, Users as UsersIcon, Briefcase, DollarSign, Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import VehicleFormModal from "@/components/fleet/VehicleFormModal";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const categoryIcons = { sedan: "🚗", suv: "🚙", luxury: "🏎️", van: "🚐", stretch_limo: "🚑" };

export default function Fleet() {
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => base44.entities.Vehicle.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Vehicle.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
  });

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <PageHeader 
        title="Fleet Management" 
        subtitle={`${vehicles.length} vehicles`} 
        actions={
          <Button onClick={() => { setEditing(null); setShowForm(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Add Vehicle
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((v, i) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "bg-card rounded-2xl border border-border/50 overflow-hidden group hover:shadow-lg transition-all",
              !v.is_active && "opacity-60"
            )}
          >
            <div className="aspect-video bg-muted relative overflow-hidden">
              {v.image_url ? (
                <img src={v.image_url} alt={v.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  {categoryIcons[v.category] || "🚗"}
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="bg-card/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full capitalize">
                  {v.category?.replace(/_/g, " ")}
                </span>
              </div>
              {!v.is_active && (
                <div className="absolute top-3 right-3">
                  <span className="bg-destructive/90 text-destructive-foreground text-xs font-semibold px-2.5 py-1 rounded-full">Inactive</span>
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg">{v.name}</h3>
              <p className="text-sm text-muted-foreground">{v.model}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><UsersIcon className="w-3.5 h-3.5" />{v.max_passengers}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{v.max_luggage || 0}</span>
                <span className="flex items-center gap-1 text-primary font-semibold"><DollarSign className="w-3.5 h-3.5" />{v.rate_per_km}/km</span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditing(v); setShowForm(true); }}>
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(v.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showForm && (
        <VehicleFormModal 
          vehicle={editing} 
          onClose={() => setShowForm(false)} 
        />
      )}
    </div>
  );
}