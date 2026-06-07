import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight, Car, Shield, Clock, Star, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Car, title: "Premium Fleet", desc: "Luxury sedans, SUVs, and stretch limos for every occasion" },
  { icon: Shield, title: "Safe & Secure", desc: "Licensed, insured, and thoroughly vetted professional chauffeurs" },
  { icon: Clock, title: "Always On Time", desc: "Punctual service with real-time tracking and flight monitoring" },
  { icon: Star, title: "5-Star Service", desc: "Exceptional experience with complimentary amenities" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">LimoElite</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/booking/status"><Button variant="ghost" size="sm">Track Booking</Button></Link>
            <Link to="/book"><Button size="sm" className="gap-2">Book Now <ArrowRight className="w-3 h-3" /></Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Crown className="w-4 h-4" /> Premium Chauffeur Service
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight tracking-tight">
              Luxury Rides,<br />
              <span className="text-primary">Unmatched</span> Comfort
            </h1>
            <p className="text-lg text-muted-foreground mt-6 max-w-lg">
              Experience world-class chauffeur service with our premium fleet. Airport transfers, corporate events, or special occasions — we deliver excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link to="/book">
                <Button size="lg" className="gap-2 h-14 px-8 text-base w-full sm:w-auto">
                  Book Your Ride <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/booking/status">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base w-full sm:w-auto">
                  Track Booking
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-10">
              <div><span className="text-3xl font-bold">500+</span><p className="text-sm text-muted-foreground">Happy Clients</p></div>
              <div className="w-px h-10 bg-border" />
              <div><span className="text-3xl font-bold">50+</span><p className="text-sm text-muted-foreground">Premium Vehicles</p></div>
              <div className="w-px h-10 bg-border" />
              <div><span className="text-3xl font-bold">4.9</span><p className="text-sm text-muted-foreground">Star Rating</p></div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-muted">
              <img 
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=800&h=600&fit=crop" 
                alt="Luxury limousine" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl p-4 shadow-xl border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Real-time Tracking</p>
                  <p className="text-xs text-muted-foreground">Track your ride live</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold">Why Choose <span className="text-primary">LimoElite</span></h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto">Premium service at every step of your journey</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} 
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border/50 p-6 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-display font-bold">Ready to Experience <span className="text-primary">Luxury</span>?</h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">Book your premium ride in minutes. Available 24/7 for all your transportation needs.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link to="/book">
                <Button size="lg" className="gap-2 h-14 px-10 text-base">Book Now <ArrowRight className="w-4 h-4" /></Button>
              </Link>
              <a href="tel:+1234567890">
                <Button size="lg" variant="outline" className="gap-2 h-14 px-10 text-base"><Phone className="w-4 h-4" /> Call Us</Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">LimoElite</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 LimoElite. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}