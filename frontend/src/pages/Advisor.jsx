import { useEffect, useState } from "react";
import { api, fmtINR } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Package, Wallet, Truck, TrendingUp } from "lucide-react";

const QUICK_PROMPTS = [
  { label: "Aaj kya reorder karu?", q: "Aaj mujhe kaunse products reorder karne chahiye aur kitne quantity mein?" },
  { label: "Kaunse customers ko remind karu?", q: "Kis kis customer ko payment ka reminder bhejna chahiye pehle?" },
  { label: "Kaunse products ka margin kam hai?", q: "Kaunse products ka profit margin sabse kam hai? Kya karein?" },
  { label: "Is hafte ka offer suggest karo", q: "Is hafte customers ke liye kaunsa offer ya bundle chalayein?" },
  { label: "Slow-moving stock kya karu?", q: "Slow-moving aur dead stock ko kaise clear karein?" },
  { label: "Kaunsa supplier payment urgent hai?", q: "Kaunse supplier ka payment sabse pehle karna chahiye?" },
];

export default function Advisor() {
  const [reorder, setReorder] = useState([]);
  const [summary, setSummary] = useState("");
  const [conv, setConv] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.aiSummary().then(r => setSummary(r.summary));
    api.aiReorder().then(r => setReorder(r.suggestions));
  }, []);

  const ask = async (query) => {
    if (!query.trim()) return;
    setConv(prev => [...prev, { role: "user", text: query }]);
    setQ("");
    setLoading(true);
    try {
      const r = await api.aiAsk(query);
      setConv(prev => [...prev, { role: "ai", text: r.answer }]);
    } catch {
      setConv(prev => [...prev, { role: "ai", text: "AI abhi busy hai." }]);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4" data-testid="advisor-page">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-3">
          AI Business Advisor
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Gemini 3</Badge>
        </h1>
        <p className="text-slate-600 text-sm mt-1">Hinglish mein daily insights aur guidance</p>
      </div>

      {/* Summary */}
      <Card className="p-5 bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5" />
          <div className="font-display font-bold">Aaj ka Business Summary</div>
        </div>
        <div className="text-sm whitespace-pre-line leading-relaxed" data-testid="advisor-summary">{summary || "Loading..."}</div>
      </Card>

      {/* Reorder suggestions */}
      <Card className="p-5 bg-white border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-4 h-4 text-blue-600" />
          <div className="font-display font-bold text-slate-900">Reorder Suggestions</div>
        </div>
        <div className="grid md:grid-cols-2 gap-2">
          {reorder.length === 0 && <div className="text-sm text-slate-500 py-3">Sab stock theek hai!</div>}
          {reorder.map(s => (
            <div key={s.product_id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold text-slate-900 text-sm">{s.name}</div>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-mono-num">{s.recommended_order}</Badge>
              </div>
              <div className="text-xs text-slate-600">{s.reason}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Chat */}
      <Card className="p-5 bg-white border-slate-200">
        <div className="font-display font-bold text-slate-900 mb-3">Poocho koi bhi sawaal</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_PROMPTS.map(p => (
            <button key={p.label} data-testid={`quick-prompt-${p.label.slice(0, 10)}`} onClick={() => ask(p.q)} className="h-8 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700">
              {p.label}
            </button>
          ))}
        </div>

        {conv.length > 0 && (
          <div className="space-y-2 mb-3 max-h-[400px] overflow-y-auto" data-testid="advisor-chat">
            {conv.map((m, i) => (
              <div key={i} className={`p-3 rounded-lg text-sm ${m.role === "user" ? "bg-blue-50 border border-blue-100" : "bg-slate-50 border border-slate-100"}`}>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">{m.role === "user" ? "You" : "AI"}</div>
                <div className="whitespace-pre-line">{m.text}</div>
              </div>
            ))}
            {loading && <div className="p-3 rounded-lg bg-slate-50 text-sm text-slate-500">AI soch raha hai...</div>}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            data-testid="advisor-input"
            placeholder="Apna sawaal likho..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask(q)}
            className="h-11"
          />
          <Button data-testid="advisor-send" onClick={() => ask(q)} disabled={loading} className="h-11 bg-blue-600 hover:bg-blue-700">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
