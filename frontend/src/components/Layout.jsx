import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, ShoppingCart, Package, Wallet, Truck, Users, Sparkles, BarChart3, Settings as Cog, Store, Bell, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api, getMode, clearShop } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import DemoBanner from "@/components/DemoBanner";

export default function Layout() {
  const loc = useLocation();
  const nav_ = useNavigate();
  const { t, refresh } = useLang();

  const nav = [
    { to: "/dashboard", label: t("dashboard"), hindi: "Ghar", icon: Home, testid: "nav-dashboard" },
    { to: "/billing", label: t("billing"), hindi: "Bill", icon: ShoppingCart, testid: "nav-billing" },
    { to: "/inventory", label: "Inventory", hindi: "Stock", icon: Package, testid: "nav-inventory" },
    { to: "/udhaar", label: "Udhaar", hindi: "Udhaar", icon: Wallet, testid: "nav-udhaar" },
    { to: "/suppliers", label: "Suppliers", hindi: "Supplier", icon: Truck, testid: "nav-suppliers" },
    { to: "/customers", label: "Customers", hindi: "Grahak", icon: Users, testid: "nav-customers" },
    { to: "/advisor", label: "AI Advisor", hindi: "AI", icon: Sparkles, testid: "nav-advisor" },
    { to: "/reports", label: "Reports", hindi: "Report", icon: BarChart3, testid: "nav-reports" },
    { to: "/settings", label: "Settings", hindi: "Setting", icon: Cog, testid: "nav-settings" },
  ];
  const bottomNav = nav.slice(0, 5);
  const active = nav.find(n => loc.pathname.startsWith(n.to));

  const [settings, setSettings] = useState({ shop_name: "Sharma General Store", owner_name: "Ramesh Sharma" });
  const [notifs, setNotifs] = useState([]);
  const [saved, setSaved] = useState(true);
  const mode = getMode() || "demo";
  const isDemo = mode === "demo";

  useEffect(() => {
    api.settings().then(setSettings).catch(() => {});
    refresh();
    const loadNotifs = () => api.dashboard().then(d => setNotifs(d.aaj_ka_kaam || [])).catch(() => {});
    loadNotifs();
    const timer = setInterval(loadNotifs, 45000);
    return () => clearInterval(timer);
  }, [loc.pathname]);

  useEffect(() => {
    setSaved(false);
    const timer = setTimeout(() => setSaved(true), 500);
    return () => clearTimeout(timer);
  }, [loc.pathname]);

  const initials = (settings.owner_name || "R S").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();

  const logout = () => { clearShop(); nav_("/"); };

  return (
    <div className="min-h-screen bg-[#FBF7F0]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-[#EFE6D3] flex-col z-40">
        <div className="p-5 border-b border-[#EFE6D3]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#312E81] to-[#1E1B4B] flex items-center justify-center shadow-sm">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display font-black text-lg leading-none text-[#0B0B12]">Dukaan AI</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#EA580C] mt-0.5">Copilot</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 overflow-y-auto">
          {nav.map(n => {
            const Icon = n.icon;
            return (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={n.testid}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-semibold transition-all ${
                    isActive ? "bg-[#F3EDDF] text-[#312E81]" : "text-slate-600 hover:bg-[#F8F3E7] hover:text-slate-900"
                  }`
                }
              >
                <Icon size={18} />
                <span>{n.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="p-3 border-t border-[#EFE6D3]">
          <button data-testid="logout-btn" onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-[#F8F3E7] hover:text-slate-900">
            <LogOut size={16} /> {t("switch_shop")}
          </button>
        </div>
      </aside>

      {/* Top header */}
      <header className="md:ml-64 sticky top-0 z-30 bg-[#FBF7F0]/85 backdrop-blur-xl border-b border-[#EFE6D3] h-14 md:h-16 flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="md:hidden w-9 h-9 rounded-xl bg-gradient-to-br from-[#312E81] to-[#1E1B4B] flex items-center justify-center flex-shrink-0">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="font-display font-black text-sm md:text-base text-[#0B0B12] truncate max-w-[160px] md:max-w-none" data-testid="header-shop-name">
                {settings.shop_name}
              </div>
              {isDemo ? (
                <Badge data-testid="demo-mode-badge" className="bg-amber-100 text-amber-700 hover:bg-amber-100 h-5 text-[10px] font-bold uppercase tracking-widest border-0">Demo</Badge>
              ) : (
                <Badge data-testid="my-shop-badge" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 h-5 text-[10px] font-bold uppercase tracking-widest border-0">{t("my_shop")}</Badge>
              )}
            </div>
            <div className="hidden md:block text-[11px] text-slate-500 truncate">
              {active?.label || t("dashboard")} · {settings.owner_name}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500" data-testid="sync-indicator">
            <div className={`w-1.5 h-1.5 rounded-full ${saved ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
            <span>{saved ? t("saved") : t("syncing")}</span>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <button data-testid="notifications-btn" className="relative w-9 h-9 rounded-lg hover:bg-[#F3EDDF] flex items-center justify-center transition-colors">
                <Bell className="w-4 h-4 text-slate-700" />
                {notifs.length > 0 && (
                  <span data-testid="notif-count" className="absolute top-1 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#EA580C] text-white text-[9px] font-bold flex items-center justify-center">
                    {notifs.length > 9 ? "9+" : notifs.length}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0" data-testid="notifications-popover">
              <div className="p-3 border-b border-slate-100">
                <div className="font-display font-bold text-slate-900">{t("notifications")}</div>
                <div className="text-[11px] text-slate-500">{t("urgent_updates")}</div>
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {notifs.length === 0 && <div className="p-6 text-center text-sm text-slate-500">{t("all_good")}</div>}
                {notifs.map((n, i) => {
                  const map = {
                    low_stock: { color: "bg-red-100 text-red-700", label: "Low stock" },
                    udhaar: { color: "bg-amber-100 text-amber-700", label: "Udhaar" },
                    supplier: { color: "bg-indigo-100 text-indigo-700", label: "Supplier" },
                    expiry: { color: "bg-purple-100 text-purple-700", label: "Expiry" },
                  };
                  const cfg = map[n.type] || { color: "bg-slate-100 text-slate-700", label: n.type };
                  return (
                    <div key={i} className="p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50" data-testid={`notif-${i}`}>
                      <Badge className={`${cfg.color} hover:${cfg.color} text-[10px] mb-1 border-0`}>{cfg.label}</Badge>
                      <div className="text-sm text-slate-700">{n.text}</div>
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          <Avatar className="w-9 h-9 ring-2 ring-[#F3EDDF]" data-testid="user-avatar">
            <AvatarFallback className="bg-gradient-to-br from-[#312E81] to-[#1E1B4B] text-white text-xs font-bold">{initials}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {isDemo && <DemoBanner />}

      <main className="md:ml-64 pb-20 md:pb-8 min-h-[calc(100vh-3.5rem)]">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        data-testid="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#EFE6D3] flex justify-around items-center z-40"
      >
        {bottomNav.map(n => {
          const Icon = n.icon;
          return (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={`bottom-${n.testid}`}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-w-[56px] ${isActive ? "text-[#312E81]" : "text-slate-500"}`
              }
            >
              <Icon size={20} />
              <span className="text-[10px] font-bold">{n.hindi}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
