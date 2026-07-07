import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Home, ShoppingCart, Package, Wallet, Truck, Users, Sparkles, BarChart3, Settings as Cog, Store } from "lucide-react";

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
  const active = nav.find(n => loc.pathname.startsWith(n.to));

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex-col z-40">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display font-extrabold text-lg leading-tight text-slate-900">Dukaan AI</div>
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
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon className="w-4.5 h-4.5" size={18} />
                <span>{n.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            <div className="font-semibold text-slate-700">Sharma General Store</div>
            <div>Ramesh Sharma</div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div className="font-display font-extrabold text-base text-slate-900">
            {active?.label || "Dukaan AI"}
          </div>
        </div>
        <div className="text-xs font-semibold text-slate-500">Sharma Store</div>
      </header>

      {/* Main content */}
      <main className="md:ml-64 pb-20 md:pb-8 min-h-screen">
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
                `flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-w-[56px] ${
                  isActive ? "text-blue-700" : "text-slate-500"
                }`
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
