import { useEffect, useMemo, useState } from "react";
import { api, fmtINR } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, Minus, Trash2, Receipt, X, Printer, ScanLine } from "lucide-react";
import { toast } from "sonner";
import BarcodeScanner from "@/components/BarcodeScanner";

const QUICK = ["Amul Milk", "Parle-G", "Maggi", "Sugar", "Tata Salt", "Bread"];

export default function Billing() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [q, setQ] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [mode, setMode] = useState("cash");
  const [customerId, setCustomerId] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [scanOpen, setScanOpen] = useState(false);

  useEffect(() => {
    api.products().then(setProducts);
    api.customers().then(setCustomers);
  }, []);

  const filtered = useMemo(() => {
    if (!q) return products.slice(0, 12);
    const l = q.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(l) || p.sku.toLowerCase().includes(l)).slice(0, 20);
  }, [q, products]);

  const addToCart = (p) => {
    setCart(prev => {
      const ex = prev.find(x => x.product_id === p.id);
      if (ex) return prev.map(x => x.product_id === p.id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { product_id: p.id, name: p.name, price: p.selling_price, purchase_price: p.purchase_price, qty: 1 }];
    });
  };

  const changeQty = (pid, delta) => {
    setCart(prev => prev.flatMap(x => {
      if (x.product_id !== pid) return [x];
      const q2 = x.qty + delta;
      return q2 <= 0 ? [] : [{ ...x, qty: q2 }];
    }));
  };

  const removeItem = (pid) => setCart(prev => prev.filter(x => x.product_id !== pid));

  const subtotal = cart.reduce((s, x) => s + x.qty * x.price, 0);
  const profit = cart.reduce((s, x) => s + x.qty * (x.price - x.purchase_price), 0);
  const total = subtotal - Number(discount || 0) + Number(tax || 0);

  const submit = async () => {
    if (cart.length === 0) return toast.error("Cart khali hai");
    if (mode === "udhaar" && !customerId) return toast.error("Udhaar ke liye customer chuno");
    const payload = {
      items: cart.map(c => ({ product_id: c.product_id, name: c.name, qty: c.qty, price: c.price, purchase_price: c.purchase_price })),
      discount: Number(discount || 0),
      tax: Number(tax || 0),
      payment_mode: mode,
      customer_id: customerId || null,
      customer_name: customerId ? customers.find(c => c.id === customerId)?.name : null,
    };
    try {
      const sale = await api.createSale(payload);
      setReceipt(sale);
      setCart([]); setDiscount(0); setTax(0); setCustomerId("");
      // reload products stock
      api.products().then(setProducts);
      toast.success("Bill ban gaya!");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Bill fail");
    }
  };

  const quickPicks = products.filter(p => QUICK.some(q => p.name.toLowerCase().startsWith(q.toLowerCase()))).slice(0, 6);

  const handleScan = (decoded) => {
    const clean = String(decoded).trim();
    const found = products.find(p => p.sku.toLowerCase() === clean.toLowerCase() || p.name.toLowerCase().includes(clean.toLowerCase()));
    if (found) {
      addToCart(found);
      toast.success(`${found.name} added`);
    } else {
      setQ(clean);
      toast.info(`Barcode "${clean}" — search se dhundo`);
    }
    setScanOpen(false);
  };

  return (
    <div className="space-y-4" data-testid="billing-page">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-slate-900">Fast Billing</h1>
          <p className="text-slate-600 text-sm mt-1">Bill banao, print karo, ho gaya</p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        {/* Products */}
        <div className="md:col-span-3 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              data-testid="product-search-input"
              placeholder="Search product name, SKU..."
              className="pl-9 pr-12 h-11 bg-white"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button
              data-testid="open-scanner-btn"
              size="icon"
              variant="ghost"
              onClick={() => setScanOpen(true)}
              className="absolute right-1 top-1 h-9 w-9"
              title="Barcode scan karo"
            >
              <ScanLine className="w-4 h-4 text-blue-600" />
            </Button>
          </div>

          {!q && quickPicks.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Quick Picks</div>
              <div className="flex flex-wrap gap-2">
                {quickPicks.map(p => (
                  <Button key={p.id} data-testid={`quick-${p.sku}`} variant="outline" size="sm" onClick={() => addToCart(p)} className="h-9 bg-white">
                    {p.name} <span className="ml-1.5 text-slate-500">{fmtINR(p.selling_price)}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filtered.map(p => (
              <button
                key={p.id}
                data-testid={`add-product-${p.sku}`}
                onClick={() => addToCart(p)}
                className="text-left p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
              >
                <div className="text-sm font-semibold text-slate-900 line-clamp-1">{p.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{p.category} • Stock {p.stock}</div>
                <div className="font-mono-num text-sm font-bold text-blue-700 mt-1">{fmtINR(p.selling_price)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <Card className="md:col-span-2 p-4 bg-white border-slate-200 h-fit md:sticky md:top-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-display font-bold text-slate-900">Bill</div>
            <Badge variant="secondary">{cart.length} items</Badge>
          </div>
          <div className="max-h-[280px] overflow-y-auto space-y-2 mb-3" data-testid="cart-items">
            {cart.length === 0 && <div className="text-sm text-slate-500 py-6 text-center">Product select karo</div>}
            {cart.map(x => (
              <div key={x.product_id} className="flex items-center gap-2 py-2 border-b border-slate-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">{x.name}</div>
                  <div className="font-mono-num text-xs text-slate-500">{fmtINR(x.price)} x {x.qty}</div>
                </div>
                <div className="flex items-center gap-1">
                  <Button data-testid={`qty-minus-${x.product_id}`} size="icon" variant="outline" className="h-7 w-7" onClick={() => changeQty(x.product_id, -1)}><Minus className="w-3 h-3" /></Button>
                  <span className="font-mono-num text-sm font-semibold w-6 text-center">{x.qty}</span>
                  <Button data-testid={`qty-plus-${x.product_id}`} size="icon" variant="outline" className="h-7 w-7" onClick={() => changeQty(x.product_id, 1)}><Plus className="w-3 h-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600" onClick={() => removeItem(x.product_id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Discount</label>
              <Input data-testid="discount-input" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="h-9 bg-white" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tax</label>
              <Input data-testid="tax-input" type="number" value={tax} onChange={(e) => setTax(e.target.value)} className="h-9 bg-white" />
            </div>
          </div>

          <div className="space-y-1.5 py-3 border-y border-slate-200 mb-3 font-mono-num">
            <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span>{fmtINR(subtotal)}</span></div>
            <div className="flex justify-between text-sm text-slate-600"><span>Profit</span><span className="text-green-700">{fmtINR(profit)}</span></div>
            <div className="flex justify-between text-lg font-bold text-slate-900 pt-1"><span>Total</span><span data-testid="cart-total">{fmtINR(total)}</span></div>
          </div>

          <div className="mb-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Payment Mode</label>
            <div className="grid grid-cols-4 gap-1.5 mt-1">
              {["cash", "upi", "card", "udhaar"].map(m => (
                <button
                  key={m}
                  data-testid={`mode-${m}`}
                  onClick={() => setMode(m)}
                  className={`h-9 rounded-md text-xs font-bold uppercase transition-colors ${
                    mode === m ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {mode === "udhaar" && (
            <div className="mb-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Customer</label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger data-testid="customer-select" className="h-10 bg-white"><SelectValue placeholder="Grahak chuno" /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name} — {c.phone}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button data-testid="submit-bill-btn" onClick={submit} className="w-full h-11 bg-blue-600 hover:bg-blue-700">
            <Receipt className="w-4 h-4 mr-2" /> Bill Generate karo
          </Button>
        </Card>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={!!receipt} onOpenChange={() => setReceipt(null)}>
        <DialogContent data-testid="receipt-dialog" className="max-w-md">
          <DialogHeader><DialogTitle className="no-print">Receipt / Rasid</DialogTitle></DialogHeader>
          {receipt && (
            <div className="text-sm print-receipt">
              <div className="text-center pb-3 border-b border-dashed">
                <div className="font-display font-black text-lg">Sharma General Store</div>
                <div className="text-xs text-slate-500">Shop No. 12, Main Market, Delhi</div>
                <div className="text-xs text-slate-500">Bill #{receipt.id?.slice(0, 8).toUpperCase()}</div>
                <div className="text-xs text-slate-500">{new Date(receipt.created_at).toLocaleString("en-IN")}</div>
              </div>
              <div className="py-3 space-y-1.5 font-mono-num">
                {receipt.items.map((it, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="flex-1">{it.name} x {it.qty}</span>
                    <span>{fmtINR(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed pt-3 space-y-1 font-mono-num text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{fmtINR(receipt.subtotal)}</span></div>
                {receipt.discount > 0 && <div className="flex justify-between text-red-600"><span>Discount</span><span>-{fmtINR(receipt.discount)}</span></div>}
                {receipt.tax > 0 && <div className="flex justify-between"><span>Tax</span><span>{fmtINR(receipt.tax)}</span></div>}
                <div className="flex justify-between font-bold text-base"><span>Total</span><span>{fmtINR(receipt.total)}</span></div>
                <div className="flex justify-between text-xs text-slate-500 pt-1"><span>Payment</span><span className="uppercase">{receipt.payment_mode}</span></div>
                {receipt.customer_name && <div className="flex justify-between text-xs text-slate-500"><span>Customer</span><span>{receipt.customer_name}</span></div>}
              </div>
              <div className="text-center text-xs text-slate-500 mt-4">Dhanyawad! Phir aaiye.</div>
            </div>
          )}
          <DialogFooter className="no-print">
            <Button data-testid="print-receipt-btn" variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" /> Print</Button>
            <Button data-testid="close-receipt-btn" onClick={() => setReceipt(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BarcodeScanner open={scanOpen} onClose={() => setScanOpen(false)} onScan={handleScan} />
    </div>
  );
}
