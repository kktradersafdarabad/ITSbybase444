import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function StatCard({ title, value, icon: Icon, trend, trendUp, className, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "bg-card rounded-2xl p-6 border border-border/50 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300",
        className
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {trend && (
          <p className={cn(
            "text-sm font-medium mt-2",
            trendUp ? "text-emerald-500" : "text-red-500"
          )}>
            {trendUp ? "↑" : "↓"} {trend}
          </p>
        )}
      </div>
    </motion.div>
  );
}