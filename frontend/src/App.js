import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/Layout";
import Landing from "@/pages/Landing";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Billing from "@/pages/Billing";
import Inventory from "@/pages/Inventory";
import Udhaar from "@/pages/Udhaar";
import Suppliers from "@/pages/Suppliers";
import Customers from "@/pages/Customers";
import Advisor from "@/pages/Advisor";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import { getShopId } from "@/lib/api";

function RequireShop({ children }) {
  const sid = getShopId();
  if (!sid) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route element={<RequireShop><Layout /></RequireShop>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/udhaar" element={<Udhaar />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/advisor" element={<Advisor />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
