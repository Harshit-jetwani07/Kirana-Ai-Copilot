from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Dukaan AI Copilot")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ---------- Helpers ----------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return str(uuid.uuid4())


def days_ago(d: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(days=d)).isoformat()


# ---------- Models ----------
class Product(BaseModel):
    id: str = Field(default_factory=new_id)
    name: str
    category: str
    sku: str
    purchase_price: float
    selling_price: float
    stock: int
    min_stock: int = 5
    supplier_id: Optional[str] = None
    expiry_date: Optional[str] = None
    unit: str = "pcs"
    movement: str = "medium"  # fast / medium / slow / dead
    created_at: str = Field(default_factory=now_iso)


class ProductCreate(BaseModel):
    name: str
    category: str
    sku: str
    purchase_price: float
    selling_price: float
    stock: int
    min_stock: int = 5
    supplier_id: Optional[str] = None
    expiry_date: Optional[str] = None
    unit: str = "pcs"


class Customer(BaseModel):
    id: str = Field(default_factory=new_id)
    name: str
    phone: str
    address: Optional[str] = ""
    tag: str = "regular"  # regular, high-value, udhaar, inactive
    pending_amount: float = 0.0
    lifetime_value: float = 0.0
    last_payment_date: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


class CustomerCreate(BaseModel):
    name: str
    phone: str
    address: Optional[str] = ""
    tag: str = "regular"


class Supplier(BaseModel):
    id: str = Field(default_factory=new_id)
    name: str
    phone: str
    company: str
    categories: List[str] = []
    payment_due: float = 0.0
    last_order_date: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


class SupplierCreate(BaseModel):
    name: str
    phone: str
    company: str
    categories: List[str] = []


class BillItem(BaseModel):
    product_id: str
    name: str
    qty: int
    price: float
    purchase_price: float = 0.0


class SaleCreate(BaseModel):
    items: List[BillItem]
    discount: float = 0.0
    tax: float = 0.0
    payment_mode: Literal["cash", "upi", "card", "udhaar"]
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None


class Sale(BaseModel):
    id: str = Field(default_factory=new_id)
    items: List[BillItem]
    subtotal: float
    discount: float
    tax: float
    total: float
    profit: float
    payment_mode: str
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


class CreditPayment(BaseModel):
    customer_id: str
    amount: float
    note: Optional[str] = ""


class PurchaseOrderItem(BaseModel):
    product_id: str
    qty: int
    unit_cost: float


class PurchaseOrder(BaseModel):
    supplier_id: str
    items: List[PurchaseOrderItem]


class ShopSettings(BaseModel):
    shop_name: str = "Sharma General Store"
    owner_name: str = "Ramesh Sharma"
    phone: str = "+91 98765 43210"
    address: str = "Shop No. 12, Main Market, Delhi"
    gst_number: str = ""
    language: str = "hinglish"
    low_stock_threshold: int = 5
    currency: str = "INR"


class AIQuery(BaseModel):
    query: str


class ReminderRequest(BaseModel):
    customer_id: str
    tone: str = "polite"  # polite, firm, festival, short


# ---------- Seed Data ----------
async def seed_if_empty():
    if await db.products.count_documents({}) > 0:
        return
    logger.info("Seeding demo data...")

    # Settings
    await db.settings.replace_one(
        {"_id": "shop"}, {"_id": "shop", **ShopSettings().model_dump()}, upsert=True
    )

    # Suppliers
    suppliers_data = [
        {"name": "Rajesh Kumar", "phone": "+91 98111 22233", "company": "Amul Distributor", "categories": ["Dairy"], "payment_due": 4500.0, "last_order_date": days_ago(3)},
        {"name": "Suresh Gupta", "phone": "+91 98222 33344", "company": "FMCG Wholesaler", "categories": ["Grocery", "Snacks", "Personal Care"], "payment_due": 12800.0, "last_order_date": days_ago(2)},
        {"name": "Mohan Lal", "phone": "+91 98333 44455", "company": "Local Grain Mandi", "categories": ["Grains", "Pulses"], "payment_due": 0.0, "last_order_date": days_ago(6)},
        {"name": "Vikas Patel", "phone": "+91 98444 55566", "company": "Nestle Distributor", "categories": ["Snacks", "Beverages"], "payment_due": 3200.0, "last_order_date": days_ago(4)},
    ]
    suppliers = [Supplier(**s) for s in suppliers_data]
    await db.suppliers.insert_many([{**s.model_dump(), "_id": s.id} for s in suppliers])

    sup_map = {s.company: s.id for s in suppliers}

    # Products
    products_data = [
        {"name": "Amul Milk 1L", "category": "Dairy", "sku": "AML1L", "purchase_price": 62, "selling_price": 70, "stock": 12, "min_stock": 10, "supplier_id": sup_map["Amul Distributor"], "expiry_date": days_ago(-3), "movement": "fast"},
        {"name": "Amul Butter 100g", "category": "Dairy", "sku": "AMBTR", "purchase_price": 52, "selling_price": 62, "stock": 8, "min_stock": 6, "supplier_id": sup_map["Amul Distributor"], "expiry_date": days_ago(-30), "movement": "medium"},
        {"name": "Parle-G Biscuit", "category": "Snacks", "sku": "PARLG", "purchase_price": 8, "selling_price": 10, "stock": 145, "min_stock": 30, "supplier_id": sup_map["FMCG Wholesaler"], "movement": "fast"},
        {"name": "Maggi 2min Noodles", "category": "Snacks", "sku": "MAGGI", "purchase_price": 12, "selling_price": 14, "stock": 6, "min_stock": 15, "supplier_id": sup_map["Nestle Distributor"], "movement": "fast"},
        {"name": "Tata Salt 1kg", "category": "Grocery", "sku": "TATAS", "purchase_price": 24, "selling_price": 28, "stock": 42, "min_stock": 12, "supplier_id": sup_map["FMCG Wholesaler"], "movement": "medium"},
        {"name": "Surf Excel 1kg", "category": "Personal Care", "sku": "SURFE", "purchase_price": 220, "selling_price": 245, "stock": 4, "min_stock": 8, "supplier_id": sup_map["FMCG Wholesaler"], "movement": "medium"},
        {"name": "Aashirvaad Atta 5kg", "category": "Grains", "sku": "ASHRD", "purchase_price": 240, "selling_price": 275, "stock": 18, "min_stock": 6, "supplier_id": sup_map["Local Grain Mandi"], "movement": "fast"},
        {"name": "Fortune Oil 1L", "category": "Grocery", "sku": "FRTNE", "purchase_price": 145, "selling_price": 165, "stock": 22, "min_stock": 8, "supplier_id": sup_map["FMCG Wholesaler"], "movement": "medium"},
        {"name": "Good Day Biscuit", "category": "Snacks", "sku": "GDDAY", "purchase_price": 22, "selling_price": 25, "stock": 34, "min_stock": 10, "supplier_id": sup_map["FMCG Wholesaler"], "movement": "medium"},
        {"name": "Colgate Toothpaste", "category": "Personal Care", "sku": "COLGT", "purchase_price": 85, "selling_price": 95, "stock": 16, "min_stock": 6, "supplier_id": sup_map["FMCG Wholesaler"], "movement": "medium"},
        {"name": "Dettol Soap 75g", "category": "Personal Care", "sku": "DETTL", "purchase_price": 32, "selling_price": 38, "stock": 28, "min_stock": 10, "supplier_id": sup_map["FMCG Wholesaler"], "movement": "medium"},
        {"name": "Basmati Rice 5kg", "category": "Grains", "sku": "BSMTI", "purchase_price": 420, "selling_price": 485, "stock": 9, "min_stock": 5, "supplier_id": sup_map["Local Grain Mandi"], "movement": "medium"},
        {"name": "Sugar 1kg", "category": "Grocery", "sku": "SUGAR", "purchase_price": 42, "selling_price": 48, "stock": 55, "min_stock": 15, "supplier_id": sup_map["Local Grain Mandi"], "movement": "fast"},
        {"name": "Red Label Tea 500g", "category": "Beverages", "sku": "REDLB", "purchase_price": 210, "selling_price": 240, "stock": 14, "min_stock": 5, "supplier_id": sup_map["FMCG Wholesaler"], "movement": "medium"},
        {"name": "Clinic Plus Shampoo Sachet", "category": "Personal Care", "sku": "CLNIC", "purchase_price": 2, "selling_price": 3, "stock": 3, "min_stock": 50, "supplier_id": sup_map["FMCG Wholesaler"], "movement": "slow"},
        {"name": "Britannia Bread", "category": "Bakery", "sku": "BRITB", "purchase_price": 32, "selling_price": 40, "stock": 5, "min_stock": 8, "supplier_id": sup_map["FMCG Wholesaler"], "expiry_date": days_ago(-2), "movement": "fast"},
        {"name": "Haldiram Namkeen 200g", "category": "Snacks", "sku": "HLDRM", "purchase_price": 55, "selling_price": 65, "stock": 2, "min_stock": 8, "supplier_id": sup_map["FMCG Wholesaler"], "movement": "slow"},
    ]
    products = [Product(**p) for p in products_data]
    await db.products.insert_many([{**p.model_dump(), "_id": p.id} for p in products])
    prod_map = {p.name: p for p in products}

    # Customers
    customers_data = [
        {"name": "Suresh Verma", "phone": "919812345678", "address": "House 4, Gali No. 3", "tag": "high-value", "pending_amount": 1250.0, "lifetime_value": 18400.0, "last_payment_date": days_ago(8)},
        {"name": "Anita Devi", "phone": "919823456789", "address": "House 12, Sector 5", "tag": "udhaar", "pending_amount": 680.0, "lifetime_value": 5200.0, "last_payment_date": days_ago(15)},
        {"name": "Rakesh Yadav", "phone": "919834567890", "address": "Near Temple", "tag": "regular", "pending_amount": 0.0, "lifetime_value": 3400.0, "last_payment_date": days_ago(2)},
        {"name": "Meena Kumari", "phone": "919845678901", "address": "Behind Bank", "tag": "udhaar", "pending_amount": 2150.0, "lifetime_value": 9800.0, "last_payment_date": days_ago(22)},
        {"name": "Kishan Singh", "phone": "919856789012", "address": "Main Road", "tag": "high-value", "pending_amount": 0.0, "lifetime_value": 22600.0, "last_payment_date": days_ago(1)},
        {"name": "Ramesh Chandra", "phone": "919867890123", "address": "Old Colony", "tag": "regular", "pending_amount": 340.0, "lifetime_value": 2100.0, "last_payment_date": days_ago(6)},
        {"name": "Priya Sharma", "phone": "919878901234", "address": "New Market", "tag": "inactive", "pending_amount": 0.0, "lifetime_value": 1250.0, "last_payment_date": days_ago(45)},
    ]
    customers = [Customer(**c) for c in customers_data]
    await db.customers.insert_many([{**c.model_dump(), "_id": c.id} for c in customers])
    cust_map = {c.name: c for c in customers}

    # Sales over last 7 days
    sales_bundles = [
        (0, [("Amul Milk 1L", 2), ("Parle-G Biscuit", 5), ("Sugar 1kg", 1)], "cash", None),
        (0, [("Aashirvaad Atta 5kg", 1), ("Fortune Oil 1L", 1)], "upi", "Kishan Singh"),
        (0, [("Maggi 2min Noodles", 4), ("Good Day Biscuit", 2)], "upi", None),
        (0, [("Amul Milk 1L", 1), ("Britannia Bread", 1)], "cash", None),
        (0, [("Colgate Toothpaste", 1), ("Dettol Soap 75g", 2)], "udhaar", "Suresh Verma"),
        (1, [("Basmati Rice 5kg", 1), ("Tata Salt 1kg", 2)], "cash", None),
        (1, [("Amul Milk 1L", 3), ("Sugar 1kg", 2)], "upi", "Rakesh Yadav"),
        (1, [("Parle-G Biscuit", 8), ("Maggi 2min Noodles", 3)], "udhaar", "Anita Devi"),
        (2, [("Aashirvaad Atta 5kg", 2), ("Fortune Oil 1L", 1), ("Sugar 1kg", 3)], "upi", "Kishan Singh"),
        (2, [("Amul Butter 100g", 2), ("Red Label Tea 500g", 1)], "cash", None),
        (3, [("Amul Milk 1L", 2), ("Parle-G Biscuit", 4)], "cash", None),
        (3, [("Surf Excel 1kg", 1), ("Colgate Toothpaste", 1)], "udhaar", "Meena Kumari"),
        (4, [("Basmati Rice 5kg", 1)], "upi", None),
        (4, [("Maggi 2min Noodles", 5), ("Good Day Biscuit", 3)], "cash", None),
        (5, [("Amul Milk 1L", 2), ("Sugar 1kg", 1), ("Tata Salt 1kg", 1)], "cash", None),
        (5, [("Fortune Oil 1L", 2)], "upi", "Ramesh Chandra"),
        (6, [("Aashirvaad Atta 5kg", 1), ("Amul Milk 1L", 1)], "cash", None),
        (6, [("Parle-G Biscuit", 6), ("Good Day Biscuit", 2)], "upi", None),
    ]
    sales_docs = []
    for days_back, items, mode, cname in sales_bundles:
        bill_items = []
        subtotal = 0.0
        profit = 0.0
        for pname, qty in items:
            p = prod_map[pname]
            bill_items.append(BillItem(product_id=p.id, name=p.name, qty=qty, price=p.selling_price, purchase_price=p.purchase_price).model_dump())
            subtotal += p.selling_price * qty
            profit += (p.selling_price - p.purchase_price) * qty
        sale = {
            "_id": new_id(),
            "id": None,
            "items": bill_items,
            "subtotal": round(subtotal, 2),
            "discount": 0.0,
            "tax": 0.0,
            "total": round(subtotal, 2),
            "profit": round(profit, 2),
            "payment_mode": mode,
            "customer_id": cust_map[cname].id if cname else None,
            "customer_name": cname,
            "created_at": days_ago(days_back),
        }
        sale["id"] = sale["_id"]
        sales_docs.append(sale)
    if sales_docs:
        await db.sales.insert_many(sales_docs)

    logger.info("Seed complete.")


# ---------- Routes: Settings ----------
@api_router.get("/settings")
async def get_settings():
    s = await db.settings.find_one({"_id": "shop"})
    if not s:
        return ShopSettings().model_dump()
    s.pop("_id", None)
    return s


@api_router.put("/settings")
async def update_settings(settings: ShopSettings):
    doc = settings.model_dump()
    await db.settings.replace_one({"_id": "shop"}, {"_id": "shop", **doc}, upsert=True)
    return doc


# ---------- Routes: Products ----------
@api_router.get("/products")
async def list_products(q: Optional[str] = None, category: Optional[str] = None):
    query = {}
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"sku": {"$regex": q, "$options": "i"}},
            {"category": {"$regex": q, "$options": "i"}},
        ]
    if category:
        query["category"] = category
    items = await db.products.find(query, {"_id": 0}).to_list(500)
    return items


@api_router.post("/products")
async def create_product(p: ProductCreate):
    prod = Product(**p.model_dump())
    await db.products.insert_one({**prod.model_dump(), "_id": prod.id})
    return prod.model_dump()


@api_router.put("/products/{pid}")
async def update_product(pid: str, p: ProductCreate):
    await db.products.update_one({"_id": pid}, {"$set": p.model_dump()})
    updated = await db.products.find_one({"_id": pid}, {"_id": 0})
    if not updated:
        raise HTTPException(404, "Product not found")
    return updated


@api_router.delete("/products/{pid}")
async def delete_product(pid: str):
    await db.products.delete_one({"_id": pid})
    return {"ok": True}


@api_router.post("/products/{pid}/adjust-stock")
async def adjust_stock(pid: str, delta: int):
    await db.products.update_one({"_id": pid}, {"$inc": {"stock": delta}})
    return {"ok": True}


@api_router.post("/products/{pid}/writeoff")
async def writeoff_product(pid: str, reason: str = "dead_stock"):
    prod = await db.products.find_one({"_id": pid})
    if not prod:
        raise HTTPException(404, "Product not found")
    loss = prod.get("purchase_price", 0) * prod.get("stock", 0)
    await db.write_offs.insert_one({
        "_id": new_id(),
        "product_id": pid,
        "product_name": prod["name"],
        "qty": prod.get("stock", 0),
        "loss_value": loss,
        "reason": reason,
        "created_at": now_iso(),
    })
    await db.products.update_one({"_id": pid}, {"$set": {"stock": 0, "movement": "dead"}})
    return {"ok": True, "loss_value": loss}


@api_router.get("/writeoffs")
async def list_writeoffs():
    return await db.write_offs.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)


# ---------- Routes: Customers ----------
@api_router.get("/customers")
async def list_customers(q: Optional[str] = None, tag: Optional[str] = None):
    query = {}
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"phone": {"$regex": q, "$options": "i"}},
        ]
    if tag:
        query["tag"] = tag
    items = await db.customers.find(query, {"_id": 0}).to_list(500)
    return items


@api_router.post("/customers")
async def create_customer(c: CustomerCreate):
    cust = Customer(**c.model_dump())
    await db.customers.insert_one({**cust.model_dump(), "_id": cust.id})
    return cust.model_dump()


@api_router.put("/customers/{cid}")
async def update_customer(cid: str, c: CustomerCreate):
    await db.customers.update_one({"_id": cid}, {"$set": c.model_dump()})
    return await db.customers.find_one({"_id": cid}, {"_id": 0})


@api_router.delete("/customers/{cid}")
async def delete_customer(cid: str):
    await db.customers.delete_one({"_id": cid})
    return {"ok": True}


@api_router.get("/customers/{cid}/history")
async def customer_history(cid: str):
    sales = await db.sales.find({"customer_id": cid}, {"_id": 0}).sort("created_at", -1).to_list(200)
    payments = await db.credit_payments.find({"customer_id": cid}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return {"sales": sales, "payments": payments}


# ---------- Routes: Suppliers ----------
@api_router.get("/suppliers")
async def list_suppliers():
    return await db.suppliers.find({}, {"_id": 0}).to_list(500)


@api_router.post("/suppliers")
async def create_supplier(s: SupplierCreate):
    sup = Supplier(**s.model_dump())
    await db.suppliers.insert_one({**sup.model_dump(), "_id": sup.id})
    return sup.model_dump()


@api_router.put("/suppliers/{sid}")
async def update_supplier(sid: str, s: SupplierCreate):
    await db.suppliers.update_one({"_id": sid}, {"$set": s.model_dump()})
    return await db.suppliers.find_one({"_id": sid}, {"_id": 0})


@api_router.delete("/suppliers/{sid}")
async def delete_supplier(sid: str):
    await db.suppliers.delete_one({"_id": sid})
    return {"ok": True}


@api_router.post("/suppliers/{sid}/pay")
async def pay_supplier(sid: str, amount: float):
    await db.suppliers.update_one({"_id": sid}, {"$inc": {"payment_due": -amount}})
    await db.supplier_payments.insert_one({
        "_id": new_id(), "supplier_id": sid, "amount": amount, "created_at": now_iso()
    })
    return {"ok": True}


@api_router.post("/purchase-orders")
async def receive_purchase(po: PurchaseOrder):
    total_cost = 0.0
    for item in po.items:
        await db.products.update_one({"_id": item.product_id}, {"$inc": {"stock": item.qty}})
        total_cost += item.qty * item.unit_cost
    await db.suppliers.update_one(
        {"_id": po.supplier_id},
        {"$inc": {"payment_due": total_cost}, "$set": {"last_order_date": now_iso()}}
    )
    po_doc = {"_id": new_id(), "supplier_id": po.supplier_id, "items": [i.model_dump() for i in po.items], "total_cost": total_cost, "created_at": now_iso()}
    await db.purchase_orders.insert_one(po_doc)
    return {"ok": True, "total_cost": total_cost}


# ---------- Routes: Sales / Billing ----------
@api_router.post("/sales")
async def create_sale(s: SaleCreate):
    # Enrich purchase_price and compute totals
    items = []
    subtotal = 0.0
    profit = 0.0
    for it in s.items:
        prod = await db.products.find_one({"_id": it.product_id})
        if not prod:
            raise HTTPException(404, f"Product {it.product_id} not found")
        pp = prod.get("purchase_price", it.purchase_price)
        line = BillItem(product_id=it.product_id, name=prod["name"], qty=it.qty, price=it.price, purchase_price=pp)
        items.append(line.model_dump())
        subtotal += it.price * it.qty
        profit += (it.price - pp) * it.qty
        # Reduce stock
        await db.products.update_one({"_id": it.product_id}, {"$inc": {"stock": -it.qty}})

    total = subtotal - s.discount + s.tax
    sale = Sale(
        items=[BillItem(**i) for i in items],
        subtotal=round(subtotal, 2),
        discount=s.discount,
        tax=s.tax,
        total=round(total, 2),
        profit=round(profit, 2),
        payment_mode=s.payment_mode,
        customer_id=s.customer_id,
        customer_name=s.customer_name,
    )
    doc = sale.model_dump()
    doc["_id"] = sale.id
    await db.sales.insert_one(doc)

    # Handle udhaar
    if s.payment_mode == "udhaar" and s.customer_id:
        await db.customers.update_one(
            {"_id": s.customer_id},
            {"$inc": {"pending_amount": total, "lifetime_value": total}, "$set": {"tag": "udhaar"}}
        )
    elif s.customer_id:
        await db.customers.update_one(
            {"_id": s.customer_id},
            {"$inc": {"lifetime_value": total}, "$set": {"last_payment_date": now_iso()}}
        )

    return sale.model_dump()


@api_router.get("/sales")
async def list_sales(days: int = 30):
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    items = await db.sales.find({"created_at": {"$gte": since}}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return items


# ---------- Routes: Credit Ledger ----------
@api_router.post("/credit/payment")
async def record_credit_payment(p: CreditPayment):
    cust = await db.customers.find_one({"_id": p.customer_id})
    if not cust:
        raise HTTPException(404, "Customer not found")
    new_pending = max(0.0, cust.get("pending_amount", 0) - p.amount)
    update = {"pending_amount": new_pending, "last_payment_date": now_iso()}
    if new_pending == 0 and cust.get("tag") == "udhaar":
        update["tag"] = "regular"
    await db.customers.update_one({"_id": p.customer_id}, {"$set": update})
    await db.credit_payments.insert_one({
        "_id": new_id(),
        "customer_id": p.customer_id,
        "amount": p.amount,
        "note": p.note,
        "created_at": now_iso(),
    })
    return {"ok": True, "pending_amount": new_pending}


# ---------- Routes: Dashboard ----------
@api_router.get("/dashboard")
async def dashboard():
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()

    sales_today = await db.sales.find({"created_at": {"$gte": today_start}}, {"_id": 0}).to_list(500)
    today_revenue = sum(s["total"] for s in sales_today)
    today_profit = sum(s["profit"] for s in sales_today)
    cash_collected = sum(s["total"] for s in sales_today if s["payment_mode"] in ("cash", "upi", "card"))

    products = await db.products.find({}, {"_id": 0}).to_list(500)
    inventory_value = sum(p["purchase_price"] * p["stock"] for p in products)
    low_stock = [p for p in products if p["stock"] <= p["min_stock"]]

    # Expiry within 7 days
    expiring = []
    today = datetime.now(timezone.utc)
    for p in products:
        if p.get("expiry_date"):
            try:
                exp = datetime.fromisoformat(p["expiry_date"].replace("Z", "+00:00"))
                if (exp - today).days <= 7:
                    expiring.append(p)
            except Exception:
                pass

    customers = await db.customers.find({}, {"_id": 0}).to_list(500)
    pending_udhaar = sum(c["pending_amount"] for c in customers)
    udhaar_customers = [c for c in customers if c["pending_amount"] > 0]

    suppliers = await db.suppliers.find({}, {"_id": 0}).to_list(500)
    supplier_due = sum(s["payment_due"] for s in suppliers)

    # 7-day trend
    trend = []
    for i in range(6, -1, -1):
        day_start = (datetime.now(timezone.utc) - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        day_sales = await db.sales.find({
            "created_at": {"$gte": day_start.isoformat(), "$lt": day_end.isoformat()}
        }, {"_id": 0}).to_list(500)
        trend.append({
            "day": day_start.strftime("%a"),
            "date": day_start.strftime("%d %b"),
            "sales": round(sum(s["total"] for s in day_sales), 2),
            "profit": round(sum(s["profit"] for s in day_sales), 2),
        })

    # Top products (30 days)
    since_30 = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    all_sales_30 = await db.sales.find({"created_at": {"$gte": since_30}}, {"_id": 0}).to_list(2000)
    top = {}
    for s in all_sales_30:
        for it in s["items"]:
            top.setdefault(it["name"], {"name": it["name"], "qty": 0, "revenue": 0.0})
            top[it["name"]]["qty"] += it["qty"]
            top[it["name"]]["revenue"] += it["qty"] * it["price"]
    top_products = sorted(top.values(), key=lambda x: x["qty"], reverse=True)[:5]

    # Payment mode split (today)
    modes = {"cash": 0.0, "upi": 0.0, "card": 0.0, "udhaar": 0.0}
    for s in sales_today:
        modes[s["payment_mode"]] = modes.get(s["payment_mode"], 0) + s["total"]

    # Aaj ka kaam
    aaj_ka_kaam = []
    for p in low_stock[:5]:
        aaj_ka_kaam.append({"type": "low_stock", "text": f"{p['name']} sirf {p['stock']} {p['unit']} bacha hai — order karo", "id": p["id"]})
    for c in sorted(udhaar_customers, key=lambda x: x["pending_amount"], reverse=True)[:3]:
        aaj_ka_kaam.append({"type": "udhaar", "text": f"{c['name']} se ₹{int(c['pending_amount'])} udhaar collect karo", "id": c["id"]})
    for s in [x for x in suppliers if x["payment_due"] > 0][:2]:
        aaj_ka_kaam.append({"type": "supplier", "text": f"{s['company']} ko ₹{int(s['payment_due'])} pay karna hai", "id": s["id"]})
    for p in expiring[:2]:
        aaj_ka_kaam.append({"type": "expiry", "text": f"{p['name']} expiry paas hai — jaldi becho", "id": p["id"]})

    return {
        "today_revenue": round(today_revenue, 2),
        "today_profit": round(today_profit, 2),
        "cash_collected": round(cash_collected, 2),
        "inventory_value": round(inventory_value, 2),
        "low_stock_count": len(low_stock),
        "low_stock_items": low_stock[:10],
        "pending_udhaar": round(pending_udhaar, 2),
        "udhaar_customers_count": len(udhaar_customers),
        "supplier_due": round(supplier_due, 2),
        "expiring_count": len(expiring),
        "sales_trend": trend,
        "top_products": top_products,
        "payment_modes": modes,
        "aaj_ka_kaam": aaj_ka_kaam,
        "bills_today": len(sales_today),
    }


# ---------- Routes: AI Advisor ----------
async def build_business_context() -> str:
    products = await db.products.find({}, {"_id": 0}).to_list(500)
    customers = await db.customers.find({}, {"_id": 0}).to_list(500)
    suppliers = await db.suppliers.find({}, {"_id": 0}).to_list(500)
    since_7 = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    sales_7 = await db.sales.find({"created_at": {"$gte": since_7}}, {"_id": 0}).to_list(2000)

    low_stock = [f"{p['name']} (stock: {p['stock']}, min: {p['min_stock']})" for p in products if p["stock"] <= p["min_stock"]]
    udhaar = [f"{c['name']} - ₹{int(c['pending_amount'])}" for c in customers if c["pending_amount"] > 0]
    sup_due = [f"{s['company']} - ₹{int(s['payment_due'])}" for s in suppliers if s["payment_due"] > 0]

    # Top selling from 7 days
    counter = {}
    for s in sales_7:
        for it in s["items"]:
            counter[it["name"]] = counter.get(it["name"], 0) + it["qty"]
    top = sorted(counter.items(), key=lambda x: x[1], reverse=True)[:5]

    revenue_7 = sum(s["total"] for s in sales_7)
    profit_7 = sum(s["profit"] for s in sales_7)

    ctx = f"""Shop Business Data (last 7 days):
- Revenue: ₹{int(revenue_7)}, Profit: ₹{int(profit_7)}, Total bills: {len(sales_7)}
- Top selling products: {', '.join(f'{n} ({q} units)' for n, q in top)}
- Low stock items: {'; '.join(low_stock) if low_stock else 'none'}
- Customers with udhaar pending: {'; '.join(udhaar) if udhaar else 'none'}
- Supplier payments due: {'; '.join(sup_due) if sup_due else 'none'}
"""
    return ctx


@api_router.get("/ai/summary")
async def ai_summary():
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        ctx = await build_business_context()
        chat = LlmChat(
            api_key=os.environ["EMERGENT_LLM_KEY"],
            session_id=f"dukaan-summary-{datetime.now().strftime('%Y%m%d')}",
            system_message=(
                "Tum ek Indian kirana shop ka business advisor ho. "
                "Hamesha Hinglish (Hindi + English mix, English letters mein) mein reply karo. "
                "Short, direct, actionable insights do. Emoji use MAT karo. "
                "Numbers rupee (₹) mein do."
            ),
        ).with_model("gemini", "gemini-3-flash-preview")

        prompt = f"{ctx}\n\nAaj ka business summary do — 3-4 crisp bullet points mein. Har point mein ek specific action ya insight ho. Format: '- point'."
        resp = await chat.send_message(UserMessage(text=prompt))
        return {"summary": str(resp).strip()}
    except Exception as e:
        logger.error(f"AI summary error: {e}")
        # Fallback rule-based summary
        products = await db.products.find({}, {"_id": 0}).to_list(500)
        low = [p for p in products if p["stock"] <= p["min_stock"]]
        customers = await db.customers.find({}, {"_id": 0}).to_list(500)
        pending = sum(c["pending_amount"] for c in customers)
        parts = []
        if low:
            parts.append(f"- {low[0]['name']} sirf {low[0]['stock']} bacha hai, aaj hi order karo")
        if pending > 0:
            parts.append(f"- Kul ₹{int(pending)} udhaar pending hai, top customers ko reminder bhejo")
        parts.append("- Parle-G aur Amul Milk fast-moving hai — stock full rakho")
        return {"summary": "\n".join(parts)}


@api_router.post("/ai/ask")
async def ai_ask(q: AIQuery):
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        ctx = await build_business_context()
        chat = LlmChat(
            api_key=os.environ["EMERGENT_LLM_KEY"],
            session_id=f"dukaan-ask-{new_id()}",
            system_message=(
                "Tum ek Indian kirana shop ka expert business advisor ho. "
                "Hinglish (Hindi + English mix, English letters mein) mein reply karo. "
                "Specific, actionable advice do based on data. Emoji use MAT karo. Short paragraphs."
            ),
        ).with_model("gemini", "gemini-3-flash-preview")
        prompt = f"{ctx}\n\nShopkeeper ka sawaal: {q.query}\n\nJavab do."
        resp = await chat.send_message(UserMessage(text=prompt))
        return {"answer": str(resp).strip()}
    except Exception as e:
        logger.error(f"AI ask error: {e}")
        return {"answer": "AI abhi busy hai. Thodi der baad try karo."}


@api_router.get("/ai/reorder-suggestions")
async def ai_reorder():
    products = await db.products.find({}, {"_id": 0}).to_list(500)
    since_7 = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    sales_7 = await db.sales.find({"created_at": {"$gte": since_7}}, {"_id": 0}).to_list(2000)

    daily_sold = {}
    for s in sales_7:
        for it in s["items"]:
            daily_sold[it["product_id"]] = daily_sold.get(it["product_id"], 0) + it["qty"]

    suggestions = []
    for p in products:
        avg_daily = daily_sold.get(p["id"], 0) / 7.0
        if p["stock"] <= p["min_stock"] or (avg_daily > 0 and p["stock"] < avg_daily * 3):
            recommended = max(p["min_stock"] * 3, int(avg_daily * 14))
            suggestions.append({
                "product_id": p["id"],
                "name": p["name"],
                "current_stock": p["stock"],
                "avg_daily_sale": round(avg_daily, 1),
                "recommended_order": recommended,
                "reason": f"Avg daily sale {round(avg_daily,1)} units, current stock sirf {p['stock']} bacha hai" if avg_daily > 0 else f"Stock {p['stock']} minimum {p['min_stock']} se kam hai",
            })
    return {"suggestions": suggestions}


@api_router.post("/ai/reminder")
async def ai_reminder(r: ReminderRequest):
    cust = await db.customers.find_one({"_id": r.customer_id}, {"_id": 0})
    if not cust:
        raise HTTPException(404, "Customer not found")

    templates = {
        "polite": f"Namaste {cust['name']} ji, umeed hai aap theek honge. Aapke Sharma General Store par ₹{int(cust['pending_amount'])} ka payment pending hai. Jab time mile, please clear kar dijiye. Dhanyawad!",
        "firm": f"{cust['name']} ji, aapka ₹{int(cust['pending_amount'])} ka payment kaafi din se pending hai. Kripya jald se jald settle kar dein. — Sharma General Store",
        "festival": f"Namaste {cust['name']} ji! Tyohaar ki shubhkaamnayein. Aapka ₹{int(cust['pending_amount'])} ka udhaar pending hai — tyohaar se pehle clear kar denge to accha rahega. Sharma General Store.",
        "short": f"Hi {cust['name']} ji, ₹{int(cust['pending_amount'])} udhaar pending hai. Please clear kariye. — Sharma Store",
    }
    return {"message": templates.get(r.tone, templates["polite"]), "phone": cust["phone"]}


@api_router.get("/ai/supplier-message/{sid}")
async def ai_supplier_message(sid: str):
    sup = await db.suppliers.find_one({"_id": sid}, {"_id": 0})
    if not sup:
        raise HTTPException(404, "Supplier not found")
    # Find low-stock products from this supplier
    low = await db.products.find({"supplier_id": sid, "$expr": {"$lte": ["$stock", "$min_stock"]}}, {"_id": 0}).to_list(50)
    if not low:
        return {"message": f"Namaste {sup['name']} ji, bas order confirmation ke liye contact kiya. Baat karte hain.", "phone": sup["phone"]}
    lines = [f"{p['min_stock']*3} {p['unit']} {p['name']}" for p in low]
    msg = f"Namaste {sup['name']} ji, ye items bhej dena:\n" + "\n".join(f"- {l}" for l in lines) + f"\n\nJaldi delivery kar dena. Dhanyawad!\n— Sharma General Store"
    return {"message": msg, "phone": sup["phone"]}


# ---------- Reports ----------
@api_router.get("/reports/summary")
async def reports_summary(days: int = 7):
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    sales = await db.sales.find({"created_at": {"$gte": since}}, {"_id": 0}).to_list(2000)
    revenue = sum(s["total"] for s in sales)
    profit = sum(s["profit"] for s in sales)
    modes = {"cash": 0.0, "upi": 0.0, "card": 0.0, "udhaar": 0.0}
    for s in sales:
        modes[s["payment_mode"]] = modes.get(s["payment_mode"], 0) + s["total"]

    # Product performance
    prod_perf = {}
    for s in sales:
        for it in s["items"]:
            key = it["name"]
            prod_perf.setdefault(key, {"name": key, "qty": 0, "revenue": 0.0, "profit": 0.0})
            prod_perf[key]["qty"] += it["qty"]
            prod_perf[key]["revenue"] += it["qty"] * it["price"]
            prod_perf[key]["profit"] += it["qty"] * (it["price"] - it.get("purchase_price", 0))
    perf_list = list(prod_perf.values())
    top_selling = sorted(perf_list, key=lambda x: x["qty"], reverse=True)[:10]
    low_margin = sorted([p for p in perf_list if p["revenue"] > 0], key=lambda x: x["profit"] / max(x["revenue"], 1))[:10]

    products = await db.products.find({}, {"_id": 0}).to_list(500)
    sold_products = set(prod_perf.keys())
    slow_moving = [p for p in products if p["name"] not in sold_products or prod_perf.get(p["name"], {}).get("qty", 0) < 3][:10]

    return {
        "revenue": round(revenue, 2),
        "profit": round(profit, 2),
        "bills": len(sales),
        "avg_bill": round(revenue / max(len(sales), 1), 2),
        "payment_modes": modes,
        "top_selling": top_selling,
        "low_margin": low_margin,
        "slow_moving": [{"name": p["name"], "stock": p["stock"], "category": p["category"]} for p in slow_moving],
    }


@api_router.get("/reports/gst")
async def reports_gst(days: int = 30, rate: float = 5.0):
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    sales = await db.sales.find({"created_at": {"$gte": since}}, {"_id": 0}).to_list(2000)
    total_sales = sum(s["total"] for s in sales)
    # Split by category-inferred taxable/non-taxable — assume all taxable for demo
    taxable_sales = total_sales
    # If rate is applied on top: GST = taxable * rate/(100+rate). If inclusive.
    gst_collected = round(taxable_sales * rate / (100 + rate), 2)
    net_sales = round(taxable_sales - gst_collected, 2)

    # Purchase GST estimate (from purchase_orders)
    pos = await db.purchase_orders.find({"created_at": {"$gte": since}}, {"_id": 0}).to_list(500)
    purchase_total = sum(po.get("total_cost", 0) for po in pos)
    purchase_gst = round(purchase_total * rate / (100 + rate), 2)

    net_gst_liability = round(gst_collected - purchase_gst, 2)

    # Per-mode breakdown
    modes = {"cash": 0.0, "upi": 0.0, "card": 0.0, "udhaar": 0.0}
    for s in sales:
        modes[s["payment_mode"]] = modes.get(s["payment_mode"], 0) + s["total"]

    return {
        "period_days": days,
        "rate": rate,
        "total_sales": round(total_sales, 2),
        "taxable_sales": round(taxable_sales, 2),
        "net_sales": net_sales,
        "gst_collected": gst_collected,
        "purchase_total": round(purchase_total, 2),
        "purchase_gst": purchase_gst,
        "net_gst_liability": net_gst_liability,
        "bills_count": len(sales),
        "payment_modes": modes,
        "note": "Estimated GST calculation. For actual filing consult your CA.",
    }


@api_router.get("/reports/digest")
async def reports_digest(period: str = "week"):
    days = 7 if period == "week" else 30
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    sales = await db.sales.find({"created_at": {"$gte": since}}, {"_id": 0}).to_list(2000)
    revenue = sum(s["total"] for s in sales)
    profit = sum(s["profit"] for s in sales)

    # Best day
    per_day = {}
    for s in sales:
        d = s["created_at"][:10]
        per_day.setdefault(d, {"revenue": 0.0, "bills": 0})
        per_day[d]["revenue"] += s["total"]
        per_day[d]["bills"] += 1
    best_day = max(per_day.items(), key=lambda x: x[1]["revenue"]) if per_day else (None, {"revenue": 0, "bills": 0})

    # Top product
    counter = {}
    for s in sales:
        for it in s["items"]:
            counter[it["name"]] = counter.get(it["name"], 0) + it["qty"]
    top = sorted(counter.items(), key=lambda x: x[1], reverse=True)[:3]

    customers = await db.customers.find({}, {"_id": 0}).to_list(500)
    new_udhaar = sum(c["pending_amount"] for c in customers)

    return {
        "period": period,
        "days": days,
        "revenue": round(revenue, 2),
        "profit": round(profit, 2),
        "bills": len(sales),
        "avg_bill": round(revenue / max(len(sales), 1), 2),
        "profit_margin": round(profit / max(revenue, 1) * 100, 1),
        "best_day": {"date": best_day[0], "revenue": round(best_day[1]["revenue"], 2), "bills": best_day[1]["bills"]},
        "top_products": [{"name": n, "qty": q} for n, q in top],
        "pending_udhaar": round(new_udhaar, 2),
    }


# ---------- Startup ----------
@app.on_event("startup")
async def on_startup():
    await seed_if_empty()


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


@api_router.get("/")
async def root():
    return {"app": "Dukaan AI Copilot", "status": "ok"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
