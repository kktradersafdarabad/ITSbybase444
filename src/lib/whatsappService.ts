import { TenantBooking, Tenant } from '../types';

export function sendWhatsAppBookingConfirmation(booking: TenantBooking, tenant: Tenant) {
  const brand = tenant.business_name;
  const logo = tenant.logo_url || 'https://via.placeholder.com/150';
  const phoneId = tenant.wa_phone_id || 'sandbox-whatsapp-phone-id';
  const token = tenant.wa_token ? '••••••••' : 'unsigned-public-sandbox';
  
  const textMessage = `*${brand} Booking Confirmation* ✅ \n\nHello ${booking.passenger_name},\nYour booking *${booking.booking_ref}* has been successfully scheduled.\n\n📍 *Pickup:* ${booking.pickup_address}\n📍 *Dropoff:* ${booking.dropoff_address}\n📅 *Date/Time:* ${booking.pickup_date} at ${booking.pickup_time}\n🚗 *Vehicle:* ${booking.vehicle_name || 'Standard Luxe'}\n💰 *Fare:* ${tenant.currency_symbol || '$'} ${booking.total_fare}\n🚀 *Status:* ${booking.status.toUpperCase()}\n\nTrack your live chauffeur location here: https://netlify-its-app.example.com/booking/status?ref=${booking.booking_ref}\n\nHave a safe and pleasant journey with ${brand}! 🌟`;

  const metaPayload = {
    messaging_product: "whatsapp",
    to: booking.passenger_phone || "+1234567890",
    type: "template",
    template: {
      name: "booking_confirmation_new",
      language: { code: "en_US" },
      components: [
        {
          type: "header",
          parameters: [{ type: "text", text: booking.booking_ref }]
        },
        {
          type: "body",
          parameters: [
            { type: "text", text: booking.passenger_name },
            { type: "text", text: booking.pickup_address },
            { type: "text", text: booking.dropoff_address },
            { type: "text", text: `${booking.pickup_date} ${booking.pickup_time}` },
            { type: "text", text: `${tenant.currency_symbol || '$'}${booking.total_fare}` }
          ]
        }
      ]
    }
  };

  console.log(`[WHATSAPP BUSINESS DISPATCH VIA ID: ${phoneId}]`, textMessage);
  return {
    success: true,
    destination: booking.passenger_phone,
    text: textMessage,
    payload: metaPayload,
    configuredToken: token,
    phoneId: phoneId
  };
}

export function sendWhatsAppStatusUpdate(booking: TenantBooking, tenant: Tenant, action: string) {
  const brand = tenant.business_name;
  let emoji = '📍';
  let desc = `Your booking status is updated to: ${booking.status}`;

  if (action === 'arrived') {
    emoji = '🚨';
    desc = `Your chauffeur ${booking.driver_name || 'Partner'} has arrived at your pickup location!`;
  } else if (action === 'in_progress') {
    emoji = '🏎️';
    desc = `Your ride has officially started. Let's make it comfortable!`;
  } else if (action === 'completed') {
    emoji = '🏆';
    desc = `You have arrived safely at your destination. Thank you for choosing ${brand}!`;
  }

  const textMessage = `*${brand} Ride Alert* ${emoji}\n\nDear ${booking.passenger_name},\n\n${desc}\n\n🚗 *Chauffeur:* ${booking.driver_name || 'Verified Chauffeur'}\n🚘 *Vehicle Plate:* ${booking.vehicle_name || 'Comfort Class'}\n📖 *Booking Ref:* ${booking.booking_ref}\n\nLive Status: https://netlify-its-app.example.com/booking/status?ref=${booking.booking_ref}`;

  console.log(`[WHATSAPP STATUS UPDATE DISPATCH]`, textMessage);
  return {
    success: true,
    destination: booking.passenger_phone,
    text: textMessage
  };
}
