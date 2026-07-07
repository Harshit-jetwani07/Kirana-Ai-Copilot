import { useEffect, useState } from "react";
import { api, fmtINR } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download, FileText, Calendar, Receipt } from "lucide-react";
import { toast } from "sonner";

export default function Reports() {
  const [days, setDays] = useState("7");
  const [data, setData] = useState(null);

  const load = () => api.reports(Number(days)).then(setData);
  useEffect(() => { load(); }, [days]);

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ["Dukaan AI Copilot Report", `Last ${days} days`],
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
          <p className="text-slate-600 text-sm mt-1">Sales, GST estimate & weekly digest</p>
        </div>
      </div>

      <Tabs defaultValue="summary">
        <TabsList data-testid="reports-tabs" className="bg-white border border-slate-200 h-11">
          <TabsTrigger value="summary" data-testid="tab-summary" className="h-9"><Receipt className="w-4 h-4 mr-1.5" /> Summary</TabsTrigger>
          <TabsTrigger value="gst" data-testid="tab-gst" className="h-9"><FileText className="w-4 h-4 mr-1.5" /> GST Helper</TabsTrigger>
          <TabsTrigger value="digest" data-testid="tab-digest" className="h-9"><Calendar className="w-4 h-4 mr-1.5" /> Digest</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4 mt-4">
          <div className="flex gap-2 justify-end flex-wrap">
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger data-testid="days-select" className="w-32 h-10 bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Today</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button data-testid="export-csv-btn" onClick={exportCSV} className="h-10 bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi label="Revenue" value={fmtINR(data.revenue)} />
            <Kpi label="Profit" value={fmtINR(data.profit)} tone="green" />
            <Kpi label="Bills" value={data.bills} />
            <Kpi label="Avg Bill" value={fmtINR(data.avg_bill)} />
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
        </TabsContent>

        <TabsContent value="gst" className="mt-4"><GSTHelper /></TabsContent>
        <TabsContent value="digest" className="mt-4"><Digest /></TabsContent>
      </Tabs>
    </div>
  );
}

function Kpi({ label, value, tone = "slate" }) {
  const tones = { slate: "text-slate-900", green: "text-green-700", red: "text-red-700" };
  return (
    <Card className="p-4 bg-white border-slate-200">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</div>
      <div className={`font-mono-num text-2xl font-black mt-1 ${tones[tone]}`}>{value}</div>
    </Card>
  );
}

function GSTHelper() {
  const [days, setDays] = useState("30");
  const [rate, setRate] = useState("5");
  const [data, setData] = useState(null);

  const load = () => api.gstReport(Number(days), Number(rate)).then(setData);
  useEffect(() => { load(); }, [days, rate]);

  const exportGST = () => {
    if (!data) return;
    const rows = [
      ["GST Helper Report", `Last ${days} days`, `Rate: ${rate}%`],
      [],
      ["Total Sales (incl. GST)", data.total_sales],
      ["Taxable Sales", data.taxable_sales],
      ["Net Sales (excl. GST)", data.net_sales],
      ["GST Collected (Output)", data.gst_collected],
      [],
      ["Purchase Total", data.purchase_total],
      ["Purchase GST (Input)", data.purchase_gst],
      [],
      ["Net GST Liability", data.net_gst_liability],
      ["Bills Count", data.bills_count],
      [],
      ["Note", data.note],
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `gst-helper-${days}d.csv`; a.click(); URL.revokeObjectURL(url);
    toast.success("GST report download ho gaya");
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-4" data-testid="gst-helper">
      <Card className="p-4 bg-amber-50 border-amber-100">
        <div className="text-sm text-amber-800">
          <strong>Note:</strong> Yeh estimated GST calculation hai. Actual filing ke liye CA se consult karo. Sabhi sales taxable maani gayi hain.
        </div>
      </Card>

      <div className="flex gap-3 flex-wrap items-end">
        <div>
          <Label className="text-xs">Period</Label>
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger data-testid="gst-days" className="w-40 h-10 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days (monthly)</SelectItem>
              <SelectItem value="90">Last 90 days (quarterly)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">GST Rate (%)</Label>
          <Input data-testid="gst-rate" className="w-24 h-10 bg-white" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
        <Button data-testid="gst-export-btn" onClick={exportGST} className="h-10 bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Total Sales" value={fmtINR(data.total_sales)} />
        <Kpi label="Net Sales" value={fmtINR(data.net_sales)} />
        <Kpi label="GST Collected" value={fmtINR(data.gst_collected)} tone="green" />
        <Kpi label="Net GST Liability" value={fmtINR(data.net_gst_liability)} tone="red" />
      </div>

      <Card className="p-5 bg-white border-slate-200">
        <div className="font-display font-bold text-slate-900 mb-3">Breakdown</div>
        <div className="space-y-2 text-sm font-mono-num">
          <Row label="Total sales (GST inclusive)" value={fmtINR(data.total_sales)} />
          <Row label="Taxable sales" value={fmtINR(data.taxable_sales)} />
          <Row label={`GST collected @ ${rate}%`} value={fmtINR(data.gst_collected)} highlight="green" />
          <Row label="Net sales (excl. GST)" value={fmtINR(data.net_sales)} />
          <div className="pt-2 mt-2 border-t border-slate-200">
            <Row label="Purchase total (period)" value={fmtINR(data.purchase_total)} />
            <Row label={`Purchase GST @ ${rate}% (input credit)`} value={fmtINR(data.purchase_gst)} highlight="blue" />
          </div>
          <div className="pt-2 mt-2 border-t border-slate-200">
            <Row label="Net GST liability (Output − Input)" value={fmtINR(data.net_gst_liability)} highlight="red" bold />
          </div>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value, highlight, bold }) {
  const c = highlight === "green" ? "text-green-700" : highlight === "red" ? "text-red-700" : highlight === "blue" ? "text-blue-700" : "text-slate-900";
  return (
    <div className={`flex justify-between ${bold ? "font-bold text-base" : ""}`}>
      <span className="text-slate-600">{label}</span>
      <span className={c}>{value}</span>
    </div>
  );
}

function Digest() {
  const [period, setPeriod] = useState("week");
  const [data, setData] = useState(null);
  useEffect(() => { api.digest(period).then(setData); }, [period]);

  if (!data) return <div>Loading...</div>;
  return (
    <div className="space-y-4" data-testid="digest-view">
      <div className="flex gap-2">
        {["week", "month"].map(p => (
          <button key={p} data-testid={`digest-${p}`} onClick={() => setPeriod(p)} className={`h-10 px-5 rounded-lg text-sm font-bold uppercase ${period === p ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
            {p}
          </button>
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
        <div className="text-[11px] font-bold uppercase tracking-widest opacity-80">Aapki {period === "week" ? "Saptahik" : "Maasik"} Digest</div>
        <div className="font-display text-3xl font-black mt-2">{fmtINR(data.revenue)}</div>
        <div className="text-sm opacity-90 mt-1">Revenue • {data.bills} bills • {data.profit_margin}% margin</div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Profit" value={fmtINR(data.profit)} tone="green" />
        <Kpi label="Avg Bill" value={fmtINR(data.avg_bill)} />
        <Kpi label="Pending Udhaar" value={fmtINR(data.pending_udhaar)} tone="red" />
        <Kpi label="Profit Margin" value={`${data.profit_margin}%`} tone="green" />
      </div>

      {data.best_day.date && (
        <Card className="p-5 bg-white border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Best Day</div>
          <div className="font-display text-xl font-bold text-slate-900 mt-1">{data.best_day.date}</div>
          <div className="text-sm text-slate-600 mt-1 font-mono-num">{fmtINR(data.best_day.revenue)} • {data.best_day.bills} bills</div>
        </Card>
      )}

      <Card className="p-5 bg-white border-slate-200">
        <div className="font-display font-bold text-slate-900 mb-3">Top Products</div>
        <div className="space-y-2" data-testid="digest-top-products">
          {data.top_products.map((p, i) => (
            <div key={i} className="flex justify-between p-2 rounded bg-slate-50">
              <span className="text-sm font-semibold text-slate-900">{i + 1}. {p.name}</span>
              <span className="font-mono-num text-sm font-bold text-blue-700">{p.qty} units</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
