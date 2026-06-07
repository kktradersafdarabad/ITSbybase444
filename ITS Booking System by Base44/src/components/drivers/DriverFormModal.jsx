import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DriverFormModal({ driver, tenantId, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    full_name: driver?.full_name || "",
    email: driver?.email || "",
    phone: driver?.phone || "",
    license_number: driver?.license_number || "",
    status: driver?.status || "available",
  });

  const mutation = useMutation({
    mutationFn: (data) => driver ? base44.entities.Driver.update(driver.id, data) : base44.entities.Driver.create({ ...data, tenant_id: tenantId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["drivers"] }); onClose(); },
  });

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{driver ? "Edit Driver" : "Add Driver"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={e => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
          <div><Label>Full Name</Label><Input value={form.full_name} onChange={e => update("full_name", e.target.value)} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => update("email", e.target.value)} required /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => update("phone", e.target.value)} required /></div>
          </div>
          <div><Label>License Number</Label><Input value={form.license_number} onChange={e => update("license_number", e.target.value)} /></div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => update("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="on_trip">On Trip</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : driver ? "Update Driver" : "Add Driver"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}