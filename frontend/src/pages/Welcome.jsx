import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, Sparkles, TrendingUp, Wallet, Users, ArrowRight, Check } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const BUSINESS_TYPES = ["Kirana / General Store", "Pharmacy / Medical", "Stationery", "Cosmetics", "Sweet Shop", "Hardware", "Grocery Wholesaler", "Other"];

export default function Welcome() {
  const nav = useNavigate();
  const [mode, setMode] = useState("choice"); // choice | setup
  const [form, setForm] = useState({
    shop_name: "", owner_name: "", phone: "", address: "", gst_number: "",
    language: "hinglish", business_type: "Kirana / General Store", low_stock_threshold: 5, currency: "INR",
  });
  const [saving, setSaving] = useState(false);

  const openDemo = () => {
    localStorage.setItem("dukaan_mode", "demo");
    localStorage.setItem("dukaan_onboarded", "true");
    nav("/dashboard");
  };

  const submit = async () => {
    if (!form.shop_name || !form.owner_name || !form.phone) {
      return toast.error("Shop name, owner aur phone zaroori hain");
    }
    setSaving(true);
    try {
      await api.updateSettings(form);
      localStorage.setItem("dukaan_mode", "live");
      localStorage.setItem("dukaan_onboarded", "true");
      toast.success("Dukaan ready hai!");
      nav("/dashboard");
    } catch {
      toast.error("Save fail");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4" data-testid="welcome-page">
      <div className="w-full max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-display font-black text-xl text-slate-900">Dukaan AI Copilot</div>
            <div className="text-xs font-semibold text-slate-500">AI business copilot for Indian kirana stores</div>
          </div>
        </div>

        {mode === "choice" ? (
          <div className="grid md:grid-cols-2 gap-4">
            {/* Demo card */}
            <Card className="p-6 bg-white border-slate-200 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Demo</Badge>
                <div className="text-xs font-semibold text-slate-500">Instant preview</div>
              </div>
              <div className="font-display font-black text-2xl text-slate-900">Sharma Kirana Store</div>
              <div className="text-sm text-slate-500 mt-1">Ramesh Sharma • Delhi</div>

              <div className="grid grid-cols-2 gap-3 my-5">
                <Stat icon={TrendingUp} label="Aaj ki bikri" value="₹1,065" tone="blue" />
                <Stat icon={Sparkles} label="Aaj ka munafa" value="₹139" tone="green" />
                <Stat icon={Wallet} label="Udhaar baaki" value="₹4,340" tone="red" />
                <Stat icon={Users} label="Customers" value="7" tone="slate" />
              </div>

              <div className="space-y-2 mb-5 text-sm text-slate-600">
                <Feature>17 products auto-loaded (Amul, Parle-G, Maggi…)</Feature>
                <Feature>7-din ki sales history</Feature>
                <Feature>AI advisor Hinglish mein</Feature>
              </div>

              <Button data-testid="open-demo-btn" onClick={openDemo} className="w-full h-11 bg-blue-600 hover:bg-blue-700">
                Open Demo Store <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            {/* Create card */}
            <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-white/15 text-white hover:bg-white/15">Live</Badge>
                <div className="text-xs font-semibold text-white/60">Setup in 30 sec</div>
              </div>
              <div className="font-display font-black text-2xl">Apni Dukaan Banao</div>
              <div className="text-sm text-white/70 mt-1">Real shop details ke saath start karo</div>

              <div className="space-y-3 my-5 text-sm text-white/80">
                <Feature light>Shop profile & GST setup</Feature>
                <Feature light>Apna inventory add karo</Feature>
                <Feature light>Customers aur suppliers manage karo</Feature>
                <Feature light>AI aapki language mein advice degi</Feature>
              </div>

              <Button data-testid="create-shop-btn" onClick={() => setMode("setup")} className="w-full h-11 bg-white text-slate-900 hover:bg-slate-100">
                Create My Shop <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </div>
        ) : (
          <Card className="p-6 md:p-8 bg-white border-slate-200 max-w-2xl mx-auto" data-testid="setup-form">
            <div className="font-display font-black text-2xl text-slate-900 mb-1">Shop Setup</div>
            <div className="text-sm text-slate-500 mb-6">Basic details bharo, phir dukaan chalu</div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <Label>Shop Name *</Label>
                <Input data-testid="sf-shopname" value={form.shop_name} onChange={(e) => setForm({ ...form, shop_name: e.target.value })} placeholder="e.g. Krishna Kirana Store" className="h-11" />
              </div>
              <div>
                <Label>Owner Name *</Label>
                <Input data-testid="sf-owner" value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} placeholder="Aapka naam" className="h-11" />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input data-testid="sf-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98xxx xxxxx" className="h-11" />
              </div>
              <div>
                <Label>City / Address</Label>
                <Input data-testid="sf-city" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="e.g. Sector 10, Delhi" className="h-11" />
              </div>
              <div>
                <Label>Business Type</Label>
                <Select value={form.business_type} onValueChange={(v) => setForm({ ...form, business_type: v })}>
                  <SelectTrigger data-testid="sf-btype" className="h-11 bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>{BUSINESS_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>GST Number (optional)</Label>
                <Input data-testid="sf-gst" value={form.gst_number} onChange={(e) => setForm({ ...form, gst_number: e.target.value })} placeholder="e.g. 07AAAAA0000A1Z5" className="h-11" />
              </div>
              <div>
                <Label>Language</Label>
                <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                  <SelectTrigger data-testid="sf-lang" className="h-11 bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hinglish">Hinglish</SelectItem>
                    <SelectItem value="hindi">हिंदी</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 mt-6 justify-between">
              <Button variant="outline" onClick={() => setMode("choice")} className="h-11">Back</Button>
              <Button data-testid="submit-setup" onClick={submit} disabled={saving} className="h-11 bg-blue-600 hover:bg-blue-700">
                {saving ? "Saving..." : "Continue to Dashboard"} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        <div className="text-center text-xs text-slate-400 mt-6">
          Powered by Gemini 3 AI • Hinglish-first • Made for Indian shopkeepers
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }) {
  const tones = { blue: "bg-blue-50 text-blue-700", green: "bg-green-50 text-green-700", red: "bg-red-50 text-red-700", slate: "bg-slate-100 text-slate-700" };
  return (
    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
      <div className={`w-8 h-8 rounded-md ${tones[tone]} flex items-center justify-center mb-2`}><Icon size={15} /></div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</div>
      <div className="font-mono-num font-bold text-slate-900">{value}</div>
    </div>
  );
}

function Feature({ children, light }) {
  return (
    <div className="flex items-center gap-2">
      <Check className={`w-4 h-4 ${light ? "text-green-400" : "text-green-600"}`} />
      <span>{children}</span>
    </div>
  );
}
