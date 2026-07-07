import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { setShop } from "@/lib/api";
import {
  Store, ShoppingCart, Package, Wallet, Truck, Sparkles, MessageCircle, FileText,
  ArrowRight, TrendingUp, Receipt, IndianRupee, CheckCircle2, AlertTriangle, Bell
} from "lucide-react";

export default function Landing() {
  const nav = useNavigate();
  const openDemo = () => { setShop("demo", "demo"); nav("/dashboard"); };
  const createShop = () => nav("/onboarding");

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#0B0B12]" data-testid="landing-page">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-[#FBF7F0]/85 backdrop-blur-xl border-b border-[#EFE6D3]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#312E81] to-[#1E1B4B] flex items-center justify-center shadow-sm">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display font-black text-base leading-none">Dukaan AI</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#EA580C] mt-0.5">Copilot</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button data-testid="nav-demo-btn" onClick={openDemo} variant="ghost" className="h-9 text-slate-700 hidden sm:inline-flex">Open Demo</Button>
            <Button data-testid="nav-start-btn" onClick={createShop} className="h-9 btn-brand">Create My Shop</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-10 md:pt-16 pb-12 relative">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <div className="pill bg-[#F3EDDF] text-[#312E81] mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" /> Made for Indian Kirana
              </div>
              <h1 className="font-serif-display text-[42px] md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight">
                AI Copilot for<br/>
                <span className="italic text-[#312E81]">India's</span> <span className="text-[#EA580C]">Kirana</span> Stores
              </h1>
              <p className="text-slate-700 text-base md:text-lg mt-6 leading-relaxed max-w-lg">
                Billing, stock, udhaar, suppliers, GST-ready reports aur WhatsApp reminders — sab kuch ek simple mobile-first app se.
              </p>
              <div className="flex flex-wrap gap-3 mt-7">
                <Button data-testid="hero-start-btn" onClick={createShop} className="h-12 px-6 btn-brand text-[15px] font-semibold">
                  Create My Shop <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button data-testid="hero-demo-btn" onClick={openDemo} variant="outline" className="h-12 px-6 border-slate-300 bg-white hover:bg-slate-50 text-[15px] font-semibold">
                  Open Demo Store
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-7 text-xs text-slate-600">
                <Item>No signup needed</Item>
                <Item>Hinglish AI advisor</Item>
                <Item>WhatsApp-first</Item>
                <Item>GST-ready reports</Item>
              </div>
            </div>

            {/* Product preview card */}
            <div className="relative">
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#FDBA74] rounded-full blur-3xl opacity-30" />
              <div className="absolute -bottom-10 -left-8 w-52 h-52 bg-[#312E81] rounded-full blur-3xl opacity-15" />

              <Card className="relative p-5 bg-white border-[#EFE6D3] shadow-2xl shadow-indigo-900/10 hover-lift" data-testid="hero-mockup">
                {/* Header row */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#312E81] to-[#1E1B4B] flex items-center justify-center">
                      <Store className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <div className="font-display font-bold text-sm leading-none">Sharma General Store</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Ramesh Sharma · Delhi</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="relative">
                      <Bell className="w-3.5 h-3.5 text-slate-500" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#EA580C]" />
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[9px] h-4 px-1.5 border-0">DEMO</Badge>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Aaj ka business</div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <MiniStat icon={IndianRupee} label="Sales" value="₹1,674" tone="indigo" delta="+18%" />
                  <MiniStat icon={AlertTriangle} label="Low Stock" value="7 items" tone="red" delta="urgent" />
                  <MiniStat icon={Wallet} label="Udhaar" value="₹4,340" tone="amber" delta="3 pending" />
                  <MiniStat icon={TrendingUp} label="Profit" value="₹220" tone="emerald" delta="13% margin" />
                </div>

                {/* Udhaar reminder */}
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Udhaar Reminder</div>
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-[9px] h-4 px-1.5 border-0">OVERDUE</Badge>
                  </div>
                  <div className="text-xs text-slate-700 leading-snug mb-2">
                    <span className="font-semibold">Meena Kumari</span> se <span className="font-mono-num font-bold">₹2,150</span> pending · 22 din
                  </div>
                  <div className="flex gap-1.5">
                    <div className="flex-1 h-7 rounded-md bg-[#25D366] text-white text-[10px] font-bold flex items-center justify-center gap-1">
                      <MessageCircle className="w-3 h-3" /> WhatsApp bhejo
                    </div>
                  </div>
                </div>

                {/* AI advice */}
                <div className="rounded-lg p-3 bg-gradient-to-br from-[#312E81] to-[#1E1B4B] text-white grain overflow-hidden relative">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3 h-3 text-[#FDBA74]" />
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#FDBA74]">AI Advice · Hinglish</div>
                  </div>
                  <div className="text-xs leading-snug">
                    Parle-G fast bik raha hai — 3 din mein khatam ho jaayega. Aaj hi <b>150 packet</b> reorder karo.
                  </div>
                </div>

                {/* Quick action */}
                <div className="flex gap-2 mt-3">
                  <div className="flex-1 h-10 bg-[#312E81] rounded-lg text-white text-xs font-bold flex items-center justify-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5" /> Naya Bill
                  </div>
                  <div className="h-10 px-3 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
                    <Package className="w-3.5 h-3.5" /> Stock
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <Section title={<>Chhote shopkeeper ke <span className="italic text-[#EA580C]">real dard</span></>} subtitle="Har din yeh problems face karte ho">
        <div className="grid md:grid-cols-3 gap-3 md:gap-4">
          {[
            { icon: Package, title: "Stock khatam ho jaata hai", desc: "Popular items suddenly finish, sale lose hoti hai." },
            { icon: Wallet, title: "Udhaar recover nahi hota", desc: "Kaun kitna deta hai, kab pay karega — hisaab nahi rehta." },
            { icon: Receipt, title: "Manual billing slow hai", desc: "Kagaz ke bill, calculation errors, waqt barbaad." },
            { icon: Truck, title: "Supplier follow-up bhool jaate", desc: "Kya order karna hai, kab payment karna hai — bhool jaate." },
            { icon: TrendingUp, title: "Munafa clear nahi", desc: "Rozana kitna kamaya, kaunse products se — pata nahi." },
            { icon: FileText, title: "GST reports confusion", desc: "CA ke paas jaate waqt data organized nahi hota." },
          ].map((p, i) => (
            <Card key={i} className="p-5 bg-white border-[#EFE6D3] hover-lift">
              <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3"><p.icon size={19} /></div>
              <div className="font-display font-bold text-slate-900 mb-1">{p.title}</div>
              <div className="text-sm text-slate-600 leading-relaxed">{p.desc}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Features */}
      <Section title={<>Sab kuch <span className="italic text-[#312E81]">ek jagah</span></>} subtitle="Dukaan AI Copilot mein har feature">
        <div className="grid md:grid-cols-3 gap-3 md:gap-4">
          {[
            { icon: ShoppingCart, title: "Fast Billing / POS", desc: "Search, quick picks, barcode scan, receipt print — 30 second mein bill.", tone: "indigo" },
            { icon: Package, title: "Inventory & Alerts", desc: "Low-stock, expiry aur dead-stock alerts. AI reorder suggestions.", tone: "emerald" },
            { icon: Wallet, title: "Udhaar Ledger", desc: "Har customer ka pending track. Overdue highlighting.", tone: "saffron" },
            { icon: MessageCircle, title: "WhatsApp Reminders", desc: "Polite / firm / festival tone Hinglish reminders — one-tap send.", tone: "emerald" },
            { icon: Truck, title: "Supplier Reorder", desc: "Auto-generated reorder message with low-stock items list.", tone: "indigo" },
            { icon: Sparkles, title: "AI Business Advisor", desc: "Gemini-powered daily insights in Hinglish. Sawaal poocho.", tone: "saffron" },
            { icon: FileText, title: "GST-Ready Reports", desc: "Monthly / quarterly GST estimate, CSV export.", tone: "indigo" },
            { icon: Receipt, title: "Print Receipts", desc: "Thermal ya normal print — clean bill layout.", tone: "emerald" },
            { icon: TrendingUp, title: "Profit Analytics", desc: "Real-time profit, per-product margin, top-selling.", tone: "saffron" },
          ].map((f, i) => {
            const tones = {
              indigo: "bg-[#EEECFB] text-[#312E81]",
              emerald: "bg-emerald-50 text-emerald-700",
              saffron: "bg-orange-50 text-[#EA580C]",
            };
            return (
              <Card key={i} className="p-5 bg-white border-[#EFE6D3] hover-lift">
                <div className={`w-11 h-11 rounded-xl ${tones[f.tone]} flex items-center justify-center mb-3`}><f.icon size={19} /></div>
                <div className="font-display font-bold text-slate-900 mb-1">{f.title}</div>
                <div className="text-sm text-slate-600 leading-relaxed">{f.desc}</div>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Workflow */}
      <Section title={<>Ek <span className="italic text-[#312E81]">complete</span> flow</>} subtitle="Bill se AI advice tak, sab connected">
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
              <Card className="p-4 text-center bg-white border-[#EFE6D3] hover-lift">
                <div className="w-11 h-11 mx-auto rounded-xl bg-[#F3EDDF] text-[#312E81] flex items-center justify-center mb-2">
                  <s.icon size={18} />
                </div>
                <div className="font-bold text-sm text-slate-900">{s.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{s.hindi}</div>
              </Card>
              {i < 5 && <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#EA580C]" />}
            </div>
          ))}
        </div>
      </Section>

      {/* Social proof */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <Card className="relative p-8 md:p-10 bg-gradient-to-br from-[#1E1B4B] to-[#312E81] text-white border-0 overflow-hidden grain">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#EA580C] rounded-full blur-3xl opacity-25" />
          <div className="grid md:grid-cols-2 gap-6 items-center relative">
            <div>
              <div className="pill bg-[#EA580C]/20 text-[#FDBA74] mb-3">Built For</div>
              <div className="font-serif-display text-2xl md:text-4xl font-black leading-tight">
                Kirana, pharmacy, stationery, general stores aur local retailers ke liye
              </div>
              <p className="text-slate-300 mt-4 text-sm leading-relaxed">
                Har shopkeeper ki language mein — Hinglish. Phone se chalta hai. WhatsApp ke saath integrated.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Stat value="17" label="Sample products" />
              <Stat value="7" label="Customer types" />
              <Stat value="4" label="Suppliers" />
              <Stat value="₹5.4K" label="7-day revenue" />
              <Stat value="₹4.3K" label="Udhaar tracked" />
              <Stat value="AI" label="Hinglish" />
            </div>
          </div>
        </Card>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-serif-display text-3xl md:text-5xl font-black text-slate-900">Aaj hi apni dukaan <span className="italic text-[#EA580C]">digital</span> karo</h2>
          <p className="text-slate-600 mt-3">Free start karo. Setup 30 second mein. Data aapke paas hi rehta hai.</p>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <Button data-testid="cta-start-btn" onClick={createShop} className="h-12 px-6 btn-brand text-[15px] font-semibold">
              Create My Shop <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button data-testid="cta-demo-btn" onClick={openDemo} variant="outline" className="h-12 px-6 border-slate-300 bg-white text-[15px] font-semibold">
              Open Demo Store
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#EFE6D3] py-6 text-center text-xs text-slate-500">
        Powered by Gemini 3 AI · Hinglish-first · Made for Indian shopkeepers
      </footer>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-14">
      <div className="mb-6 md:mb-8">
        <h2 className="font-serif-display text-3xl md:text-4xl font-black text-slate-900">{title}</h2>
        <p className="text-slate-600 text-sm md:text-base mt-1.5">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Item({ children }) {
  return (
    <div className="flex items-center gap-1.5">
      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> <span>{children}</span>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, tone, delta }) {
  const tones = {
    indigo: "bg-[#EEECFB] text-[#312E81]",
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
      <div className="flex items-center gap-1.5 mb-1">
        <div className={`w-6 h-6 rounded-md ${tones[tone]} flex items-center justify-center`}><Icon size={12} /></div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{label}</div>
      </div>
      <div className="font-mono-num text-sm font-bold text-slate-900">{value}</div>
      {delta && <div className="text-[9px] text-slate-500 mt-0.5">{delta}</div>}
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="p-3 rounded-lg bg-white/10 backdrop-blur border border-white/10">
      <div className="font-serif-display font-black text-xl md:text-2xl">{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-300 mt-0.5">{label}</div>
    </div>
  );
}
