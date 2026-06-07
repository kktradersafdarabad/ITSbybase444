import { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Navigation, MapPin } from "lucide-react";

// Simulated live map using Canvas (no API key needed)
// Shows animated car moving along a route
export default function LiveTracker({ booking, driverId, isDriver = false }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [locationShared, setLocationShared] = useState(false);
  const posRef = useRef({ x: 0.1, y: 0.85, progress: 0 });

  // Route points (simulated path across canvas)
  const route = [
    { x: 0.1, y: 0.85 },
    { x: 0.25, y: 0.7 },
    { x: 0.4, y: 0.55 },
    { x: 0.55, y: 0.45 },
    { x: 0.7, y: 0.35 },
    { x: 0.85, y: 0.2 },
    { x: 0.9, y: 0.15 },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame = 0;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function getPos(progress) {
      const total = route.length - 1;
      const idx = Math.min(Math.floor(progress * total), total - 1);
      const t = (progress * total) - idx;
      const from = route[idx];
      const to = route[Math.min(idx + 1, total)];
      return {
        x: lerp(from.x, to.x, t) * canvas.width,
        y: lerp(from.y, to.y, t) * canvas.height,
      };
    }

    function draw() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, "#0f172a");
      grad.addColorStop(1, "#1e293b");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Route line (dashed)
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = "rgba(100,150,255,0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      route.forEach((pt, i) => {
        const x = pt.x * canvas.width;
        const y = pt.y * canvas.height;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Completed path
      const progress = posRef.current.progress;
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 3;
      ctx.beginPath();
      const total = route.length - 1;
      const idx = Math.min(Math.floor(progress * total), total - 1);
      const t = (progress * total) - idx;
      for (let i = 0; i <= idx; i++) {
        const x = route[i].x * canvas.width;
        const y = route[i].y * canvas.height;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      if (idx < total) {
        const from = route[idx];
        const to = route[idx + 1];
        ctx.lineTo(lerp(from.x, to.x, t) * canvas.width, lerp(from.y, to.y, t) * canvas.height);
      }
      ctx.stroke();

      // Pickup pin
      const pickup = { x: route[0].x * canvas.width, y: route[0].y * canvas.height };
      ctx.fillStyle = "#22c55e";
      ctx.beginPath(); ctx.arc(pickup.x, pickup.y, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "white";
      ctx.beginPath(); ctx.arc(pickup.x, pickup.y, 4, 0, Math.PI * 2); ctx.fill();

      // Dropoff pin
      const dropoff = { x: route[route.length - 1].x * canvas.width, y: route[route.length - 1].y * canvas.height };
      ctx.fillStyle = "#ef4444";
      ctx.beginPath(); ctx.arc(dropoff.x, dropoff.y, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "white";
      ctx.beginPath(); ctx.arc(dropoff.x, dropoff.y, 4, 0, Math.PI * 2); ctx.fill();

      // Car position
      const pos = getPos(progress);
      // Pulse ring
      const pulse = 0.5 + 0.5 * Math.sin(frame * 0.1);
      ctx.strokeStyle = `rgba(212,160,23,${0.3 + 0.3 * pulse})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(pos.x, pos.y, 16 + pulse * 6, 0, Math.PI * 2); ctx.stroke();

      // Car dot
      const carGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 12);
      carGrad.addColorStop(0, "#f5c842");
      carGrad.addColorStop(1, "#d4a017");
      ctx.fillStyle = carGrad;
      ctx.beginPath(); ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Car icon text
      ctx.fillStyle = "#1a2744";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🚗", pos.x, pos.y);

      // Labels
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("📍 Pickup", pickup.x + 12, pickup.y + 4);
      ctx.fillText("🏁 Dropoff", dropoff.x + 12, dropoff.y + 4);

      // ETA overlay
      const eta = Math.max(0, Math.round((1 - progress) * 15));
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.roundRect(12, 12, 120, 32, 8);
      ctx.fill();
      ctx.fillStyle = "#d4a017";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`ETA: ~${eta} min`, 22, 32);

      frame++;
      if (booking?.status === "in_progress") {
        posRef.current.progress = Math.min(posRef.current.progress + 0.0008, 0.99);
      }
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [booking?.status]);

  const shareLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.watchPosition(async pos => {
      if (driverId && booking?.id) {
        const existing = await base44.entities.DriverLocation.filter({ driver_id: driverId, booking_id: booking.id });
        const data = {
          driver_id: driverId,
          booking_id: booking.id,
          tenant_slug: booking.tenant_slug,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: pos.coords.heading || 0,
          is_active: true,
        };
        if (existing[0]) {
          await base44.entities.DriverLocation.update(existing[0].id, data);
        } else {
          await base44.entities.DriverLocation.create(data);
        }
        setLocationShared(true);
      }
    }, null, { enableHighAccuracy: true, maximumAge: 5000 });
  };

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        className="w-full h-52 rounded-2xl border border-border/50"
        style={{ display: "block" }}
      />
      {isDriver && booking?.status === "in_progress" && (
        <button
          onClick={shareLocation}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-colors ${
            locationShared
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <Navigation className="w-4 h-4" />
          {locationShared ? "📡 Location Sharing Active" : "Share Live Location"}
        </button>
      )}
      {!isDriver && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          {booking?.status === "in_progress" ? "Driver is on the way" : "Waiting for driver to start"}
        </div>
      )}
    </div>
  );
}