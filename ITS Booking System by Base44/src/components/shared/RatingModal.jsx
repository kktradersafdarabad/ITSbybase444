import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

function StarRating({ value, onChange, label }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="space-y-1">
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                star <= (hover || value)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RatingModal({ booking, tenantId, onClose, onSubmitted }) {
  const [ratings, setRatings] = useState({ overall: 0, service: 0, cleanliness: 0, punctuality: 0 });
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!ratings.overall) return;
    setSubmitting(true);
    await base44.entities.Review.create({
      tenant_id: tenantId,
      booking_id: booking.id,
      booking_ref: booking.booking_ref,
      driver_id: booking.driver_id,
      driver_name: booking.driver_name,
      passenger_name: booking.passenger_name,
      passenger_email: booking.passenger_email,
      rating: ratings.overall,
      service_rating: ratings.service || ratings.overall,
      cleanliness_rating: ratings.cleanliness || ratings.overall,
      punctuality_rating: ratings.punctuality || ratings.overall,
      comment,
    });
    setDone(true);
    setSubmitting(false);
    setTimeout(() => { onSubmitted?.(); onClose(); }, 2000);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            Rate Your Ride
          </DialogTitle>
        </DialogHeader>

        {done ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8 space-y-3">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <Star className="w-8 h-8 text-emerald-600 fill-emerald-600" />
            </div>
            <p className="font-semibold text-lg">Thank you for your review!</p>
            <p className="text-muted-foreground text-sm">Your feedback helps us improve our service.</p>
          </motion.div>
        ) : (
          <div className="space-y-5 py-2">
            <div className="bg-muted/40 rounded-xl p-3 text-sm">
              <p className="font-medium">{booking.passenger_name}</p>
              <p className="text-muted-foreground">{booking.pickup_address} → {booking.dropoff_address || "—"}</p>
              {booking.driver_name && <p className="text-muted-foreground">Driver: {booking.driver_name}</p>}
            </div>

            <StarRating value={ratings.overall} onChange={v => setRatings(p => ({ ...p, overall: v }))} label="Overall Rating *" />

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Service</p>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setRatings(p => ({ ...p, service: s }))}>
                      <Star className={`w-4 h-4 ${s <= ratings.service ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Cleanliness</p>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setRatings(p => ({ ...p, cleanliness: s }))}>
                      <Star className={`w-4 h-4 ${s <= ratings.cleanliness ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Punctuality</p>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setRatings(p => ({ ...p, punctuality: s }))}>
                      <Star className={`w-4 h-4 ${s <= ratings.punctuality ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Textarea
              placeholder="Leave a comment (optional)"
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="resize-none h-20"
            />

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button
                onClick={handleSubmit}
                disabled={!ratings.overall || submitting}
                className="flex-1"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}