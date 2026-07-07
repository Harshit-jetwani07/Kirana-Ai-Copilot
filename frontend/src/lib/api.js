import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({ baseURL: API });

export const api = {
  dashboard: () => client.get("/dashboard").then(r => r.data),
  products: (params) => client.get("/products", { params }).then(r => r.data),
  createProduct: (p) => client.post("/products", p).then(r => r.data),
  updateProduct: (id, p) => client.put(`/products/${id}`, p).then(r => r.data),
  deleteProduct: (id) => client.delete(`/products/${id}`).then(r => r.data),
  customers: (params) => client.get("/customers", { params }).then(r => r.data),
  createCustomer: (c) => client.post("/customers", c).then(r => r.data),
  customerHistory: (id) => client.get(`/customers/${id}/history`).then(r => r.data),
  suppliers: () => client.get("/suppliers").then(r => r.data),
  createSupplier: (s) => client.post("/suppliers", s).then(r => r.data),
  paySupplier: (id, amount) => client.post(`/suppliers/${id}/pay`, null, { params: { amount } }).then(r => r.data),
  receivePurchase: (po) => client.post("/purchase-orders", po).then(r => r.data),
  createSale: (s) => client.post("/sales", s).then(r => r.data),
  sales: (days = 30) => client.get("/sales", { params: { days } }).then(r => r.data),
  recordCreditPayment: (p) => client.post("/credit/payment", p).then(r => r.data),
  aiSummary: () => client.get("/ai/summary").then(r => r.data),
  aiAsk: (query) => client.post("/ai/ask", { query }).then(r => r.data),
  aiReorder: () => client.get("/ai/reorder-suggestions").then(r => r.data),
  aiReminder: (customer_id, tone) => client.post("/ai/reminder", { customer_id, tone }).then(r => r.data),
  aiSupplierMessage: (sid) => client.get(`/ai/supplier-message/${sid}`).then(r => r.data),
  reports: (days = 7) => client.get("/reports/summary", { params: { days } }).then(r => r.data),
  gstReport: (days = 30, rate = 5) => client.get("/reports/gst", { params: { days, rate } }).then(r => r.data),
  digest: (period = "week") => client.get("/reports/digest", { params: { period } }).then(r => r.data),
  writeoff: (pid, reason = "dead_stock") => client.post(`/products/${pid}/writeoff`, null, { params: { reason } }).then(r => r.data),
  writeoffs: () => client.get("/writeoffs").then(r => r.data),
  settings: () => client.get("/settings").then(r => r.data),
  updateSettings: (s) => client.put("/settings", s).then(r => r.data),
};

export const fmtINR = (n) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
export const fmtINRD = (n) => "₹" + (Number(n) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const whatsappLink = (phone, msg) => {
  const clean = String(phone).replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
};
