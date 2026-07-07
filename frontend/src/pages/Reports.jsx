import { useEffect, useState } from "react";
import { api, fmtINR } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, TrendingUp, Package, Wallet } from "lucide-react";
import { toast } from "sonner";

export default function Reports() {
  const [days, setDays] = useState("7");
  const [data, setData] = useState(null);

  const load = () => api.reports(Number(days)).then(setData);
  useEffect(() => { load(); }, [days]);

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ["Report Summary", `Last ${days} days`],
      [],
      ["Revenue", data.revenue],
      ["Profit", data.profit],
      ["Bills", data.bills],
      ["Avg Bill", data.avg_bill],
      [],
      ["Payment Mode", "Amount"],
      ...Object.entries(data.payment_modes).map(([k, v]) => [k, v]),
      [],
      ["Top Selling", "Qty", "Revenue", "Profit"],
      ...data.top_selling.map(p => [p.name, p.qty, p.revenue.toFixed(2), p.profit.toFixed(2)]),
      [],
      ["Low Margin", "Qty", "Revenue", "Profit"],
      ...data.low_margin.map(p => [p.name, p.qty, p.revenue.toFixed(2), p.profit.toFixed(2)]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `dukaan-report-${days}d.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV download ho gaya");
  };

  if (!data) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-4" data-testid="reports-page">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-slate-900">Reports</h1>
          <p className="text-slate-600 text-sm mt-1">Sales, profit & performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger data-testid="days-select" className="w-32 h-11 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Today</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button data-testid="export-csv-btn" onClick={exportCSV} className="h-11 bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" /> CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-white border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Revenue</div>
          <div className="font-mono-num text-2xl font-black text-slate-900 mt-1">{fmtINR(data.revenue)}</div>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Profit</div>
          <div className="font-mono-num text-2xl font-black text-green-700 mt-1">{fmtINR(data.profit)}</div>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Bills</div>
          <div className="font-mono-num text-2xl font-black text-slate-900 mt-1">{data.bills}</div>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Avg Bill</div>
          <div className="font-mono-num text-2xl font-black text-slate-900 mt-1">{fmtINR(data.avg_bill)}</div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5 bg-white border-slate-200">
          <div className="font-display font-bold text-slate-900 mb-3">Top Selling Products</div>
          <div className="space-y-2" data-testid="top-selling-list">
            {data.top_selling.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-50">
                <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                <div className="text-right">
                  <div className="font-mono-num text-sm font-bold text-slate-900">{p.qty} units</div>
                  <div className="font-mono-num text-xs text-green-700">{fmtINR(p.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 bg-white border-slate-200">
          <div className="font-display font-bold text-slate-900 mb-3">Low Margin Products</div>
          <div className="space-y-2" data-testid="low-margin-list">
            {data.low_margin.slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-amber-50 border border-amber-100">
                <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                <div className="text-right">
                  <div className="font-mono-num text-xs text-slate-600">Rev {fmtINR(p.revenue)}</div>
                  <div className="font-mono-num text-xs font-bold text-amber-700">Profit {fmtINR(p.profit)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5 bg-white border-slate-200">
        <div className="font-display font-bold text-slate-900 mb-3">Payment Modes Breakdown</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(data.payment_modes).map(([mode, amt]) => (
            <div key={mode} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{mode}</div>
              <div className="font-mono-num text-lg font-bold text-slate-900 mt-1">{fmtINR(amt)}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 bg-white border-slate-200">
        <div className="font-display font-bold text-slate-900 mb-3">Slow Moving Stock</div>
        <div className="grid md:grid-cols-3 gap-2" data-testid="slow-moving-list">
          {data.slow_moving.map((p, i) => (
            <div key={i} className="p-2 rounded bg-slate-50 border border-slate-100 text-sm">
              <div className="font-semibold text-slate-900">{p.name}</div>
              <div className="text-xs text-slate-500">{p.category} • Stock {p.stock}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
