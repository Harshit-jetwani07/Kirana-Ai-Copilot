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
import { MessageCircle, Copy, Wallet, Phone } from "lucide-react";
import { toast } from "sonner";

export default function Udhaar() {
  const [customers, setCustomers] = useState([]);
  const [payOpen, setPayOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [amount, setAmount] = useState(0);
  const [tone, setTone] = useState("polite");
  const [reminderMsg, setReminderMsg] = useState("");

  const load = () => api.customers().then(list => setCustomers(list.filter(c => c.pending_amount > 0).sort((a, b) => b.pending_amount - a.pending_amount)));
  useEffect(() => { load(); }, []);

  const totalPending = customers.reduce((s, c) => s + c.pending_amount, 0);

  const openPay = (c) => { setActive(c); setAmount(c.pending_amount); setPayOpen(true); };
  const openReminder = async (c) => {
    setActive(c); setReminderOpen(true);
    const r = await api.aiReminder(c.id, tone);
    setReminderMsg(r.message);
  };

  const changeTone = async (t) => {
    setTone(t);
    if (active) {
      const r = await api.aiReminder(active.id, t);
      setReminderMsg(r.message);
    }
  };

  const submitPay = async () => {
    await api.recordCreditPayment({ customer_id: active.id, amount: Number(amount) });
    toast.success("Payment record ho gaya");
    setPayOpen(false); load();
  };

  const copyMsg = () => {
    navigator.clipboard.writeText(reminderMsg);
    toast.success("Message copy ho gaya");
  };

  return (
    <div className="space-y-4" data-testid="udhaar-page">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-slate-900">Udhaar Ledger</h1>
          <p className="text-slate-600 text-sm mt-1">Customer se pending payments track karo</p>
        </div>
        <Card className="p-4 bg-red-50 border-red-100">
          <div className="text-[10px] font-bold uppercase tracking-widest text-red-700">Total Baaki</div>
          <div className="font-mono-num text-2xl font-black text-red-700 mt-1">{fmtINR(totalPending)}</div>
        </Card>
      </div>

      {customers.length === 0 && (
        <Card className="p-10 text-center bg-white border-dashed">
          <Wallet className="w-10 h-10 mx-auto text-slate-400 mb-3" />
          <div className="font-semibold text-slate-700">Koi udhaar pending nahi!</div>
        </Card>
      )}

      <div className="grid gap-3">
        {customers.map(c => {
          const days = c.last_payment_date ? Math.floor((Date.now() - new Date(c.last_payment_date)) / 86400000) : 0;
          const overdue = days > 14;
          return (
            <Card key={c.id} className={`p-4 bg-white ${overdue ? "border-red-200" : "border-slate-200"}`} data-testid={`udhaar-card-${c.id}`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-display font-bold text-slate-900">{c.name}</div>
                    {overdue && <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Overdue {days}d</Badge>}
                    <Badge variant="secondary" className="capitalize">{c.tag}</Badge>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Baaki</div>
                  <div className="font-mono-num text-xl font-black text-red-700">{fmtINR(c.pending_amount)}</div>
                  <div className="text-[10px] text-slate-500">Last pay: {days}d ago</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button data-testid={`remind-${c.id}`} onClick={() => openReminder(c)} className="h-9 whatsapp-btn hover:bg-[#1EBE5D] text-white">
                    <MessageCircle className="w-4 h-4 mr-1.5" /> Remind
                  </Button>
                  <Button data-testid={`pay-${c.id}`} onClick={() => openPay(c)} variant="outline" className="h-9">
                    Payment
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Payment dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment - {active?.name}</DialogTitle></DialogHeader>
          <div>
            <Label>Amount</Label>
            <Input data-testid="payment-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-11" />
            <div className="text-xs text-slate-500 mt-1">Pending: {fmtINR(active?.pending_amount || 0)}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button data-testid="submit-payment" onClick={submitPay} className="bg-[#312E81] hover:bg-[#1E1B4B]">Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reminder dialog */}
      <Dialog open={reminderOpen} onOpenChange={setReminderOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>WhatsApp Reminder - {active?.name}</DialogTitle></DialogHeader>
          <div>
            <Label>Tone</Label>
            <div className="grid grid-cols-4 gap-2 mt-1 mb-3">
              {["polite", "firm", "festival", "short"].map(t => (
                <button
                  key={t}
                  data-testid={`tone-${t}`}
                  onClick={() => changeTone(t)}
                  className={`h-9 rounded-md text-xs font-bold uppercase ${tone === t ? "bg-[#312E81] text-white" : "bg-slate-100 text-slate-600"}`}
                >{t}</button>
              ))}
            </div>
            <Label>Message</Label>
            <Textarea data-testid="reminder-msg" value={reminderMsg} onChange={(e) => setReminderMsg(e.target.value)} rows={5} />
          </div>
          <DialogFooter className="flex-wrap gap-2">
            <Button data-testid="copy-msg" variant="outline" onClick={copyMsg}><Copy className="w-4 h-4 mr-1" /> Copy</Button>
            {active && (
              <a href={whatsappLink(active.phone, reminderMsg)} target="_blank" rel="noopener noreferrer">
                <Button data-testid="open-whatsapp" className="whatsapp-btn hover:bg-[#1EBE5D] text-white">
                  <MessageCircle className="w-4 h-4 mr-1.5" /> WhatsApp bhejo
                </Button>
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
