import { useEffect, useState } from "react";
import { api, fmtINR } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, AlertTriangle, Sparkles, Trash2, Edit, Package } from "lucide-react";
import { toast } from "sonner";

const empty = { name: "", category: "", sku: "", purchase_price: 0, selling_price: 0, stock: 0, min_stock: 5, unit: "pcs" };

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [reorder, setReorder] = useState([]);

  const load = () => api.products({ q }).then(setProducts);
  useEffect(() => { load(); }, [q]);

  const save = async () => {
    try {
      if (editing) await api.updateProduct(editing, form);
      else await api.createProduct(form);
      toast.success(editing ? "Update ho gaya" : "Product add ho gaya");
      setOpen(false); setForm(empty); setEditing(null); load();
    } catch { toast.error("Save fail"); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete product?")) return;
    await api.deleteProduct(id); load(); toast.success("Delete ho gaya");
  };

  const openEdit = (p) => {
    setEditing(p.id);
    setForm({ name: p.name, category: p.category, sku: p.sku, purchase_price: p.purchase_price, selling_price: p.selling_price, stock: p.stock, min_stock: p.min_stock, unit: p.unit });
    setOpen(true);
  };

  const openAI = async () => {
    setAiOpen(true);
    const r = await api.aiReorder();
    setReorder(r.suggestions);
  };

  return (
    <div className="space-y-4" data-testid="inventory-page">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-slate-900">Inventory</h1>
          <p className="text-slate-600 text-sm mt-1">Stock management • Alerts • Reorder</p>
        </div>
        <div className="flex gap-2">
          <Button data-testid="ai-reorder-btn" onClick={openAI} variant="outline" className="h-11">
            <Sparkles className="w-4 h-4 mr-2 text-blue-600" /> AI Reorder
          </Button>
          <Button data-testid="add-product-btn" onClick={() => { setEditing(null); setForm(empty); setOpen(true); }} className="h-11 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" /> Product
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input data-testid="inventory-search" placeholder="Search product, SKU, category..." className="pl-9 h-11 bg-white" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {products.length === 0 && (
        <Card className="p-10 text-center bg-white border-dashed border-slate-300">
          <Package className="w-10 h-10 mx-auto text-slate-400 mb-3" />
          <div className="font-semibold text-slate-700">Koi product nahi mila</div>
          <div className="text-sm text-slate-500 mt-1">Naya product add karo</div>
        </Card>
      )}

      <div className="grid gap-3 md:hidden">
        {products.map(p => <ProductCard key={p.id} p={p} onEdit={openEdit} onDelete={del} />)}
      </div>

      <Card className="hidden md:block overflow-hidden bg-white border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3 text-[11px] uppercase tracking-widest font-bold">Product</th>
              <th className="text-left px-4 py-3 text-[11px] uppercase tracking-widest font-bold">Category</th>
              <th className="text-right px-4 py-3 text-[11px] uppercase tracking-widest font-bold">Buy</th>
              <th className="text-right px-4 py-3 text-[11px] uppercase tracking-widest font-bold">Sell</th>
              <th className="text-right px-4 py-3 text-[11px] uppercase tracking-widest font-bold">Margin</th>
              <th className="text-right px-4 py-3 text-[11px] uppercase tracking-widest font-bold">Stock</th>
              <th className="text-left px-4 py-3 text-[11px] uppercase tracking-widest font-bold">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const low = p.stock <= p.min_stock;
              const margin = p.purchase_price ? ((p.selling_price - p.purchase_price) / p.purchase_price * 100).toFixed(0) : 0;
              return (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50" data-testid={`product-row-${p.sku}`}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500 font-mono-num">{p.sku}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.category}</td>
                  <td className="px-4 py-3 text-right font-mono-num">{fmtINR(p.purchase_price)}</td>
                  <td className="px-4 py-3 text-right font-mono-num">{fmtINR(p.selling_price)}</td>
                  <td className="px-4 py-3 text-right font-mono-num text-green-700 font-semibold">{margin}%</td>
                  <td className="px-4 py-3 text-right font-mono-num font-semibold">{p.stock}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {low && <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Low stock</Badge>}
                      {p.movement === "fast" && <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Fast</Badge>}
                      {p.movement === "slow" && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Slow</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button data-testid={`edit-${p.sku}`} size="icon" variant="ghost" onClick={() => openEdit(p)}><Edit className="w-3.5 h-3.5" /></Button>
                    <Button data-testid={`delete-${p.sku}`} size="icon" variant="ghost" onClick={() => del(p.id)}><Trash2 className="w-3.5 h-3.5 text-red-600" /></Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Add/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Product" : "Naya Product"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Name</Label><Input data-testid="pf-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Category</Label><Input data-testid="pf-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div><Label>SKU</Label><Input data-testid="pf-sku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
            <div><Label>Purchase Price</Label><Input data-testid="pf-purchase" type="number" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: Number(e.target.value) })} /></div>
            <div><Label>Selling Price</Label><Input data-testid="pf-selling" type="number" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: Number(e.target.value) })} /></div>
            <div><Label>Stock</Label><Input data-testid="pf-stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
            <div><Label>Min Stock</Label><Input data-testid="pf-minstock" type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: Number(e.target.value) })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button data-testid="pf-save" onClick={save} className="bg-blue-600 hover:bg-blue-700">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Reorder */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-600" /> AI Reorder Suggestions</DialogTitle></DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-2">
            {reorder.length === 0 && <div className="text-sm text-slate-500 py-8 text-center">Sab stock theek hai!</div>}
            {reorder.map(s => (
              <div key={s.product_id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-slate-900">{s.name}</div>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-mono-num">Order {s.recommended_order}</Badge>
                </div>
                <div className="text-xs text-slate-600">{s.reason}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductCard({ p, onEdit, onDelete }) {
  const low = p.stock <= p.min_stock;
  const margin = p.purchase_price ? ((p.selling_price - p.purchase_price) / p.purchase_price * 100).toFixed(0) : 0;
  return (
    <Card className="p-3 bg-white border-slate-200" data-testid={`mcard-${p.sku}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-slate-900 truncate">{p.name}</div>
          <div className="text-xs text-slate-500">{p.category} • {p.sku}</div>
        </div>
        <div className="text-right">
          <div className="font-mono-num text-sm font-bold text-blue-700">{fmtINR(p.selling_price)}</div>
          <div className="text-xs text-green-700 font-mono-num">+{margin}%</div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-1">
          <Badge variant="secondary" className="font-mono-num">Stock {p.stock}</Badge>
          {low && <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Low</Badge>}
        </div>
        <div>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(p)}><Edit className="w-3.5 h-3.5" /></Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onDelete(p.id)}><Trash2 className="w-3.5 h-3.5 text-red-600" /></Button>
        </div>
      </div>
    </Card>
  );
}
