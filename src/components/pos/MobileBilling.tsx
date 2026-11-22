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
import { calculateDiscount, calculateBillSummary, round2 } from '../../lib/discount';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  Tag,
  X,
  CreditCard,
  Banknote,
  QrCode,
  Share2,
  Printer,
  Cable,
  RotateCcw,
  Sparkles,
  ArrowRight,
  UserCheck,
  ChevronUp,
  SlidersHorizontal,
  Camera,
} from 'lucide-react';
import { CameraScannerModal } from './CameraScannerModal';
import { toast } from 'sonner';
import { ReceiptModal } from './ReceiptModal';
import { SplitPaymentModal } from './SplitPaymentModal';
import { DynamicUPIQR } from './DynamicUPIQR';
import { generateWhatsAppMessage, triggerPrint } from '../../lib/receipt';
import { sharePDFOnWhatsApp } from '../../lib/pdfGenerator';
import { useLanguage } from '../../lib/i18n';

interface MobileBillingProps {
  currentUser: User;
  shopSettings: ShopSettings;
  onCartChange?: (count: number) => void;
}

export const MobileBilling: React.FC<MobileBillingProps> = ({
  currentUser,
  shopSettings,
  onCartChange,
}) => {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Bill-Level Discount state
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

  // Mobile Bottom Sheets & Modal States
  const [selectedProductForSheet, setSelectedProductForSheet] = useState<Product | null>(null);
  const [sheetSelectedVariant, setSheetSelectedVariant] = useState<ProductVariant | null>(null);
  const [sheetQuantity, setSheetQuantity] = useState<number>(1);

  // Quick Custom Item Sheet
  const [isCustomItemSheetOpen, setIsCustomItemSheetOpen] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState<number>(500);
  const [customItemQty, setCustomItemQty] = useState<number>(1);
  const [customItemDiscount, setCustomItemDiscount] = useState<number>(50);

  // Cart Sheet & Payment Sheet
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);

  // Success Screen State
  const [finalizedSale, setFinalizedSale] = useState<Sale | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleScannedBarcode = (code: string) => {
    const trimmed = code.trim().toLowerCase();
    for (const p of products) {
      const matched = p.variants.find(
        (v) =>
          v.barcode.toLowerCase() === trimmed ||
          v.sku.toLowerCase() === trimmed
      );
      if (matched) {
        if (matched.stock <= 0 && !shopSettings.allowNegativeStock) {
          toast.error(`Out of Stock: ${matched.size} / ${matched.color}`);
          return;
        }
        const defaultPerPc = defaultPerPieceDiscount;
        const lineBase = round2(matched.sellingPrice * 1);
        const initialDiscount = round2(Math.min(lineBase, defaultPerPc * 1));
        const discPercent = lineBase > 0 ? round2((initialDiscount / lineBase) * 100) : 0;
        setCart((prev) => {
          const existingIndex = prev.findIndex((i) => i.variantId === matched.id);
          if (existingIndex >= 0) {
            const item = prev[existingIndex];
            const newQty = item.quantity + 1;
            const updatedLineBase = round2(item.rate * newQty);
            const disc = round2(Math.min(updatedLineBase, defaultPerPc * newQty));
            const updated = [...prev];
            updated[existingIndex] = {
              ...item,
              quantity: newQty,
              discountAmount: disc,
              discountPercent: updatedLineBase > 0 ? round2((disc / updatedLineBase) * 100) : 0,
              finalPrice: round2(updatedLineBase - disc),
            };
            return updated;
          } else {
            return [
              {
                variantId: matched.id,
                productId: p.id,
                productName: p.name,
                category: p.category,
                size: matched.size,
                color: matched.color,
                sku: matched.sku || '',
                barcode: matched.barcode || '',
                mrp: matched.mrp,
                rate: matched.sellingPrice,
                purchasePrice: matched.purchasePrice,
                quantity: 1,
                discountType: 'AMOUNT',
                discountPercent: discPercent,
                discountAmount: initialDiscount,
                finalPrice: round2(lineBase - initialDiscount),
                availableStock: matched.stock,
              },
              ...prev,
            ];
          }
        });
        toast.success(`Scanned: ${p.name} (${matched.size})`);
        return;
      }
    }
    setSearchQuery(code);
    toast.info(`Search for: ${code}`);
  };

  // Max allowed discount based on user role
  const maxAllowedPercent = useMemo(() => {
    if (currentUser.role === 'ADMIN') return 100;
    if (currentUser.role === 'MANAGER') return shopSettings.managerMaxDiscount || 35;
    return shopSettings.cashierMaxDiscount || 15;
  }, [currentUser.role, shopSettings]);

  const defaultPerPieceDiscount = shopSettings.defaultItemDiscountPerPiece ?? 50;

  const reloadData = () => {
    setProducts(StorageService.getProducts().filter((p) => p.active));
    setCustomers(StorageService.getCustomers());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Sync cart count to parent bottom navigation badge
  useEffect(() => {
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    onCartChange?.(totalQty);
  }, [cart, onCartChange]);

  // Customer phone lookup
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

  // Fast Mobile Search (Name, Category, Size, Color)
  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategory !== 'ALL') {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (!searchQuery.trim()) return list;

    const query = searchQuery.trim().toLowerCase();
    return list.filter((p) => {
      const matchName = p.name.toLowerCase().includes(query);
      const matchCat = p.category.toLowerCase().includes(query);
      const matchBrand = p.brand.toLowerCase().includes(query);
      const matchVariants = p.variants.some(
        (v) =>
          v.size.toLowerCase().includes(query) ||
          v.color.toLowerCase().includes(query) ||
          `size ${v.size.toLowerCase()}`.includes(query)
      );
      return matchName || matchCat || matchBrand || matchVariants;
    });
  }, [products, selectedCategory, searchQuery]);

  // Open Product Variant Selection Bottom Sheet
  const handleOpenProductSheet = (product: Product) => {
    setSelectedProductForSheet(product);
    setSheetQuantity(1);
    if (product.variants.length > 0) {
      // Pick first in-stock variant or first variant
      const inStock = product.variants.find((v) => v.stock > 0);
      setSheetSelectedVariant(inStock || product.variants[0]);
    } else {
      setSheetSelectedVariant(null);
    }
  };

  // Add Variant from Bottom Sheet to Bill
  const handleAddVariantFromSheet = () => {
    if (!selectedProductForSheet || !sheetSelectedVariant) return;

    if (sheetSelectedVariant.stock <= 0 && !shopSettings.allowNegativeStock) {
      toast.error(`Out of Stock: ${sheetSelectedVariant.size} / ${sheetSelectedVariant.color}`);
      return;
    }

    const defaultPerPc = defaultPerPieceDiscount;

    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.variantId === sheetSelectedVariant.id);
      if (existingIndex >= 0) {
        const item = prev[existingIndex];
        const newQty = item.quantity + sheetQuantity;

        if (newQty > sheetSelectedVariant.stock && !shopSettings.allowNegativeStock) {
          toast.warning(`Stock limit: ${sheetSelectedVariant.stock} pcs available`);
          return prev;
        }

        const lineBase = round2(item.rate * newQty);
        const perPc = item.quantity > 0 ? item.discountAmount / item.quantity : defaultPerPc;
        const discAmount = round2(Math.min(lineBase, perPc * newQty));
        const discPercent = lineBase > 0 ? round2((discAmount / lineBase) * 100) : 0;

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
        const lineBase = round2(sheetSelectedVariant.sellingPrice * sheetQuantity);
        const initialDiscount = round2(
          Math.min(lineBase, defaultPerPc * sheetQuantity)
        );
        const discPercent = lineBase > 0 ? round2((initialDiscount / lineBase) * 100) : 0;

        const newItem: CartItem = {
          variantId: sheetSelectedVariant.id,
          productId: selectedProductForSheet.id,
          productName: selectedProductForSheet.name,
          category: selectedProductForSheet.category,
          size: sheetSelectedVariant.size,
          color: sheetSelectedVariant.color,
          sku: sheetSelectedVariant.sku || '',
          barcode: sheetSelectedVariant.barcode || '',
          mrp: sheetSelectedVariant.mrp,
          rate: sheetSelectedVariant.sellingPrice,
          purchasePrice: sheetSelectedVariant.purchasePrice,
          quantity: sheetQuantity,
          discountType: 'AMOUNT',
          discountPercent: discPercent,
          discountAmount: initialDiscount,
          finalPrice: round2(lineBase - initialDiscount),
          availableStock: sheetSelectedVariant.stock,
        };
        return [newItem, ...prev];
      }
    });

    toast.success(`Jod diya: ${selectedProductForSheet.name} (${sheetSelectedVariant.size})`);
    setSelectedProductForSheet(null);
    setSheetSelectedVariant(null);
  };

  // Add Custom Item (Uninventoried item)
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
    toast.success(`Custom Item jod diya: ${customItemName}`);
    setIsCustomItemSheetOpen(false);
    setCustomItemName('');
    setCustomItemPrice(500);
    setCustomItemQty(1);
    setCustomItemDiscount(50);
  };

  // Update item quantity in cart
  const updateQuantity = (variantId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.variantId !== variantId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (
            !item.isCustom &&
            newQty > item.availableStock &&
            !shopSettings.allowNegativeStock
          ) {
            toast.warning(`Stock limit: ${item.availableStock} pcs`);
            return item;
          }

          const lineBase = round2(item.rate * newQty);
          let discAmount = 0;
          let discPercent = item.discountPercent;
          if (item.discountType === 'PERCENT') {
            discAmount = round2((lineBase * discPercent) / 100);
          } else {
            const perPc =
              item.quantity > 0 ? item.discountAmount / item.quantity : defaultPerPieceDiscount;
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

  const removeItem = (variantId: string) => {
    setCart((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  // Synchronized item discount change
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

  // Bill-Level Discount change
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
  const cashChange =
    cashNum > billSummary.finalPayable ? round2(cashNum - billSummary.finalPayable) : 0;
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

  // Finalize Sale Transaction
  const handleFinalizeBill = () => {
    if (cart.length === 0) {
      toast.error('Cart khaali hai! Product jodein.');
      return;
    }

    let amountReceived = billSummary.finalPayable;
    if (paymentMode === 'CASH') {
      amountReceived =
        cashNum > 0 ? Math.min(cashNum, billSummary.finalPayable) : billSummary.finalPayable;
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
      isCustom: c.isCustom,
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
      toast.error(result.error || 'Bill create karne me samasya aayi');
      return;
    }

    // Success! Show Success View
    setFinalizedSale(result.sale);
    setIsPaymentSheetOpen(false);
    setIsCartSheetOpen(false);
    setCart([]);
    setBillDiscountValue(0);
    setBillDiscountAmountDisplay('0');
    setCashReceived('');
    setSplitDetails(null);
    setCustomerMobile('');
    setCustomerName('');
    reloadData();
  };

  const handlePrintSlip = async (sale: Sale) => {
    const res = await triggerPrint(sale, shopSettings, shopSettings.receiptPaperSize || '80mm');
    if (!res.success && res.message) {
      toast.error(res.message);
    } else {
      toast.success(res.message || 'Parchi print dialog open!');
    }
  };

  const handleOTGPrint = async (sale: Sale) => {
    const res = await triggerPrint(sale, shopSettings, shopSettings.receiptPaperSize || '80mm', 'rawbt');
    if (res.message) {
      if (res.success) toast.success(res.message);
      else toast.info(res.message);
    }
  };

  const handleWhatsAppShare = async (sale: Sale) => {
    toast.loading(language === 'hi' ? 'WhatsApp PDF तैयार हो रहा है...' : 'Preparing WhatsApp PDF...', { id: 'mob-pdf' });
    try {
      const res = await sharePDFOnWhatsApp(sale, shopSettings, sale.customerMobile);
      if (res.method === 'web_share') {
        toast.success(language === 'hi' ? 'WhatsApp पर बिल PDF शेयर कर दिया गया!' : 'Bill PDF shared via WhatsApp!', { id: 'mob-pdf' });
      } else {
        toast.success(language === 'hi' ? 'PDF डाउनलोड हो गया! WhatsApp चैट खुल गई है।' : 'PDF downloaded! WhatsApp chat opened.', { id: 'mob-pdf' });
      }
    } catch (e) {
      toast.error(language === 'hi' ? 'WhatsApp शेयर करने में समस्या आई' : 'Could not share on WhatsApp', { id: 'mob-pdf' });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-0 relative select-none">
      {/* ================= TOP SEARCH & FILTER BAR ================= */}
      <div className="bg-white border-b border-slate-200 p-3 space-y-2.5 shrink-0 shadow-xs">
        {/* Search Bar + Quick Custom Item Button */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Product search karein (Jeans, Shirt, 32...)"
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-medium text-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="p-2 bg-slate-100 hover:bg-slate-200 active:scale-95 border border-slate-300 text-slate-700 rounded-xl flex items-center justify-center shrink-0 h-10 w-10"
            title="Scan Barcode with Camera"
          >
            <Camera className="w-5 h-5 text-blue-600" />
          </button>

          <button
            onClick={() => setIsCustomItemSheetOpen(true)}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 active:scale-95 border border-blue-200 text-blue-700 font-bold text-xs rounded-xl flex items-center space-x-1 shrink-0 h-10"
            title="Custom Item"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Custom</span>
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Items
          </button>
          {CLOTHING_CATEGORIES.map((cat) => {
            const isSel = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
                  isSel
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= PRODUCT CARDS FEED ================= */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 pb-28">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-sm">Koi Product Nahi Mila</div>
              <p className="text-xs text-slate-400 mt-0.5">
                Alag naam ya size search karein, ya direct Custom Item jodein.
              </p>
            </div>
            <button
              onClick={() => setIsCustomItemSheetOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
            >
              + Add Custom Item
            </button>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
            const minPrice = Math.min(...p.variants.map((v) => v.sellingPrice));
            const maxPrice = Math.max(...p.variants.map((v) => v.sellingPrice));
            const priceLabel =
              minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`;

            const availableSizes = Array.from(new Set(p.variants.map((v) => v.size))).join(' • ');
            const availableColors = Array.from(new Set(p.variants.map((v) => v.color))).join(' • ');

            return (
              <div
                key={p.id}
                onClick={() => handleOpenProductSheet(p)}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs hover:border-blue-400 active:scale-[0.99] transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="space-y-1 pr-3 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                      {p.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        totalStock <= 0
                          ? 'bg-rose-100 text-rose-700'
                          : totalStock <= 3
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {totalStock <= 0 ? 'Out of Stock' : `${totalStock} pcs in stock`}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1">
                    {p.name}
                  </h3>

                  <div className="text-[11px] text-slate-500 font-medium">
                    Sizes: <span className="font-semibold text-slate-700">{availableSizes}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Colours: {availableColors}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-black text-blue-700 font-mono">{priceLabel}</div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                    Auto -₹{defaultPerPieceDiscount} off
                  </div>
                  <button className="mt-2 px-3 py-1.5 bg-blue-600 text-white font-black text-xs rounded-xl shadow-sm flex items-center space-x-1 ml-auto">
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>ADD</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================= STICKY CHECKOUT BAR (WHEN CART HAS ITEMS) ================= */}
      {cart.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-30 bg-slate-900 text-white px-4 py-3 shadow-2xl flex items-center justify-between border-t border-slate-800">
          <div onClick={() => setIsCartSheetOpen(true)} className="cursor-pointer space-y-0.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-400">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>
                {billSummary.totalQuantity} Items • Total ₹{billSummary.finalPayable.toFixed(0)}
              </span>
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            </div>
            {billSummary.totalDiscount > 0 && (
              <div className="text-[11px] text-emerald-400 font-bold font-mono">
                {t.saved} ₹{billSummary.totalDiscount.toFixed(0)}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCartSheetOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-500/30 flex items-center space-x-1"
          >
            <span>{t.viewBillPrint} →</span>
          </button>
        </div>
      )}

      {/* ================= BOTTOM SHEET 1: VARIANT SELECTOR ================= */}
      {selectedProductForSheet && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            {/* Sheet Handle & Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  {selectedProductForSheet.category}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 mt-1">
                  {selectedProductForSheet.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProductForSheet(null)}
                className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Size Selector */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-2">
                  1. Size Chuniye:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {selectedProductForSheet.variants.map((v) => {
                    const isSelected = sheetSelectedVariant?.id === v.id;
                    const isOut = v.stock <= 0 && !shopSettings.allowNegativeStock;

                    return (
                      <button
                        key={v.id}
                        disabled={isOut}
                        onClick={() => setSheetSelectedVariant(v)}
                        className={`py-2.5 px-2 rounded-xl font-bold text-xs border flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : isOut
                            ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed'
                            : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        <span className="text-sm font-black">{v.size}</span>
                        <span className="text-[10px] opacity-80 font-mono mt-0.5">
                          {isOut ? 'Out' : `${v.stock} left`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Variant Pricing and Colour info */}
              {sheetSelectedVariant && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 text-xs">
                      Colour: <span className="text-blue-700">{sheetSelectedVariant.color}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Rate: ₹{sheetSelectedVariant.sellingPrice} | MRP: ₹{sheetSelectedVariant.mrp}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      ✓ Auto ₹{defaultPerPieceDiscount} off/pc
                    </span>
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-2">
                  2. Kitne Piece (Quantity)?
                </label>
                <div className="flex items-center space-x-3 bg-slate-100 p-1.5 rounded-2xl w-fit">
                  <button
                    onClick={() => setSheetQuantity((q) => Math.max(1, q - 1))}
                    className="w-11 h-11 rounded-xl bg-white text-slate-800 font-black text-lg flex items-center justify-center shadow-xs active:scale-95"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center font-black text-base font-mono text-slate-900">
                    {sheetQuantity}
                  </span>
                  <button
                    onClick={() => setSheetQuantity((q) => q + 1)}
                    className="w-11 h-11 rounded-xl bg-white text-slate-800 font-black text-lg flex items-center justify-center shadow-xs active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Action */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <button
                onClick={handleAddVariantFromSheet}
                disabled={!sheetSelectedVariant || (sheetSelectedVariant.stock <= 0 && !shopSettings.allowNegativeStock)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center space-x-2"
              >
                <span>ADD TO BILL</span>
                {sheetSelectedVariant && (
                  <span className="font-mono">
                    (₹
                    {(
                      sheetSelectedVariant.sellingPrice * sheetQuantity -
                      defaultPerPieceDiscount * sheetQuantity
                    ).toFixed(0)}
                    )
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BOTTOM SHEET 2: QUICK CUSTOM ITEM ================= */}
      {isCustomItemSheetOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Custom Item Jodein
                </h3>
                <p className="text-[11px] text-slate-500">
                  Bina inventory ka item direct bill me jodne ke liye
                </p>
              </div>
              <button
                onClick={() => setIsCustomItemSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomItem} className="p-4 space-y-3.5 text-xs overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Item Ka Naam *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rain Coat ya Men's Belt"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Selling Rate (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={customItemPrice || ''}
                    onChange={(e) => setCustomItemPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 text-base font-bold font-mono border border-slate-300 rounded-xl text-blue-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={customItemQty}
                    onChange={(e) => setCustomItemQty(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2.5 text-base font-bold font-mono border border-slate-300 rounded-xl text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Discount Per Piece (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={customItemDiscount || ''}
                  onChange={(e) => setCustomItemDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 text-base font-bold font-mono border border-slate-300 rounded-xl text-emerald-700"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/30"
                >
                  ADD TO BILL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= BOTTOM SHEET 3: CART & DUAL DISCOUNT ================= */}
      {isCartSheetOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">
                  Active Bill ({billSummary.totalQuantity} Pieces)
                </h3>
              </div>
              <button
                onClick={() => setIsCartSheetOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Bar */}
            <div className="p-2.5 bg-slate-100 border-b border-slate-200 flex items-center space-x-2 text-xs shrink-0">
              <UserCheck className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder="Mobile (Optional)"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-32 px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
              />
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="flex-1 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {cart.map((item) => (
                <div
                  key={item.variantId}
                  className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-snug">
                        {item.productName}
                      </h4>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                          Size: {item.size}
                        </span>
                        <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                          {item.color}
                        </span>
                        <span className="font-mono text-slate-400">@ ₹{item.rate}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    {/* Stepper */}
                    <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => updateQuantity(item.variantId, -1)}
                        className="w-6 h-6 rounded-lg bg-white text-slate-800 font-bold flex items-center justify-center shadow-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-slate-900 font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variantId, 1)}
                        className="w-6 h-6 rounded-lg bg-white text-slate-800 font-bold flex items-center justify-center shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Discount Input */}
                    <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                      <span className="text-[10px] font-bold text-slate-500">Disc ₹:</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.discountAmount || ''}
                        onChange={(e) =>
                          handleItemDiscountChange(item.variantId, 'AMOUNT', e.target.value)
                        }
                        className="w-14 text-xs font-bold text-right bg-transparent focus:outline-none text-emerald-700"
                      />
                    </div>

                    {/* Total */}
                    <div className="text-right">
                      <div className="font-black text-sm text-slate-900 font-mono">
                        ₹{(item.rate * item.quantity).toFixed(2)}
                      </div>
                      {item.discountAmount > 0 && (
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          {t.discount}: -₹{item.discountAmount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Bill-level Discount Bar */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>Extra Bill Discount:</span>
                </span>
                <div className="flex items-center space-x-1 bg-white border border-slate-300 rounded-lg px-2 py-1">
                  <span className="font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={billDiscountAmountDisplay === '0' ? '' : billDiscountAmountDisplay}
                    onChange={(e) => handleBillDiscountChange('AMOUNT', e.target.value)}
                    placeholder="0"
                    className="w-16 text-xs font-bold text-right bg-transparent focus:outline-none text-emerald-700 font-mono"
                  />
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{billSummary.totalOriginalAmount.toFixed(2)}</span>
                </div>
                {billSummary.totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Total Discount:</span>
                    <span className="font-mono">-₹{billSummary.totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-1.5 border-t border-slate-200 flex justify-between items-baseline text-sm font-bold text-slate-900">
                  <span>Grand Total:</span>
                  <span className="text-xl font-black text-blue-700 font-mono">
                    ₹{billSummary.finalPayable.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Button to Proceed */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <button
                onClick={() => {
                  setIsCartSheetOpen(false);
                  setIsPaymentSheetOpen(true);
                }}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center space-x-2"
              >
                <span>CONTINUE TO PAYMENT (₹{billSummary.finalPayable.toFixed(2)})</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BOTTOM SHEET 4: PAYMENT SCREEN ================= */}
      {isPaymentSheetOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">Payment & Cash Memo</h3>
                <p className="text-xs text-slate-400">Total Payable Amount</p>
              </div>
              <button
                onClick={() => setIsPaymentSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs overflow-y-auto">
              {/* Grand Total Display */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-center">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kul Rashi (Payable)
                </div>
                <div className="text-3xl font-black text-blue-700 font-mono mt-1">
                  ₹{billSummary.finalPayable.toFixed(2)}
                </div>
                {billSummary.totalDiscount > 0 && (
                  <div className="text-xs font-bold text-emerald-700 mt-1">
                    🎉 Customer Bachat: ₹{billSummary.totalDiscount.toFixed(2)}!
                  </div>
                )}
              </div>

              {/* Payment Mode Selector */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-2">
                  Select Payment Mode:
                </label>
                <div className="grid grid-cols-4 gap-2 font-bold">
                  {(['CASH', 'UPI', 'CARD', 'DUE'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`py-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        paymentMode === mode
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {mode === 'CASH' ? (
                        <Banknote className="w-4 h-4 mb-1" />
                      ) : mode === 'UPI' ? (
                        <QrCode className="w-4 h-4 mb-1" />
                      ) : mode === 'CARD' ? (
                        <CreditCard className="w-4 h-4 mb-1" />
                      ) : (
                        <Tag className="w-4 h-4 mb-1" />
                      )}
                      <span>{mode}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash Received input */}
              {paymentMode === 'CASH' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-700">Cash Received: ₹</span>
                    <input
                      type="number"
                      step="any"
                      placeholder={billSummary.finalPayable.toFixed(2)}
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-base"
                    />
                  </div>
                  {cashChange > 0 && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 font-bold flex justify-between">
                      <span>Change Wapas Dena Hai:</span>
                      <span className="font-mono text-sm">₹{cashChange.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Automatic Dynamic UPI QR Code for Exact Bill Amount */}
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
            </div>

            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <button
                onClick={handleFinalizeBill}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>GENERATE CASH MEMO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUCCESS STATE SCREEN (AFTER BILL FINALIZATION) ================= */}
      {finalizedSale && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center space-y-5 animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">Bill Ban Gaya!</h2>
              <p className="text-xs font-mono font-bold text-blue-700">
                #{finalizedSale.billNumber}
              </p>
              <div className="text-3xl font-black font-mono text-slate-900 mt-2">
                ₹{finalizedSale.finalPayable.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500">
                Payment: <span className="font-bold">{finalizedSale.paymentMode}</span> •{' '}
                {finalizedSale.items.length} items
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handlePrintSlip(finalizedSale)}
                  className="py-3 px-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-md shadow-blue-500/30 flex items-center justify-center space-x-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>🖨️ {language === 'hi' ? 'सिस्टम प्रिंट' : 'SYSTEM PRINT'}</span>
                </button>

                <button
                  onClick={() => handleOTGPrint(finalizedSale)}
                  className="py-3 px-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-1.5"
                >
                  <Cable className="w-4 h-4" />
                  <span>🔌 {language === 'hi' ? 'OTG थर्मल' : 'OTG USB PRINT'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleWhatsAppShare(finalizedSale)}
                  className="py-3 bg-emerald-50 hover:bg-emerald-100 active:scale-98 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp PDF</span>
                </button>
                <button
                  onClick={() => setIsReceiptModalOpen(true)}
                  className="py-3 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-bold text-xs rounded-xl"
                >
                  View / PDF
                </button>
              </div>

              <button
                onClick={() => setFinalizedSale(null)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 active:scale-98 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 mt-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Naya Bill Shuru Karein</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= RECEIPT VIEW & PDF FALLBACK MODAL ================= */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        sale={finalizedSale}
        settings={shopSettings}
        onNewBill={() => {
          setIsReceiptModalOpen(false);
          setFinalizedSale(null);
        }}
      />

      {/* Split Payment Modal */}
      <SplitPaymentModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        totalPayable={billSummary.finalPayable}
        onConfirm={(split) => {
          setSplitDetails(split);
          toast.success('Split details saved');
        }}
      />

      {/* Camera Barcode Scanner Modal */}
      <CameraScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScannedBarcode}
      />
    </div>
  );
};
