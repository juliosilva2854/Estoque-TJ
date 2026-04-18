from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime
import uuid

class UserBase(BaseModel):
    email: str
    name: str
    role: Literal["dev", "master", "usuario"]
    active: bool = True

class UserCreate(UserBase):
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class WarehouseBase(BaseModel):
    name: str
    location: str
    description: Optional[str] = None
    sectors: List[str] = []
    active: bool = True

class WarehouseCreate(WarehouseBase):
    pass

class Warehouse(WarehouseBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime
    created_by: str

class SupplierBase(BaseModel):
    name: str
    cnpj: str
    contact: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    active: bool = True

class SupplierCreate(SupplierBase):
    pass

class Supplier(SupplierBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime
    created_by: str

class ProductBase(BaseModel):
    name: str
    sku: str
    description: Optional[str] = None
    category: Optional[str] = None
    unit: str = "UN"
    min_stock: float = 0
    cost_price: float = 0
    sale_price: float = 0
    available_qty: float = 0
    active: bool = True

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime
    created_by: str

class InventoryItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    warehouse_id: str
    quantity: float
    updated_at: datetime

class InvoiceItemBase(BaseModel):
    product_name: str
    product_sku: Optional[str] = None
    quantity: float
    unit_price: float
    total: float
    tax: Optional[float] = 0

class InvoiceBase(BaseModel):
    invoice_number: str
    supplier_id: Optional[str] = None
    supplier_name: str
    issue_date: str
    total_value: float
    tax_value: float = 0
    items: List[InvoiceItemBase]
    status: Literal["pending", "processed", "error"] = "pending"
    type: Literal["entrada", "saida"] = "entrada"
    notes: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    pass

class Invoice(InvoiceBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime
    created_by: str
    file_url: Optional[str] = None

class SaleItemBase(BaseModel):
    product_id: str
    product_name: str
    quantity: float
    unit_price: float
    total: float

class SaleBase(BaseModel):
    customer_name: Optional[str] = None
    customer_document: Optional[str] = None
    warehouse_id: str
    items: List[SaleItemBase]
    subtotal: float
    discount: float = 0
    total: float
    payment_method: Optional[str] = None
    status: Literal["pending", "completed", "cancelled"] = "pending"
    type: Literal["venda", "pedido", "orcamento"] = "venda"
    notes: Optional[str] = None

class SaleCreate(SaleBase):
    pass

class Sale(SaleBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sale_number: str
    created_at: datetime
    created_by: str

class AuditLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    action: str
    entity_type: str
    entity_id: str
    changes: Optional[dict] = None
    timestamp: datetime
    ip_address: Optional[str] = None

class DashboardStats(BaseModel):
    total_products: int
    total_suppliers: int
    total_warehouses: int
    total_sales_today: float
    total_sales_month: float
    low_stock_alerts: int
    pending_invoices: int

class StockAlert(BaseModel):
    product_id: str
    product_name: str
    warehouse_id: str
    warehouse_name: str
    current_quantity: float
    min_stock: float

class FinancialReport(BaseModel):
    period: str
    revenue: float
    cost: float
    gross_profit: float
    profit_margin: float
    expenses: float
    net_profit: float

class OCRRequest(BaseModel):
    image_base64: str


class AlertConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    alert_type: Literal["stock_low", "invoice_pending", "sale_completed"]
    email_enabled: bool = False
    internal_enabled: bool = True
    mobile_enabled: bool = False
    email_address: Optional[str] = None
    phone_number: Optional[str] = None
    threshold: Optional[float] = None
    active: bool = True
    created_at: datetime

class AlertConfigCreate(BaseModel):
    alert_type: Literal["stock_low", "invoice_pending", "sale_completed"]
    email_enabled: bool = False
    internal_enabled: bool = True
    mobile_enabled: bool = False
    email_address: Optional[str] = None
    phone_number: Optional[str] = None
    threshold: Optional[float] = None

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    type: Literal["info", "warning", "error", "success"]
    read: bool = False
    created_at: datetime

class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    type: Literal["info", "warning", "error", "success"] = "info"

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    min_stock: Optional[float] = None
    cost_price: Optional[float] = None
    sale_price: Optional[float] = None
    active: Optional[bool] = None

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    cnpj: Optional[str] = None
    contact: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    active: Optional[bool] = None

class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    sectors: Optional[List[str]] = None
    active: Optional[bool] = None


class OrderItemBase(BaseModel):
    product_id: str
    product_name: str
    quantity: float
    unit_price: float
    total: float

class OrderBase(BaseModel):
    customer_name: str
    customer_document: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    warehouse_id: Optional[str] = None
    items: List[OrderItemBase]
    subtotal: float
    discount: float = 0
    total: float
    payment_method: Optional[str] = None
    type: Literal["pedido", "orcamento"]
    status: Literal["draft", "confirmed", "cancelled", "converted"] = "draft"
    notes: Optional[str] = None
    valid_until: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str
    created_at: datetime
    created_by: str

class OrderUpdate(BaseModel):
    status: Optional[Literal["draft", "confirmed", "cancelled", "converted"]] = None
    notes: Optional[str] = None
    payment_method: Optional[str] = None
    warehouse_id: Optional[str] = None
    valid_until: Optional[str] = None

class CashFlowReport(BaseModel):
    period: str
    inflows: float
    outflows: float
    balance: float
    inflow_details: List[dict]
    outflow_details: List[dict]
