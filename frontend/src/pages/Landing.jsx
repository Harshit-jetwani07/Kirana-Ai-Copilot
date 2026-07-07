import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { setShop } from "@/lib/api";
import {
  Store, ShoppingCart, Package, Wallet, Truck, Sparkles, MessageCircle, FileText,
  ArrowRight, TrendingUp, Receipt, IndianRupee, AlertTriangle, CheckCircle2, Users
} from "lucide-react";

export default function Landing() {
  const nav = useNavigate();

  const openDemo = () => { setShop("demo", "demo"); nav("/dashboard"); };
  const startFree = () => nav("/onboarding");

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900" data-testid="landing-page">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display font-extrabold text-base leading-tight">Dukaan AI</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Copilot</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button data-testid="nav-demo-btn" onClick={openDemo} variant="ghost" className="h-9 text-slate-700 hidden sm:inline-flex">View Demo</Button>
            <Button data-testid="nav-start-btn" onClick={startFree} className="h-9 bg-blue-600 hover:bg-blue-700">Start Free</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 pt-10 md:pt-16 pb-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mb-4">Made for Indian Kirana</Badge>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight">
              AI Copilot for<br/>India's <span className="text-blue-600">Kirana Stores</span>
            </h1>
            <p className="text-slate-600 text-base md:text-lg mt-5 leading-relaxed max-w-lg">
              Manage billing, stock, udhaar, suppliers, GST-ready reports aur WhatsApp reminders — sab kuch ek simple mobile-first app se.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button data-testid="hero-start-btn" onClick={startFree} className="h-12 px-6 bg-blue-600 hover:bg-blue-700">
                Start Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button data-testid="hero-demo-btn" onClick={openDemo} variant="outline" className="h-12 px-6">
                View Demo Store
              </Button>
            </div>
            <div className="flex items-center gap-6 mt-8 text-xs text-slate-500">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-600" /> No signup needed</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-600" /> Hinglish AI advisor</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-600" /> WhatsApp-first</div>
            </div>
          </div>

          {/* Product preview mockup */}
          <div className="relative">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-60" />
            <div className="absolute -bottom-10 -left-6 w-40 h-40 bg-green-100 rounded-full blur-3xl opacity-60" />
            <Card className="relative p-4 bg-white border-slate-200 shadow-xl" data-testid="hero-mockup">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-display font-bold text-sm">Sharma General Store</div>
                  <div className="text-[10px] text-slate-500">Dashboard • Aaj ka business</div>
                </div>
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[9px]">DEMO</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <MiniStat icon={IndianRupee} label="Aaj Bikri" value="₹1,674" tone="blue" />
                <MiniStat icon={TrendingUp} label="Munafa" value="₹220" tone="green" />
                <MiniStat icon={Wallet} label="Udhaar" value="₹4,340" tone="red" />
                <MiniStat icon={Package} label="Low Stock" value="7" tone="amber" />
              </div>
              <Card className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3 h-3" />
                  <div className="text-[10px] font-bold uppercase tracking-widest">AI Advisor</div>
                </div>
                <div className="text-xs leading-snug">
                  Parle-G aur Amul Milk fast bik rahe hain. Maggi ka stock 2 din mein khatam ho sakta hai — order lagao.
                </div>
              </Card>
              <div className="flex gap-2 mt-3">
                <div className="flex-1 h-9 bg-blue-600 rounded-lg text-white text-xs font-semibold flex items-center justify-center gap-1"><Receipt className="w-3.5 h-3.5" /> Naya Bill</div>
                <div className="h-9 w-9 bg-green-500 rounded-lg text-white flex items-center justify-center"><MessageCircle className="w-4 h-4" /></div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Problem */}
      <Section title="Kya problem solve karta hai" subtitle="Har chhote shopkeeper ke real dard">
        <div className="grid md:grid-cols-3 gap-3 md:gap-4">
          {[
            { icon: Package, title: "Stock khatam ho jaata hai", desc: "Popular items suddenly finish, sale lose hoti hai." },
            { icon: Wallet, title: "Udhaar recover nahi hota", desc: "Kaun kitna deta hai, kab pay karega — hisaab nahi rehta." },
            { icon: Receipt, title: "Manual billing slow hai", desc: "Kagaz ke bill, calculation errors, waqt barbaad." },
            { icon: Truck, title: "Supplier follow-up bhool jaate", desc: "Kya order karna hai, kab payment karna hai — sab bhool jaate." },
            { icon: TrendingUp, title: "Munafa clear nahi", desc: "Rozana kitna kamaya, kaunse products se — pata nahi." },
            { icon: FileText, title: "GST aur reports confusion", desc: "CA ke paas jaate waqt data organized nahi hota." },
          ].map((p, i) => (
            <Card key={i} className="p-5 bg-white border-slate-200 hover-lift">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-3"><p.icon size={18} /></div>
              <div className="font-display font-bold text-slate-900 mb-1">{p.title}</div>
              <div className="text-sm text-slate-600 leading-relaxed">{p.desc}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Solution features */}
      <Section title="Sab ek jagah" subtitle="Dukaan AI Copilot mein har feature">
        <div className="grid md:grid-cols-3 gap-3 md:gap-4">
          {[
            { icon: ShoppingCart, title: "Fast Billing / POS", desc: "Search, quick picks, barcode scan, receipt print — 30 second mein bill." },
            { icon: Package, title: "Inventory & Alerts", desc: "Low-stock, expiry aur dead-stock alerts. AI reorder suggestions." },
            { icon: Wallet, title: "Udhaar Ledger", desc: "Har customer ka pending track. Overdue highlighting." },
            { icon: MessageCircle, title: "WhatsApp Reminders", desc: "Polite / firm / festival tone Hinglish reminders — one-tap send." },
            { icon: Truck, title: "Supplier Reorder", desc: "Auto-generated reorder message with low-stock items list." },
            { icon: Sparkles, title: "AI Business Advisor", desc: "Gemini-powered daily insights in Hinglish. Sawaal poocho, javab pao." },
            { icon: FileText, title: "GST-Ready Reports", desc: "Monthly / quarterly GST estimate, CSV export." },
            { icon: Receipt, title: "Print-friendly Receipts", desc: "Thermal printer ya normal print — clean bill layout." },
            { icon: TrendingUp, title: "Profit Analytics", desc: "Real-time profit, margin per product, top-selling analytics." },
          ].map((f, i) => (
            <Card key={i} className="p-5 bg-white border-slate-200 hover-lift">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3"><f.icon size={18} /></div>
              <div className="font-display font-bold text-slate-900 mb-1">{f.title}</div>
              <div className="text-sm text-slate-600 leading-relaxed">{f.desc}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Workflow */}
      <Section title="Ek complete flow" subtitle="Bill se AI advice tak, sab connected">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-3">
          {[
            { icon: Receipt, label: "Bill", hindi: "Grahak ka bill" },
            { icon: Package, label: "Stock", hindi: "Auto reduce" },
            { icon: Wallet, label: "Udhaar", hindi: "Track pending" },
            { icon: MessageCircle, label: "Reminder", hindi: "WhatsApp bhejo" },
            { icon: Truck, label: "Reorder", hindi: "Supplier msg" },
            { icon: Sparkles, label: "AI Advice", hindi: "Daily insight" },
          ].map((s, i) => (
            <div key={i} className="relative">
              <Card className="p-4 text-center bg-white border-slate-200 hover-lift">
                <div className="w-10 h-10 mx-auto rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2">
                  <s.icon size={18} />
                </div>
                <div className="font-bold text-sm text-slate-900">{s.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{s.hindi}</div>
              </Card>
              {i < 5 && <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />}
            </div>
          ))}
        </div>
      </Section>

      {/* Social proof */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <Card className="p-8 md:p-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Built for</div>
              <div className="font-display text-2xl md:text-3xl font-black mt-2 leading-tight">
                Kirana, pharmacy, stationery, general stores aur local retailers ke liye
              </div>
              <p className="text-slate-300 mt-4 text-sm leading-relaxed">
                Har shopkeeper ki language mein — Hinglish. Phone se chalta hai. WhatsApp ke saath integrated. Aapke jaise hi chhote SMB owners ke liye design kiya.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Stat big value="17" label="Sample products" />
              <Stat big value="7" label="Customer types" />
              <Stat big value="4" label="Suppliers" />
              <Stat big value="₹5.4K" label="7-day revenue" />
              <Stat big value="₹4.3K" label="Udhaar tracked" />
              <Stat big value="AI" label="Hinglish" />
            </div>
          </div>
        </Card>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-black text-slate-900">Aaj hi apni dukaan digital karo</h2>
          <p className="text-slate-600 mt-3">Free start karo. Setup 30 second mein. Data aapke paas hi rehta hai.</p>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <Button data-testid="cta-start-btn" onClick={startFree} className="h-12 px-6 bg-blue-600 hover:bg-blue-700">
              Start Free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button data-testid="cta-demo-btn" onClick={openDemo} variant="outline" className="h-12 px-6">
              Open Demo Store
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        Powered by Gemini 3 AI • Hinglish-first • Made for Indian shopkeepers
      </footer>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-14">
      <div className="mb-6 md:mb-8">
        <h2 className="font-display text-2xl md:text-3xl font-black text-slate-900">{title}</h2>
        <p className="text-slate-600 text-sm md:text-base mt-1.5">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function MiniStat({ icon: Icon, label, value, tone }) {
  const tones = { blue: "bg-blue-50 text-blue-700", green: "bg-green-50 text-green-700", red: "bg-red-50 text-red-700", amber: "bg-amber-50 text-amber-700" };
  return (
    <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100">
      <div className="flex items-center gap-1.5 mb-1">
        <div className={`w-5 h-5 rounded ${tones[tone]} flex items-center justify-center`}><Icon size={11} /></div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{label}</div>
      </div>
      <div className="font-mono-num text-sm font-bold text-slate-900">{value}</div>
    </div>
  );
}

function Stat({ value, label, big }) {
  return (
    <div className="p-3 rounded-lg bg-white/10 backdrop-blur">
      <div className={`font-mono-num font-black ${big ? "text-xl md:text-2xl" : "text-lg"}`}>{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-300 mt-0.5">{label}</div>
    </div>
  );
}
