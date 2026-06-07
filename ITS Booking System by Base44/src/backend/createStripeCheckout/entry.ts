import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const { tenantSlug, amount, bookingRef, currency = "usd" } = await req.json();

  if (!tenantSlug || !amount || !bookingRef) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const base44 = createClientFromRequest(req);
  const tenants = await base44.asServiceRole.entities.Tenant.filter({ slug: tenantSlug });
  const tenant = tenants[0];

  if (!tenant?.stripe_secret_key) {
    return Response.json({ error: "Stripe is not configured for this tenant" }, { status: 400 });
  }

  const origin = req.headers.get("origin") || `https://app.base44.app`;
  const successUrl = `${origin}/pay/${tenantSlug}?payment=success&ref=${bookingRef}&amount=${amount}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl  = `${origin}/pay/${tenantSlug}?payment=cancelled&ref=${bookingRef}&amount=${amount}`;

  const params = new URLSearchParams({
    "payment_method_types[]": "card",
    "line_items[0][price_data][currency]": (tenant.currency || currency).toLowerCase(),
    "line_items[0][price_data][product_data][name]": `Ride Booking – ${bookingRef}`,
    "line_items[0][price_data][product_data][description]": tenant.business_name || "Transportation Service",
    "line_items[0][price_data][unit_amount]": String(Math.round(amount * 100)),
    "line_items[0][quantity]": "1",
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    "metadata[booking_ref]": bookingRef,
    "metadata[tenant_slug]": tenantSlug,
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tenant.stripe_secret_key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const session = await response.json();

  if (!response.ok || session.error) {
    const errMsg = session.error?.message || `Stripe error (${response.status})`;
    return Response.json({ error: errMsg }, { status: 200 });
  }

  return Response.json({ url: session.url, session_id: session.id });
});