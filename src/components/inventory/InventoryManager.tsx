import React, { useState } from 'react';
import {
  Product,
  ProductVariant,
  StockLedgerEntry,
  ShopSettings,
  User,
  ClothingCategory,
} from '../../types';
import { StorageService } from '../../lib/storage';
import {
  Layers,
  Search,
  AlertTriangle,
  FileSpreadsheet,
  Plus,
  Minus,
  RotateCcw,
  History,
  X,
  CheckCircle,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';

interface InventoryManagerProps {
  currentUser: User;
  shopSettings: ShopSettings;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  currentUser,
  shopSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'ledger'>('stock');
  const [products, setProducts] = useState<Product[]>(StorageService.getProducts());
  const [ledger, setLedger] = useState<StockLedgerEntry[]>(StorageService.getStockLedger());
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');

  // Adjustment Modal
  const [adjustmentTarget, setAdjustmentTarget] = useState<{
    product: Product;
    variant: ProductVariant;
  } | null>(null);
  const [adjustType, setAdjustType] = useState<'DAMAGE' | 'ADJUSTMENT_ADD' | 'ADJUSTMENT_SUB'>(
    'DAMAGE'
  );
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('');

  const reload = () => {
    setProducts(StorageService.getProducts());
    setLedger(StorageService.getStockLedger());
  };

  // Flattened variants for inventory table
  const allVariants = products.flatMap((p) =>
    p.variants.map((v) => ({
      product: p,
      variant: v,
    }))
  );

  const lowStockThreshold = shopSettings.lowStockThresholdDefault || 3;

  const filteredVariants = allVariants.filter(({ product, variant }) => {
    if (filterMode === 'LOW') {
      const isLow = variant.stock > 0 && variant.stock <= (variant.minStockAlert || lowStockThreshold);
      if (!isLow) return false;
    } else if (filterMode === 'OUT') {
      if (variant.stock > 0) return false;
    }

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      product.name.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q) ||
      variant.sku.toLowerCase().includes(q) ||
      variant.barcode.toLowerCase().includes(q) ||
      variant.size.toLowerCase().includes(q) ||
      variant.color.toLowerCase().includes(q)
    );
  });

  const filteredLedger = ledger.filter((entry) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      entry.productName.toLowerCase().includes(q) ||
      entry.sku.toLowerCase().includes(q) ||
      entry.referenceId.toLowerCase().includes(q) ||
      entry.type.toLowerCase().includes(q) ||
      entry.actorName.toLowerCase().includes(q)
    );
  });

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustmentTarget) return;

    if (currentUser.role === 'CASHIER') {
      toast.error('Cashiers cannot perform manual stock adjustments');
      return;
    }

    const res = StorageService.adjustStock({
      variantId: adjustmentTarget.variant.id,
      type: adjustType,
      quantity: adjustQty,
      reason: adjustReason.trim() || `Manual adjustment: ${adjustType}`,
    });

    if (res.success) {
      toast.success('Stock updated & recorded in audit ledger');
      setAdjustmentTarget(null);
      setAdjustReason('');
      setAdjustQty(1);
      reload();
    } else {
      toast.error(res.error || 'Failed to adjust stock');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 select-none">
      {/* Top Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">Inventory & Stock Ledger</h2>
            <p className="text-xs text-slate-500">
              Live variant stock monitoring and complete auditable stock movement logs
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'stock'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Current Stock ({allVariants.length})
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'ledger'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Stock Ledger ({ledger.length})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={
              activeTab === 'stock'
                ? 'Search stock by Name, SKU, Barcode, Size...'
                : 'Search ledger by Bill #, Product, Reference...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {activeTab === 'stock' && (
          <div className="flex items-center space-x-1.5 text-xs font-semibold">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterMode === 'ALL'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Variants
            </button>
            <button
              onClick={() => setFilterMode('LOW')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterMode === 'LOW'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Low Stock (&le; {lowStockThreshold})
            </button>
            <button
              onClick={() => setFilterMode('OUT')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterMode === 'OUT'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Out of Stock (0)
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'stock' ? (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Color</th>
                  {currentUser.role !== 'CASHIER' && (
                    <th className="py-2.5 px-3 text-right">Cost</th>
                  )}
                  <th className="py-2.5 px-3 text-right">Selling Rate</th>
                  <th className="py-2.5 px-3 text-center">Available Stock</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  {currentUser.role !== 'CASHIER' && (
                    <th className="py-2.5 px-3 text-center">Adjust</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredVariants.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No stock records found matching filters
                    </td>
                  </tr>
                ) : (
                  filteredVariants.map(({ product, variant }) => {
                    const isOut = variant.stock <= 0;
                    const isLow =
                      !isOut && variant.stock <= (variant.minStockAlert || lowStockThreshold);

                    return (
                      <tr key={variant.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{product.name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{product.category}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{variant.size}</td>
                        <td className="py-2.5 px-3 text-slate-700">{variant.color}</td>
                        {currentUser.role !== 'CASHIER' && (
                          <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                            ₹{variant.purchasePrice.toFixed(2)}
                          </td>
                        )}
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                          ₹{variant.sellingPrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-sm">
                          {variant.stock} pcs
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              isOut
                                ? 'bg-rose-100 text-rose-700'
                                : isLow
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'IN STOCK'}
                          </span>
                        </td>
                        {currentUser.role !== 'CASHIER' && (
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => {
                                setAdjustmentTarget({ product, variant });
                                setAdjustQty(1);
                                setAdjustReason('');
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-[10px]"
                            >
                              Adjust
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Product / Variant</th>
                  <th className="py-2.5 px-3">Transaction Type</th>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3 text-center">Movement</th>
                  <th className="py-2.5 px-3 text-right">Prev Stock</th>
                  <th className="py-2.5 px-3 text-right">New Stock</th>
                  <th className="py-2.5 px-3">Remarks / Reason</th>
                  <th className="py-2.5 px-3">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLedger.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No stock ledger entries recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map((entry) => {
                    const isPositive = entry.quantityChange > 0;
                    const isZero = entry.quantityChange === 0;

                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 text-slate-500">
                          {new Date(entry.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-bold text-slate-900">{entry.productName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {entry.size} / {entry.color} ({entry.sku})
                          </div>
                        </td>
                        <td className="py-2 px-3 font-semibold">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              entry.type === 'SALE'
                                ? 'bg-blue-100 text-blue-800'
                                : entry.type === 'PURCHASE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : entry.type === 'CUSTOMER_RETURN'
                                ? 'bg-purple-100 text-purple-800'
                                : entry.type === 'DAMAGE'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {entry.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-700">
                          {entry.referenceId}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-black">
                          <span
                            className={
                              isPositive
                                ? 'text-emerald-600'
                                : isZero
                                ? 'text-slate-400'
                                : 'text-rose-600'
                            }
                          >
                            {isPositive ? `+${entry.quantityChange}` : entry.quantityChange}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-500">
                          {entry.previousStock}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {entry.newStock}
                        </td>
                        <td className="py-2 px-3 text-slate-600 max-w-xs truncate">
                          {entry.notes || '-'}
                        </td>
                        <td className="py-2 px-3 text-slate-500">{entry.actorName}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= ADJUSTMENT MODAL ================= */}
      {adjustmentTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Manual Stock Adjustment</h3>
                <p className="text-xs text-slate-400">
                  {adjustmentTarget.product.name} ({adjustmentTarget.variant.size} /{' '}
                  {adjustmentTarget.variant.color})
                </p>
              </div>
              <button
                onClick={() => setAdjustmentTarget(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyAdjustment} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between font-bold">
                <span>Current Stock:</span>
                <span className="font-mono text-sm text-blue-700">
                  {adjustmentTarget.variant.stock} pcs
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Adjustment Type *
                </label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="DAMAGE">Damaged / Discarded Item (- Stock)</option>
                  <option value="ADJUSTMENT_SUB">Stock Audit Reduction / Lost (- Stock)</option>
                  <option value="ADJUSTMENT_ADD">Physical Found / Correction (+ Stock)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Reason / Audit Remarks *
                </label>
                <textarea
                  required
                  rows={2}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Torn stitching discovered during packaging; or physical audit recount"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustmentTarget(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
