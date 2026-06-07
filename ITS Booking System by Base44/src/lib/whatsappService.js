/**
 * WhatsApp Business API Service
 * 
 * WhatsApp Business API ke zariye booking confirmations,
 * driver assignment aur ride status notifications bhejta hai.
 * 
 * How it works:
 * - WhatsApp Cloud API (Meta) use karta hai
 * - Tenant ke WhatsApp Business credentials use karte hain (wa_phone_id, wa_token)
 * - Agar credentials nahi hain to silently skip karta hai
 */

import { base44 } from "@/api/base44Client";

/**
 * WhatsApp pe text message bhejo
 * @param {string} toPhone - International format: +923001234567
 * @param {string} message - Plain text message
 * @param {object} tenant - Tenant object (wa_phone_id, wa_token chahiye)
 */
async function sendWhatsAppMessage(toPhone, message, tenant) {
  if (!toPhone || !tenant?.wa_phone_id || !tenant?.wa_token) return;

  // Phone number clean karo (sirf digits + leading +)
  const cleanPhone = toPhone.replace(/[^0-9+]/g, "").replace(/^\+/, "");

  await base44.integrations.Core.InvokeLLM({
    prompt: `
You are a WhatsApp Business API caller. Make a POST request to send a WhatsApp message.

API Endpoint: https://graph.facebook.com/v18.0/${tenant.wa_phone_id}/messages
Authorization: Bearer ${tenant.wa_token}
Content-Type: application/json

Body:
{
  "messaging_product": "whatsapp",
  "to": "${cleanPhone}",
  "type": "text",
  "text": { "body": ${JSON.stringify(message)} }
}

Please confirm the message was sent successfully. Return {"success": true} or {"success": false, "error": "reason"}.
    `.trim(),
    response_json_schema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        error: { type: "string" }
      }
    }
  });
}

/**
 * Customer ko booking confirmation WhatsApp bhejo
 */
export async function sendWhatsAppBookingConfirmation(booking, tenant) {
  if (!booking?.passenger_phone) return;

  const ref = booking.booking_ref || booking.id?.slice(0, 8);
  const fare = (booking.total_fare || 0).toFixed(2);
  const tenantName = tenant?.business_name || "ITS Booking";
  const symbol = tenant?.currency_symbol || "$";

  const message = `✅ *Booking Confirmed!*

Hi ${booking.passenger_name},

Your ride is booked with *${tenantName}*.

📋 *Ref:* ${ref}
📍 *Pickup:* ${booking.pickup_address}
${booking.dropoff_address ? `🏁 *Dropoff:* ${booking.dropoff_address}\n` : ""}📅 *Date:* ${booking.pickup_date} at ${booking.pickup_time}
🚗 *Vehicle:* ${booking.vehicle_name || "To be assigned"}
👥 *Passengers:* ${booking.passengers_count || 1}
💰 *Total Fare:* ${symbol}${fare}
💳 *Payment:* ${(booking.payment_method || "cash").replace(/_/g, " ")}
${booking.flight_number ? `✈️ *Flight:* ${booking.flight_number}\n` : ""}
Thank you for choosing ${tenantName}! 🙏`;

  await sendWhatsAppMessage(booking.passenger_phone, message, tenant);
}

/**
 * Driver ko new job assignment WhatsApp bhejo
 */
export async function sendWhatsAppDriverAssignment(booking, driver, tenant) {
  if (!driver?.phone) return;

  const ref = booking.booking_ref || booking.id?.slice(0, 8);
  const tenantName = tenant?.business_name || "ITS Booking";
  const symbol = tenant?.currency_symbol || "$";

  const message = `🚗 *New Job Assigned!*

Hi ${driver.full_name},

You have a new booking from *${tenantName}*.

📋 *Ref:* ${ref}
👤 *Passenger:* ${booking.passenger_name}
📞 *Phone:* ${booking.passenger_phone || "N/A"}
📍 *Pickup:* ${booking.pickup_address}
${booking.dropoff_address ? `🏁 *Dropoff:* ${booking.dropoff_address}\n` : ""}📅 *Date:* ${booking.pickup_date} at ${booking.pickup_time}
👥 *Passengers:* ${booking.passengers_count || 1}
💰 *Fare:* ${symbol}${(booking.total_fare || 0).toFixed(2)}
${booking.special_requests ? `📝 *Special Requests:* ${booking.special_requests}\n` : ""}
Please open the Driver App to manage this job. ✅`;

  await sendWhatsAppMessage(driver.phone, message, tenant);
}

/**
 * Customer ko ride status update WhatsApp bhejo
 */
export async function sendWhatsAppStatusUpdate(booking, tenant) {
  if (!booking?.passenger_phone) return;

  const ref = booking.booking_ref || booking.id?.slice(0, 8);
  const tenantName = tenant?.business_name || "ITS Booking";

  const statusMessages = {
    confirmed: `✅ *Booking Confirmed!*\n\nHi ${booking.passenger_name}, your booking *${ref}* with ${tenantName} is confirmed.\n📅 ${booking.pickup_date} at ${booking.pickup_time}\n📍 ${booking.pickup_address}`,
    arrived: `🚗 *Driver Arrived!*\n\nHi ${booking.passenger_name}, your driver *${booking.driver_name || ""}* has arrived at the pickup location.\n📋 Ref: ${ref}`,
    in_progress: `🛣️ *Ride Started!*\n\nHi ${booking.passenger_name}, your ride is now in progress. Enjoy your journey!\n📋 Ref: ${ref}\n🚗 Driver: ${booking.driver_name || "Assigned"}`,
    completed: `🏁 *Ride Completed!*\n\nHi ${booking.passenger_name}, your ride with ${tenantName} is complete.\n📋 Ref: ${ref}\n💰 Total: ${tenant?.currency_symbol || "$"}${(booking.total_fare || 0).toFixed(2)}\n\nThank you for riding with us! ⭐`,
    cancelled: `❌ *Booking Cancelled*\n\nHi ${booking.passenger_name}, your booking *${ref}* has been cancelled.\n\nNeed help? Contact us directly.`,
  };

  const message = statusMessages[booking.status];
  if (!message) return;

  await sendWhatsAppMessage(booking.passenger_phone, message, tenant);
}