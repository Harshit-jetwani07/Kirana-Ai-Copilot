import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, ShoppingCart, Package, Wallet, Truck, Users, Sparkles, BarChart3, Settings as Cog, Store, Bell, Check, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/lib/api";

const nav = [
  { to: "/dashboard", label: "Dashboard", hindi: "Ghar", icon: Home, testid: "nav-dashboard" },
  { to: "/billing", label: "Billing", hindi: "Bill", icon: ShoppingCart, testid: "nav-billing" },
  { to: "/inventory", label: "Inventory", hindi: "Stock", icon: Package, testid: "nav-inventory" },
  { to: "/udhaar", label: "Udhaar", hindi: "Udhaar", icon: Wallet, testid: "nav-udhaar" },
  { to: "/suppliers", label: "Suppliers", hindi: "Supplier", icon: Truck, testid: "nav-suppliers" },
  { to: "/customers", label: "Customers", hindi: "Grahak", icon: Users, testid: "nav-customers" },
  { to: "/advisor", label: "AI Advisor", hindi: "AI", icon: Sparkles, testid: "nav-advisor" },
  { to: "/reports", label: "Reports", hindi: "Report", icon: BarChart3, testid: "nav-reports" },
  { to: "/settings", label: "Settings", hindi: "Setting", icon: Cog, testid: "nav-settings" },
];
const bottomNav = nav.slice(0, 5);

export default function Layout() {
  const loc = useLocation();
  const nav_ = useNavigate();
  const active = nav.find(n => loc.pathname.startsWith(n.to));

  const [settings, setSettings] = useState({ shop_name: "Sharma General Store", owner_name: "Ramesh Sharma" });
  const [notifs, setNotifs] = useState([]);
  const [saved, setSaved] = useState(true);
  const mode = typeof window !== "undefined" ? localStorage.getItem("dukaan_mode") || "demo" : "demo";
  const isDemo = mode === "demo";

  useEffect(() => {
    api.settings().then(setSettings).catch(() => {});
    const loadNotifs = () => api.dashboard().then(d => setNotifs(d.aaj_ka_kaam || [])).catch(() => {});
    loadNotifs();
    const t = setInterval(loadNotifs, 45000);
    return () => clearInterval(t);
  }, [loc.pathname]);

  // Saved indicator: briefly show 'Saving...' on route change, then 'Saved'
  useEffect(() => {
    setSaved(false);
    const t = setTimeout(() => setSaved(true), 500);
    return () => clearTimeout(t);
  }, [loc.pathname]);

  const initials = (settings.owner_name || "R S").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();

  const logout = () => {
    localStorage.removeItem("dukaan_onboarded");
    localStorage.removeItem("dukaan_mode");
    localStorage.removeItem("dukaan_shop_id");
    nav_("/");
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex-col z-40">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display font-extrabold text-base leading-tight text-slate-900">Dukaan AI</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Copilot</div>
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
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-semibold transition-colors ${
                    isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={18} />
                <span>{n.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-200">
          <button data-testid="logout-btn" onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900">
            <LogOut size={16} /> Switch Shop
          </button>
        </div>
      </aside>

      {/* Top header (both mobile + desktop) */}
      <header className="md:ml-64 sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-slate-200 h-14 md:h-16 flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="md:hidden w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="font-display font-extrabold text-sm md:text-base text-slate-900 truncate max-w-[160px] md:max-w-none" data-testid="header-shop-name">
                {settings.shop_name}
              </div>
              {isDemo ? (
                <Badge data-testid="demo-mode-badge" className="bg-amber-100 text-amber-700 hover:bg-amber-100 h-5 text-[10px] font-bold uppercase tracking-widest">Demo</Badge>
              ) : (
                <Badge data-testid="my-shop-badge" className="bg-green-100 text-green-700 hover:bg-green-100 h-5 text-[10px] font-bold uppercase tracking-widest">My Shop</Badge>
              )}
            </div>
            <div className="hidden md:block text-[11px] text-slate-500 truncate">
              {active?.label || "Dashboard"} • Powered by AI
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-3">
          {/* Saved indicator */}
          <div className="hidden md:flex items-center gap-1 text-xs text-slate-500" data-testid="sync-indicator">
            <div className={`w-1.5 h-1.5 rounded-full ${saved ? "bg-green-500" : "bg-amber-500"}`} />
            <span>{saved ? "Saved" : "Syncing…"}</span>
          </div>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <button data-testid="notifications-btn" className="relative w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                <Bell className="w-4 h-4 text-slate-700" />
                {notifs.length > 0 && (
                  <span data-testid="notif-count" className="absolute top-1 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {notifs.length > 9 ? "9+" : notifs.length}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0" data-testid="notifications-popover">
              <div className="p-3 border-b border-slate-100">
                <div className="font-display font-bold text-slate-900">Notifications</div>
                <div className="text-[11px] text-slate-500">Aapke shop ke urgent updates</div>
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {notifs.length === 0 && <div className="p-6 text-center text-sm text-slate-500">Sab clear hai!</div>}
                {notifs.map((n, i) => {
                  const map = {
                    low_stock: { color: "bg-red-100 text-red-700", label: "Low stock" },
                    udhaar: { color: "bg-amber-100 text-amber-700", label: "Udhaar" },
                    supplier: { color: "bg-blue-100 text-blue-700", label: "Supplier" },
                    expiry: { color: "bg-purple-100 text-purple-700", label: "Expiry" },
                  };
                  const cfg = map[n.type] || { color: "bg-slate-100 text-slate-700", label: n.type };
                  return (
                    <div key={i} className="p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50" data-testid={`notif-${i}`}>
                      <Badge className={`${cfg.color} hover:${cfg.color} text-[10px] mb-1`}>{cfg.label}</Badge>
                      <div className="text-sm text-slate-700">{n.text}</div>
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          {/* Avatar */}
          <Avatar className="w-9 h-9 ring-2 ring-slate-100" data-testid="user-avatar">
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xs font-bold">{initials}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="md:ml-64 pb-20 md:pb-8 min-h-[calc(100vh-3.5rem)]">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        data-testid="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex justify-around items-center z-40"
      >
        {bottomNav.map(n => {
          const Icon = n.icon;
          return (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={`bottom-${n.testid}`}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-w-[56px] ${isActive ? "text-blue-700" : "text-slate-500"}`
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
