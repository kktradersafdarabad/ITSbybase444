import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, CreditCard, CheckCircle, Shield, Lock, ArrowLeft, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { sendBookingConfirmation } from "@/lib/emailService";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";

// ── PayPal Button ──────────────────────────────────────────────
function PayPalButton({ amount, clientId, onSuccess, onError }) {
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!clientId) { setLoadError(true); return; }

    // Remove any existing PayPal script
    const existing = document.getElementById("paypal-sdk");
    if (existing) existing.remove();
    if (window.paypal) delete window.paypal;

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.onload = () => setLoaded(true);
    script.onerror = () => setLoadError(true);
    document.body.appendChild(script);

    return () => {
      const s = document.getElementById("paypal-sdk");
      if (s) s.remove();
    };
  }, [clientId]);

  useEffect(() => {
    if (!loaded || !containerRef.current || !window.paypal) return;
    containerRef.current.innerHTML = "";
    window.paypal.Buttons({
      style: { layout: "vertical", color: "gold", shape: "rect", label: "pay" },
      createOrder: (data, actions) => actions.order.create({
        purchase_units: [{ amount: { value: amount.toFixed(2) } }]
      }),
      onApprove: async (data, actions) => {
        const details = await actions.order.capture();
        onSuccess(details.id);
      },
      onError: (err) => { console.error(err); onError(); },
      onCancel: () => onError("cancelled"),
    }).render(containerRef.current);
  }, [loaded]);

  if (loadError) return (
    <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-sm text-destructive text-center">
      PayPal could not be loaded. Please check the PayPal Client ID in your integration settings.
    </div>
  );

  if (!loaded) return (
    <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground text-sm">
      <div className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
      Loading PayPal...
    </div>
  );

  return <div ref={containerRef} className="min-h-[50px]" />;
}

// ── Stripe Card Form ───────────────────────────────────────────
function StripeCardForm({ amount, primaryColor, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [name, setName] = useState("");
  const [cardError, setCardError] = useState(null);
  const [nameError, setNameError] = useState("");

  const STRIPE_STYLE = {
    base: {
      fontSize: "16px",
      color: "#1a1a2e",
      "::placeholder": { color: "#9ca3af" },
      fontFamily: '"Inter", "Helvetica Neue", sans-serif',
      lineHeight: "26px",
    },
    invalid: { color: "#ef4444" },
  };

  const handlePay = async () => {
    if (!name.trim()) { setNameError("Enter cardholder name"); return; }
    setNameError("");
    if (!stripe || !elements) return;
    setProcessing(true);
    setCardError(null);

    const cardNumberEl = elements.getElement(CardNumberElement);
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: "card",
      card: cardNumberEl,
      billing_details: { name },
    });

    if (error) {
      setCardError(error.message);
      setProcessing(false);
      onError(error.message);
      return;
    }

    onSuccess(paymentMethod.id);
  };

  const fieldClass = (hasError) =>
    `border rounded-lg bg-white px-3 py-3.5 ${hasError ? "border-destructive" : "border-gray-200"} focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <CreditCard className="w-4 h-4" style={{ color: primaryColor }} /> Secure Card Payment
        </h3>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" /> SSL Secured
        </span>
      </div>

      {/* Card Brand Icons */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="h-8 px-2 bg-white border border-gray-200 rounded flex items-center justify-center shadow-sm">
          <svg viewBox="0 0 60 20" width="48" height="16"><text x="0" y="16" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="#1A1F71">VISA</text></svg>
        </div>
        <div className="h-8 px-2 bg-white border border-gray-200 rounded flex items-center gap-1 shadow-sm">
          <div className="w-5 h-5 rounded-full bg-[#EB001B]" /><div className="w-5 h-5 rounded-full bg-[#F79E1B] -ml-2.5" />
        </div>
        <div className="h-8 px-2 bg-[#2E77BC] rounded flex items-center justify-center shadow-sm">
          <span className="text-white text-[10px] font-bold tracking-wide">AMEX</span>
        </div>
        <div className="h-8 px-2 bg-white border border-gray-200 rounded flex items-center justify-center shadow-sm">
          <span className="text-[#FF6600] text-[10px] font-bold">DISCOVER</span>
        </div>
      </div>

      {/* Cardholder Name */}
      <div>
        <label className="text-sm font-medium block mb-1.5">Cardholder Name</label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="John Doe"
          className={`h-12 text-base ${nameError ? "border-destructive" : ""}`}
        />
        {nameError && <p className="text-xs text-destructive mt-1">{nameError}</p>}
      </div>

      {/* Card Number */}
      <div>
        <label className="text-sm font-medium block mb-1.5">Card Number</label>
        <div className={fieldClass(false)}>
          <CardNumberElement options={{ style: STRIPE_STYLE, showIcon: true }} />
        </div>
      </div>

      {/* Expiry + CVC */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium block mb-1.5">Expiry Date</label>
          <div className={fieldClass(false)}>
            <CardExpiryElement options={{ style: STRIPE_STYLE }} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">CVC / CVV</label>
          <div className={fieldClass(false)}>
            <CardCvcElement options={{ style: STRIPE_STYLE }} />
          </div>
        </div>
      </div>

      {cardError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 text-sm text-destructive">
          {cardError}
        </div>
      )}

      <Button
        onClick={handlePay}
        disabled={processing || !stripe}
        className="w-full h-12 text-base font-semibold gap-2"
        style={{ background: primaryColor }}
      >
        {processing ? (
          <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
        ) : (
          <><Lock className="w-4 h-4" /> Pay ${amount.toFixed(2)} Securely</>
        )}
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Shield className="w-3.5 h-3.5 text-emerald-600" />
        256-bit encrypted · Powered by Stripe · Card data never stored
      </p>
    </div>
  );
}

// ── Main Payment Page ──────────────────────────────────────────
export default function PaymentPage() {
  const pathParts = window.location.pathname.split("/");
  const slug = pathParts[2];
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  const method = params.get("method") || "credit_card";
  const amount = parseFloat(params.get("amount") || "0");

  const payment = params.get("payment"); // "success" | "cancelled" from Stripe hosted redirect
  const [pageStatus, setPageStatus] = useState(payment === "success" ? "stripe_redirect_success" : "idle");
  const [stripePromise, setStripePromise] = useState(null);

  const [pendingBooking] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("pending_booking") || "{}"); } catch { return {}; }
  });

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["tenant", slug],
    queryFn: () => base44.entities.Tenant.filter({ slug }),
    enabled: !!slug,
  });
  const tenant = tenants[0];

  // Load Stripe once tenant is available (for PaymentPage embedded form fallback)
  useEffect(() => {
    if (tenant?.stripe_publishable_key && method === "credit_card" && !payment) {
      setStripePromise(loadStripe(tenant.stripe_publishable_key));
    }
  }, [tenant?.stripe_publishable_key]);

  // Auto-confirm booking when returning from Stripe Hosted Checkout
  useEffect(() => {
    if (payment === "success" && tenant && pendingBooking?.booking_ref && pageStatus === "stripe_redirect_success") {
      const sessionId = params.get("session_id") || "";
      createMutation.mutate({
        ...pendingBooking,
        payment_status: "paid",
        payment_intent_id: sessionId,
        status: "confirmed",
      });
    }
  }, [tenant?.id]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TenantBooking.create(data),
    onSuccess: (result) => {
      sessionStorage.removeItem("pending_booking");
      sendBookingConfirmation(result, tenant?.business_name).catch(() => {});
      setPageStatus("success");
    },
    onError: () => setPageStatus("error"),
  });

  const handlePaymentSuccess = (paymentIntentId) => {
    createMutation.mutate({
      ...pendingBooking,
      payment_status: "paid",
      payment_intent_id: paymentIntentId,
      status: "confirmed",
    });
  };

  const handlePaymentError = (msg) => {
    if (msg !== "cancelled") setPageStatus("error");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const primaryColor = tenant?.primary_color || "#d4a017";

  // ── No pending booking (skip check if returning from Stripe) ──
  if (!pendingBooking?.booking_ref && !payment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-bold">No Pending Booking</h2>
          <p className="text-muted-foreground">Please complete the booking form first.</p>
          <Button variant="outline" onClick={() => window.location.href = `/book/${slug}`}>Back to Booking</Button>
        </div>
      </div>
    );
  }

  // ── Stripe Redirect: Processing ──
  if (pageStatus === "stripe_redirect_success" && createMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Confirming your booking...</p>
        </div>
      </div>
    );
  }

  // ── Stripe Redirect: Cancelled ──
  if (payment === "cancelled") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold">Payment Cancelled</h2>
          <p className="text-muted-foreground">Your payment was not completed. Your booking has not been confirmed.</p>
          <Button onClick={() => window.location.href = `/book/${slug}`} style={{ background: primaryColor }} className="text-white">Try Again</Button>
        </div>
      </div>
    );
  }

  // ── Success Screen ──
  if (pageStatus === "success") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: primaryColor }}>
              <Crown className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">{tenant?.business_name}</span>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5 max-w-sm">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Payment Successful!</h2>
              <p className="text-muted-foreground mt-1">Your booking is confirmed. A confirmation email has been sent.</p>
            </div>
            <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-2 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Booking Ref</span>
                <span className="font-mono font-bold">{ref}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold text-emerald-600">${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-emerald-600">Confirmed ✓</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={() => window.location.href = `/booking/status?ref=${ref}`} className="w-full" style={{ background: primaryColor }}>
                View Booking Status
              </Button>
              <Button variant="outline" onClick={() => window.location.href = `/book/${slug}`} className="w-full">
                Book Another Ride
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Payment Form ──
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          {tenant?.logo_url ? (
            <img src={tenant.logo_url} alt={tenant.business_name} className="h-9 object-contain" />
          ) : (
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: primaryColor }}>
              <Crown className="w-5 h-5 text-white" />
            </div>
          )}
          <span className="font-bold flex-1">{tenant?.business_name}</span>
          <button onClick={() => window.history.back()} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
        {/* Order Summary */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-3">Order Summary</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Booking Ref: <span className="font-mono">{ref}</span></p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {tenant?.business_name} · {method === "credit_card" ? "Credit Card" : "PayPal"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold" style={{ color: primaryColor }}>${amount.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Total due</p>
            </div>
          </div>
        </div>

        {/* Stripe */}
        {method === "credit_card" && (
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            {stripePromise ? (
              <Elements stripe={stripePromise}>
                <StripeCardForm
                  amount={amount}
                  primaryColor={primaryColor}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 text-center space-y-1">
                <p className="font-semibold">Stripe not configured</p>
                <p>Please add a Stripe Publishable Key in the Integrations settings to accept card payments.</p>
              </div>
            )}
          </div>
        )}

        {/* PayPal */}
        {method === "paypal" && (
          <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
            <h3 className="font-semibold">Pay with PayPal</h3>
            <div className="bg-[#f5f7fa] rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-[#003087] font-bold text-3xl italic">Pay</span>
                <span className="text-[#009cde] font-bold text-3xl italic">Pal</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">${amount.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Click the button below to pay securely with PayPal</p>
            </div>

            {tenant?.paypal_client_id ? (
              <PayPalButton
                amount={amount}
                clientId={tenant.paypal_client_id}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 text-center space-y-1">
                <p className="font-semibold">PayPal not configured</p>
                <p>Please add a PayPal Client ID in the Integrations settings to accept PayPal payments.</p>
              </div>
            )}

            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Your payment is protected by PayPal Buyer Protection
            </p>
          </div>
        )}

        {pageStatus === "error" && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-center text-sm text-destructive">
            Payment failed. Please check your details and try again.
          </div>
        )}
      </div>
    </div>
  );
}