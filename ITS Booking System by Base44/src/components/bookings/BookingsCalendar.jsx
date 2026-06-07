import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, User, Car } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBadge from "@/components/shared/StatusBadge";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function BookingsCalendar({ bookings, onSelectBooking }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Group bookings by date
  const byDate = {};
  bookings.forEach(b => {
    if (!b.pickup_date) return;
    const d = b.pickup_date.slice(0, 10);
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(b);
  });

  const padDate = (d) => {
    const dd = String(d).padStart(2, "0");
    const mm = String(month + 1).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  const selectedBookings = selectedDate ? (byDate[selectedDate] || []) : [];

  const statusColor = {
    pending: "bg-amber-400",
    confirmed: "bg-blue-500",
    arrived: "bg-purple-500",
    in_progress: "bg-orange-500",
    completed: "bg-emerald-500",
    cancelled: "bg-gray-400",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Calendar */}
      <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 p-5">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{MONTHS[month]} {year}</h3>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty slots before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const dateStr = padDate(day);
            const dayBookings = byDate[dateStr] || [];
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`relative min-h-[56px] rounded-xl p-1.5 text-left transition-all border ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm"
                    : isToday
                    ? "border-primary/40 bg-primary/5"
                    : dayBookings.length > 0
                    ? "border-border hover:border-primary/30 hover:bg-muted/30 bg-background"
                    : "border-transparent hover:bg-muted/20"
                }`}
              >
                <span className={`text-xs font-semibold block ${
                  isToday ? "text-primary" : "text-foreground"
                }`}>{day}</span>

                {dayBookings.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {dayBookings.slice(0, 3).map((b, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full ${statusColor[b.status] || "bg-gray-400"}`}
                      />
                    ))}
                    {dayBookings.length > 3 && (
                      <span className="text-[9px] text-muted-foreground">+{dayBookings.length - 3}</span>
                    )}
                  </div>
                )}

                {dayBookings.length > 0 && (
                  <span className="absolute top-1 right-1.5 text-[10px] font-bold text-primary">
                    {dayBookings.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border/50">
          {Object.entries(statusColor).map(([s, cls]) => (
            <div key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className={`w-2.5 h-2.5 rounded-full ${cls}`} />
              <span className="capitalize">{s.replace("_", " ")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day detail panel */}
      <div className="bg-card rounded-2xl border border-border/50 p-5">
        <h3 className="font-semibold mb-3 text-sm">
          {selectedDate
            ? `Bookings on ${selectedDate}`
            : "Select a date to view bookings"}
        </h3>

        <AnimatePresence mode="wait">
          {!selectedDate ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                <ChevronRight className="w-6 h-6" />
              </div>
              <p className="text-sm">Click any date on the calendar</p>
            </motion.div>
          ) : selectedBookings.length === 0 ? (
            <motion.div key="no-bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center"
            >
              <p className="text-sm">No bookings on this date</p>
            </motion.div>
          ) : (
            <motion.div key={selectedDate} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-2.5 max-h-[480px] overflow-y-auto"
            >
              {selectedBookings.map(b => (
                <button
                  key={b.id}
                  onClick={() => onSelectBooking(b)}
                  className="w-full text-left p-3 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-muted/30 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{b.passenger_name}</span>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{b.pickup_address}</span>
                  </div>
                  {b.driver_name && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Car className="w-3 h-3 flex-shrink-0" />
                      <span>{b.driver_name}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{b.pickup_time}</span>
                    <span className="font-semibold text-primary">${(b.total_fare || 0).toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}