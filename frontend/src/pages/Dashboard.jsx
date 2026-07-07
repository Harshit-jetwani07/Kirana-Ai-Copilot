import { useEffect, useState } from "react";
import { api, fmtINR } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, TrendingUp, Wallet, Package, AlertTriangle, Truck, IndianRupee, Receipt, ArrowRight, RefreshCw, ShoppingCart, MessageCircle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { toast } from "sonner";

const StatCard = ({ icon: Icon, label, hindi, value, sub, tone = "blue", testid }) => {
  const tones = {
    blue: "bg-[#F3EDDF] text-[#312E81]",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return (
    <Card data-testid={testid} className="p-5 border-slate-200 hover-lift bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${tones[tone]} flex items-center justify-center`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</div>
      <div className="text-[10px] text-slate-400 mt-0.5">{hindi}</div>
      <div className="font-mono-num text-2xl font-bold text-slate-900 mt-2">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </Card>
  );
};

export default function Dashboard() {
  const { t } = useLang();
  const [data, setData] = useState(null);
  const [settings, setSettings] = useState({ owner_name: "Ramesh" });
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const load = async () => {
    try {
      const d = await api.dashboard();
      setData(d);
    } catch { toast.error("Dashboard load fail"); }
  };

  const loadAI = async () => {
    setAiLoading(true);
    try {
      const r = await api.aiSummary();
      setAiSummary(r.summary);
    } catch { setAiSummary("AI abhi busy hai, thodi der baad try karo."); }
    finally { setAiLoading(false); }
  };

  useEffect(() => {
    load();
    loadAI();
    api.settings().then(setSettings).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  const paymentModeData = Object.entries(data.payment_modes).map(([k, v]) => ({ mode: k.toUpperCase(), amount: v }));
  const isEmpty = data.counts && data.counts.products === 0 && data.counts.sales_all_time === 0;

  if (isEmpty) {
    return (
      <div className="space-y-6" data-testid="dashboard-empty">
        <div>
          <h1 className="font-serif-display text-3xl md:text-5xl font-black text-slate-900">{t("namaste")}, {(settings.owner_name || "Owner").split(" ")[0]} {t("ji")}</h1>
          <p className="text-slate-600 mt-1">Aapki dukaan ready hai! Chaliye pehla kaam karte hain.</p>
        </div>

        <Card className="relative overflow-hidden p-6 md:p-8 bg-gradient-to-br from-[#1E1B4B] to-[#312E81] text-white border-0 grain">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#EA580C] rounded-full blur-3xl opacity-25" />
          <div className="relative">
            <div className="pill bg-[#EA580C]/25 text-[#FDBA74] mb-2">Getting Started</div>
            <div className="font-serif-display text-2xl md:text-3xl font-black mt-1">Setup Checklist</div>
            <p className="text-sm text-slate-200 mt-2 max-w-lg">5 quick steps mein aapki dukaan fully functional ho jaayegi. Har step complete karne se dashboard smart hoti jaayegi.</p>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-3">
          <EmptyStep step="1" to="/inventory" icon={Package} title="Add first product" hindi="Apna pehla product add karo" cta="Product add karo" />
          <EmptyStep step="2" to="/billing" icon={Receipt} title="Create first bill" hindi="Pehla bill banao" cta="Naya bill" />
          <EmptyStep step="3" to="/customers" icon={ShoppingCart} title="Add first customer" hindi="Pehla grahak add karo" cta="Customer add karo" />
          <EmptyStep step="4" to="/suppliers" icon={Truck} title="Add supplier" hindi="Supplier details save karo" cta="Supplier add karo" />
          <div className="md:col-span-2">
            <EmptyStep step="5" to="/settings" icon={Sparkles} title="Import sample products (optional)" hindi="Kirana sample data se try karo" cta="Sample data import karo" featured />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-slate-900">Namaste, Ramesh ji</h1>
          <p className="text-slate-600 mt-1 text-sm md:text-base">Aaj ka business ek nazar mein</p>
        </div>
        <Link to="/billing">
          <Button data-testid="dashboard-new-bill-btn" className="bg-[#312E81] hover:bg-[#1E1B4B] h-11 px-5">
            <Receipt className="w-4 h-4 mr-2" /> Naya Bill
          </Button>
        </Link>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard testid="stat-today-sales" icon={IndianRupee} label="Today's Sales" hindi="Aaj ki bikri" value={fmtINR(data.today_revenue)} sub={`${data.bills_today} bills`} tone="blue" />
        <StatCard testid="stat-today-profit" icon={TrendingUp} label="Today's Profit" hindi="Aaj ka munafa" value={fmtINR(data.today_profit)} tone="green" />
        <StatCard testid="stat-inventory-value" icon={Package} label="Inventory Value" hindi="Stock keemat" value={fmtINR(data.inventory_value)} sub={`${data.low_stock_count} low`} tone="slate" />
        <StatCard testid="stat-pending-udhaar" icon={Wallet} label="Pending Udhaar" hindi="Baaki udhaar" value={fmtINR(data.pending_udhaar)} sub={`${data.udhaar_customers_count} customers`} tone="red" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard testid="stat-cash-collected" icon={Wallet} label="Cash Collected" hindi="Aaj cash" value={fmtINR(data.cash_collected)} tone="green" />
        <StatCard testid="stat-supplier-due" icon={Truck} label="Supplier Due" hindi="Supplier ko dena" value={fmtINR(data.supplier_due)} tone="amber" />
        <StatCard testid="stat-low-stock" icon={AlertTriangle} label="Low Stock" hindi="Khatam hone wala" value={data.low_stock_count} sub="items" tone="red" />
        <StatCard testid="stat-expiring" icon={AlertTriangle} label="Expiring Soon" hindi="Expiry paas" value={data.expiring_count} sub="items" tone="amber" />
      </div>

      {/* AI Summary + Aaj ka kaam */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 p-5 border-slate-200 bg-gradient-to-br from-[#F3EDDF] to-white">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#312E81] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-display font-bold text-slate-900">AI Business Summary</div>
                <div className="text-xs text-slate-500">Powered by Gemini • Hinglish</div>
              </div>
            </div>
            <Button data-testid="ai-refresh-btn" variant="ghost" size="sm" onClick={loadAI} disabled={aiLoading}>
              <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed min-h-[80px]" data-testid="ai-summary-text">
            {aiLoading ? "Soch raha hoon..." : aiSummary}
          </div>
          <Link to="/advisor" className="inline-flex items-center gap-1 text-[#312E81] text-sm font-semibold mt-3 hover:underline" data-testid="link-full-advisor">
            Full advisor kholo <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <Card className="p-5 border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
            </div>
            <div className="font-display font-bold text-slate-900">Aaj ka kaam</div>
          </div>
          <div className="space-y-2 max-h-[280px] overflow-y-auto" data-testid="aaj-ka-kaam-list">
            {data.aaj_ka_kaam.length === 0 && <div className="text-sm text-slate-500">Sab kaam ho gaya!</div>}
            {data.aaj_ka_kaam.map((t, i) => (
              <div key={i} className="p-2.5 rounded-md bg-slate-50 border border-slate-100 text-sm text-slate-700">
                <Badge className={`mb-1 text-[10px] ${t.type === "low_stock" ? "bg-red-100 text-red-700" : t.type === "udhaar" ? "bg-amber-100 text-amber-700" : t.type === "supplier" ? "bg-[#EEECFB] text-[#312E81]" : "bg-purple-100 text-purple-700"}`}>
                  {t.type.replace("_", " ")}
                </Badge>
                <div>{t.text}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5 border-slate-200 bg-white">
          <div className="font-display font-bold text-slate-900 mb-1">7-Din Sales Trend</div>
          <div className="text-xs text-slate-500 mb-4">Last week revenue</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.sales_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v) => "₹" + v} />
              <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: "#2563eb" }} />
              <Line type="monotone" dataKey="profit" stroke="#16a34a" strokeWidth={2} dot={{ r: 3, fill: "#16a34a" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 border-slate-200 bg-white">
          <div className="font-display font-bold text-slate-900 mb-1">Top 5 Products (30 din)</div>
          <div className="text-xs text-slate-500 mb-4">Sabse zyada bikne wale</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.top_products} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" fontSize={11} />
              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={110} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Bar dataKey="qty" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Payment mode split */}
      <Card className="p-5 border-slate-200 bg-white">
        <div className="font-display font-bold text-slate-900 mb-3">Aaj ke payment modes</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {paymentModeData.map(m => (
            <div key={m.mode} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{m.mode}</div>
              <div className="font-mono-num text-lg font-bold text-slate-900 mt-1">{fmtINR(m.amount)}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Today's Workflow */}
      <Card className="p-5 border-slate-200 bg-white" data-testid="todays-workflow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-display font-bold text-slate-900">Aaj ka Workflow</div>
            <div className="text-xs text-slate-500">Ek-ek karke complete karo</div>
          </div>
          <Badge className="bg-[#EEECFB] text-[#312E81] hover:bg-[#EEECFB]">4 steps</Badge>
        </div>
        <div className="grid md:grid-cols-4 gap-3">
          <WorkflowStep
            step={1}
            icon={ShoppingCart}
            title="Billing"
            hindi="Naye bills banao"
            to="/billing"
            active={true}
            done={data.bills_today > 0}
            metric={`${data.bills_today} bills aaj`}
            testid="wf-billing"
          />
          <WorkflowStep
            step={2}
            icon={Package}
            title="Inventory Update"
            hindi="Stock check karo"
            to="/inventory"
            active={data.low_stock_count > 0}
            done={data.low_stock_count === 0}
            metric={data.low_stock_count > 0 ? `${data.low_stock_count} low stock` : "All stocked"}
            testid="wf-inventory"
          />
          <WorkflowStep
            step={3}
            icon={MessageCircle}
            title="Udhaar Reminder"
            hindi="WhatsApp bhejo"
            to="/udhaar"
            active={data.udhaar_customers_count > 0}
            done={data.udhaar_customers_count === 0}
            metric={data.udhaar_customers_count > 0 ? `${data.udhaar_customers_count} customers` : "No pending"}
            testid="wf-udhaar"
          />
          <WorkflowStep
            step={4}
            icon={Truck}
            title="Supplier Reorder"
            hindi="Order place karo"
            to="/suppliers"
            active={data.supplier_due > 0 || data.low_stock_count > 0}
            done={data.supplier_due === 0 && data.low_stock_count === 0}
            metric={data.supplier_due > 0 ? `${fmtINR(data.supplier_due)} due` : "All paid"}
            testid="wf-supplier"
          />
        </div>
      </Card>
    </div>
  );
}

function WorkflowStep({ step, icon: Icon, title, hindi, to, active, done, metric, testid }) {
  return (
    <Link
      to={to}
      data-testid={testid}
      className={`group relative p-4 rounded-xl border-2 transition-all ${
        done ? "bg-green-50 border-green-200" : active ? "bg-[#F3EDDF] border-[#312E81]/25 hover:border-[#312E81]" : "bg-slate-50 border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${done ? "bg-green-600" : active ? "bg-[#312E81]" : "bg-slate-400"} text-white`}>
          {done ? <CheckCircle2 size={18} /> : <Icon size={18} />}
        </div>
        <div className={`text-[10px] font-bold uppercase tracking-widest ${done ? "text-green-700" : "text-slate-400"}`}>
          Step {step}
        </div>
      </div>
      <div className="font-display font-bold text-slate-900">{title}</div>
      <div className="text-[11px] text-slate-500 mb-2">{hindi}</div>
      <div className={`font-mono-num text-xs font-semibold ${done ? "text-green-700" : "text-slate-700"}`}>{metric}</div>
      <ArrowRight className="w-3.5 h-3.5 absolute bottom-3 right-3 text-slate-400 group-hover:text-[#312E81] group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

function EmptyStep({ step, to, icon: Icon, title, hindi, cta, featured }) {
  return (
    <Link to={to} data-testid={`empty-step-${step}`} className={`group p-5 rounded-xl border-2 ${featured ? "border-[#EA580C]/40 bg-orange-50/40" : "border-[#EFE6D3] bg-white"} hover:border-[#312E81] hover:shadow-lg transition-all block`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl ${featured ? "bg-[#EA580C] text-white" : "bg-[#F3EDDF] text-[#312E81]"} flex items-center justify-center`}><Icon size={19} /></div>
        <div className={`text-[10px] font-bold uppercase tracking-widest ${featured ? "text-[#EA580C]" : "text-slate-400"}`}>Step {step}</div>
      </div>
      <div className="font-display font-bold text-slate-900">{title}</div>
      <div className="text-xs text-slate-500 mb-3">{hindi}</div>
      <div className="text-sm font-bold text-[#312E81] group-hover:underline flex items-center gap-1">
        {cta} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}
