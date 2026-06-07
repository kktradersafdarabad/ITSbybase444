import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const steps = ["Trip Details", "Vehicle", "Your Info", "Summary", "Done"];

export default function StepIndicator({ current, primaryColor }) {
  const color = primaryColor || "hsl(var(--primary))";
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-6">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-1 sm:gap-2">
          <div className="flex flex-col items-center">
            <motion.div
              initial={false}
              animate={{ scale: i === current ? 1.12 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm",
                i < current ? "text-white" :
                i === current ? "text-white ring-4" :
                "bg-muted text-muted-foreground"
              )}
              style={
                i < current ? { background: color } :
                i === current ? { background: color, boxShadow: `0 0 0 4px ${color}30` } :
                {}
              }
            >
              {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </motion.div>
            <span className={cn(
              "text-[10px] sm:text-xs mt-1 hidden sm:block font-medium transition-colors",
              i === current ? "text-foreground" : "text-muted-foreground"
            )}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="w-6 sm:w-10 h-0.5 rounded-full mb-4 sm:mb-0 transition-all" style={{ background: i < current ? color : "hsl(var(--muted))" }} />
          )}
        </div>
      ))}
    </div>
  );
}