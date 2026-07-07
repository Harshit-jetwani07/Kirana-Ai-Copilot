import { useEffect, useState } from "react";
import { api, fmtINR, whatsappLink } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Truck, Plus, Copy, Phone } from "lucide-react";
import { toast } from "sonner";

const empty = { name: "", phone: "", company: "", categories: [] };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [msgOpen, setMsgOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [msg, setMsg] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [amount, setAmount] = useState(0);

  const load = () => api.suppliers().then(setSuppliers);
  useEffect(() => { load(); }, []);

  const save = async () => {
    await api.createSupplier({ ...form, categories: typeof form.categories === "string" ? form.categories.split(",").map(s => s.trim()) : form.categories });
    setOpen(false); setForm(empty); load(); toast.success("Supplier add ho gaya");
  };

  const openMessage = async (s) => {
    setActive(s); setMsgOpen(true);
    const r = await api.aiSupplierMessage(s.id);
    setMsg(r.message);
  };

  const openPay = (s) => { setActive(s); setAmount(s.payment_due); setPayOpen(true); };
  const submitPay = async () => {
    await api.paySupplier(active.id, Number(amount));
    setPayOpen(false); load(); toast.success("Payment record ho gaya");
  };

  const totalDue = suppliers.reduce((s, x) => s + x.payment_due, 0);

  return (
    <div className="space-y-4" data-testid="suppliers-page">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-slate-900">Suppliers</h1>
          <p className="text-slate-600 text-sm mt-1">Reorder message & payments</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Card className="p-3 bg-amber-50 border-amber-100">
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Total Due</div>
            <div className="font-mono-num text-xl font-black text-amber-700">{fmtINR(totalDue)}</div>
          </Card>
          <Button data-testid="add-supplier-btn" onClick={() => setOpen(true)} className="h-11 bg-[#312E81] hover:bg-[#1E1B4B]">
            <Plus className="w-4 h-4 mr-2" /> Supplier
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {suppliers.map(s => (
          <Card key={s.id} className="p-4 bg-white border-slate-200" data-testid={`supplier-card-${s.id}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-display font-bold text-slate-900">{s.company}</div>
                <div className="text-sm text-slate-600">{s.name}</div>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><Phone className="w-3 h-3" /> {s.phone}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Payment Due</div>
                <div className={`font-mono-num text-lg font-black ${s.payment_due > 0 ? "text-amber-700" : "text-slate-400"}`}>{fmtINR(s.payment_due)}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {(s.categories || []).map(c => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}
            </div>
            <div className="flex gap-2">
              <Button data-testid={`reorder-msg-${s.id}`} onClick={() => openMessage(s)} className="h-9 flex-1 whatsapp-btn hover:bg-[#1EBE5D] text-white">
                <MessageCircle className="w-4 h-4 mr-1.5" /> Reorder msg
              </Button>
              <Button data-testid={`pay-supplier-${s.id}`} onClick={() => openPay(s)} variant="outline" className="h-9">
                {s.payment_due > 0 ? `Pay ₹${Math.round(s.payment_due)}` : "Record Payment"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Naya Supplier</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input data-testid="sf-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Company</Label><Input data-testid="sf-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div><Label>Phone (with country code)</Label><Input data-testid="sf-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Categories (comma-separated)</Label><Input data-testid="sf-categories" value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button data-testid="sf-save" onClick={save} className="bg-[#312E81] hover:bg-[#1E1B4B]">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message dialog */}
      <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Reorder Message - {active?.company}</DialogTitle></DialogHeader>
          <Textarea data-testid="supplier-msg" value={msg} onChange={(e) => setMsg(e.target.value)} rows={7} />
          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(msg); toast.success("Copy ho gaya"); }}>
              <Copy className="w-4 h-4 mr-1" /> Copy
            </Button>
            {active && (
              <a href={whatsappLink(active.phone, msg)} target="_blank" rel="noopener noreferrer">
                <Button data-testid="sup-whatsapp" className="whatsapp-btn hover:bg-[#1EBE5D] text-white">
                  <MessageCircle className="w-4 h-4 mr-1.5" /> WhatsApp
                </Button>
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pay dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Pay Supplier - {active?.company}</DialogTitle></DialogHeader>
          <Label>Amount</Label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} data-testid="sp-amount" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button data-testid="sp-submit" onClick={submitPay} className="bg-[#312E81] hover:bg-[#1E1B4B]">Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
