import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req: Request) => {
  const base44 = createClientFromRequest(req);

  // Fetch all TenantBookings (we'll filter in code)
  const bookings = await base44.asServiceRole.entities.TenantBooking.list();

  const now = new Date();
  const remindersSent: string[] = [];

  for (const booking of bookings) {
    // Skip if reminder already sent, or no email/date/time
    if (booking.reminder_sent) continue;
    if (!["confirmed", "pending"].includes(booking.status)) continue;
    if (!booking.passenger_email || !booking.pickup_date || !booking.pickup_time) continue;

    // Parse pickup datetime
    const pickupDateTime = new Date(`${booking.pickup_date}T${booking.pickup_time}`);
    const diffHours = (pickupDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Window: 1.75h – 2.5h before pickup
    if (diffHours >= 1.75 && diffHours <= 2.5) {
      // Get tenant info for branding
      const tenants = booking.tenant_id
        ? await base44.asServiceRole.entities.Tenant.filter({ id: booking.tenant_id })
        : [];
      const tenant = tenants[0];
      const businessName = tenant?.business_name || "Your Ride Service";

      const pickupDateFormatted = new Date(booking.pickup_date).toLocaleDateString("en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      });

      await base44.integrations.Core.SendEmail({
        to: booking.passenger_email,
        from_name: businessName,
        subject: `⏰ Reminder: Your ride is in 2 hours – ${booking.booking_ref}`,
        body: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <div style="background:${tenant?.primary_color || "#d4a017"};padding:24px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:22px;">🚗 Your Ride is in 2 Hours!</h1>
            </div>
            <div style="padding:24px;">
              <p style="color:#374151;font-size:16px;">Hi <strong>${booking.passenger_name}</strong>,</p>
              <p style="color:#374151;">This is a reminder that your ride with <strong>${businessName}</strong> is coming up shortly. Please be ready at your pickup location.</p>
              
              <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0;border-left:4px solid ${tenant?.primary_color || "#d4a017"};">
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:6px 0;color:#6b7280;width:120px;">📋 Booking Ref</td><td style="padding:6px 0;font-weight:bold;font-family:monospace;">${booking.booking_ref}</td></tr>
                  <tr><td style="padding:6px 0;color:#6b7280;">📅 Date</td><td style="padding:6px 0;">${pickupDateFormatted}</td></tr>
                  <tr><td style="padding:6px 0;color:#6b7280;">⏰ Time</td><td style="padding:6px 0;font-weight:bold;">${booking.pickup_time}</td></tr>
                  <tr><td style="padding:6px 0;color:#6b7280;">📍 Pickup</td><td style="padding:6px 0;">${booking.pickup_address}</td></tr>
                  ${booking.dropoff_address ? `<tr><td style="padding:6px 0;color:#6b7280;">🏁 Dropoff</td><td style="padding:6px 0;">${booking.dropoff_address}</td></tr>` : ""}
                  ${booking.driver_name ? `<tr><td style="padding:6px 0;color:#6b7280;">👤 Driver</td><td style="padding:6px 0;">${booking.driver_name}</td></tr>` : ""}
                  ${booking.vehicle_name ? `<tr><td style="padding:6px 0;color:#6b7280;">🚗 Vehicle</td><td style="padding:6px 0;">${booking.vehicle_name}</td></tr>` : ""}
                  ${booking.flight_number ? `<tr><td style="padding:6px 0;color:#6b7280;">✈️ Flight</td><td style="padding:6px 0;">${booking.flight_number}</td></tr>` : ""}
                </table>
              </div>

              ${tenant?.phone ? `<p style="color:#374151;">📞 Need help? Call us: <strong>${tenant.phone}</strong></p>` : ""}
              <p style="color:#9ca3af;font-size:12px;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:16px;">This is an automated reminder from ${businessName}. Please do not reply to this email.</p>
            </div>
          </div>
        `,
      });

      // Mark reminder sent
      await base44.asServiceRole.entities.TenantBooking.update(booking.id, { reminder_sent: true });
      remindersSent.push(booking.booking_ref);
    }
  }

  return Response.json({
    success: true,
    checked: bookings.length,
    reminders_sent: remindersSent.length,
    booking_refs: remindersSent,
  });
});