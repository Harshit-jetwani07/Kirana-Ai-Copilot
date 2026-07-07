import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, Users, Lock } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [form, setForm] = useState(null);

  useEffect(() => { api.settings().then(setForm); }, []);

  const save = async () => {
    await api.updateSettings(form);
    toast.success("Settings save ho gayi");
  };

  if (!form) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-4" data-testid="settings-page">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-black text-slate-900">Settings</h1>
        <p className="text-slate-600 text-sm mt-1">Shop profile & preferences</p>
      </div>

      <Card className="p-5 bg-white border-slate-200 space-y-4">
        <div>
          <div className="font-display font-bold text-slate-900 mb-3">Shop Profile</div>
          <div className="grid md:grid-cols-2 gap-3">
            <div><Label>Shop Name</Label><Input data-testid="st-shopname" value={form.shop_name} onChange={(e) => setForm({ ...form, shop_name: e.target.value })} /></div>
            <div><Label>Owner Name</Label><Input data-testid="st-owner" value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} /></div>
            <div><Label>Phone</Label><Input data-testid="st-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>GST Number</Label><Input data-testid="st-gst" value={form.gst_number} onChange={(e) => setForm({ ...form, gst_number: e.target.value })} placeholder="Optional" /></div>
            <div className="md:col-span-2"><Label>Address</Label><Input data-testid="st-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          </div>
        </div>

        <div>
          <div className="font-display font-bold text-slate-900 mb-3">Preferences</div>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <Label>Language</Label>
              <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                <SelectTrigger data-testid="st-language"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hinglish">Hinglish</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Currency</Label>
              <Input value={form.currency} disabled />
            </div>
            <div>
              <Label>Default Low Stock Threshold</Label>
              <Input data-testid="st-lowstock" type="number" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: Number(e.target.value) })} />
            </div>
          </div>
        </div>

        <Button data-testid="st-save" onClick={save} className="bg-blue-600 hover:bg-blue-700 h-11">Save Settings</Button>
      </Card>

      <Card className="p-5 bg-white border-slate-200">
        <div className="font-display font-bold text-slate-900 mb-2">Data Backup</div>
        <p className="text-sm text-slate-600 mb-3">Reports page se CSV export karo. Full backup jald aayega.</p>
      </Card>

      {/* Multi-store ready */}
      <Card className="p-5 bg-white border-slate-200" data-testid="multi-store-section">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-600" />
            <div className="font-display font-bold text-slate-900">Multi-Store Manager</div>
          </div>
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Coming Soon</Badge>
        </div>
        <p className="text-sm text-slate-600 mb-3">Ek se zyada dukaan chalate ho? Jald hi ek hi login se sabhi stores manage kar paayenge.</p>

        <div className="grid md:grid-cols-2 gap-3 opacity-70 pointer-events-none">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <Label className="text-xs">Active Store</Label>
            <Select value="current" disabled>
              <SelectTrigger data-testid="store-switcher" className="mt-1 bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Sharma General Store (current)</SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-2 flex items-center gap-1 text-xs text-slate-500"><Lock className="w-3 h-3" /> Currently single-shop demo mode</div>
          </div>
          <Button data-testid="add-store-btn" variant="outline" disabled className="h-11 self-end">
            <Store className="w-4 h-4 mr-2" /> Add New Store
          </Button>
        </div>
      </Card>

      <Card className="p-5 bg-white border-slate-200" data-testid="login-section">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <div className="font-display font-bold text-slate-900">Login & Team Access</div>
          </div>
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Coming Soon</Badge>
        </div>
        <p className="text-sm text-slate-600 mb-3">Apne staff ko cashier ya manager access do. Phone-OTP ya Google se login.</p>
        <div className="grid md:grid-cols-2 gap-3 opacity-70 pointer-events-none">
          <div>
            <Label className="text-xs">Phone / Email</Label>
            <Input disabled placeholder="+91 98765 43210" className="bg-white" />
          </div>
          <div>
            <Label className="text-xs">Role</Label>
            <Select value="owner" disabled>
              <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner (you)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs text-slate-500"><Lock className="w-3 h-3" /> Currently single-shop demo. Auth aayega jald.</div>
      </Card>
    </div>
  );
}
