import { base44 } from "@/api/base44Client";

/**
 * Send booking confirmation email to passenger
 */
export async function sendBookingConfirmation(booking, tenantName = "LimoElite") {
  if (!booking?.passenger_email) return;

  const ref = booking.booking_ref || booking.id?.slice(0, 8);
  const fare = (booking.total_fare || 0).toFixed(2);

  await base44.integrations.Core.SendEmail({
    to: booking.passenger_email,
    subject: `Booking Confirmed – ${ref} | ${tenantName}`,
    body: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Inter,sans-serif;background:#f5f5f5;margin:0;padding:20px;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
    <div style="background:#d4a017;padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">${tenantName}</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:15px;">Booking Confirmed ✓</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#111;font-size:16px;margin-top:0;">Hi <strong>${booking.passenger_name}</strong>,</p>
      <p style="color:#444;font-size:14px;">Your ride has been successfully booked. Here are your details:</p>

      <div style="background:#f9f9f9;border-radius:12px;padding:20px;margin:20px 0;">
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="color:#666;padding:6px 0;">Booking Ref</td><td style="text-align:right;font-weight:700;font-family:monospace;font-size:16px;">${ref}</td></tr>
          <tr><td style="color:#666;padding:6px 0;">Pickup</td><td style="text-align:right;color:#111;">${booking.pickup_address}</td></tr>
          ${booking.dropoff_address ? `<tr><td style="color:#666;padding:6px 0;">Dropoff</td><td style="text-align:right;color:#111;">${booking.dropoff_address}</td></tr>` : ""}
          <tr><td style="color:#666;padding:6px 0;">Date & Time</td><td style="text-align:right;color:#111;">${booking.pickup_date} at ${booking.pickup_time}</td></tr>
          <tr><td style="color:#666;padding:6px 0;">Vehicle</td><td style="text-align:right;color:#111;">${booking.vehicle_name || "Assigned"}</td></tr>
          <tr><td style="color:#666;padding:6px 0;">Passengers</td><td style="text-align:right;color:#111;">${booking.passengers_count || 1}</td></tr>
          <tr><td style="color:#666;padding:6px 0;">Payment</td><td style="text-align:right;color:#111;text-transform:capitalize;">${(booking.payment_method || "cash").replace(/_/g, " ")}</td></tr>
          <tr style="border-top:2px solid #eee;"><td style="color:#111;padding:12px 0 6px;font-weight:700;font-size:16px;">Total Fare</td><td style="text-align:right;font-weight:700;font-size:20px;color:#d4a017;padding:12px 0 6px;">$${fare}</td></tr>
        </table>
      </div>

      ${booking.special_requests ? `<p style="color:#444;font-size:14px;"><strong>Special Requests:</strong> ${booking.special_requests}</p>` : ""}
      ${booking.flight_number ? `<p style="color:#444;font-size:14px;"><strong>Flight:</strong> ${booking.flight_number}</p>` : ""}

      <p style="color:#444;font-size:14px;margin-top:24px;">If you have any questions, please contact us. We look forward to serving you!</p>
    </div>
    <div style="background:#f9f9f9;padding:20px;text-align:center;border-top:1px solid #eee;">
      <p style="color:#888;font-size:12px;margin:0;">${tenantName} · Booking Reference: ${ref}</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    from_name: tenantName,
  });
}

/**
 * Send new job alert email to driver
 */
export async function sendDriverJobAlert(booking, driverEmail, driverName, tenantName = "LimoElite") {
  if (!driverEmail) return;

  const ref = booking.booking_ref || booking.id?.slice(0, 8);

  await base44.integrations.Core.SendEmail({
    to: driverEmail,
    subject: `New Job Assigned – ${ref} | ${tenantName}`,
    body: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Inter,sans-serif;background:#f5f5f5;margin:0;padding:20px;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
    <div style="background:#1a2744;padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">${tenantName}</h1>
      <p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:15px;">🚗 New Job Alert</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#111;font-size:16px;margin-top:0;">Hi <strong>${driverName}</strong>,</p>
      <p style="color:#444;font-size:14px;">You have a new job assigned. Please check the details below:</p>

      <div style="background:#f9f9f9;border-radius:12px;padding:20px;margin:20px 0;">
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="color:#666;padding:6px 0;">Booking Ref</td><td style="text-align:right;font-weight:700;font-family:monospace;font-size:16px;">${ref}</td></tr>
          <tr><td style="color:#666;padding:6px 0;">Passenger</td><td style="text-align:right;color:#111;">${booking.passenger_name}</td></tr>
          <tr><td style="color:#666;padding:6px 0;">Phone</td><td style="text-align:right;color:#111;">${booking.passenger_phone || "—"}</td></tr>
          <tr><td style="color:#666;padding:6px 0;">Pickup</td><td style="text-align:right;color:#111;">${booking.pickup_address}</td></tr>
          ${booking.dropoff_address ? `<tr><td style="color:#666;padding:6px 0;">Dropoff</td><td style="text-align:right;color:#111;">${booking.dropoff_address}</td></tr>` : ""}
          <tr><td style="color:#666;padding:6px 0;">Date & Time</td><td style="text-align:right;color:#111;">${booking.pickup_date} at ${booking.pickup_time}</td></tr>
          <tr><td style="color:#666;padding:6px 0;">Passengers</td><td style="text-align:right;color:#111;">${booking.passengers_count || 1}</td></tr>
          ${booking.flight_number ? `<tr><td style="color:#666;padding:6px 0;">Flight</td><td style="text-align:right;color:#111;">${booking.flight_number}</td></tr>` : ""}
          <tr style="border-top:2px solid #eee;"><td style="color:#111;padding:12px 0 6px;font-weight:700;">Fare</td><td style="text-align:right;font-weight:700;font-size:18px;color:#d4a017;padding:12px 0 6px;">$${(booking.total_fare || 0).toFixed(2)}</td></tr>
        </table>
      </div>

      ${booking.special_requests ? `<div style="background:#fff8e6;border:1px solid #f0d080;border-radius:8px;padding:12px;margin-bottom:16px;"><p style="color:#7a5c00;font-size:13px;margin:0;"><strong>Special Requests:</strong> ${booking.special_requests}</p></div>` : ""}

      <p style="color:#444;font-size:14px;">Log in to the driver app to manage this booking.</p>
    </div>
    <div style="background:#f9f9f9;padding:20px;text-align:center;border-top:1px solid #eee;">
      <p style="color:#888;font-size:12px;margin:0;">${tenantName} · Driver Portal</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    from_name: tenantName,
  });
}

/**
 * Send status update email to passenger
 */
export async function sendStatusUpdateEmail(booking, tenantName = "LimoElite") {
  if (!booking?.passenger_email) return;

  const ref = booking.booking_ref || booking.id?.slice(0, 8);
  const statusLabels = {
    confirmed: "Your booking has been confirmed",
    in_progress: "Your driver is on the way",
    completed: "Your ride is complete",
    cancelled: "Your booking has been cancelled",
  };
  const label = statusLabels[booking.status];
  if (!label) return;

  await base44.integrations.Core.SendEmail({
    to: booking.passenger_email,
    subject: `Booking Update – ${ref} | ${tenantName}`,
    body: `
<!DOCTYPE html>
<html>
<body style="font-family:Inter,sans-serif;background:#f5f5f5;margin:0;padding:20px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
    <div style="background:#d4a017;padding:24px;text-align:center;">
      <p style="color:#fff;margin:0;font-size:18px;font-weight:700;">${tenantName}</p>
    </div>
    <div style="padding:28px;">
      <p style="color:#111;font-size:16px;margin-top:0;">Hi <strong>${booking.passenger_name}</strong>,</p>
      <p style="color:#444;font-size:15px;">${label}.</p>
      <p style="color:#888;font-size:14px;">Booking Ref: <strong>${ref}</strong></p>
      ${booking.driver_name ? `<p style="color:#444;font-size:14px;">Driver: <strong>${booking.driver_name}</strong></p>` : ""}
    </div>
  </div>
</body>
</html>
    `.trim(),
    from_name: tenantName,
  });
}