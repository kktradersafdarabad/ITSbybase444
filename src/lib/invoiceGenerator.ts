import { jsPDF } from 'jspdf';
import { TenantBooking, Tenant } from '../types';

export function generateInvoicePDF(booking: TenantBooking, tenant: Tenant): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = tenant.primary_color || '#C91C14';
  const currencySymbol = tenant.currency_symbol || '$';
  const brand = tenant.business_name;

  // Header background block (Primary Accent)
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 40, 'F');

  // Title
  doc.setTextColor('#FFFFFF');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(brand.toUpperCase(), 15, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('INTELLIGENT TRANSPORTATION SYSTEM (ITS)', 15, 32);

  // Invoice label
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEIPT/INVOICE', 140, 25);

  // Reset text color to dark gray
  doc.setTextColor('#333333');
  
  // Section: Booking metadata
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BOOKING METADATA', 15, 55);
  doc.line(15, 57, 195, 57);

  doc.setFont('helvetica', 'normal');
  doc.text(`Booking Reference Code:`, 15, 65);
  doc.setFont('helvetica', 'bold');
  doc.text(`${booking.booking_ref}`, 70, 65);

  doc.setFont('helvetica', 'normal');
  doc.text(`Scheduled Date/Time:`, 15, 71);
  doc.text(`${booking.pickup_date} at ${booking.pickup_time}`, 70, 71);

  doc.text(`Service Booking Mode:`, 15, 77);
  doc.text(`${booking.booking_type.toUpperCase()}`, 70, 77);

  doc.text(`Assigned Driver Chauffeur:`, 15, 83);
  doc.text(`${booking.driver_name || 'Not Dispatched / Cash Booking'}`, 70, 83);

  // Section: Passenger Details
  doc.setFont('helvetica', 'bold');
  doc.text('PASSENGER DETAILS', 15, 95);
  doc.line(15, 97, 195, 97);

  doc.setFont('helvetica', 'normal');
  doc.text(`Name:`, 15, 105);
  doc.text(`${booking.passenger_name}`, 40, 105);

  doc.text(`Email Address:`, 15, 111);
  doc.text(`${booking.passenger_email}`, 40, 111);

  doc.text(`Contact Number:`, 15, 117);
  doc.text(`${booking.passenger_phone || 'None provided'}`, 40, 117);

  // Section: Routing
  doc.setFont('helvetica', 'bold');
  doc.text('TRIP ROUTE', 15, 129);
  doc.line(15, 131, 195, 131);

  doc.setFont('helvetica', 'bold');
  doc.text('Pickup Terminal:', 15, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(`${booking.pickup_address}`, 48, 139);

  doc.setFont('helvetica', 'bold');
  doc.text('Destination Dropoff:', 15, 145);
  doc.setFont('helvetica', 'normal');
  doc.text(`${booking.dropoff_address}`, 48, 145);

  if (booking.estimated_distance_km) {
    doc.text(`Total Distance: ${booking.estimated_distance_km} KM (${booking.estimated_duration_min || 0} Minutes Traveled)`, 48, 151);
  }

  // Section: Pricing & Total Breakdown
  doc.setFont('helvetica', 'bold');
  doc.text('FARE & DISCOUNTS BREAKDOWN', 15, 163);
  doc.line(15, 165, 195, 165);

  doc.setFont('helvetica', 'normal');
  doc.text('Base Tariff:', 15, 172);
  doc.text(`${currencySymbol} ${booking.base_fare.toFixed(2)}`, 140, 172);

  doc.text('Distance Charge Multiplier:', 15, 178);
  doc.text(`${currencySymbol} ${booking.distance_charge.toFixed(2)}`, 140, 178);

  doc.text('Time Duration Charge:', 15, 184);
  doc.text(`${currencySymbol} ${booking.time_charge.toFixed(2)}`, 140, 184);

  if (booking.discount_amount > 0) {
    doc.setTextColor('#C91C14');
    doc.text(`Promo Code Offset (${booking.promo_code || 'APPLIED'}):`, 15, 190);
    doc.text(`- ${currencySymbol} ${booking.discount_amount.toFixed(2)}`, 140, 190);
    doc.setTextColor('#333333');
  }

  // Total summary badge
  doc.setFillColor('#F3F4F6');
  doc.rect(15, 202, 180, 15, 'F');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('NET TOTAL DUE / CHARGED', 20, 211);
  doc.setTextColor(primaryColor);
  doc.text(`${currencySymbol} ${booking.total_fare.toFixed(2)}`, 141, 211);

  // Footer message
  doc.setTextColor('#999999');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Authorized verification stamp generated via digital server portal. No signature required.', 15, 235);
  doc.text(`Transaction Status: ${booking.payment_status.toUpperCase() || 'PAID'} VIA ${booking.payment_method.toUpperCase()}`, 15, 240);

  return doc;
}

export function downloadInvoicePDF(booking: TenantBooking, tenant: Tenant) {
  const doc = generateInvoicePDF(booking, tenant);
  doc.save(`Invoice_${booking.booking_ref}.pdf`);
}
