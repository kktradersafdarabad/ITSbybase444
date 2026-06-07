import { TenantBooking, Tenant } from '../types';

export function sendBookingConfirmationEmail(booking: TenantBooking, tenant: Tenant) {
  const brand = tenant.business_name;
  const color = tenant.primary_color || '#C91C14';
  const symbol = tenant.currency_symbol || '$';
  
  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05)">
      <div style="background-color: ${color}; color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 20px; font-weight: bold;">Booking Confirmed!</h1>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Ref: ${booking.booking_ref}</p>
      </div>
      <div style="padding: 24px; background-color: #ffffff; color: #333333;">
        <p>Dear <strong>${booking.passenger_name}</strong>,</p>
        <p>Thank you for choosing ${brand}. Your luxury ride reservation is secured. Below is your booking summary:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 13px;">Pickup Point</td>
            <td style="padding: 8px 0; font-weight: bold; font-size: 13px; text-align: right;">${booking.pickup_address}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 13px;">Dropoff Point</td>
            <td style="padding: 8px 0; font-weight: bold; font-size: 13px; text-align: right;">${booking.dropoff_address}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 13px;">Date & Time</td>
            <td style="padding: 8px 0; font-weight: bold; font-size: 13px; text-align: right;">${booking.pickup_date} at ${booking.pickup_time}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 13px;">Vehicle Class</td>
            <td style="padding: 8px 0; font-weight: bold; font-size: 13px; text-align: right;">${booking.vehicle_name || 'Premium Class'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 13px;">Status</td>
            <td style="padding: 8px 0; font-weight: bold; color: ${color}; font-size: 13px; text-align: right; text-transform: uppercase;">${booking.status}</td>
          </tr>
        </table>
        
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        
        <div style="background-color: #fcfcfc; padding: 12px; border-radius: 8px; border: 1px dashed #dedede; display: flex; justify-content: space-between;">
          <span style="font-size: 14px; font-weight: bold;">Total Amount Charged</span>
          <span style="font-size: 14px; font-weight: bold; color: ${color};">${symbol} ${booking.total_fare}</span>
        </div>

        <p style="font-size: 11px; color: #999999; margin-top: 24px; text-align: center; border-top: 1px solid #eeeeee; padding-top: 16px;">
          This is an automated operational transmission from ${brand} Intelligent Transport System hub. If you have any inquiries regarding your booking, please reach us out.
        </p>
      </div>
    </div>
  `;

  console.log(`[EMAIL DISPATCH] Sent to ${booking.passenger_email} for booking ${booking.booking_ref}`);
  return {
    success: true,
    recipient: booking.passenger_email,
    html: htmlTemplate
  };
}
