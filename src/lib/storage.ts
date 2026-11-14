import {
  Product,
  Sale,
  Purchase,
  Supplier,
  Customer,
  StockLedgerEntry,
  ReturnTransaction,
  Expense,
  ShopSettings,
  User,
  CLOTHING_CATEGORIES,
  SaleItemSnapshot,
} from '../types';

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  shopName: 'TARA COLLECTION',
  tagline: "Men's Wear | Sports Wear",
  phone: '7000627153',
  address: 'Chhawni, Opp. Laxmi Narayan Doodh Dairy, Indore (M.P.)',
  country: 'India',
  currency: 'INR',
  currencySymbol: '₹',
  timeZone: 'Asia/Kolkata',
  billingType: 'Retail Cash Memo / Non-GST',
  billPrefix: 'TC',
  nextBillSequence: 1001,
  receiptFooter: 'Thank you for shopping at TARA COLLECTION!',
  exchangePolicy:
    'Exchange within 7 days with original cash memo. Tags must remain intact. Items must be unwashed & unused.',
  receiptPaperSize: '80mm',
  enableAutoPrint: false,
  cashierMaxDiscount: 15,
  managerMaxDiscount: 35,
  defaultItemDiscountPerPiece: 50,
  lowStockThresholdDefault: 3,
  allowNegativeStock: false,
  upiId: '7000627153@upi',
  upiPayeeName: 'TARA COLLECTION',
};

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Rajat (Owner)', username: 'admin', role: 'ADMIN', pin: '1234', active: true },
  { id: 'u2', name: 'Suresh (Store Manager)', username: 'manager', role: 'MANAGER', pin: '2345', active: true },
  { id: 'u3', name: 'Ramesh (Cashier)', username: 'cashier', role: 'CASHIER', pin: '0000', active: true },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup1',
    name: 'Kailash Textiles',
    businessName: 'Kailash Textiles Indore',
    mobile: '9826011223',
    address: 'Cloth Market, Indore',
    openingBalance: 0,
    totalPurchases: 45000,
    totalPaid: 45000,
    outstandingBalance: 0,
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'sup2',
    name: 'Tirupur Knitwear Hub',
    businessName: 'Tirupur Knitwear Exports',
    mobile: '9842099887',
    address: 'Ring Road, Tirupur, TN',
    openingBalance: 0,
    totalPurchases: 32000,
    totalPaid: 25000,
    outstandingBalance: 7000,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'sup3',
    name: 'Surat Denim Mills',
    businessName: 'Surat Denim Fabrics',
    mobile: '9909033445',
    address: 'Ring Road Market, Surat, Gujarat',
    openingBalance: 0,
    totalPurchases: 68000,
    totalPaid: 50000,
    outstandingBalance: 18000,
    createdAt: '2026-01-20T10:00:00Z',
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust1',
    name: 'Vikas Sharma',
    mobile: '9827012345',
    address: 'Navlakha, Indore',
    customerType: 'Regular',
    totalBills: 3,
    totalPurchases: 4850,
    lastPurchaseDate: '2026-11-10T14:30:00Z',
    outstandingDue: 0,
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'cust2',
    name: 'Amit Patel',
    mobile: '9425098765',
    address: 'Bhawarkua, Indore',
    customerType: 'VIP',
    totalBills: 5,
    totalPurchases: 9200,
    lastPurchaseDate: '2026-11-12T17:15:00Z',
    outstandingDue: 450,
    createdAt: '2026-02-15T10:00:00Z',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_jeans_1',
    name: "Men's Slim Fit Denim Jeans",
    code: 'JNS-001',
    category: 'Jeans',
    brand: 'Tara Classic',
    description: 'Premium stretchable washed denim jeans for men',
    active: true,
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
    variants: [
      {
        id: 'var_jns1_30_blu',
        productId: 'prod_jeans_1',
        sku: 'TC-JNS-30-BLU',
        barcode: '8901001001',
        size: '30',
        color: 'Dark Blue',
        purchasePrice: 580,
        sellingPrice: 999,
        mrp: 1299,
        stock: 8,
        minStockAlert: 3,
      },
      {
        id: 'var_jns1_32_blu',
        productId: 'prod_jeans_1',
        sku: 'TC-JNS-32-BLU',
        barcode: '8901001002',
        size: '32',
        color: 'Dark Blue',
        purchasePrice: 580,
        sellingPrice: 999,
        mrp: 1299,
        stock: 12,
        minStockAlert: 3,
      },
      {
        id: 'var_jns1_34_blu',
        productId: 'prod_jeans_1',
        sku: 'TC-JNS-34-BLU',
        barcode: '8901001003',
        size: '34',
        color: 'Dark Blue',
        purchasePrice: 580,
        sellingPrice: 999,
        mrp: 1299,
        stock: 5,
        minStockAlert: 3,
      },
      {
        id: 'var_jns1_32_blk',
        productId: 'prod_jeans_1',
        sku: 'TC-JNS-32-BLK',
        barcode: '8901001004',
        size: '32',
        color: 'Black',
        purchasePrice: 580,
        sellingPrice: 1049,
        mrp: 1399,
        stock: 6,
        minStockAlert: 3,
      },
      {
        id: 'var_jns1_34_blk',
        productId: 'prod_jeans_1',
        sku: 'TC-JNS-34-BLK',
        barcode: '8901001005',
        size: '34',
        color: 'Black',
        purchasePrice: 580,
        sellingPrice: 1049,
        mrp: 1399,
        stock: 2, // Low stock demo
        minStockAlert: 3,
      },
    ],
  },
  {
    id: 'prod_shirt_1',
    name: 'Casual Check Cotton Shirt',
    code: 'SHT-001',
    category: 'Shirt',
    brand: 'Tara Urban',
    description: '100% Breathable cotton casual shirt with spread collar',
    active: true,
    createdAt: '2026-01-02T10:00:00Z',
    updatedAt: '2026-01-02T10:00:00Z',
    variants: [
      {
        id: 'var_sht1_m_navy',
        productId: 'prod_shirt_1',
        sku: 'TC-SHT-M-NVY',
        barcode: '8901002001',
        size: 'M',
        color: 'Navy Blue',
        purchasePrice: 380,
        sellingPrice: 699,
        mrp: 999,
        stock: 10,
        minStockAlert: 3,
      },
      {
        id: 'var_sht1_l_navy',
        productId: 'prod_shirt_1',
        sku: 'TC-SHT-L-NVY',
        barcode: '8901002002',
        size: 'L',
        color: 'Navy Blue',
        purchasePrice: 380,
        sellingPrice: 699,
        mrp: 999,
        stock: 14,
        minStockAlert: 4,
      },
      {
        id: 'var_sht1_xl_navy',
        productId: 'prod_shirt_1',
        sku: 'TC-SHT-XL-NVY',
        barcode: '8901002003',
        size: 'XL',
        color: 'Navy Blue',
        purchasePrice: 380,
        sellingPrice: 699,
        mrp: 999,
        stock: 7,
        minStockAlert: 3,
      },
    ],
  },
  {
    id: 'prod_lower_1',
    name: 'Sports Lycra Track Pant / Lower',
    code: 'LWR-001',
    category: 'Lower',
    brand: 'Tara Sportz',
    description: '4-way stretchable sports gym and running lower with zippered pockets',
    active: true,
    createdAt: '2026-01-05T10:00:00Z',
    updatedAt: '2026-01-05T10:00:00Z',
    variants: [
      {
        id: 'var_lwr1_m_blk',
        productId: 'prod_lower_1',
        sku: 'TC-LWR-M-BLK',
        barcode: '8901003001',
        size: 'M',
        color: 'Black',
        purchasePrice: 240,
        sellingPrice: 499,
        mrp: 699,
        stock: 15,
        minStockAlert: 5,
      },
      {
        id: 'var_lwr1_l_blk',
        productId: 'prod_lower_1',
        sku: 'TC-LWR-L-BLK',
        barcode: '8901003002',
        size: 'L',
        color: 'Black',
        purchasePrice: 240,
        sellingPrice: 499,
        mrp: 699,
        stock: 20,
        minStockAlert: 5,
      },
      {
        id: 'var_lwr1_xl_gry',
        productId: 'prod_lower_1',
        sku: 'TC-LWR-XL-GRY',
        barcode: '8901003003',
        size: 'XL',
        color: 'Grey',
        purchasePrice: 240,
        sellingPrice: 499,
        mrp: 699,
        stock: 8,
        minStockAlert: 3,
      },
    ],
  },
  {
    id: 'prod_tshirt_1',
    name: 'Dry-Fit Sports Round Neck T-shirt',
    code: 'TSH-001',
    category: 'T-shirt',
    brand: 'Tara Sportz',
    description: 'Sweat-wicking athletic performance t-shirt',
    active: true,
    createdAt: '2026-01-06T10:00:00Z',
    updatedAt: '2026-01-06T10:00:00Z',
    variants: [
      {
        id: 'var_tsh1_m_wht',
        productId: 'prod_tshirt_1',
        sku: 'TC-TSH-M-WHT',
        barcode: '8901004001',
        size: 'M',
        color: 'White',
        purchasePrice: 160,
        sellingPrice: 349,
        mrp: 499,
        stock: 18,
        minStockAlert: 5,
      },
      {
        id: 'var_tsh1_l_blu',
        productId: 'prod_tshirt_1',
        sku: 'TC-TSH-L-BLU',
        barcode: '8901004002',
        size: 'L',
        color: 'Blue',
        purchasePrice: 160,
        sellingPrice: 349,
        mrp: 499,
        stock: 12,
        minStockAlert: 4,
      },
    ],
  },
  {
    id: 'prod_cargo_1',
    name: '6-Pocket Heavy Duty Cotton Cargo',
    code: 'CRG-001',
    category: 'Cargo',
    brand: 'Tara Cargo',
    description: 'Combat style heavy cotton cargo trousers with deep utility pockets',
    active: true,
    createdAt: '2026-01-08T10:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
    variants: [
      {
        id: 'var_crg1_32_olv',
        productId: 'prod_cargo_1',
        sku: 'TC-CRG-32-OLV',
        barcode: '8901005001',
        size: '32',
        color: 'Olive Green',
        purchasePrice: 620,
        sellingPrice: 1149,
        mrp: 1499,
        stock: 7,
        minStockAlert: 2,
      },
      {
        id: 'var_crg1_34_olv',
        productId: 'prod_cargo_1',
        sku: 'TC-CRG-34-OLV',
        barcode: '8901005002',
        size: '34',
        color: 'Olive Green',
        purchasePrice: 620,
        sellingPrice: 1149,
        mrp: 1499,
        stock: 5,
        minStockAlert: 2,
      },
    ],
  },
  {
    id: 'prod_tracksuit_1',
    name: 'Winter Warm Fleece Track Suit (Set)',
    code: 'TRK-001',
    category: 'Track Suit',
    brand: 'Tara Sportz',
    description: 'Full zipper jacket and matching warm jogger pant set',
    active: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
    variants: [
      {
        id: 'var_trk1_l_nvy',
        productId: 'prod_tracksuit_1',
        sku: 'TC-TRK-L-NVY',
        barcode: '8901006001',
        size: 'L',
        color: 'Navy Blue',
        purchasePrice: 850,
        sellingPrice: 1599,
        mrp: 1999,
        stock: 6,
        minStockAlert: 2,
      },
      {
        id: 'var_trk1_xl_nvy',
        productId: 'prod_tracksuit_1',
        sku: 'TC-TRK-XL-NVY',
        barcode: '8901006002',
        size: 'XL',
        color: 'Navy Blue',
        purchasePrice: 850,
        sellingPrice: 1599,
        mrp: 1999,
        stock: 4,
        minStockAlert: 2,
      },
    ],
  },
  {
    id: 'prod_jacket_1',
    name: 'Windproof Puffer Winter Jacket',
    code: 'JKT-001',
    category: 'Jacket',
    brand: 'Tara Classic',
    description: 'Lightweight insulated warm zipper jacket',
    active: true,
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z',
    variants: [
      {
        id: 'var_jkt1_l_blk',
        productId: 'prod_jacket_1',
        sku: 'TC-JKT-L-BLK',
        barcode: '8901007001',
        size: 'L',
        color: 'Black',
        purchasePrice: 950,
        sellingPrice: 1799,
        mrp: 2299,
        stock: 8,
        minStockAlert: 2,
      },
      {
        id: 'var_jkt1_xl_blk',
        productId: 'prod_jacket_1',
        sku: 'TC-JKT-XL-BLK',
        barcode: '8901007002',
        size: 'XL',
        color: 'Black',
        purchasePrice: 950,
        sellingPrice: 1799,
        mrp: 2299,
        stock: 0, // Out of stock demo
        minStockAlert: 2,
      },
    ],
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp1',
    title: 'Shop Electricity Bill',
    category: 'Electricity',
    amount: 3200,
    date: '2026-11-05',
    paymentMode: 'UPI',
    notes: 'MPPKVVCL October bill payment',
    recordedBy: 'Rajat (Owner)',
  },
  {
    id: 'exp2',
    title: 'Store Staff Tea & Refreshment',
    category: 'Tea & Snacks',
    amount: 450,
    date: '2026-11-12',
    paymentMode: 'CASH',
    notes: 'Weekly tea vendor settlement',
    recordedBy: 'Suresh (Manager)',
  },
];

// Storage keys
const STORAGE_PREFIX = 'tara_pos_';
const KEYS = {
  SETTINGS: `${STORAGE_PREFIX}settings`,
  PRODUCTS: `${STORAGE_PREFIX}products`,
  SALES: `${STORAGE_PREFIX}sales`,
  PURCHASES: `${STORAGE_PREFIX}purchases`,
  SUPPLIERS: `${STORAGE_PREFIX}suppliers`,
  CUSTOMERS: `${STORAGE_PREFIX}customers`,
  STOCK_LEDGER: `${STORAGE_PREFIX}stock_ledger`,
  RETURNS: `${STORAGE_PREFIX}returns`,
  EXPENSES: `${STORAGE_PREFIX}expenses`,
  USERS: `${STORAGE_PREFIX}users`,
  CURRENT_USER: `${STORAGE_PREFIX}current_user`,
};

function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key}`, e);
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key}`, e);
  }
}

/**
 * Storage Service
 */
export const StorageService = {
  init(): void {
    if (!localStorage.getItem(KEYS.SETTINGS)) {
      setLocal(KEYS.SETTINGS, DEFAULT_SHOP_SETTINGS);
    }
    if (!localStorage.getItem(KEYS.USERS)) {
      setLocal(KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(KEYS.CURRENT_USER)) {
      setLocal(KEYS.CURRENT_USER, INITIAL_USERS[0]);
    }
    if (!localStorage.getItem(KEYS.PRODUCTS)) {
      setLocal(KEYS.PRODUCTS, INITIAL_PRODUCTS);
    }
    if (!localStorage.getItem(KEYS.SUPPLIERS)) {
      setLocal(KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    }
    if (!localStorage.getItem(KEYS.CUSTOMERS)) {
      setLocal(KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    }
    if (!localStorage.getItem(KEYS.EXPENSES)) {
      setLocal(KEYS.EXPENSES, INITIAL_EXPENSES);
    }
    if (!localStorage.getItem(KEYS.SALES)) {
      setLocal(KEYS.SALES, []);
    }
    if (!localStorage.getItem(KEYS.PURCHASES)) {
      setLocal(KEYS.PURCHASES, []);
    }
    if (!localStorage.getItem(KEYS.RETURNS)) {
      setLocal(KEYS.RETURNS, []);
    }
    if (!localStorage.getItem(KEYS.STOCK_LEDGER)) {
      // Seed initial opening stock entries
      const initialLedger: StockLedgerEntry[] = [];
      const prods = INITIAL_PRODUCTS;
      const now = new Date().toISOString();
      const ts = Date.now();
      for (const p of prods) {
        for (const v of p.variants) {
          if (v.stock > 0) {
            initialLedger.push({
              id: 'led_init_' + v.id,
              date: now,
              timestamp: ts,
              variantId: v.id,
              productId: p.id,
              productName: p.name,
              size: v.size,
              color: v.color,
              sku: v.sku,
              type: 'OPENING',
              quantityChange: v.stock,
              previousStock: 0,
              newStock: v.stock,
              referenceId: 'OPENING-STOCK',
              notes: 'Initial shop setup opening inventory',
              actorName: 'System Seeder',
            });
          }
        }
      }
      setLocal(KEYS.STOCK_LEDGER, initialLedger);
    }
  },

  // Settings
  getSettings(): ShopSettings {
    const s = getLocal<ShopSettings>(KEYS.SETTINGS, DEFAULT_SHOP_SETTINGS);
    if (s.defaultItemDiscountPerPiece === undefined) {
      s.defaultItemDiscountPerPiece = 50;
    }
    if (!s.upiId) {
      s.upiId = '7000627153@upi';
    }
    if (!s.upiPayeeName) {
      s.upiPayeeName = 'TARA COLLECTION';
    }
    return s;
  },
  saveSettings(settings: ShopSettings): void {
    setLocal(KEYS.SETTINGS, settings);
  },

  // Users & Auth
  getUsers(): User[] {
    return getLocal<User[]>(KEYS.USERS, INITIAL_USERS);
  },
  saveUsers(users: User[]): void {
    setLocal(KEYS.USERS, users);
  },
  getCurrentUser(): User {
    return getLocal<User>(KEYS.CURRENT_USER, INITIAL_USERS[0]);
  },
  setCurrentUser(user: User): void {
    setLocal(KEYS.CURRENT_USER, user);
  },

  // Products
  getProducts(): Product[] {
    return getLocal<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },
  saveProducts(products: Product[]): void {
    setLocal(KEYS.PRODUCTS, products);
  },
  saveProduct(product: Product): void {
    const list = this.getProducts();
    const idx = list.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      list[idx] = product;
    } else {
      list.unshift(product);
    }
    this.saveProducts(list);
  },
  deleteProduct(productId: string): { success: boolean; error?: string } {
    // Check if product was sold in any sale
    const sales = this.getSales();
    const hasSale = sales.some((s) => s.items.some((i) => i.productId === productId));
    if (hasSale) {
      // Archive instead of hard delete
      const list = this.getProducts();
      const p = list.find((item) => item.id === productId);
      if (p) {
        p.active = false;
        this.saveProducts(list);
        return { success: true };
      }
      return { success: false, error: 'Product not found' };
    }
    const filtered = this.getProducts().filter((p) => p.id !== productId);
    this.saveProducts(filtered);
    return { success: true };
  },

  // Suppliers
  getSuppliers(): Supplier[] {
    return getLocal<Supplier[]>(KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
  },
  saveSuppliers(suppliers: Supplier[]): void {
    setLocal(KEYS.SUPPLIERS, suppliers);
  },
  saveSupplier(supplier: Supplier): void {
    const list = this.getSuppliers();
    const idx = list.findIndex((s) => s.id === supplier.id);
    if (idx >= 0) {
      list[idx] = supplier;
    } else {
      list.unshift(supplier);
    }
    this.saveSuppliers(list);
  },

  // Customers
  getCustomers(): Customer[] {
    return getLocal<Customer[]>(KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },
  saveCustomers(customers: Customer[]): void {
    setLocal(KEYS.CUSTOMERS, customers);
  },
  saveCustomer(customer: Customer): void {
    const list = this.getCustomers();
    const idx = list.findIndex((c) => c.id === customer.id);
    if (idx >= 0) {
      list[idx] = customer;
    } else {
      list.unshift(customer);
    }
    this.saveCustomers(list);
  },

  // Expenses
  getExpenses(): Expense[] {
    return getLocal<Expense[]>(KEYS.EXPENSES, INITIAL_EXPENSES);
  },
  saveExpenses(expenses: Expense[]): void {
    setLocal(KEYS.EXPENSES, expenses);
  },
  addExpense(expense: Expense): void {
    const list = this.getExpenses();
    list.unshift(expense);
    this.saveExpenses(list);
  },

  // Sales
  getSales(): Sale[] {
    return getLocal<Sale[]>(KEYS.SALES, []);
  },
  saveSales(sales: Sale[]): void {
    setLocal(KEYS.SALES, sales);
  },

  // Purchases
  getPurchases(): Purchase[] {
    return getLocal<Purchase[]>(KEYS.PURCHASES, []);
  },
  savePurchases(purchases: Purchase[]): void {
    setLocal(KEYS.PURCHASES, purchases);
  },

  // Stock Ledger
  getStockLedger(): StockLedgerEntry[] {
    return getLocal<StockLedgerEntry[]>(KEYS.STOCK_LEDGER, []);
  },
  saveStockLedger(entries: StockLedgerEntry[]): void {
    setLocal(KEYS.STOCK_LEDGER, entries);
  },

  // Returns
  getReturns(): ReturnTransaction[] {
    return getLocal<ReturnTransaction[]>(KEYS.RETURNS, []);
  },
  saveReturns(returns: ReturnTransaction[]): void {
    setLocal(KEYS.RETURNS, returns);
  },

  // Next Bill Number Generation
  getNextBillNumber(): string {
    const settings = this.getSettings();
    const year = new Date().getFullYear();
    const seq = settings.nextBillSequence || 1001;
    const billNumber = `${settings.billPrefix}-${year}-${String(seq).padStart(6, '0')}`;
    return billNumber;
  },

  previewNextBillNumber(): string {
    return this.getNextBillNumber();
  },

  /**
   * ATOMIC SALE TRANSACTION:
   * 1. Validates stock
   * 2. Generates sequential bill number
   * 3. Saves sale
   * 4. Deducts stock from each variant
   * 5. Appends stock ledger entries
   * 6. Updates customer ledger if applicable
   * 7. Increments bill sequence
   */
  processSale(saleData: Omit<Sale, 'id' | 'billNumber' | 'date' | 'timestamp'>): {
    success: boolean;
    sale?: Sale;
    error?: string;
  } {
    const settings = this.getSettings();
    const products = this.getProducts();
    const currentUser = this.getCurrentUser();

    // 1. Validate stock
    if (!settings.allowNegativeStock) {
      for (const item of saleData.items) {
        if (item.isCustom) continue; // Custom uninventoried items skip stock validation
        let foundVariant = false;
        for (const p of products) {
          const v = p.variants.find((variant) => variant.id === item.variantId);
          if (v) {
            foundVariant = true;
            if (v.stock < item.quantity) {
              return {
                success: false,
                error: `Insufficient stock for ${item.productName} (${item.size}/${item.color}). Available: ${v.stock}, Requested: ${item.quantity}`,
              };
            }
            break;
          }
        }
        if (!foundVariant) {
          return {
            success: false,
            error: `Product variant ${item.productName} (${item.size}/${item.color}) not found!`,
          };
        }
      }
    }

    // 2. Generate sequential bill number
    const billNumber = this.getNextBillNumber();
    const now = new Date().toISOString();
    const timestamp = Date.now();
    const saleId = 'sale_' + timestamp + '_' + Math.random().toString(36).substring(2, 7);

    const fullSale: Sale = {
      ...saleData,
      id: saleId,
      billNumber,
      date: now,
      timestamp,
    };

    // 3. Deduct stock & create ledger entries
    const ledgerEntries: StockLedgerEntry[] = [];
    for (const item of saleData.items) {
      if (item.isCustom) continue; // Custom uninventoried items do not decrement stock
      for (const p of products) {
        const v = p.variants.find((variant) => variant.id === item.variantId);
        if (v) {
          const prev = v.stock;
          v.stock -= item.quantity;
          p.updatedAt = now;

          ledgerEntries.push({
            id: 'led_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            date: now,
            timestamp,
            variantId: v.id,
            productId: p.id,
            productName: p.name,
            size: v.size,
            color: v.color,
            sku: v.sku,
            type: 'SALE',
            quantityChange: -item.quantity,
            previousStock: prev,
            newStock: v.stock,
            referenceId: billNumber,
            notes: `Sold via Cash Memo #${billNumber}`,
            actorName: currentUser.name,
          });
          break;
        }
      }
    }

    // 4. Update customer stats if customer provided
    if (fullSale.customerMobile) {
      const customers = this.getCustomers();
      let customer = customers.find((c) => c.mobile === fullSale.customerMobile);
      if (customer) {
        customer.totalBills = (customer.totalBills || 0) + 1;
        customer.totalPurchases = (customer.totalPurchases || 0) + fullSale.finalPayable;
        customer.lastPurchaseDate = now;
        customer.outstandingDue = (customer.outstandingDue || 0) + fullSale.balanceDue;
      } else if (fullSale.customerName) {
        customer = {
          id: 'cust_' + Date.now(),
          name: fullSale.customerName,
          mobile: fullSale.customerMobile,
          address: fullSale.customerAddress || '',
          customerType: 'Regular',
          totalBills: 1,
          totalPurchases: fullSale.finalPayable,
          lastPurchaseDate: now,
          outstandingDue: fullSale.balanceDue,
          createdAt: now,
        };
        customers.unshift(customer);
      }
      this.saveCustomers(customers);
    }

    // 5. Commit state
    const sales = this.getSales();
    sales.unshift(fullSale);
    this.saveSales(sales);

    this.saveProducts(products);

    const currentLedger = this.getStockLedger();
    this.saveStockLedger([...ledgerEntries, ...currentLedger]);

    // Increment bill sequence
    settings.nextBillSequence = (settings.nextBillSequence || 1001) + 1;
    this.saveSettings(settings);

    return { success: true, sale: fullSale };
  },

  /**
   * ATOMIC PURCHASE INWARD:
   * 1. Increases stock
   * 2. Preserves purchase cost
   * 3. Creates ledger entries
   * 4. Updates supplier balance
   */
  processPurchase(purchaseData: Omit<Purchase, 'id' | 'purchaseNumber' | 'createdAt'>): {
    success: boolean;
    purchase?: Purchase;
    error?: string;
  } {
    const products = this.getProducts();
    const currentUser = this.getCurrentUser();
    const now = new Date().toISOString();
    const timestamp = Date.now();
    const purchaseYear = new Date().getFullYear();
    const existingPurchases = this.getPurchases();
    const purchaseNumber = `PO-${purchaseYear}-${String(existingPurchases.length + 1).padStart(4, '0')}`;

    const purchase: Purchase = {
      ...purchaseData,
      id: 'po_' + timestamp,
      purchaseNumber,
      createdAt: now,
    };

    const ledgerEntries: StockLedgerEntry[] = [];

    // Increase stock
    for (const item of purchase.items) {
      for (const p of products) {
        const v = p.variants.find((variant) => variant.id === item.variantId);
        if (v) {
          const prev = v.stock;
          v.stock += item.quantity;
          // Update purchase price and selling price if specified
          if (item.purchaseRate > 0) v.purchasePrice = item.purchaseRate;
          if (item.sellingRate > 0) v.sellingPrice = item.sellingRate;
          if (item.mrp > 0) v.mrp = item.mrp;
          p.updatedAt = now;

          ledgerEntries.push({
            id: 'led_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            date: now,
            timestamp,
            variantId: v.id,
            productId: p.id,
            productName: p.name,
            size: v.size,
            color: v.color,
            sku: v.sku,
            type: 'PURCHASE',
            quantityChange: item.quantity,
            previousStock: prev,
            newStock: v.stock,
            referenceId: purchaseNumber,
            notes: `Purchased from ${purchase.supplierName} (${purchase.invoiceRef || 'Direct'})`,
            actorName: currentUser.name,
          });
          break;
        }
      }
    }

    // Update supplier balance
    const suppliers = this.getSuppliers();
    const supplier = suppliers.find((s) => s.id === purchase.supplierId);
    if (supplier) {
      supplier.totalPurchases = (supplier.totalPurchases || 0) + purchase.totalAmount;
      supplier.totalPaid = (supplier.totalPaid || 0) + purchase.paidAmount;
      supplier.outstandingBalance = (supplier.outstandingBalance || 0) + purchase.balanceDue;
      this.saveSuppliers(suppliers);
    }

    existingPurchases.unshift(purchase);
    this.savePurchases(existingPurchases);
    this.saveProducts(products);

    const currentLedger = this.getStockLedger();
    this.saveStockLedger([...ledgerEntries, ...currentLedger]);

    return { success: true, purchase };
  },

  /**
   * MANUAL STOCK ADJUSTMENT (Damage / Correction / Loss)
   */
  adjustStock(params: {
    variantId: string;
    type: 'DAMAGE' | 'ADJUSTMENT_ADD' | 'ADJUSTMENT_SUB';
    quantity: number;
    reason: string;
  }): { success: boolean; error?: string } {
    const products = this.getProducts();
    const currentUser = this.getCurrentUser();
    const now = new Date().toISOString();
    const timestamp = Date.now();

    for (const p of products) {
      const v = p.variants.find((variant) => variant.id === params.variantId);
      if (v) {
        const prev = v.stock;
        let change = 0;
        if (params.type === 'ADJUSTMENT_ADD') {
          change = params.quantity;
        } else {
          // DAMAGE or SUB
          change = -params.quantity;
          if (v.stock < params.quantity && !this.getSettings().allowNegativeStock) {
            return {
              success: false,
              error: `Stock cannot be reduced below 0. Current stock: ${v.stock}`,
            };
          }
        }
        v.stock += change;
        p.updatedAt = now;

        const ledgerEntry: StockLedgerEntry = {
          id: 'led_' + Date.now(),
          date: now,
          timestamp,
          variantId: v.id,
          productId: p.id,
          productName: p.name,
          size: v.size,
          color: v.color,
          sku: v.sku,
          type: params.type,
          quantityChange: change,
          previousStock: prev,
          newStock: v.stock,
          referenceId: 'ADJUSTMENT',
          notes: params.reason,
          actorName: currentUser.name,
        };

        this.saveProducts(products);
        const ledger = this.getStockLedger();
        this.saveStockLedger([ledgerEntry, ...ledger]);
        return { success: true };
      }
    }

    return { success: false, error: 'Product variant not found' };
  },

  /**
   * CUSTOMER RETURN & EXCHANGE
   */
  processReturn(returnData: Omit<ReturnTransaction, 'id' | 'returnNumber' | 'date'>): {
    success: boolean;
    returnTx?: ReturnTransaction;
    error?: string;
  } {
    const products = this.getProducts();
    const currentUser = this.getCurrentUser();
    const now = new Date().toISOString();
    const timestamp = Date.now();
    const year = new Date().getFullYear();
    const existingReturns = this.getReturns();
    const returnNumber = `RET-${year}-${String(existingReturns.length + 1).padStart(4, '0')}`;

    const returnTx: ReturnTransaction = {
      ...returnData,
      id: 'ret_' + timestamp,
      returnNumber,
      date: now,
    };

    const ledgerEntries: StockLedgerEntry[] = [];

    // For each returned item, check condition
    for (const item of returnTx.items) {
      for (const p of products) {
        const v = p.variants.find((variant) => variant.id === item.variantId);
        if (v) {
          const prev = v.stock;
          if (item.condition === 'GOOD') {
            // Restock to sellable stock
            v.stock += item.quantity;
            ledgerEntries.push({
              id: 'led_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              date: now,
              timestamp,
              variantId: v.id,
              productId: p.id,
              productName: p.name,
              size: v.size,
              color: v.color,
              sku: v.sku,
              type: 'CUSTOMER_RETURN',
              quantityChange: item.quantity,
              previousStock: prev,
              newStock: v.stock,
              referenceId: returnTx.returnNumber,
              notes: `Customer return from Cash Memo #${returnTx.originalBillNumber} (${returnTx.reason}) - Condition: Good`,
              actorName: currentUser.name,
            });
          } else {
            // Damaged - do not add to sellable stock; record damage log
            ledgerEntries.push({
              id: 'led_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              date: now,
              timestamp,
              variantId: v.id,
              productId: p.id,
              productName: p.name,
              size: v.size,
              color: v.color,
              sku: v.sku,
              type: 'DAMAGE',
              quantityChange: 0,
              previousStock: prev,
              newStock: prev,
              referenceId: returnTx.returnNumber,
              notes: `Customer return marked DAMAGED from Cash Memo #${returnTx.originalBillNumber} - Not restocked`,
              actorName: currentUser.name,
            });
          }
          break;
        }
      }
    }

    // Update original sale status if needed
    const sales = this.getSales();
    const originalSale = sales.find((s) => s.billNumber === returnTx.originalBillNumber);
    if (originalSale) {
      originalSale.status = returnTx.isExchange ? 'EXCHANGED' : 'COMPLETED';
    }

    existingReturns.unshift(returnTx);
    this.saveReturns(existingReturns);
    this.saveProducts(products);
    this.saveSales(sales);

    const ledger = this.getStockLedger();
    this.saveStockLedger([...ledgerEntries, ...ledger]);

    return { success: true, returnTx };
  },

  /**
   * CANCEL BILL (Authorized)
   */
  cancelBill(billNumber: string, reason: string): { success: boolean; error?: string } {
    const sales = this.getSales();
    const sale = sales.find((s) => s.billNumber === billNumber);
    if (!sale) return { success: false, error: 'Bill not found' };
    if (sale.status === 'CANCELLED') return { success: false, error: 'Bill already cancelled' };

    const currentUser = this.getCurrentUser();
    const now = new Date().toISOString();
    const timestamp = Date.now();

    sale.status = 'CANCELLED';
    sale.cancelReason = reason;
    sale.cancelledBy = currentUser.name;
    sale.cancelledAt = now;

    // Roll back inventory
    const products = this.getProducts();
    const ledgerEntries: StockLedgerEntry[] = [];

    for (const item of sale.items) {
      for (const p of products) {
        const v = p.variants.find((variant) => variant.id === item.variantId);
        if (v) {
          const prev = v.stock;
          v.stock += item.quantity;
          ledgerEntries.push({
            id: 'led_cancel_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            date: now,
            timestamp,
            variantId: v.id,
            productId: p.id,
            productName: p.name,
            size: v.size,
            color: v.color,
            sku: v.sku,
            type: 'CUSTOMER_RETURN',
            quantityChange: item.quantity,
            previousStock: prev,
            newStock: v.stock,
            referenceId: billNumber,
            notes: `Cancelled Bill #${billNumber} - Reason: ${reason}`,
            actorName: currentUser.name,
          });
          break;
        }
      }
    }

    this.saveSales(sales);
    this.saveProducts(products);
    const ledger = this.getStockLedger();
    this.saveStockLedger([...ledgerEntries, ...ledger]);

    return { success: true };
  },

  /**
   * BACKUP AND RESTORE
   */
  exportBackup(): string {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      shop: 'TARA COLLECTION',
      settings: this.getSettings(),
      products: this.getProducts(),
      sales: this.getSales(),
      purchases: this.getPurchases(),
      suppliers: this.getSuppliers(),
      customers: this.getCustomers(),
      stockLedger: this.getStockLedger(),
      returns: this.getReturns(),
      expenses: this.getExpenses(),
      users: this.getUsers(),
    };
    return JSON.stringify(data, null, 2);
  },

  importBackup(jsonString: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.products || !parsed.settings) {
        return { success: false, error: 'Invalid backup file structure' };
      }
      if (parsed.settings) setLocal(KEYS.SETTINGS, parsed.settings);
      if (parsed.products) setLocal(KEYS.PRODUCTS, parsed.products);
      if (parsed.sales) setLocal(KEYS.SALES, parsed.sales);
      if (parsed.purchases) setLocal(KEYS.PURCHASES, parsed.purchases);
      if (parsed.suppliers) setLocal(KEYS.SUPPLIERS, parsed.suppliers);
      if (parsed.customers) setLocal(KEYS.CUSTOMERS, parsed.customers);
      if (parsed.stockLedger) setLocal(KEYS.STOCK_LEDGER, parsed.stockLedger);
      if (parsed.returns) setLocal(KEYS.RETURNS, parsed.returns);
      if (parsed.expenses) setLocal(KEYS.EXPENSES, parsed.expenses);
      if (parsed.users) setLocal(KEYS.USERS, parsed.users);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to parse JSON file' };
    }
  },

  resetToDemo(): void {
    localStorage.clear();
    this.init();
  },
};
