import { useEffect, useState } from "react";
import { api, fmtINR, whatsappLink } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, MessageCircle, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";

const empty = { name: "", phone: "", address: "", tag: "regular" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [msgOpen, setMsgOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("offer");

  const load = () => api.customers().then(setCustomers);
  useEffect(() => { load(); }, []);

  const list = filter === "all" ? customers : customers.filter(c => c.tag === filter);

  const save = async () => {
    await api.createCustomer(form);
    setOpen(false); setForm(empty); load(); toast.success("Customer add ho gaya");
  };

  const buildMessage = (c, type) => {
    const templates = {
      offer: `Namaste ${c.name} ji! Sharma General Store me is weekend special offer: Aashirvaad Atta 5kg + Fortune Oil 1L par ₹30 discount. Aaiye, stock limited hai!`,
      thank: `Namaste ${c.name} ji, aapke bharose ke liye dhanyawad! Aap hamare regular customer hain, jab bhi zaroorat ho please batayein. — Sharma Store`,
      inactive: `Namaste ${c.name} ji! Kaafi din ho gaye aapko dekhe. Store par naye products aaye hain — aa jaayiye, chai peete peete dikhaenge. — Sharma Store`,
      combo: `${c.name} ji, aapke liye special: Amul Milk + Britannia Bread + Amul Butter combo sirf ₹120 mein! Sirf is hafte.`,
    };
    return templates[type];
  };

  const openMsg = (c, type = "offer") => {
    setActive(c); setMsgType(type); setMsg(buildMessage(c, type)); setMsgOpen(true);
  };

  const changeType = (t) => { setMsgType(t); if (active) setMsg(buildMessage(active, t)); };

  const tagColors = {
    "regular": "bg-slate-100 text-slate-700",
    "high-value": "bg-[#EEECFB] text-[#312E81]",
    "udhaar": "bg-red-100 text-red-700",
    "inactive": "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-4" data-testid="customers-page">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-slate-900">Customers</h1>
          <p className="text-slate-600 text-sm mt-1">Regular grahak & CRM</p>
        </div>
        <Button data-testid="add-customer-btn" onClick={() => setOpen(true)} className="h-11 bg-[#312E81] hover:bg-[#1E1B4B]">
          <Plus className="w-4 h-4 mr-2" /> Customer
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "regular", "high-value", "udhaar", "inactive"].map(t => (
          <button
            key={t}
            data-testid={`filter-${t}`}
            onClick={() => setFilter(t)}
            className={`h-9 px-4 rounded-full text-xs font-bold uppercase ${filter === t ? "bg-[#312E81] text-white" : "bg-white border border-slate-200 text-slate-600"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {list.map(c => (
          <Card key={c.id} className="p-4 bg-white border-slate-200" data-testid={`cust-card-${c.id}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-display font-bold text-slate-900">{c.name}</div>
                <div className="text-xs text-slate-500">{c.phone}</div>
              </div>
              <Badge className={`${tagColors[c.tag]} hover:${tagColors[c.tag]} capitalize`}>{c.tag}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="bg-slate-50 rounded p-2">
                <div className="text-slate-500">Lifetime Value</div>
                <div className="font-mono-num font-bold text-slate-900">{fmtINR(c.lifetime_value)}</div>
              </div>
              <div className={`rounded p-2 ${c.pending_amount > 0 ? "bg-red-50" : "bg-slate-50"}`}>
                <div className={c.pending_amount > 0 ? "text-red-600" : "text-slate-500"}>Pending</div>
                <div className={`font-mono-num font-bold ${c.pending_amount > 0 ? "text-red-700" : "text-slate-900"}`}>{fmtINR(c.pending_amount)}</div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button data-testid={`offer-${c.id}`} size="sm" onClick={() => openMsg(c, "offer")} className="h-8 whatsapp-btn hover:bg-[#1EBE5D] text-white">
                <Sparkles className="w-3 h-3 mr-1" /> Offer
              </Button>
              <Button data-testid={`thank-${c.id}`} size="sm" variant="outline" onClick={() => openMsg(c, "thank")} className="h-8">Thank you</Button>
              {c.tag === "inactive" && <Button size="sm" variant="outline" onClick={() => openMsg(c, "inactive")} className="h-8">Comeback</Button>}
            </div>
          </Card>
        ))}
      </div>

      {list.length === 0 && (
        <Card className="p-10 text-center border-dashed bg-white">
          <Users className="w-10 h-10 mx-auto text-slate-400 mb-3" />
          <div className="font-semibold text-slate-700">Koi customer nahi</div>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Naya Customer</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input data-testid="cf-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Phone</Label><Input data-testid="cf-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="919xxxxxxxxx" /></div>
            <div><Label>Address</Label><Input data-testid="cf-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div>
              <Label>Tag</Label>
              <Select value={form.tag} onValueChange={(v) => setForm({ ...form, tag: v })}>
                <SelectTrigger data-testid="cf-tag"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="high-value">High Value</SelectItem>
                  <SelectItem value="udhaar">Udhaar</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button data-testid="cf-save" onClick={save} className="bg-[#312E81] hover:bg-[#1E1B4B]">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>WhatsApp Message - {active?.name}</DialogTitle></DialogHeader>
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {["offer", "thank", "combo", "inactive"].map(t => (
                <button key={t} onClick={() => changeType(t)} data-testid={`mtype-${t}`} className={`h-8 px-3 rounded-md text-xs font-bold uppercase ${msgType === t ? "bg-[#312E81] text-white" : "bg-slate-100 text-slate-600"}`}>
                  {t}
                </button>
              ))}
            </div>
            <Textarea data-testid="cust-msg" value={msg} onChange={(e) => setMsg(e.target.value)} rows={5} />
          </div>
          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(msg); toast.success("Copy ho gaya"); }}>
              <Copy className="w-4 h-4 mr-1" /> Copy
            </Button>
            {active && (
              <a href={whatsappLink(active.phone, msg)} target="_blank" rel="noopener noreferrer">
                <Button data-testid="cust-whatsapp" className="whatsapp-btn hover:bg-[#1EBE5D] text-white">
                  <MessageCircle className="w-4 h-4 mr-1.5" /> WhatsApp
                </Button>
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
