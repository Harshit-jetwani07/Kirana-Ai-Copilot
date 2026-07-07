import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, ArrowRight, ArrowLeft, Package, Sparkles, Check } from "lucide-react";
import { api, setShop } from "@/lib/api";
import { toast } from "sonner";

const BUSINESS_TYPES = ["Kirana / General Store", "Pharmacy / Medical", "Stationery", "Cosmetics", "Sweet Shop", "Hardware", "Grocery Wholesaler", "Retail", "Other"];

export default function Onboarding() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    shop_name: "", owner_name: "", phone: "", address: "", gst_number: "",
    business_type: "Kirana / General Store", language: "hinglish", seed_samples: false,
  });

  const next = () => {
    if (!form.shop_name || !form.owner_name || !form.phone) {
      return toast.error("Shop name, owner aur phone zaroori hain");
    }
    setStep(2);
  };

  const submit = async (seed_samples) => {
    setSaving(true);
    try {
      const shop = await api.createShop({ ...form, seed_samples });
      setShop(shop.id, "live");
      toast.success(seed_samples ? "Shop ready with sample data!" : "Shop ready! Ab apna data add karo");
      nav("/dashboard");
    } catch {
      toast.error("Save fail");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center p-4" data-testid="onboarding-page">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#312E81] to-[#1E1B4B] flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-serif-display font-black text-xl text-slate-900">Dukaan AI Copilot</div>
            <div className="text-xs font-semibold text-slate-500">Step {step} of 2</div>
          </div>
        </div>

        {step === 1 && (
          <Card className="p-6 md:p-8 bg-white border-slate-200" data-testid="setup-form">
            <div className="font-display font-black text-2xl text-slate-900 mb-1">Apni Dukaan ki details</div>
            <div className="text-sm text-slate-500 mb-6">Basic info bharo — ye aapke bills aur receipts par aayega</div>

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
              <Button variant="outline" onClick={() => nav("/")} className="h-11"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
              <Button data-testid="next-step" onClick={next} className="h-11 btn-brand">
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-6 md:p-8 bg-white border-[#EFE6D3]" data-testid="seed-choice">
            <div className="font-serif-display font-black text-2xl md:text-3xl text-slate-900 mb-1">Kaise start karna hai?</div>
            <div className="text-sm text-slate-500 mb-6">Empty shop se ya sample data ke saath?</div>

            <div className="grid md:grid-cols-2 gap-3">
              <button
                data-testid="start-empty"
                onClick={() => submit(false)}
                disabled={saving}
                className="text-left p-5 rounded-xl border-2 border-[#EFE6D3] bg-white hover:border-[#312E81] hover:bg-[#F8F3E7] transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-[#F3EDDF] text-[#312E81] flex items-center justify-center mb-3">
                  <Package size={20} />
                </div>
                <div className="font-display font-bold text-slate-900 mb-1">Empty Shop</div>
                <div className="text-sm text-slate-600 mb-3">Clean slate — apne products, customers, suppliers khud add karo.</div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <Bullet>Bilkul saaf shuruat</Bullet>
                  <Bullet>Aapka real data hi</Bullet>
                  <Bullet>Later sample import kar sakte ho</Bullet>
                </div>
              </button>

              <button
                data-testid="start-samples"
                onClick={() => submit(true)}
                disabled={saving}
                className="text-left p-5 rounded-xl border-2 border-[#EA580C]/40 bg-orange-50/40 hover:border-[#EA580C] transition-all relative"
              >
                <div className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">Popular</div>
                <div className="w-11 h-11 rounded-xl bg-[#EA580C] text-white flex items-center justify-center mb-3">
                  <Sparkles size={20} />
                </div>
                <div className="font-display font-bold text-slate-900 mb-1">Sample Data ke Saath</div>
                <div className="text-sm text-slate-600 mb-3">17 kirana products, 7 customers, 4 suppliers, 7-din ka sales history — try karo phir apne add karo.</div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <Bullet>Amul, Parle-G, Maggi jaise items</Bullet>
                  <Bullet>Realistic udhaar aur sales</Bullet>
                  <Bullet>Full app feel milta hai</Bullet>
                </div>
              </button>
            </div>

            <div className="flex gap-2 mt-6 justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="h-11" disabled={saving}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              {saving && <div className="text-sm text-slate-500 self-center">Setting up your shop…</div>}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Bullet({ children }) {
  return <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-600" /> <span>{children}</span></div>;
}
