import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle, Phone, CheckCircle, Star, Car, Users, BarChart3,
  CreditCard, MapPin, Clock, Shield, Zap, Globe, ChevronRight,
  CalendarCheck, Smartphone, Settings, ArrowRight, Sun, Moon, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const WHATSAPP_NUMBER = "447403644245";
const LOGO_URL = "https://media.base44.com/images/public/69df1db75ebf47a17f97c05c/0ec2e135c_craiyon-190410-image1.png";
const GOLD = "#C91C14";

const features = [
  { icon: CalendarCheck, title: "Smart Booking System", desc: "Multi-step booking form with vehicle selection, fare calculator, promo codes, and instant confirmation emails." },
  { icon: Car, title: "Fleet Management", desc: "Add unlimited vehicles with categories, pricing, images, and capacity. Manage your entire fleet from one dashboard." },
  { icon: Users, title: "Driver Portal", desc: "Dedicated driver app to accept jobs, update trip status, track earnings, and generate invoices." },
  { icon: CreditCard, title: "Stripe & PayPal", desc: "Accept card payments via Stripe and PayPal. Automatic payment confirmation and booking updates." },
  { icon: MapPin, title: "Live GPS Tracking", desc: "Real-time driver location tracking with Google Maps visible to both drivers and passengers." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Revenue charts, booking statistics, driver performance metrics, and business insights at a glance." },
  { icon: Globe, title: "Multi-language", desc: "Booking forms available in English, Urdu, Arabic, Spanish, and French for global reach." },
  { icon: Settings, title: "Full White-Label", desc: "Custom branding with your logo, colors, and domain. Looks 100% like your own platform." },
];

const plans = [
  { name: "Basic", price: "£49", period: "/month", color: "#3b82f6", features: ["Up to 50 bookings/month", "1 Driver account", "Stripe Payments", "Email Confirmations", "Basic Analytics"] },
  { name: "Pro", price: "£99", period: "/month", color: "#C91C14", popular: true, features: ["Unlimited bookings", "Unlimited drivers", "Stripe + PayPal", "Live GPS Tracking", "Advanced Analytics", "Promo Codes", "Multi-language", "Custom Branding"] },
  { name: "Enterprise", price: "Custom", period: "", color: "#8b5cf6", features: ["Everything in Pro", "Custom domain", "Priority support", "Custom integrations", "SLA guarantee", "Onboarding support"] },
];

const testimonials = [
  { name: "Ahmed Al-Rashid", role: "Private Hire Owner, Dubai", rating: 5, text: "ITS transformed our booking process completely. Our customers love the professional experience and we've increased bookings by 40%." },
  { name: "James Cooper", role: "Taxi Fleet Manager, London", rating: 5, text: "The white-label feature is brilliant. Our customers think it's our own custom app. Driver portal saves us hours every week." },
  { name: "Sarah Martinez", role: "Limousine Service, Madrid", rating: 5, text: "Setup was incredibly easy. Within 24 hours we had a fully working booking system with our branding. Highly recommended!" },
];

const stats = [
  { value: "50+", label: "Active Businesses" },
  { value: "10,000+", label: "Bookings Processed" },
  { value: "24hrs", label: "Setup Time" },
  { value: "99.9%", label: "Uptime" },
];

export default function WelcomePage() {
  const [dark, setDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("its_theme", dark ? "dark" : "light");
  }, [dark]);

  const openWhatsApp = (msg = "Hi, I am interested in getting ITS Booking System for my business.") => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Theme-aware classes
  const bg = dark ? "bg-gray-950" : "bg-white";
  const bgAlt = dark ? "bg-gray-900" : "bg-gray-50";
  const text = dark ? "text-gray-100" : "text-gray-900";
  const textMuted = dark ? "text-gray-400" : "text-gray-500";
  const border = dark ? "border-gray-800" : "border-gray-100";
  const cardBg = dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100";
  const navBg = dark ? "bg-gray-950/90 border-gray-800" : "bg-white/90 border-gray-100";

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${bg}`}>

      {/* ── NAVBAR ── */}
      <nav className={`sticky top-0 z-50 backdrop-blur-md border-b shadow-sm transition-colors duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="ITS" className="w-10 h-10 object-contain rounded-xl" />
            <span className={`font-bold text-lg ${text}`}>ITS Booking System</span>
          </div>

          {/* Desktop Nav */}
          <div className={`hidden md:flex items-center gap-8 text-sm font-medium ${textMuted}`}>
            {[["#features","Features"],["#pricing","Pricing"],["#testimonials","Reviews"],["#contact","Contact"]].map(([href, label]) => (
              <a key={href} href={href} className="hover:text-red-500 transition-colors">{label}</a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(d => !d)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${dark ? "border-gray-700 bg-gray-800 text-red-400" : "border-gray-200 bg-gray-50 text-gray-600"} hover:border-red-400`}
              title="Toggle dark mode"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Button onClick={() => openWhatsApp()} className="gap-2 text-sm font-semibold text-white shadow-md hidden sm:flex" style={{ background: "#25D366" }}>
              <MessageCircle className="w-4 h-4" /> WhatsApp Us
            </Button>

            {/* Mobile menu */}
            <button className={`md:hidden w-9 h-9 rounded-xl flex items-center justify-center border ${dark ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600"}`} onClick={() => setMobileMenuOpen(o => !o)}>
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-t px-4 py-3 space-y-2 ${dark ? "bg-gray-950 border-gray-800" : "bg-white border-gray-100"}`}>
            {[["#features","Features"],["#pricing","Pricing"],["#testimonials","Reviews"],["#contact","Contact"]].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMobileMenuOpen(false)} className={`block py-2 text-sm font-medium ${textMuted} hover:text-red-500 transition-colors`}>{label}</a>
            ))}
            <Button onClick={() => openWhatsApp()} className="gap-2 w-full text-sm font-semibold text-white mt-2" style={{ background: "#25D366" }}>
              <MessageCircle className="w-4 h-4" /> WhatsApp Us
            </Button>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white py-24 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-3xl opacity-20" style={{ background: GOLD }} />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: GOLD }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-amber-500/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-amber-500/5" />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-1.5 text-amber-400 text-sm font-medium mb-6">
                <Zap className="w-3.5 h-3.5" /> White-Label Ride Booking Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Your Own <span style={{ color: GOLD }}>Booking System</span> in 24 Hours
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Give your transport business a professional edge. Custom-branded booking forms, driver management, live tracking, and payment processing — all under your own brand.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => openWhatsApp("Hi, I want to get started with ITS Booking System for my transport business.")} size="lg" className="gap-2 text-base font-semibold text-white px-8 shadow-xl" style={{ background: `linear-gradient(135deg, ${GOLD}, #e02020)` }}>
                  Get Started Today <ArrowRight className="w-5 h-5" />
                </Button>
                <Button onClick={() => openWhatsApp()} size="lg" variant="outline" className="gap-2 text-base font-semibold border-white/30 text-white hover:bg-white/10 px-8">
                  <MessageCircle className="w-5 h-5 text-green-400" /> WhatsApp Demo
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-400">
                {["Setup in 24hrs", "No tech skills needed", "Free onboarding"].map((t, i) => (
                  <div key={i} className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-red-400" /> {t}</div>
                ))}
              </div>
            </motion.div>

            {/* Dashboard mockup */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl blur-2xl opacity-30" style={{ background: `linear-gradient(135deg, ${GOLD}44, #3b82f644)` }} />
                <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/60 shadow-2xl overflow-hidden">
                  <div className="bg-gray-900 px-4 py-3 flex items-center gap-2 border-b border-gray-700/50">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="ml-3 text-xs text-gray-500 font-mono">dashboard.mybusiness.com</span>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Today's Bookings", value: "24", color: GOLD, icon: "📅" },
                        { label: "Active Drivers", value: "8", color: "#10b981", icon: "🚗" },
                        { label: "Revenue", value: "£1,840", color: "#3b82f6", icon: "💰" },
                      ].map((s, i) => (
                        <div key={i} className="bg-gray-700/60 rounded-xl p-3 text-center border border-gray-600/30">
                          <div className="text-lg mb-1">{s.icon}</div>
                          <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-700/40 rounded-xl p-3 space-y-2.5 border border-gray-600/20">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Recent Bookings</p>
                      {[
                        { name: "Ahmed K.", from: "Heathrow T2", to: "Central London", status: "In Progress", color: "#3b82f6" },
                        { name: "Sarah M.", from: "Gatwick Airport", to: "Brighton", status: "Confirmed", color: GOLD },
                        { name: "James B.", from: "Manchester City", to: "Airport T1", status: "Pending", color: "#9ca3af" },
                      ].map((b, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-600/20 last:border-0">
                          <div>
                            <span className="text-white font-medium">{b.name}</span>
                            <span className="text-gray-400 ml-2 hidden sm:inline">{b.from} → {b.to}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap" style={{ color: b.color, background: b.color + "22" }}>{b.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: `linear-gradient(135deg, ${GOLD}, #e02020)` }} className="py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <p className="text-3xl sm:text-4xl font-bold drop-shadow">{s.value}</p>
              <p className="text-amber-100 text-sm mt-1 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className={`py-20 px-4 transition-colors duration-300 ${bgAlt}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-3" style={{ background: GOLD + "22", color: GOLD }}>Everything You Need</span>
              <h2 className={`text-3xl sm:text-4xl font-bold ${text}`}>A Complete Booking Platform</h2>
              <p className={`mt-3 max-w-xl mx-auto ${textMuted}`}>From booking forms to driver portals to payment processing — ITS handles everything so you can focus on growing your business.</p>
            </motion.div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`rounded-2xl p-6 border shadow-sm hover:shadow-lg transition-all group cursor-default ${cardBg}`}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all" style={{ background: GOLD + "18" }}>
                  <f.icon className="w-6 h-6" style={{ color: GOLD }} />
                </div>
                <h3 className={`font-bold mb-2 ${text}`}>{f.title}</h3>
                <p className={`text-sm leading-relaxed ${textMuted}`}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={`py-20 px-4 transition-colors duration-300 ${bg}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-3" style={{ background: GOLD + "22", color: GOLD }}>Simple Process</span>
            <h2 className={`text-3xl sm:text-4xl font-bold ${text}`}>Get Running in 3 Steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 opacity-20" style={{ background: GOLD }} />
            {[
              { step: "01", icon: MessageCircle, title: "Contact Us", desc: "WhatsApp or call us. We'll understand your business needs and set up your account within 24 hours." },
              { step: "02", icon: Settings, title: "We Configure", desc: "We set up your vehicles, drivers, pricing, branding, and payment integration — fully customised for you." },
              { step: "03", icon: Smartphone, title: "Go Live", desc: "Share your booking link with customers. They book, pay, and track — all under your brand name." },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} className="text-center relative">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white font-black text-xl shadow-xl" style={{ background: `linear-gradient(135deg, ${GOLD}, #e02020)` }}>
                  {s.step}
                </div>
                <h3 className={`text-xl font-bold mb-2 ${text}`}>{s.title}</h3>
                <p className={`leading-relaxed text-sm ${textMuted}`}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className={`py-20 px-4 transition-colors duration-300 ${bgAlt}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-3" style={{ background: GOLD + "22", color: GOLD }}>Transparent Pricing</span>
            <h2 className={`text-3xl sm:text-4xl font-bold ${text}`}>Choose Your Plan</h2>
            <p className={`mt-3 ${textMuted}`}>No hidden fees. Cancel anytime. All plans include free setup.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`rounded-2xl border-2 p-7 relative transition-all ${p.popular ? "shadow-2xl scale-105 z-10" : "shadow-sm"} ${dark ? "bg-gray-900" : "bg-white"}`}
                style={{ borderColor: p.popular ? p.color : dark ? "#374151" : "#e5e7eb" }}>
                {p.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold shadow-lg" style={{ background: p.color }}>
                    ⭐ Most Popular
                  </div>
                )}
                <h3 className={`font-bold text-xl mb-1 ${text}`}>{p.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black" style={{ color: p.color }}>{p.price}</span>
                  <span className={`text-sm ${textMuted}`}>{p.period}</span>
                </div>
                <ul className="space-y-3 mb-7">
                  {p.features.map((f, j) => (
                    <li key={j} className={`flex items-start gap-2.5 text-sm ${text}`}>
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: p.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button onClick={() => openWhatsApp(`Hi, I'm interested in the ${p.name} plan for ITS Booking System.`)} className="w-full font-semibold text-white" style={{ background: p.color }}>
                  Get {p.name} Plan
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className={`py-20 px-4 transition-colors duration-300 ${bg}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-3" style={{ background: GOLD + "22", color: GOLD }}>Client Reviews</span>
            <h2 className={`text-3xl sm:text-4xl font-bold ${text}`}>What Our Clients Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-6 border ${cardBg}`}>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-red-400 text-red-400" />
                  ))}
                </div>
                <p className={`text-sm leading-relaxed mb-5 ${textMuted}`}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: GOLD }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${text}`}>{t.name}</p>
                    <p className={`text-xs ${textMuted}`}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="contact" className="py-24 px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10" style={{ background: GOLD }} />
        </div>
        <div className="max-w-2xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-6 overflow-hidden shadow-xl border-2 border-amber-500/30">
              <img src={LOGO_URL} alt="ITS" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Launch Your Booking System?</h2>
            <p className="text-gray-300 mb-8 text-lg">Contact us on WhatsApp right now. We'll have your system live within 24 hours.</p>
            <Button onClick={() => openWhatsApp("Hi, I want to launch my own booking system with ITS. Please help me get started.")} size="lg"
              className="gap-2 text-base font-semibold text-white px-10 shadow-xl" style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
              <MessageCircle className="w-5 h-5" /> Start on WhatsApp
            </Button>
            <div className="flex items-center justify-center gap-2 mt-6 text-gray-400 text-sm">
              <Phone className="w-4 h-4" /><span>+44 7403 644245</span>
              <span className="mx-2">·</span>
              <Clock className="w-4 h-4" /><span>Available 24/7</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={`pt-16 pb-8 px-4 transition-colors duration-300 ${dark ? "bg-gray-950 border-t border-gray-800" : "bg-gray-950"}`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src={LOGO_URL} alt="ITS" className="w-10 h-10 object-contain opacity-90" />
                <span className="text-white font-bold text-lg">ITS Booking System</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-5">
                A complete white-label ride booking platform for transport businesses. Custom branding, driver management, live tracking, and payment processing — all in one place.
              </p>
              <button onClick={() => openWhatsApp()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
              </button>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                {[["#features","Features"],["#pricing","Pricing"],["#testimonials","Reviews"],["#contact","Contact"]].map(([href, label]) => (
                  <li key={href}><a href={href} className="text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1.5"><ChevronRight className="w-3 h-3" />{label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-red-400 flex-shrink-0" /><span>+44 7403 644245</span></li>
                <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-green-500 flex-shrink-0" /><span>WhatsApp Support</span></li>
                <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400 flex-shrink-0" /><span>Available 24/7</span></li>
                <li className="flex items-center gap-2"><Globe className="w-4 h-4 text-purple-400 flex-shrink-0" /><span>Worldwide Service</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <span>© {new Date().getFullYear()} ITS Booking System. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span className="hover:text-gray-400 cursor-default transition-colors">Privacy Policy</span>
              <span className="hover:text-gray-400 cursor-default transition-colors">Terms of Service</span>
              <Link to="/super-admin" className="opacity-10 hover:opacity-30 transition-opacity">·</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}