import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function VehicleFormModal({ vehicle, tenantId, onClose, onSaved }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: vehicle?.name || "",
    model: vehicle?.model || "",
    category: vehicle?.category || "sedan",
    max_passengers: vehicle?.max_passengers || 4,
    max_luggage: vehicle?.max_luggage || 2,
    rate_per_km: vehicle?.rate_per_km || 2.5,
    rate_per_hour: vehicle?.rate_per_hour || 50,
    base_fare: vehicle?.base_fare || 10,
    license_plate: vehicle?.license_plate || "",
    image_url: vehicle?.image_url || "",
    is_active: vehicle?.is_active !== false,
  });

  const mutation = useMutation({
    mutationFn: (data) => vehicle ? base44.entities.Vehicle.update(vehicle.id, data) : base44.entities.Vehicle.create({ ...data, tenant_id: tenantId }),
    onSuccess: () => {
      if (onSaved) onSaved();
      else queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vehicle ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Name</Label><Input value={form.name} onChange={e => update("name", e.target.value)} required /></div>
            <div><Label>Model</Label><Input value={form.model} onChange={e => update("model", e.target.value)} required /></div>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={v => update("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sedan">Sedan</SelectItem>
                <SelectItem value="suv">SUV</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
                <SelectItem value="van">Van</SelectItem>
                <SelectItem value="stretch_limo">Stretch Limo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Max Passengers</Label><Input type="number" value={form.max_passengers} onChange={e => update("max_passengers", +e.target.value)} /></div>
            <div><Label>Max Luggage</Label><Input type="number" value={form.max_luggage} onChange={e => update("max_luggage", +e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Rate/KM ($)</Label><Input type="number" step="0.01" value={form.rate_per_km} onChange={e => update("rate_per_km", +e.target.value)} /></div>
            <div><Label>Rate/Hour ($)</Label><Input type="number" step="0.01" value={form.rate_per_hour} onChange={e => update("rate_per_hour", +e.target.value)} /></div>
            <div><Label>Base Fare ($)</Label><Input type="number" step="0.01" value={form.base_fare} onChange={e => update("base_fare", +e.target.value)} /></div>
          </div>
          <div><Label>License Plate</Label><Input value={form.license_plate} onChange={e => update("license_plate", e.target.value)} /></div>
          <div><Label>Image URL</Label><Input value={form.image_url} onChange={e => update("image_url", e.target.value)} placeholder="https://..." /></div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_active} onCheckedChange={v => update("is_active", v)} />
            <Label>Active</Label>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : vehicle ? "Update Vehicle" : "Add Vehicle"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}