import jsPDF from "jspdf";

export function generateBookingInvoice(booking, tenantName = "Transport Co.") {
  const doc = new jsPDF();
  const primaryColor = [212, 160, 23]; // gold
  const darkColor = [26, 39, 68];
  const ref = booking.booking_ref || booking.id?.slice(0, 8) || "N/A";
  const fare = (booking.total_fare || 0).toFixed(2);

  // Header background
  doc.setFillColor(...darkColor);
  doc.rect(0, 0, 210, 45, "F");

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(tenantName, 15, 22);

  // Invoice label
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(212, 160, 23);
  doc.text("BOOKING INVOICE", 15, 34);

  // Ref on right
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`Ref: ${ref}`, 195, 22, { align: "right" });
  doc.text(new Date().toLocaleDateString(), 195, 32, { align: "right" });

  // Divider
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(15, 50, 195, 50);

  // Passenger info
  doc.setTextColor(...darkColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 15, 62);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(booking.passenger_name || "Passenger", 15, 72);
  if (booking.passenger_email) doc.text(booking.passenger_email, 15, 80);
  if (booking.passenger_phone) doc.text(booking.passenger_phone, 15, 88);

  // Trip details on right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Trip Details:", 120, 62);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Date: ${booking.pickup_date || "—"}`, 120, 72);
  doc.text(`Time: ${booking.pickup_time || "—"}`, 120, 80);
  if (booking.vehicle_name) doc.text(`Vehicle: ${booking.vehicle_name}`, 120, 88);
  if (booking.driver_name) doc.text(`Driver: ${booking.driver_name}`, 120, 96);

  // Addresses section
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(15, 105, 195, 105);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkColor);
  doc.text("Pickup:", 15, 115);
  doc.setFont("helvetica", "normal");
  const pickupLines = doc.splitTextToSize(booking.pickup_address || "—", 80);
  doc.text(pickupLines, 40, 115);

  if (booking.dropoff_address) {
    doc.setFont("helvetica", "bold");
    doc.text("Dropoff:", 110, 115);
    doc.setFont("helvetica", "normal");
    const dropLines = doc.splitTextToSize(booking.dropoff_address, 80);
    doc.text(dropLines, 135, 115);
  }

  // Fare breakdown table
  doc.line(15, 130, 195, 130);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Fare Breakdown", 15, 142);

  // Table header
  doc.setFillColor(245, 245, 245);
  doc.rect(15, 148, 180, 10, "F");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("Description", 20, 155);
  doc.text("Amount", 180, 155, { align: "right" });

  const rows = [];
  if (booking.base_fare) rows.push(["Base Fare", `$${booking.base_fare.toFixed(2)}`]);
  if (booking.distance_charge) rows.push(["Distance Charge", `$${booking.distance_charge.toFixed(2)}`]);
  if (booking.time_charge) rows.push(["Time Charge", `$${booking.time_charge.toFixed(2)}`]);
  if (booking.discount_amount && booking.discount_amount > 0) {
    rows.push([`Discount${booking.promo_code ? ` (${booking.promo_code})` : ""}`, `-$${booking.discount_amount.toFixed(2)}`]);
  }

  let rowY = 165;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkColor);
  rows.forEach((row, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(252, 252, 252);
      doc.rect(15, rowY - 6, 180, 10, "F");
    }
    doc.text(row[0], 20, rowY);
    doc.text(row[1], 180, rowY, { align: "right" });
    rowY += 12;
  });

  // Total
  doc.setFillColor(...primaryColor);
  doc.rect(15, rowY + 2, 180, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("TOTAL FARE", 20, rowY + 12);
  doc.text(`$${fare}`, 190, rowY + 12, { align: "right" });

  // Payment status
  rowY += 25;
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  const payStatus = booking.payment_status === "paid" ? "✓ PAID" : "PENDING";
  const payColor = booking.payment_status === "paid" ? [34, 197, 94] : [239, 68, 68];
  doc.setTextColor(...payColor);
  doc.setFont("helvetica", "bold");
  doc.text(`Payment Status: ${payStatus}`, 15, rowY + 12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const method = (booking.payment_method || "cash").replace(/_/g, " ");
  doc.text(`Method: ${method.charAt(0).toUpperCase() + method.slice(1)}`, 15, rowY + 22);

  // Footer
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 270, 210, 30, "F");
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "normal");
  doc.text(`Thank you for choosing ${tenantName}!`, 105, 280, { align: "center" });
  doc.text(`Booking Ref: ${ref} · Generated on ${new Date().toLocaleString()}`, 105, 290, { align: "center" });

  // Save
  doc.save(`Invoice_${ref}.pdf`);
}