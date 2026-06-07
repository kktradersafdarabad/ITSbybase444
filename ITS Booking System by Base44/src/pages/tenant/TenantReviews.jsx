import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Star, MessageSquare, User } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";

function StarDisplay({ value, size = "sm" }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`${size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5"} ${s <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground opacity-30"}`} />
      ))}
    </div>
  );
}

export default function TenantReviews() {
  const { tenant, primaryColor } = useOutletContext();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["tenant-reviews", tenant.id],
    queryFn: () => base44.entities.Review.filter({ tenant_id: tenant.id }, "-created_date", 100),
    enabled: !!tenant?.id,
  });

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
  }, [reviews]);

  const avgService = useMemo(() => reviews.length ? reviews.reduce((s, r) => s + (r.service_rating || r.rating || 0), 0) / reviews.length : 0, [reviews]);
  const avgClean = useMemo(() => reviews.length ? reviews.reduce((s, r) => s + (r.cleanliness_rating || r.rating || 0), 0) / reviews.length : 0, [reviews]);
  const avgPunct = useMemo(() => reviews.length ? reviews.reduce((s, r) => s + (r.punctuality_rating || r.rating || 0), 0) / reviews.length : 0, [reviews]);

  const ratingDist = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating]++; });
    return dist;
  }, [reviews]);

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Customer Reviews</h1>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <Star className="w-14 h-14 mx-auto mb-4 opacity-20" />
          <p className="font-medium text-lg">No reviews yet</p>
          <p className="text-sm mt-1">Reviews will appear here after customers complete rides and leave feedback.</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Score */}
            <div className="bg-card rounded-2xl border border-border/50 p-6 flex items-center gap-6">
              <div className="text-center">
                <p className="text-5xl font-bold" style={{ color: primaryColor }}>{avgRating.toFixed(1)}</p>
                <StarDisplay value={Math.round(avgRating)} size="lg" />
                <p className="text-sm text-muted-foreground mt-2">{reviews.length} reviews</p>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="text-xs w-4">{star}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-amber-400 transition-all"
                        style={{ width: reviews.length ? `${(ratingDist[star] / reviews.length) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-6">{ratingDist[star]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category breakdown */}
            <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
              <h3 className="font-semibold">Category Breakdown</h3>
              {[
                { label: "Service", value: avgService },
                { label: "Cleanliness", value: avgClean },
                { label: "Punctuality", value: avgPunct },
              ].map(cat => (
                <div key={cat.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{cat.label}</span>
                    <span className="font-medium">{cat.value.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${(cat.value / 5) * 100}%`, background: primaryColor }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-card rounded-2xl border border-border/50 p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{r.passenger_name || "Anonymous"}</p>
                      {r.driver_name && <p className="text-xs text-muted-foreground">Driver: {r.driver_name}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <StarDisplay value={r.rating} />
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(r.created_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {r.comment && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/40 rounded-xl p-3">
                    <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>{r.comment}</p>
                  </div>
                )}

                {(r.service_rating || r.cleanliness_rating || r.punctuality_rating) && (
                  <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                    <span>Service: {r.service_rating?.toFixed(1) || "—"} ★</span>
                    <span>Cleanliness: {r.cleanliness_rating?.toFixed(1) || "—"} ★</span>
                    <span>Punctuality: {r.punctuality_rating?.toFixed(1) || "—"} ★</span>
                  </div>
                )}

                {r.booking_ref && (
                  <p className="text-xs text-muted-foreground mt-2 font-mono">Booking: {r.booking_ref}</p>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}