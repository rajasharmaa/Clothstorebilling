export type ClothingCategory =
  | 'Jeans'
  | 'Shirt'
  | 'Lower'
  | 'T-shirt'
  | 'Cargo'
  | 'Track Suit'
  | 'Upper'
  | 'Rain Coat'
  | 'Jacket'
  | 'Other';

export const CLOTHING_CATEGORIES: ClothingCategory[] = [
  'Jeans',
  'Shirt',
  'Lower',
  'T-shirt',
  'Cargo',
  'Track Suit',
  'Upper',
  'Rain Coat',
  'Jacket',
  'Other',
];

export const STANDARD_SIZES = ['28', '30', '32', '34', '36', '38', '40', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

export const POPULAR_COLORS = [
  'Black',
  'Blue',
  'Navy Blue',
  'Dark Blue',
  'Light Blue',
  'White',
  'Grey',
  'Charcoal',
  'Olive Green',
  'Brown',
  'Maroon',
  'Beige',
];

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  barcode: string;
  size: string;
  color: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  stock: number;
  minStockAlert: number;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  category: ClothingCategory;
  brand: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export type PaymentMode = 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'SPLIT' | 'DUE';

export interface SplitPaymentDetail {
  cash: number;
  upi: number;
  card: number;
}

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  category: ClothingCategory;
  size: string;
  color: string;
  sku: string;
  barcode: string;
  mrp: number;
  rate: number; // selling price per unit
  purchasePrice: number; // historical cost snapshot
  quantity: number;
  discountType: 'PERCENT' | 'AMOUNT';
  discountPercent: number;
  discountAmount: number; // Total discount for this line
  finalPrice: number; // rate * quantity - discountAmount
  availableStock: number;
  isCustom?: boolean;
}

export interface SaleItemSnapshot {
  variantId: string;
  productId: string;
  productName: string;
  category: ClothingCategory;
  size: string;
  color: string;
  sku: string;
  quantity: number;
  rate: number;
  purchasePriceSnapshot: number; // for accurate profit calculation
  mrp: number;
  discountAmount: number;
  discountPercent: number;
  finalAmount: number;
  isCustom?: boolean;
}

export interface Sale {
  id: string;
  billNumber: string; // e.g. TC-2026-000001
  date: string; // ISO string
  timestamp: number;
  customerId?: string;
  customerName?: string;
  customerMobile?: string;
  customerAddress?: string;
  items: SaleItemSnapshot[];
  totalOriginalAmount: number;
  totalItemDiscount: number;
  billDiscountType: 'PERCENT' | 'AMOUNT';
  billDiscountPercent: number;
  billDiscountAmount: number;
  totalDiscount: number;
  effectiveDiscountPercent: number;
  finalPayable: number;
  amountReceived: number;
  balanceDue: number;
  paymentMode: PaymentMode;
  splitDetails?: SplitPaymentDetail;
  paymentReference?: string;
  cashierName: string;
  cashierId: string;
  status: 'COMPLETED' | 'CANCELLED' | 'EXCHANGED';
  notes?: string;
  cancelReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
}

export interface StockLedgerEntry {
  id: string;
  date: string;
  timestamp: number;
  variantId: string;
  productId: string;
  productName: string;
  size: string;
  color: string;
  sku: string;
  type:
    | 'OPENING'
    | 'SALE'
    | 'PURCHASE'
    | 'CUSTOMER_RETURN'
    | 'SUPPLIER_RETURN'
    | 'DAMAGE'
    | 'ADJUSTMENT_ADD'
    | 'ADJUSTMENT_SUB'
    | 'EXCHANGE_IN'
    | 'EXCHANGE_OUT';
  quantityChange: number; // positive for IN, negative for OUT
  previousStock: number;
  newStock: number;
  referenceId: string; // billNumber or purchaseNumber
  notes?: string;
  actorName: string;
}

export interface Supplier {
  id: string;
  name: string;
  businessName: string;
  mobile: string;
  address?: string;
  openingBalance: number;
  totalPurchases: number;
  totalPaid: number;
  outstandingBalance: number;
  notes?: string;
  createdAt: string;
}

export interface PurchaseItem {
  variantId: string;
  productId: string;
  productName: string;
  size: string;
  color: string;
  sku: string;
  quantity: number;
  purchaseRate: number;
  mrp: number;
  sellingRate: number;
  total: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string; // e.g. PO-2026-0001
  supplierId: string;
  supplierName: string;
  date: string;
  invoiceRef?: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  paymentMode: PaymentMode;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  address?: string;
  customerType: 'Regular' | 'VIP' | 'Wholesale';
  totalBills: number;
  totalPurchases: number;
  lastPurchaseDate?: string;
  outstandingDue: number;
  notes?: string;
  createdAt: string;
}

export interface ReturnItem {
  variantId: string;
  productName: string;
  size: string;
  color: string;
  sku: string;
  quantity: number;
  originalRate: number;
  refundRate: number;
  condition: 'GOOD' | 'DAMAGED'; // GOOD = restock; DAMAGED = discard/damage log
}

export interface ReturnTransaction {
  id: string;
  returnNumber: string; // e.g. RET-2026-0001
  originalBillNumber: string;
  date: string;
  customerName?: string;
  customerMobile?: string;
  items: ReturnItem[];
  totalRefundAmount: number;
  refundMethod: PaymentMode;
  reason: string;
  processedBy: string;
  isExchange: boolean;
  exchangeBillNumber?: string;
}

export interface Expense {
  id: string;
  title: string;
  category:
    | 'Shop Rent'
    | 'Electricity'
    | 'Staff Salary'
    | 'Transportation'
    | 'Packaging'
    | 'Tea & Snacks'
    | 'Maintenance'
    | 'Other';
  amount: number;
  date: string;
  paymentMode: PaymentMode;
  notes?: string;
  recordedBy: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  phone: string;
  address: string;
  country: string;
  currency: string;
  currencySymbol: string;
  timeZone: string;
  billingType: string;
  billPrefix: string;
  nextBillSequence: number;
  receiptFooter: string;
  exchangePolicy: string;
  receiptPaperSize: '58mm' | '80mm' | 'A4';
  enableAutoPrint: boolean;
  cashierMaxDiscount: number;
  managerMaxDiscount: number;
  defaultItemDiscountPerPiece: number; // e.g. 50 Rs discount per piece
  lowStockThresholdDefault: number;
  allowNegativeStock: boolean;
  logoUrl?: string;
  upiId?: string;
  upiPayeeName?: string;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  pin: string; // 4-digit PIN for quick access
  active: boolean;
}
