import React, { useState } from 'react';
import {
  Product,
  ProductVariant,
  ClothingCategory,
  CLOTHING_CATEGORIES,
  STANDARD_SIZES,
  POPULAR_COLORS,
  User,
  ShopSettings,
} from '../../types';
import { StorageService } from '../../lib/storage';
import {
  Layers,
  Search,
  Plus,
  AlertTriangle,
  Package,
  Edit2,
  Trash2,
  X,
  Check,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface MobileStockManagerProps {
  currentUser: User;
  shopSettings: ShopSettings;
}

export const MobileStockManager: React.FC<MobileStockManagerProps> = ({
  currentUser,
  shopSettings,
}) => {
  const [products, setProducts] = useState<Product[]>(StorageService.getProducts());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');

  // Stock Adjustment Bottom Sheet State
  const [adjustmentTarget, setAdjustmentTarget] = useState<{
    product: Product;
    variant: ProductVariant;
  } | null>(null);
  const [adjustAction, setAdjustAction] = useState<'ADD' | 'REMOVE' | 'SET'>('ADD');
  const [adjustQty, setAdjustQty] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState<string>('New Stock');

  // Add Product Mobile Sheet State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<ClothingCategory>('Jeans');
  const [newProductVariants, setNewProductVariants] = useState<
    Array<{
      size: string;
      color: string;
      purchasePrice: number;
      sellingPrice: number;
      stock: number;
    }>
  >([
    { size: '30', color: 'Blue', purchasePrice: 500, sellingPrice: 999, stock: 10 },
    { size: '32', color: 'Blue', purchasePrice: 500, sellingPrice: 999, stock: 10 },
  ]);

  const reload = () => setProducts(StorageService.getProducts());

  const lowStockThreshold = shopSettings.lowStockThresholdDefault || 3;

  // KPI figures
  const totalProducts = products.length;
  const totalStockQty = products.reduce(
    (acc, p) => acc + p.variants.reduce((sum, v) => sum + v.stock, 0),
    0
  );
  const lowStockCount = products.flatMap((p) =>
    p.variants.filter((v) => v.stock > 0 && v.stock <= (v.minStockAlert || lowStockThreshold))
  ).length;
  const outOfStockCount = products.flatMap((p) => p.variants.filter((v) => v.stock <= 0)).length;

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;

    if (stockStatusFilter === 'LOW') {
      const hasLow = p.variants.some(
        (v) => v.stock > 0 && v.stock <= (v.minStockAlert || lowStockThreshold)
      );
      if (!hasLow) return false;
    } else if (stockStatusFilter === 'OUT') {
      const hasOut = p.variants.some((v) => v.stock <= 0);
      if (!hasOut) return false;
    }

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchName = p.name.toLowerCase().includes(q);
    const matchCat = p.category.toLowerCase().includes(q);
    const matchVariant = p.variants.some(
      (v) => v.size.toLowerCase().includes(q) || v.color.toLowerCase().includes(q)
    );
    return matchName || matchCat || matchVariant;
  });

  // Handle stock adjustment submit
  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustmentTarget) return;

    if (currentUser.role === 'CASHIER') {
      toast.error('Cashiers cannot adjust inventory stock directly');
      return;
    }

    let adjType: 'ADJUSTMENT_ADD' | 'ADJUSTMENT_SUB' | 'DAMAGE' = 'ADJUSTMENT_ADD';
    let qtyToApply = adjustQty;

    if (adjustAction === 'ADD') {
      adjType = 'ADJUSTMENT_ADD';
      qtyToApply = adjustQty;
    } else if (adjustAction === 'REMOVE') {
      adjType = adjustReason.toLowerCase().includes('damage') ? 'DAMAGE' : 'ADJUSTMENT_SUB';
      qtyToApply = adjustQty;
    } else {
      // SET exact quantity
      const diff = adjustQty - adjustmentTarget.variant.stock;
      if (diff > 0) {
        adjType = 'ADJUSTMENT_ADD';
        qtyToApply = diff;
      } else if (diff < 0) {
        adjType = 'ADJUSTMENT_SUB';
        qtyToApply = Math.abs(diff);
      } else {
        toast.info('No change in quantity');
        setAdjustmentTarget(null);
        return;
      }
    }

    const res = StorageService.adjustStock({
      variantId: adjustmentTarget.variant.id,
      type: adjType,
      quantity: qtyToApply,
      reason: `${adjustReason} (${adjustAction}: ${qtyToApply} pcs)`,
    });

    if (res.success) {
      toast.success('Stock update ho gaya!');
      setAdjustmentTarget(null);
      reload();
    } else {
      toast.error(res.error || 'Failed to adjust stock');
    }
  };

  // Add Product form submit
  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) {
      toast.error('Product ka naam likhein');
      return;
    }
    if (newProductVariants.length === 0) {
      toast.error('Kam se kam ek size/color jodein');
      return;
    }

    const prodId = 'prod_' + Date.now();
    const newProduct: Product = {
      id: prodId,
      name: newProductName.trim(),
      code: 'TC-' + Math.floor(100 + Math.random() * 900),
      category: newProductCategory,
      brand: 'Tara Collection',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variants: newProductVariants.map((v, i) => ({
        id: `var_${Date.now()}_${i}`,
        productId: prodId,
        sku: '',
        barcode: '',
        size: v.size.trim(),
        color: v.color.trim(),
        purchasePrice: v.purchasePrice,
        sellingPrice: v.sellingPrice,
        mrp: Math.round(v.sellingPrice * 1.25),
        stock: v.stock,
        minStockAlert: lowStockThreshold,
      })),
    };

    StorageService.saveProduct(newProduct);
    toast.success(`Naya product jod diya: ${newProduct.name}`);
    setIsAddProductOpen(false);
    setNewProductName('');
    setNewProductVariants([
      { size: '30', color: 'Blue', purchasePrice: 500, sellingPrice: 999, stock: 10 },
      { size: '32', color: 'Blue', purchasePrice: 500, sellingPrice: 999, stock: 10 },
    ]);
    reload();
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-0 select-none">
      {/* ================= TOP SEARCH & FILTER BAR ================= */}
      <div className="bg-white border-b border-slate-200 p-3 space-y-2.5 shrink-0 shadow-xs">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Stock search karein (Name, Size, Colour)..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-medium"
            />
          </div>

          {currentUser.role !== 'CASHIER' && (
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center space-x-1 shrink-0 h-10 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Naya Product</span>
            </button>
          )}
        </div>

        {/* Category horizontal scroll chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
              categoryFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Items
          </button>
          {CLOTHING_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick Stock Status Filter Pills */}
        <div className="grid grid-cols-3 gap-2 text-xs font-bold pt-1">
          <button
            onClick={() => setStockStatusFilter('ALL')}
            className={`py-2 px-2 rounded-xl border text-center transition-all ${
              stockStatusFilter === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <div>All Stock</div>
            <div className="text-[11px] font-mono mt-0.5">{totalStockQty} pcs</div>
          </button>
          <button
            onClick={() => setStockStatusFilter('LOW')}
            className={`py-2 px-2 rounded-xl border text-center transition-all ${
              stockStatusFilter === 'LOW'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <div>Low Stock</div>
            <div className="text-[11px] font-mono mt-0.5">{lowStockCount} items</div>
          </button>
          <button
            onClick={() => setStockStatusFilter('OUT')}
            className={`py-2 px-2 rounded-xl border text-center transition-all ${
              stockStatusFilter === 'OUT'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div>Out of Stock</div>
            <div className="text-[11px] font-mono mt-0.5">{outOfStockCount} items</div>
          </button>
        </div>
      </div>

      {/* ================= PRODUCT STOCK CARDS FEED ================= */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Koi product nahi mila. Upar "Naya Product" button dabakar product jodein.
          </div>
        ) : (
          filteredProducts.map((p) => {
            const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-2.5"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                      {p.category}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 mt-0.5">{p.name}</h3>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                        totalStock <= 0
                          ? 'bg-rose-100 text-rose-700'
                          : totalStock <= 3
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {totalStock} pcs total
                    </span>
                  </div>
                </div>

                {/* Variants Matrix Chips */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500">
                    Sizes & Colours (Stock badalne ke liye tap karein):
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {p.variants.map((v) => {
                      const isOut = v.stock <= 0;
                      const isLow = !isOut && v.stock <= (v.minStockAlert || lowStockThreshold);

                      return (
                        <button
                          key={v.id}
                          onClick={() => {
                            setAdjustmentTarget({ product: p, variant: v });
                            setAdjustAction('ADD');
                            setAdjustQty(5);
                            setAdjustReason('New Stock Inward');
                          }}
                          className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all active:scale-95 ${
                            isOut
                              ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                              : isLow
                              ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                              : 'bg-slate-50 border-slate-200 hover:border-blue-400 text-slate-900'
                          }`}
                        >
                          <div>
                            <div className="font-black text-xs">
                              Size {v.size} • <span className="font-medium">{v.color}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Rate: ₹{v.sellingPrice}
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-sm font-black font-mono ${
                                isOut
                                  ? 'text-rose-600'
                                  : isLow
                                  ? 'text-amber-600'
                                  : 'text-emerald-700'
                              }`}
                            >
                              {v.stock} pcs
                            </div>
                            <div className="text-[9px] uppercase font-bold text-blue-600">
                              TAP TO EDIT
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================= BOTTOM SHEET: STOCK ADJUSTMENT ================= */}
      {adjustmentTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">Stock Update Karein</h3>
                <p className="text-xs text-blue-300">
                  {adjustmentTarget.product.name} (Size: {adjustmentTarget.variant.size} /{' '}
                  {adjustmentTarget.variant.color})
                </p>
              </div>
              <button
                onClick={() => setAdjustmentTarget(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="p-4 space-y-4 text-xs overflow-y-auto">
              <div className="p-3 bg-slate-100 rounded-2xl flex items-center justify-between">
                <span className="font-bold text-slate-700">Abhi Current Stock:</span>
                <span className="text-xl font-black font-mono text-blue-700">
                  {adjustmentTarget.variant.stock} Pieces
                </span>
              </div>

              {/* Action Selector */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-2">
                  Action Chuniye:
                </label>
                <div className="grid grid-cols-3 gap-2 font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustAction('ADD');
                      setAdjustReason('New Stock Inward');
                    }}
                    className={`py-2.5 rounded-xl border flex flex-col items-center justify-center ${
                      adjustAction === 'ADD'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    <Plus className="w-4 h-4 mb-0.5" />
                    <span>+ Add Stock</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustAction('REMOVE');
                      setAdjustReason('Damaged / Defect Item');
                    }}
                    className={`py-2.5 rounded-xl border flex flex-col items-center justify-center ${
                      adjustAction === 'REMOVE'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    <Minus className="w-4 h-4 mb-0.5" />
                    <span>- Remove Item</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustAction('SET');
                      setAdjustReason('Physical Count Correction');
                    }}
                    className={`py-2.5 rounded-xl border flex flex-col items-center justify-center ${
                      adjustAction === 'SET'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4 mb-0.5" />
                    <span>Set Exact Qty</span>
                  </button>
                </div>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {adjustAction === 'ADD'
                    ? 'Kitne Piece Jodne Hain (+ Quantity)?'
                    : adjustAction === 'REMOVE'
                    ? 'Kitne Piece Kam Karne Hain (- Quantity)?'
                    : 'Naya Exact Stock Kitna Hai?'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 text-xl font-black font-mono border border-slate-300 rounded-xl text-center focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Karan (Reason):
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl font-medium"
                >
                  <option value="New Stock Inward">New Stock (Naya Mal Aaya)</option>
                  <option value="Damaged / Defect Item">Damaged (Kharaab / Fata Item)</option>
                  <option value="Lost / Missing">Lost (Kho Gaya)</option>
                  <option value="Physical Count Correction">Count Correction (Ginti Thik Ki)</option>
                  <option value="Other Adjustment">Other (Anya)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/30"
                >
                  SAVE STOCK ADJUSTMENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= BOTTOM SHEET: ADD NEW PRODUCT ================= */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">Naya Clothing Product Jodein</h3>
                <p className="text-xs text-slate-400">Mobile form - simple & fast</p>
              </div>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewProduct} className="p-4 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Product Ka Naam *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Slim Fit Denim Jeans ya Cotton Shirt"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Category *
                </label>
                <select
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl font-medium"
                >
                  {CLOTHING_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Variants Section */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 text-xs uppercase">
                    Sizes, Colours & Stock
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewProductVariants([
                        ...newProductVariants,
                        { size: '34', color: 'Blue', purchasePrice: 500, sellingPrice: 999, stock: 5 },
                      ]);
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Aur Size Jodein</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {newProductVariants.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-5 gap-2 items-end"
                    >
                      <div className="col-span-1">
                        <label className="text-[10px] font-bold text-slate-500">Size</label>
                        <input
                          type="text"
                          value={v.size}
                          onChange={(e) => {
                            const arr = [...newProductVariants];
                            arr[idx].size = e.target.value;
                            setNewProductVariants(arr);
                          }}
                          className="w-full px-1.5 py-1 text-xs border rounded bg-white text-center font-bold"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] font-bold text-slate-500">Colour</label>
                        <input
                          type="text"
                          value={v.color}
                          onChange={(e) => {
                            const arr = [...newProductVariants];
                            arr[idx].color = e.target.value;
                            setNewProductVariants(arr);
                          }}
                          className="w-full px-1.5 py-1 text-xs border rounded bg-white text-center"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] font-bold text-slate-500">Rate (₹)</label>
                        <input
                          type="number"
                          value={v.sellingPrice}
                          onChange={(e) => {
                            const arr = [...newProductVariants];
                            arr[idx].sellingPrice = parseFloat(e.target.value) || 0;
                            setNewProductVariants(arr);
                          }}
                          className="w-full px-1.5 py-1 text-xs border rounded bg-white text-center font-mono font-bold text-blue-700"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] font-bold text-slate-500">Stock</label>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => {
                            const arr = [...newProductVariants];
                            arr[idx].stock = parseInt(e.target.value) || 0;
                            setNewProductVariants(arr);
                          }}
                          className="w-full px-1.5 py-1 text-xs border rounded bg-white text-center font-mono font-bold"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        {newProductVariants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewProductVariants(newProductVariants.filter((_, i) => i !== idx));
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/30"
                >
                  PRODUCT SAVE KAREIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
