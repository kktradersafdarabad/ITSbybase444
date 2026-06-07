import StatusBadge from "@/components/shared/StatusBadge";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

export default function RecentBookingsTable({ bookings }) {
  if (bookings.length === 0) {
    return <p className="text-muted-foreground text-sm text-center py-8">No bookings yet</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Ref</th>
            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Passenger</th>
            <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden md:table-cell">Pickup</th>
            <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden lg:table-cell">Date</th>
            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
            <th className="text-right py-3 px-4 text-muted-foreground font-medium">Fare</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
              <td className="py-3 px-4 font-mono text-xs">{b.booking_ref || b.id?.slice(0, 8)}</td>
              <td className="py-3 px-4 font-medium">{b.passenger_name}</td>
              <td className="py-3 px-4 text-muted-foreground hidden md:table-cell truncate max-w-[200px]">{b.pickup_address}</td>
              <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{b.pickup_date}</td>
              <td className="py-3 px-4"><StatusBadge status={b.status} /></td>
              <td className="py-3 px-4 text-right font-semibold">${(b.total_fare || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}