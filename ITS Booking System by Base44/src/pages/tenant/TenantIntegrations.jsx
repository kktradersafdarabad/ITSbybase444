import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, CreditCard, Eye, EyeOff, CheckCircle, AlertCircle, Info, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function TenantIntegrations() {
  const { tenant, slug } = useOutletContext();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    stripe_publishable_key: tenant.stripe_publishable_key || "",
    stripe_secret_key: tenant.stripe_secret_key || "",
    paypal_client_id: tenant.paypal_client_id || "",
    paypal_secret: tenant.paypal_secret || "",
    wa_phone_id: tenant.wa_phone_id || "",
    wa_token: tenant.wa_token || "",
  });

  const [showSecrets, setShowSecrets] = useState({ stripe: false, paypal: false, wa: false });
  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Tenant.update(tenant.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-admin", slug] });
      toast.success("Integration settings saved!");
    },
  });

  const stripeConnected = !!form.stripe_publishable_key && !!form.stripe_secret_key;
  const paypalConnected = !!form.paypal_client_id && !!form.paypal_secret;
  const waConnected = !!form.wa_phone_id && !!form.wa_token;

  return (
    <div className="p-6 lg:p-8 max-w-[900px] mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">Payment Integrations</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure payment gateways for {tenant.business_name}</p>
        </div>
        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="gap-2">
          <Save className="w-4 h-4" /> {mutation.isPending ? "Saving..." : "Save Integrations"}
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <p className="font-semibold">How it works</p>
          <p className="mt-1 text-xs">When customers select "Credit Card" or "PayPal" on your booking form, they will be redirected to the respective payment page. After payment, the booking is automatically confirmed.</p>
        </div>
      </div>

      {/* Payment Methods Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`rounded-2xl border p-4 flex items-center gap-3 ${stripeConnected ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" : "bg-muted/40 border-border"}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stripeConnected ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-muted"}`}>
            <CreditCard className={`w-5 h-5 ${stripeConnected ? "text-emerald-600" : "text-muted-foreground"}`} />
          </div>
          <div>
            <p className="font-semibold text-sm">Stripe</p>
            <div className="flex items-center gap-1 mt-0.5">
              {stripeConnected ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-muted-foreground" />}
              <p className="text-xs text-muted-foreground">{stripeConnected ? "Connected" : "Not configured"}</p>
            </div>
          </div>
        </div>
        <div className={`rounded-2xl border p-4 flex items-center gap-3 ${paypalConnected ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" : "bg-muted/40 border-border"}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paypalConnected ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-muted"}`}>
            <span className={`text-lg font-bold ${paypalConnected ? "text-emerald-600" : "text-muted-foreground"}`}>P</span>
          </div>
          <div>
            <p className="font-semibold text-sm">PayPal</p>
            <div className="flex items-center gap-1 mt-0.5">
              {paypalConnected ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-muted-foreground" />}
              <p className="text-xs text-muted-foreground">{paypalConnected ? "Connected" : "Not configured"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stripe */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-500" /> Stripe Configuration
          </h3>
          {stripeConnected && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Active</span>}
        </div>
        <div className="space-y-3">
          <div>
            <Label>Publishable Key</Label>
            <Input
              value={form.stripe_publishable_key}
              onChange={e => u("stripe_publishable_key", e.target.value)}
              placeholder="pk_live_... or pk_test_..."
            />
            <p className="text-xs text-muted-foreground mt-1">Found in your Stripe Dashboard → Developers → API Keys</p>
          </div>
          <div>
            <Label>Secret Key</Label>
            <div className="relative">
              <Input
                type={showSecrets.stripe ? "text" : "password"}
                value={form.stripe_secret_key}
                onChange={e => u("stripe_secret_key", e.target.value)}
                placeholder="sk_live_... or sk_test_..."
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowSecrets(p => ({ ...p, stripe: !p.stripe }))}
              >
                {showSecrets.stripe ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Keep this secret — never share it publicly</p>
          </div>
        </div>
      </div>

      {/* PayPal */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="text-lg font-bold text-blue-600">P</span> PayPal Configuration
          </h3>
          {paypalConnected && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Active</span>}
        </div>
        <div className="space-y-3">
          <div>
            <Label>Client ID</Label>
            <Input
              value={form.paypal_client_id}
              onChange={e => u("paypal_client_id", e.target.value)}
              placeholder="AaBbCcDd..."
            />
            <p className="text-xs text-muted-foreground mt-1">Found in PayPal Developer Dashboard → My Apps</p>
          </div>
          <div>
            <Label>Client Secret</Label>
            <div className="relative">
              <Input
                type={showSecrets.paypal ? "text" : "password"}
                value={form.paypal_secret}
                onChange={e => u("paypal_secret", e.target.value)}
                placeholder="EeFfGgHh..."
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowSecrets(p => ({ ...p, paypal: !p.paypal }))}
              >
                {showSecrets.paypal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Keep this secret — never share it publicly</p>
          </div>
        </div>
      </div>

      {/* WhatsApp Business API */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp Business API
          </h3>
          {waConnected
            ? <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Active</span>
            : <span className="text-xs text-muted-foreground">Optional</span>}
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-3 text-xs text-green-800 dark:text-green-300">
          <p className="font-semibold mb-1">📱 Automated WhatsApp Notifications</p>
          <p>When configured, customers will receive booking confirmation, driver assignment, and ride status updates directly on WhatsApp. Drivers also get job alerts on WhatsApp.</p>
          <p className="mt-1">Get credentials from: <strong>developers.facebook.com → WhatsApp → API Setup</strong></p>
        </div>
        <div className="space-y-3">
          <div>
            <Label>Phone Number ID</Label>
            <Input
              value={form.wa_phone_id}
              onChange={e => u("wa_phone_id", e.target.value)}
              placeholder="1234567890123456"
            />
            <p className="text-xs text-muted-foreground mt-1">Found in Meta Developer Console → WhatsApp → API Setup → Phone Number ID</p>
          </div>
          <div>
            <Label>Access Token</Label>
            <div className="relative">
              <Input
                type={showSecrets.wa ? "text" : "password"}
                value={form.wa_token}
                onChange={e => u("wa_token", e.target.value)}
                placeholder="EAABwzLixnjYBO..."
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowSecrets(p => ({ ...p, wa: !p.wa }))}
              >
                {showSecrets.wa ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Temporary (24hr) or permanent token from Meta Developer Console</p>
          </div>
        </div>
      </div>

      {/* How payment shows on booking form */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-3">
        <h3 className="font-semibold text-sm">Payment Methods on Booking Form</h3>
        <p className="text-xs text-muted-foreground">Based on your configuration, customers will see these options:</p>
        <div className="space-y-2">
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${stripeConnected ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10" : "border-border opacity-50"}`}>
            <CreditCard className="w-4 h-4" />
            <span className="text-sm font-medium">Credit / Debit Card (Stripe)</span>
            {stripeConnected ? <CheckCircle className="w-4 h-4 text-emerald-600 ml-auto" /> : <span className="text-xs text-muted-foreground ml-auto">Disabled</span>}
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${paypalConnected ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10" : "border-border opacity-50"}`}>
            <span className="font-bold text-blue-600 text-sm">PayPal</span>
            <span className="text-sm font-medium">PayPal</span>
            {paypalConnected ? <CheckCircle className="w-4 h-4 text-emerald-600 ml-auto" /> : <span className="text-xs text-muted-foreground ml-auto">Disabled</span>}
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
            <span className="text-sm">💵</span>
            <span className="text-sm font-medium">Cash on Pickup</span>
            <span className="text-xs text-emerald-600 ml-auto font-medium">Always available</span>
          </div>
        </div>
      </div>
    </div>
  );
}