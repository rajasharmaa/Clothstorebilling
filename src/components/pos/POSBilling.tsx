import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Product,
  ProductVariant,
  CartItem,
  Sale,
  ShopSettings,
  User,
  ClothingCategory,
  CLOTHING_CATEGORIES,
  PaymentMode,
  SplitPaymentDetail,
  Customer,
} from '../../types';
import { StorageService } from '../../lib/storage';
import {
  calculateDiscount,
  calculateBillSummary,
  round2,
} from '../../lib/discount';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  UserCheck,
  CheckCircle2,
  Percent,
  IndianRupee,
  Layers,
  Sparkles,
  CreditCard,
  Banknote,
  QrCode,
  Tag,
  AlertCircle,
  X,
  Split,
} from 'lucide-react';
import { toast } from 'sonner';
import { ReceiptModal } from './ReceiptModal';
import { SplitPaymentModal } from './SplitPaymentModal';
import { DynamicUPIQR } from './DynamicUPIQR';
import { useLanguage } from '../../lib/i18n';

interface POSBillingProps {
  currentUser: User;
  shopSettings: ShopSettings;
}

const CATEGORY_ICONS: Record<string, string> = {
  'Jeans': '👖',
  'Shirt': '👔',
  'Lower': '🩳',
  'T-shirt': '👕',
  'Cargo': '📦',
  'Track Suit': '🏃',
  'Jacket': '🧥',
};
const getCategoryIcon = (cat: string) => CATEGORY_ICONS[cat] || '🏷️';

export const POSBilling: React.FC<POSBillingProps> = ({ currentUser, shopSettings }) => {
  const { t } = useLanguage();

  // Master data
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Active Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Bill-Level Discount state (Rupees only)
  const [billDiscountType, setBillDiscountType] = useState<'PERCENT' | 'AMOUNT'>('AMOUNT');
  const [billDiscountValue, setBillDiscountValue] = useState<number>(0);
  const [billDiscountPercentDisplay, setBillDiscountPercentDisplay] = useState<string>('0');
  const [billDiscountAmountDisplay, setBillDiscountAmountDisplay] = useState<string>('0');

  // Customer info
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [matchedCustomer, setMatchedCustomer] = useState<Customer | null>(null);

  // Payment State
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [splitDetails, setSplitDetails] = useState<SplitPaymentDetail | null>(null);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);

  // Receipt Modal State
  const [finalizedSale, setFinalizedSale] = useState<Sale | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Variant selector popover
  const [activeProductForVariant, setActiveProductForVariant] = useState<Product | null>(null);

  // Quick Custom Item Modal State
  const [isCustomItemModalOpen, setIsCustomItemModalOpen] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState<number>(500);
  const [customItemQty, setCustomItemQty] = useState<number>(1);
  const [customItemDiscount, setCustomItemDiscount] = useState<number>(
    shopSettings.defaultItemDiscountPerPiece || 50
  );

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim()) {
      toast.error('Item name likhein (e.g. Rain Coat)');
      return;
    }
    if (customItemPrice <= 0) {
      toast.error('Valid price daalein');
      return;
    }

    const lineBase = round2(customItemPrice * customItemQty);
    const discAmount = round2(Math.min(lineBase, customItemDiscount * customItemQty));
    const discPercent = lineBase > 0 ? round2((discAmount / lineBase) * 100) : 0;

    const customCartItem: CartItem = {
      variantId: 'custom_' + Date.now(),
      productId: 'custom_prod_' + Date.now(),
      productName: customItemName.trim(),
      category: 'Other',
      size: 'Free',
      color: 'Standard',
      sku: 'CUSTOM',
      barcode: '',
      mrp: customItemPrice,
      rate: customItemPrice,
      purchasePrice: 0,
      quantity: customItemQty,
      discountType: 'AMOUNT',
      discountPercent: discPercent,
      discountAmount: discAmount,
      finalPrice: round2(lineBase - discAmount),
      availableStock: 999,
      isCustom: true,
    };

    setCart((prev) => [customCartItem, ...prev]);
    toast.success(`Custom item added: ${customItemName}`);
    setIsCustomItemModalOpen(false);
    setCustomItemName('');
    setCustomItemPrice(500);
    setCustomItemQty(1);
    setCustomItemDiscount(shopSettings.defaultItemDiscountPerPiece || 50);
  };

  // Focus ref for search
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Max allowed discount based on user role
  const maxAllowedPercent = useMemo(() => {
    if (currentUser.role === 'ADMIN') return 100;
    if (currentUser.role === 'MANAGER') return shopSettings.managerMaxDiscount || 35;
    return shopSettings.cashierMaxDiscount || 15;
  }, [currentUser.role, shopSettings]);

  // Load products & customers
  const refreshData = () => {
    setProducts(StorageService.getProducts().filter((p) => p.active));
    setCustomers(StorageService.getCustomers());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === 'F4') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F8') {
        e.preventDefault();
        handleCheckout();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, billDiscountValue, paymentMode, cashReceived, customerMobile, customerName]);

  // Barcode / Fast Search matching
  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategory !== 'ALL') {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (!searchQuery.trim()) return list;

    const query = searchQuery.trim().toLowerCase();
    return list.filter((p) => {
      const matchName = p.name.toLowerCase().includes(query);
      const matchCode = p.code.toLowerCase().includes(query);
      const matchBrand = p.brand.toLowerCase().includes(query);
      const matchVariants = p.variants.some(
        (v) =>
          v.sku.toLowerCase().includes(query) ||
          v.barcode.toLowerCase().includes(query) ||
          v.size.toLowerCase().includes(query) ||
          v.color.toLowerCase().includes(query)
      );
      return matchName || matchCode || matchBrand || matchVariants;
    });
  }, [products, selectedCategory, searchQuery]);

  // Customer mobile lookup
  useEffect(() => {
    if (customerMobile.length >= 10) {
      const found = customers.find((c) => c.mobile.includes(customerMobile));
      if (found) {
        setMatchedCustomer(found);
        setCustomerName(found.name);
        setCustomerAddress(found.address || '');
      } else {
        setMatchedCustomer(null);
      }
    } else {
      setMatchedCustomer(null);
    }
  }, [customerMobile, customers]);

  // Add variant to cart
  const addVariantToCart = (product: Product, variant: ProductVariant) => {
    if (variant.stock <= 0 && !shopSettings.allowNegativeStock) {
      toast.error(`Out of Stock: ${product.name} (${variant.size} / ${variant.color})`);
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.variantId === variant.id);
      const defaultPerPc = shopSettings.defaultItemDiscountPerPiece ?? 50;

      if (existingIndex >= 0) {
        const item = prev[existingIndex];
        const newQty = item.quantity + 1;

        if (newQty > variant.stock && !shopSettings.allowNegativeStock) {
          toast.warning(`Cannot exceed available stock of ${variant.stock}`);
          return prev;
        }

        // Recompute item discount proportionally per piece
        const lineBase = round2(item.rate * newQty);
        let discAmount = 0;
        let discPercent = item.discountPercent;
        if (item.discountType === 'PERCENT') {
          discAmount = round2((lineBase * discPercent) / 100);
        } else {
          const perPc = item.quantity > 0 ? (item.discountAmount / item.quantity) : defaultPerPc;
          discAmount = round2(Math.min(lineBase, perPc * newQty));
          discPercent = lineBase > 0 ? round2((discAmount / lineBase) * 100) : 0;
        }

        const updated = [...prev];
        updated[existingIndex] = {
          ...item,
          quantity: newQty,
          discountAmount: discAmount,
          discountPercent: discPercent,
          finalPrice: round2(lineBase - discAmount),
        };
        return updated;
      } else {
        // New item in cart: automatically apply ₹50 discount per piece
        const lineBase = variant.sellingPrice;
        const initialDiscount = Math.min(lineBase, defaultPerPc);
        const discPercent = lineBase > 0 ? round2((initialDiscount / lineBase) * 100) : 0;

        const newItem: CartItem = {
          variantId: variant.id,
          productId: product.id,
          productName: product.name,
          category: product.category,
          size: variant.size,
          color: variant.color,
          sku: variant.sku,
          barcode: variant.barcode,
          mrp: variant.mrp,
          rate: variant.sellingPrice,
          purchasePrice: variant.purchasePrice,
          quantity: 1,
          discountType: 'AMOUNT',
          discountPercent: discPercent,
          discountAmount: initialDiscount,
          finalPrice: round2(lineBase - initialDiscount),
          availableStock: variant.stock,
        };
        return [newItem, ...prev];
      }
    });

    toast.success(`Added ${product.name} (${variant.size}/${variant.color})`);
    setActiveProductForVariant(null);
    setSearchQuery('');
  };

  // Direct Barcode Scan Handler
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const trimmed = searchQuery.trim().toLowerCase();
    // Search exact variant barcode or SKU
    for (const p of products) {
      const exactVariant = p.variants.find(
        (v) =>
          v.barcode.toLowerCase() === trimmed ||
          v.sku.toLowerCase() === trimmed ||
          p.code.toLowerCase() === trimmed
      );
      if (exactVariant) {
        addVariantToCart(p, exactVariant);
        setSearchQuery('');
        return;
      }
    }

    // If only one product filtered with 1 variant
    if (filteredProducts.length === 1 && filteredProducts[0].variants.length === 1) {
      addVariantToCart(filteredProducts[0], filteredProducts[0].variants[0]);
      setSearchQuery('');
    }
  };

  // Update item quantity
  const updateQuantity = (variantId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.variantId !== variantId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.availableStock && !shopSettings.allowNegativeStock) {
            toast.warning(`Available stock limit is ${item.availableStock}`);
            return item;
          }

          const defaultPerPc = shopSettings.defaultItemDiscountPerPiece ?? 50;
          const lineBase = round2(item.rate * newQty);
          let discAmount = 0;
          let discPercent = item.discountPercent;
          if (item.discountType === 'PERCENT') {
            discAmount = round2((lineBase * discPercent) / 100);
          } else {
            const perPc = item.quantity > 0 ? (item.discountAmount / item.quantity) : defaultPerPc;
            discAmount = round2(Math.min(lineBase, perPc * newQty));
            discPercent = lineBase > 0 ? round2((discAmount / lineBase) * 100) : 0;
          }

          return {
            ...item,
            quantity: newQty,
            discountAmount: discAmount,
            discountPercent: discPercent,
            finalPrice: round2(lineBase - discAmount),
          };
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove item
  const removeItem = (variantId: string) => {
    setCart((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  // Synchronized Item-Level Discount Input (% or ₹)
  const handleItemDiscountChange = (
    variantId: string,
    field: 'PERCENT' | 'AMOUNT',
    valStr: string
  ) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.variantId !== variantId) return item;

        const lineBase = round2(item.rate * item.quantity);
        const parsedVal = parseFloat(valStr) || 0;

        const res = calculateDiscount({
          baseAmount: lineBase,
          enteredType: field,
          value: parsedVal,
          maxPercentAllowed: maxAllowedPercent,
        });

        if (!res.isValid && res.errorMessage) {
          toast.error(res.errorMessage);
        }

        return {
          ...item,
          discountType: field,
          discountPercent: res.percent,
          discountAmount: res.amount,
          finalPrice: res.finalAmount,
        };
      })
    );
  };

  // Synchronized Bill-Level Discount Input (% or ₹)
  const handleBillDiscountChange = (field: 'PERCENT' | 'AMOUNT', valStr: string) => {
    setBillDiscountType(field);
    const num = parseFloat(valStr) || 0;
    setBillDiscountValue(num);

    const subtotalAfterItemDiscounts = cart.reduce((sum, item) => sum + item.finalPrice, 0);

    const res = calculateDiscount({
      baseAmount: subtotalAfterItemDiscounts,
      enteredType: field,
      value: num,
      maxPercentAllowed: maxAllowedPercent,
    });

    if (!res.isValid && res.errorMessage) {
      toast.error(res.errorMessage);
    }

    if (field === 'PERCENT') {
      setBillDiscountPercentDisplay(valStr);
      setBillDiscountAmountDisplay(res.amount ? String(res.amount) : '0');
    } else {
      setBillDiscountAmountDisplay(valStr);
      setBillDiscountPercentDisplay(res.percent ? String(res.percent) : '0');
    }
  };

  // Bill Summary Calculation
  const billSummary = useMemo(() => {
    return calculateBillSummary(
      cart.map((i) => ({
        rate: i.rate,
        quantity: i.quantity,
        discountAmount: i.discountAmount,
      })),
      {
        type: billDiscountType,
        value: billDiscountValue,
        maxPercent: maxAllowedPercent,
      }
    );
  }, [cart, billDiscountType, billDiscountValue, maxAllowedPercent]);

  // Cash change calculation
  const cashNum = parseFloat(cashReceived) || 0;
  const cashChange = cashNum > billSummary.finalPayable ? round2(cashNum - billSummary.finalPayable) : 0;
  const balanceDue =
    paymentMode === 'DUE'
      ? billSummary.finalPayable
      : paymentMode === 'CASH' && cashNum < billSummary.finalPayable
      ? round2(billSummary.finalPayable - cashNum)
      : paymentMode === 'SPLIT' && splitDetails
      ? round2(
          Math.max(
            0,
            billSummary.finalPayable -
              (splitDetails.cash + splitDetails.upi + splitDetails.card)
          )
        )
      : 0;

  // Checkout / Finalize Bill
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty! Add products first.');
      return;
    }

    // Check cashier discount permission
    if (billSummary.effectiveDiscountPercent > maxAllowedPercent) {
      toast.error(
        `Total discount ${billSummary.effectiveDiscountPercent.toFixed(
          1
        )}% exceeds your role limit of ${maxAllowedPercent}%`
      );
      return;
    }

    let amountReceived = billSummary.finalPayable;
    if (paymentMode === 'CASH') {
      amountReceived = cashNum > 0 ? Math.min(cashNum, billSummary.finalPayable) : billSummary.finalPayable;
    } else if (paymentMode === 'SPLIT' && splitDetails) {
      amountReceived = splitDetails.cash + splitDetails.upi + splitDetails.card;
    } else if (paymentMode === 'DUE') {
      amountReceived = 0;
    }

    const saleItems = cart.map((c) => ({
      variantId: c.variantId,
      productId: c.productId,
      productName: c.productName,
      category: c.category,
      size: c.size,
      color: c.color,
      sku: c.sku,
      quantity: c.quantity,
      rate: c.rate,
      purchasePriceSnapshot: c.purchasePrice,
      mrp: c.mrp,
      discountAmount: c.discountAmount,
      discountPercent: c.discountPercent,
      finalAmount: c.finalPrice,
    }));

    const result = StorageService.processSale({
      customerId: matchedCustomer?.id,
      customerName: customerName.trim() || undefined,
      customerMobile: customerMobile.trim() || undefined,
      customerAddress: customerAddress.trim() || undefined,
      items: saleItems,
      totalOriginalAmount: billSummary.totalOriginalAmount,
      totalItemDiscount: billSummary.totalItemDiscount,
      billDiscountType: billDiscountType,
      billDiscountPercent: billSummary.billDiscountPercent,
      billDiscountAmount: billSummary.billDiscountAmount,
      totalDiscount: billSummary.totalDiscount,
      effectiveDiscountPercent: billSummary.effectiveDiscountPercent,
      finalPayable: billSummary.finalPayable,
      amountReceived: amountReceived,
      balanceDue: balanceDue,
      paymentMode: paymentMode,
      splitDetails: splitDetails || undefined,
      cashierName: currentUser.name,
      cashierId: currentUser.id,
      status: 'COMPLETED',
    });

    if (!result.success || !result.sale) {
      toast.error(result.error || 'Failed to process sale transaction');
      return;
    }

    // Successfully finalized
    toast.success(`Bill #${result.sale.billNumber} created successfully!`);
    setFinalizedSale(result.sale);
    setIsReceiptModalOpen(true);
    refreshData();
  };

  // Reset cart for next bill
  const handleResetForNextBill = () => {
    setCart([]);
    setBillDiscountValue(0);
    setBillDiscountPercentDisplay('0');
    setBillDiscountAmountDisplay('0');
    setCustomerMobile('');
    setCustomerName('');
    setCustomerAddress('');
    setMatchedCustomer(null);
    setCashReceived('');
    setSplitDetails(null);
    setPaymentMode('CASH');
    searchInputRef.current?.focus();
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-100">
      {/* ================= LEFT MAIN AREA: CATALOG & SEARCH ================= */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200 bg-white">
        {/* Search Header Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by item name, category, or size..."
                className="w-full pl-9 pr-8 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm font-medium text-slate-800"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsCustomItemModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl border border-blue-600 shrink-0 flex items-center space-x-1.5 shadow-xs transition-all active:scale-95"
              title="Add item not in inventory"
            >
              <Plus className="w-4 h-4" />
              <span>Custom Item</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-xs">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-xl font-bold shrink-0 transition-all flex items-center space-x-1.5 ${
                selectedCategory === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/70'
              }`}
            >
              <span>✨ All Items</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedCategory === 'ALL' ? 'bg-blue-800/60 text-white' : 'bg-white text-slate-600'
                }`}
              >
                {products.length}
              </span>
            </button>
            {CLOTHING_CATEGORIES.map((cat) => {
              const count = products.filter((p) => p.category === cat).length;
              if (count === 0) return null;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold shrink-0 transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/70'
                  }`}
                >
                  <span>
                    {getCategoryIcon(cat)} {cat}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-blue-800/60 text-white' : 'bg-white text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid - 3 Columns with Spacious Touch-Friendly Cards */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin bg-slate-50/30">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-12">
              <Layers className="w-12 h-12 text-slate-300 stroke-[1.5]" />
              <p className="font-semibold text-sm">No products found</p>
              <p className="text-xs text-slate-400">Try searching with a different item name or size</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredProducts.map((p) => {
                const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
                const minPrice = Math.min(...p.variants.map((v) => v.sellingPrice));
                const maxPrice = Math.max(...p.variants.map((v) => v.sellingPrice));
                const priceLabel =
                  minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`;

                return (
                  <div
                    key={p.id}
                    onClick={() => setActiveProductForVariant(p)}
                    className="bg-white border border-slate-200/90 hover:border-blue-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 rounded-2xl p-4 cursor-pointer flex flex-col justify-between group relative select-none shadow-xs"
                  >
                    <div>
                      {/* Top: Category Tag with Emoji & Stock Status */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 font-extrabold px-2 py-0.5 rounded-lg uppercase tracking-wider text-[10px] whitespace-nowrap">
                          <span>{getCategoryIcon(p.category)}</span>
                          <span>{p.category}</span>
                        </span>
                        <span
                          className={`font-mono px-2 py-0.5 rounded-lg font-bold whitespace-nowrap text-[10px] border ${
                            totalStock <= 0
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : totalStock <= 3
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {totalStock <= 0 ? 'Out of Stock' : `${totalStock} in Stock`}
                        </span>
                      </div>

                      {/* Product Name */}
                      <h3 className="font-extrabold text-[13px] text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">Code: {p.code}</p>
                    </div>

                    {/* Bottom: Price on Left, Touch Action on Right */}
                    <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-mono font-black text-sm text-blue-700 whitespace-nowrap tracking-tight">
                          {priceLabel}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {p.variants.length} variant{p.variants.length > 1 ? 's' : ''}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="h-8 px-3 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white font-bold text-xs transition-all shadow-2xs flex items-center space-x-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ================= RIGHT AREA: CURRENT BILL & CART ================= */}
      <div className="w-[480px] xl:w-[520px] bg-white flex flex-col shrink-0 shadow-lg select-none">
        {/* Cart Top Bar */}
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm tracking-wide">
              Active Cash Memo ({billSummary.totalQuantity} items)
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1 rounded transition-colors"
                title="Clear Cart"
              >
                Clear Cart
              </button>
            )}
            <span className="text-xs font-mono font-bold bg-blue-600/40 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
              {StorageService.getNextBillNumber()}
            </span>
          </div>
        </div>

        {/* Customer Quick Input Bar */}
        <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center space-x-2 text-xs">
          <UserCheck className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Mobile (10 digits)"
            value={customerMobile}
            onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
            className="w-40 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs"
          />
          <input
            type="text"
            placeholder="Customer Name (Optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
          />
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin bg-slate-50/50 min-h-0">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-1.5 py-4">
              <ShoppingCart className="w-10 h-10 text-slate-300 stroke-[1.5]" />
              <p className="font-semibold text-xs">Cart is empty</p>
              <p className="text-[11px] text-slate-400 text-center max-w-xs">
                Tap any item on the left to add
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.variantId}
                className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs hover:border-slate-300 transition-all space-y-2"
              >
                {/* Item header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs leading-snug">
                      {item.productName}
                    </h5>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                        Size: {item.size}
                      </span>
                      <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                        Color: {item.color}
                      </span>
                      <span className="font-mono text-slate-400">₹{item.rate}/ea</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Qty & Price controls & Dual Discount inputs */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  {/* Quantity controls */}
                  <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.variantId, -1)}
                      className="w-5 h-5 rounded bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200 shadow-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center font-bold text-slate-800 font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, 1)}
                      className="w-5 h-5 rounded bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200 shadow-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Item Discount (Rupees only) */}
                  <div className="flex flex-col items-end">
                    <div className="flex items-center space-x-1 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 shadow-xs">
                      <span className="text-[11px] font-bold text-slate-500">Disc ₹:</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.discountAmount || ''}
                        onChange={(e) =>
                          handleItemDiscountChange(item.variantId, 'AMOUNT', e.target.value)
                        }
                        placeholder="0"
                        className="w-14 text-xs font-bold text-right bg-transparent focus:outline-none text-emerald-700 font-mono"
                      />
                    </div>
                    {item.discountAmount > 0 && (
                      <span className="text-[10px] text-emerald-600 font-bold mt-0.5">
                        {t.saved} -₹{item.discountAmount.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Item Original Selling Price Line Total */}
                  <div className="text-right">
                    <div className="font-extrabold text-sm text-slate-900 font-mono">
                      ₹{(item.rate * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill-Level Discount & Checkout Section (Scroll-safe, Never Cuts Off) */}
        <div className="p-3 bg-white border-t border-slate-200 space-y-2 overflow-y-auto max-h-[72vh] scrollbar-thin shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>Bill-Level Discount:</span>
            </span>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 shadow-xs">
                <span className="text-xs font-bold text-slate-600">₹</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    billDiscountAmountDisplay === '0' && billDiscountValue === 0
                      ? ''
                      : billDiscountAmountDisplay
                  }
                  onChange={(e) => handleBillDiscountChange('AMOUNT', e.target.value)}
                  placeholder="0"
                  className="w-16 text-xs font-bold text-right bg-transparent focus:outline-none text-emerald-700 font-mono"
                />
              </div>

              {/* Quick discount chips */}
              <div className="flex items-center space-x-1">
                {[50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleBillDiscountChange('AMOUNT', String(amt))}
                    className="px-2 py-1 text-[11px] font-bold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 active:scale-95"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Complete Financial Breakdown */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-700 font-medium">
              <span>Subtotal:</span>
              <span className="font-bold font-mono">
                ₹{billSummary.totalOriginalAmount.toFixed(2)}
              </span>
            </div>

            {billSummary.totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>{t.totalDiscount}</span>
                <span className="font-bold font-mono">
                  -₹{billSummary.totalDiscount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="pt-1.5 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-800">{t.finalPayable}</span>
              <span className="text-xl font-black text-blue-700 font-mono">
                ₹{billSummary.finalPayable.toFixed(2)}
              </span>
            </div>

            {billSummary.totalDiscount > 0 && (
              <div className="bg-emerald-100/70 border border-emerald-300 text-emerald-800 px-2 py-1 rounded-md text-[11px] font-bold text-center">
                🎉 {t.youSaved} ₹{billSummary.totalDiscount.toFixed(2)}!
              </div>
            )}
          </div>

          {/* Payment Mode Selector */}
          <div className="grid grid-cols-5 gap-1.5 pt-1 text-xs font-bold">
            {[
              { id: 'CASH', label: `💵 ${t.cash}` },
              { id: 'UPI', label: `📱 ${t.upi}` },
              { id: 'CARD', label: `💳 ${t.card}` },
              { id: 'SPLIT', label: `✂️ ${t.split}` },
              { id: 'DUE', label: `⏳ ${t.creditDue}` },
            ].map(({ id, label }) => {
              const isSelected = paymentMode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setPaymentMode(id as PaymentMode);
                    if (id === 'SPLIT') setIsSplitModalOpen(true);
                  }}
                  className={`py-2 px-1 rounded-xl border text-center transition-all ${
                    isSelected
                      ? id === 'CASH'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : id === 'UPI'
                        ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                        : id === 'DUE'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                        : 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {id === 'SPLIT' && splitDetails ? '✂️ Split ✓' : label}
                </button>
              );
            })}
          </div>

          {/* Cash Received & Change Return with Quick Tender Chips */}
          {paymentMode === 'CASH' && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center space-x-2 text-xs">
                <div className="flex-1 flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500">
                  <span className="text-slate-500 font-bold">Cash Received: ₹</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="flex-1 font-bold text-sm bg-transparent focus:outline-none font-mono"
                  />
                </div>
                {cashChange > 0 && (
                  <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg font-extrabold text-xs">
                    वापस (Change): ₹{cashChange.toFixed(2)}
                  </div>
                )}
              </div>
              {/* Quick Cash Tender Chips */}
              {billSummary.finalPayable > 0 && (
                <div className="flex items-center space-x-1 text-[11px]">
                  <span className="text-slate-400 font-semibold mr-1">Quick:</span>
                  <button
                    type="button"
                    onClick={() => setCashReceived(String(billSummary.finalPayable))}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 font-semibold"
                  >
                    Exact
                  </button>
                  {[500, 1000, 2000]
                    .filter((den) => den >= billSummary.finalPayable)
                    .slice(0, 3)
                    .map((den) => (
                      <button
                        key={den}
                        type="button"
                        onClick={() => setCashReceived(String(den))}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 font-semibold"
                      >
                        ₹{den}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Automatic Dynamic UPI QR for Exact Bill Amount */}
          {paymentMode === 'UPI' && (
            <div className="pt-1">
              <DynamicUPIQR
                amount={billSummary.finalPayable}
                upiId={shopSettings.upiId}
                payeeName={shopSettings.shopName}
                billNumber={StorageService.getNextBillNumber()}
              />
            </div>
          )}

          {/* Generate Bill / Checkout Action */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 active:scale-[0.99]"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Generate & Print Slip</span>
            {billSummary.finalPayable > 0 && (
              <span className="font-mono bg-blue-700/60 px-2 py-0.5 rounded-lg">
                ₹{billSummary.finalPayable.toFixed(2)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ================= VARIANT SELECTOR MODAL ================= */}
      {activeProductForVariant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-blue-400 bg-blue-900/50 px-2 py-0.5 rounded">
                  {activeProductForVariant.category}
                </span>
                <h3 className="font-bold text-base mt-1">{activeProductForVariant.name}</h3>
                <p className="text-xs text-slate-400">Code: {activeProductForVariant.code}</p>
              </div>
              <button
                onClick={() => setActiveProductForVariant(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Select Size & Color Variant:
              </p>
              {activeProductForVariant.variants.map((v) => (
                <div
                  key={v.id}
                  onClick={() => addVariantToCart(activeProductForVariant, v)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    v.stock <= 0 && !shopSettings.allowNegativeStock
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : 'bg-white border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 shadow-xs'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-800">
                      {v.size}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800">
                        {v.color} - Size {v.size}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        Rate: ₹{v.sellingPrice}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-sm text-blue-700">₹{v.sellingPrice}</div>
                    <div className="text-xs text-slate-400 line-through">MRP: ₹{v.mrp}</div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        v.stock <= 0
                          ? 'bg-rose-100 text-rose-700'
                          : v.stock <= 3
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {v.stock} in Stock
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveProductForVariant(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= QUICK CUSTOM ITEM MODAL ================= */}
      {isCustomItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Add Custom Item (अन-लिस्टेड कपड़ा)</h3>
                <p className="text-xs text-slate-400">Add clothing not in catalog</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomItemModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomItem} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Item Name (कपड़े का नाम) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rain Coat ya Track Suit"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Selling Rate (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={customItemPrice || ''}
                    onChange={(e) => setCustomItemPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-bold font-mono border border-slate-300 rounded-xl text-blue-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={customItemQty}
                    onChange={(e) => setCustomItemQty(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm font-bold font-mono border border-slate-300 rounded-xl text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.itemDiscountPrompt}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={customItemDiscount || ''}
                  onChange={(e) => setCustomItemDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold font-mono border border-slate-300 rounded-xl text-emerald-700"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCustomItemModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Add to Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= SPLIT PAYMENT MODAL ================= */}
      <SplitPaymentModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        totalPayable={billSummary.finalPayable}
        onConfirm={(split) => {
          setSplitDetails(split);
          toast.success('Split payment modes updated');
        }}
      />

      {/* ================= RECEIPT & PRINT MODAL ================= */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        sale={finalizedSale}
        settings={shopSettings}
        onNewBill={handleResetForNextBill}
      />
    </div>
  );
};
