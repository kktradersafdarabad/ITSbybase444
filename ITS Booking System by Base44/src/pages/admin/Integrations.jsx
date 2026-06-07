import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, CreditCard, Wallet, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { toast } from "sonner";

export default function Integrations() {
  const queryClient = useQueryClient();
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showPaypalSecret, setShowPaypalSecret] = useState(false);

  const { data: settingsList = [] } = useQuery({
    queryKey: ["settings"],
    queryFn: () => base44.entities.CompanySettings.list(),
  });

  const settings = settingsList[0];
  const [form, setForm] = useState({
    stripe_publishable_key: "",
    stripe_secret_key: "",
    paypal_client_id: "",
    paypal_secret: "",
  });

  useEffect(() => {
    if (settings?.id) {
      setForm({
        stripe_publishable_key: settings.stripe_publishable_key || "",
        stripe_secret_key: settings.stripe_secret_key || "",
        paypal_client_id: settings.paypal_client_id || "",
        paypal_secret: settings.paypal_secret || "",
      });
    }
  }, [settings?.id]);

  const mutation = useMutation({
    mutationFn: (data) => settings?.id
      ? base44.entities.CompanySettings.update(settings.id, data)
      : base44.entities.CompanySettings.create({ company_name: "My Company", ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Payment integrations saved!");
    },
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const hasStripe = !!form.stripe_publishable_key && !!form.stripe_secret_key;
  const hasPaypal = !!form.paypal_client_id;

  return (
    <div className="p-6 lg:p-8 max-w-[900px] mx-auto">
      <PageHeader title="Integrations" subtitle="Connect payment gateways for the public booking form" />

      <div className="space-y-6">
        {/* Stripe */}
        <div className="bg-card rounded-2xl border border-border/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#635bff]/10 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-[#635bff]" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Stripe</h3>
                <p className="text-sm text-muted-foreground">Accept credit/debit card payments</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasStripe
                ? <><CheckCircle className="w-5 h-5 text-emerald-500" /><span className="text-sm text-emerald-600 font-medium">Connected</span></>
                : <><XCircle className="w-5 h-5 text-muted-foreground" /><span className="text-sm text-muted-foreground">Not connected</span></>
              }
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Publishable Key (pk_live_... or pk_test_...)</Label>
              <Input
                value={form.stripe_publishable_key}
                onChange={e => update("stripe_publishable_key", e.target.value)}
                placeholder="pk_live_..."
              />
            </div>
            <div>
              <Label>Secret Key (sk_live_... or sk_test_...)</Label>
              <div className="relative">
                <Input
                  type={showStripeSecret ? "text" : "password"}
                  value={form.stripe_secret_key}
                  onChange={e => update("stripe_secret_key", e.target.value)}
                  placeholder="sk_live_..."
                />
                <button
                  type="button"
                  onClick={() => setShowStripeSecret(!showStripeSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showStripeSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
            <strong>How it works:</strong> When a customer selects "Credit Card" in the booking form, they will be redirected to a secure payment page powered by Stripe. Get your keys from <a href="https://dashboard.stripe.com/apikeys" target="_blank" className="underline">dashboard.stripe.com</a>
          </div>
        </div>

        {/* PayPal */}
        <div className="bg-card rounded-2xl border border-border/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#0070ba]/10 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-[#0070ba]" />
              </div>
              <div>
                <h3 className="font-bold text-lg">PayPal</h3>
                <p className="text-sm text-muted-foreground">Accept PayPal payments</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasPaypal
                ? <><CheckCircle className="w-5 h-5 text-emerald-500" /><span className="text-sm text-emerald-600 font-medium">Connected</span></>
                : <><XCircle className="w-5 h-5 text-muted-foreground" /><span className="text-sm text-muted-foreground">Not connected</span></>
              }
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>PayPal Client ID</Label>
              <Input
                value={form.paypal_client_id}
                onChange={e => update("paypal_client_id", e.target.value)}
                placeholder="AaBbCc..."
              />
            </div>
            <div>
              <Label>PayPal Secret</Label>
              <div className="relative">
                <Input
                  type={showPaypalSecret ? "text" : "password"}
                  value={form.paypal_secret}
                  onChange={e => update("paypal_secret", e.target.value)}
                  placeholder="Your PayPal App Secret"
                />
                <button
                  type="button"
                  onClick={() => setShowPaypalSecret(!showPaypalSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPaypalSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
            <strong>How it works:</strong> When a customer selects "PayPal" in the booking form, they will be redirected to PayPal to complete payment. Get credentials from <a href="https://developer.paypal.com/dashboard/" target="_blank" className="underline">developer.paypal.com</a>
          </div>
        </div>

        {/* How payment selection works */}
        <div className="bg-muted/50 rounded-2xl border border-border/50 p-6">
          <h3 className="font-semibold mb-3">How Payment Methods Appear in Booking Forms</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-primary font-bold mt-0.5">•</span> <span><strong>Credit Card</strong> — Shown only if Stripe keys are configured (above for main form, or per-tenant in Tenants page)</span></li>
            <li className="flex items-start gap-2"><span className="text-primary font-bold mt-0.5">•</span> <span><strong>PayPal</strong> — Shown only if PayPal Client ID is configured</span></li>
            <li className="flex items-start gap-2"><span className="text-primary font-bold mt-0.5">•</span> <span><strong>Cash</strong> — Always shown as an option</span></li>
            <li className="flex items-start gap-2"><span className="text-primary font-bold mt-0.5">•</span> <span>For <strong>tenant customers</strong>, configure their payment keys individually in the <strong>Tenants</strong> page under each tenant's payment tab</span></li>
          </ul>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="gap-2">
            <Save className="w-4 h-4" /> {mutation.isPending ? "Saving..." : "Save Integrations"}
          </Button>
        </div>
      </div>
    </div>
  );
}