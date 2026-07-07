import { useEffect, useState, createContext, useContext } from "react";
import { api, getMode } from "@/lib/api";

const DICT = {
  hinglish: {
    namaste: "Namaste",
    ji: "ji",
    dashboard: "Dashboard",
    todays_business: "Aaj ka business ek nazar mein",
    new_bill: "Naya Bill",
    todays_sales: "Aaj ki bikri",
    todays_profit: "Aaj ka munafa",
    inventory_value: "Stock keemat",
    pending_udhaar: "Baaki udhaar",
    cash_collected: "Aaj cash",
    supplier_due: "Supplier ko dena",
    low_stock: "Khatam hone wala",
    expiring: "Expiry paas",
    aaj_ka_kaam: "Aaj ka kaam",
    todays_workflow: "Aaj ka Workflow",
    workflow_sub: "Ek-ek karke complete karo",
    billing: "Billing",
    inventory: "Inventory Update",
    udhaar: "Udhaar Reminder",
    supplier: "Supplier Reorder",
    stock_check: "Stock check karo",
    whatsapp_bhejo: "WhatsApp bhejo",
    order_place: "Order place karo",
    new_bills: "Naye bills banao",
    all_stocked: "All stocked",
    no_pending: "No pending",
    all_paid: "All paid",
    ai_summary: "AI Business Summary",
    ai_powered: "Powered by Gemini • Hinglish",
    thinking: "Soch raha hoon...",
    full_advisor: "Full advisor kholo",
    payment_modes: "Aaj ke payment modes",
    sales_trend: "7-Din Sales Trend",
    top_products: "Top 5 Products (30 din)",
    all_clear: "Sab kaam ho gaya!",
    saved: "Saved",
    syncing: "Syncing…",
    notifications: "Notifications",
    urgent_updates: "Aapke shop ke urgent updates",
    all_good: "Sab clear hai!",
    switch_shop: "Switch Shop",
    my_shop: "My Shop",
    demo: "Demo",
  },
  hindi: {
    namaste: "नमस्ते",
    ji: "जी",
    dashboard: "डैशबोर्ड",
    todays_business: "आज का व्यापार एक नज़र में",
    new_bill: "नया बिल",
    todays_sales: "आज की बिक्री",
    todays_profit: "आज का मुनाफ़ा",
    inventory_value: "स्टॉक कीमत",
    pending_udhaar: "बाकी उधार",
    cash_collected: "आज कैश",
    supplier_due: "सप्लायर को देना",
    low_stock: "ख़त्म होने वाला",
    expiring: "एक्सपायरी पास",
    aaj_ka_kaam: "आज का काम",
    todays_workflow: "आज का वर्कफ़्लो",
    workflow_sub: "एक-एक करके पूरा करो",
    billing: "बिलिंग",
    inventory: "इन्वेंटरी अपडेट",
    udhaar: "उधार रिमाइंडर",
    supplier: "सप्लायर रीऑर्डर",
    stock_check: "स्टॉक चेक करो",
    whatsapp_bhejo: "व्हाट्सएप भेजो",
    order_place: "ऑर्डर प्लेस करो",
    new_bills: "नए बिल बनाओ",
    all_stocked: "सब स्टॉक में",
    no_pending: "कोई बाकी नहीं",
    all_paid: "सब चुकता",
    ai_summary: "AI बिज़नेस सारांश",
    ai_powered: "जेमिनी द्वारा • हिंदी",
    thinking: "सोच रहा हूँ...",
    full_advisor: "पूरा एडवाइज़र खोलो",
    payment_modes: "आज के पेमेंट मोड",
    sales_trend: "7-दिन बिक्री ट्रेंड",
    top_products: "टॉप 5 प्रोडक्ट्स (30 दिन)",
    all_clear: "सब काम हो गया!",
    saved: "सुरक्षित",
    syncing: "सिंक हो रहा है…",
    notifications: "सूचनाएं",
    urgent_updates: "आपकी दुकान के ज़रूरी अपडेट",
    all_good: "सब क्लियर है!",
    switch_shop: "दुकान बदलें",
    my_shop: "मेरी दुकान",
    demo: "डेमो",
  },
  english: {
    namaste: "Hello",
    ji: "",
    dashboard: "Dashboard",
    todays_business: "Today's business at a glance",
    new_bill: "New Bill",
    todays_sales: "Today's Sales",
    todays_profit: "Today's Profit",
    inventory_value: "Inventory Value",
    pending_udhaar: "Pending Credit",
    cash_collected: "Cash Collected",
    supplier_due: "Supplier Due",
    low_stock: "Low Stock",
    expiring: "Expiring Soon",
    aaj_ka_kaam: "Today's Tasks",
    todays_workflow: "Today's Workflow",
    workflow_sub: "Complete one by one",
    billing: "Billing",
    inventory: "Inventory",
    udhaar: "Credit Reminder",
    supplier: "Supplier Reorder",
    stock_check: "Check stock",
    whatsapp_bhejo: "Send WhatsApp",
    order_place: "Place order",
    new_bills: "Create new bills",
    all_stocked: "All stocked",
    no_pending: "No pending",
    all_paid: "All paid",
    ai_summary: "AI Business Summary",
    ai_powered: "Powered by Gemini",
    thinking: "Thinking...",
    full_advisor: "Open full advisor",
    payment_modes: "Payment modes today",
    sales_trend: "7-Day Sales Trend",
    top_products: "Top 5 Products (30d)",
    all_clear: "All done!",
    saved: "Saved",
    syncing: "Syncing…",
    notifications: "Notifications",
    urgent_updates: "Urgent updates for your shop",
    all_good: "All clear!",
    switch_shop: "Switch Shop",
    my_shop: "My Shop",
    demo: "Demo",
  },
};

const LangContext = createContext({ lang: "hinglish", t: (k) => k, refresh: () => {} });

export function LangProvider({ children }) {
  const [lang, setLang] = useState("hinglish");

  const refresh = async () => {
    try {
      const s = await api.settings();
      if (s?.language && DICT[s.language]) setLang(s.language);
    } catch {}
  };

  useEffect(() => {
    if (getMode()) refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    window.addEventListener("dukaan-lang-changed", refresh);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("dukaan-lang-changed", refresh);
    };
  }, []);

  const t = (key) => (DICT[lang] && DICT[lang][key]) || DICT.hinglish[key] || key;
  return <LangContext.Provider value={{ lang, t, refresh, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() { return useContext(LangContext); }

export const emitLangChange = () => window.dispatchEvent(new Event("dukaan-lang-changed"));
