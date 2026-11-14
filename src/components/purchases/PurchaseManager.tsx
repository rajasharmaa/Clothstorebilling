import React, { useState } from 'react';
import {
  Purchase,
  PurchaseItem,
  Supplier,
  Product,
  ProductVariant,
  User,
  ShopSettings,
  PaymentMode,
} from '../../types';
import { StorageService } from '../../lib/storage';
import {
  ShoppingBag,
  Plus,
  Search,
  Trash2,
  Calendar,
  Truck,
  CheckCircle,
  FileText,
  IndianRupee,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface PurchaseManagerProps {
  currentUser: User;
  shopSettings: ShopSettings;
}

export const PurchaseManager: React.FC<PurchaseManagerProps> = ({ currentUser, shopSettings }) => {
  const [purchases, setPurchases] = useState<Purchase[]>(StorageService.getPurchases());
  const [suppliers, setSuppliers] = useState<Supplier[]>(StorageService.getSuppliers());
  const [products, setProducts] = useState<Product[]>(StorageService.getProducts());
  const [isNewPurchaseModalOpen, setIsNewPurchaseModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // New Purchase Form State
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [invoiceRef, setInvoiceRef] = useState<string>('');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Selected item selector
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [itemQty, setItemQty] = useState<number>(10);
  const [itemRate, setItemRate] = useState<number>(400);
  const [itemMrp, setItemMrp] = useState<number>(999);
  const [itemSellingRate, setItemSellingRate] = useState<number>(799);

  const reload = () => {
    setPurchases(StorageService.getPurchases());
    setSuppliers(StorageService.getSuppliers());
    setProducts(StorageService.getProducts());
  };

  const handleOpenAdd = () => {
    if (products.length === 0) {
      toast.error('Add clothing products first before recording purchases');
      return;
    }
    if (suppliers.length === 0) {
      toast.error('Add a supplier first before recording purchases');
      return;
    }

    setPurchaseItems([]);
    setInvoiceRef('');
    setPaidAmount(0);
    setNotes('');

    // Pre-select first product and variant
    const firstP = products[0];
    setSelectedProductId(firstP.id);
    if (firstP.variants.length > 0) {
      const firstV = firstP.variants[0];
      setSelectedVariantId(firstV.id);
      setItemRate(firstV.purchasePrice);
      setItemMrp(firstV.mrp);
      setItemSellingRate(firstV.sellingPrice);
    }
    setIsNewPurchaseModalOpen(true);
  };

  const handleAddItem = () => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;
    const variant = prod.variants.find((v) => v.id === selectedVariantId);
    if (!variant) return;

    const existingIdx = purchaseItems.findIndex((i) => i.variantId === variant.id);
    const total = itemRate * itemQty;

    if (existingIdx >= 0) {
      const updated = [...purchaseItems];
      updated[existingIdx].quantity += itemQty;
      updated[existingIdx].total = updated[existingIdx].purchaseRate * updated[existingIdx].quantity;
      setPurchaseItems(updated);
    } else {
      const newItem: PurchaseItem = {
        variantId: variant.id,
        productId: prod.id,
        productName: prod.name,
        size: variant.size,
        color: variant.color,
        sku: variant.sku,
        quantity: itemQty,
        purchaseRate: itemRate,
        mrp: itemMrp,
        sellingRate: itemSellingRate,
        total,
      };
      setPurchaseItems([...purchaseItems, newItem]);
    }
    toast.success(`Added ${prod.name} (${variant.size}/${variant.color}) to purchase list`);
  };

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseItems.length === 0) {
      toast.error('Please add at least one item to this purchase');
      return;
    }

    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) {
      toast.error('Please select a supplier');
      return;
    }

    const totalAmount = purchaseItems.reduce((acc, i) => acc + i.total, 0);
    const balanceDue = Math.max(0, totalAmount - paidAmount);

    const res = StorageService.processPurchase({
      supplierId: supplier.id,
      supplierName: supplier.name,
      date: new Date().toISOString(),
      invoiceRef: invoiceRef.trim() || undefined,
      items: purchaseItems,
      totalAmount,
      paidAmount,
      balanceDue,
      paymentMode,
      notes: notes.trim() || undefined,
    });

    if (res.success && res.purchase) {
      toast.success(`Purchase #${res.purchase.purchaseNumber} recorded & stock updated!`);
      setIsNewPurchaseModalOpen(false);
      reload();
    } else {
      toast.error(res.error || 'Failed to process purchase');
    }
  };

  const totalPurchaseBill = purchaseItems.reduce((acc, i) => acc + i.total, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 select-none">
      {/* Header Bar */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">Purchase Inward & Goods Receipt</h2>
            <p className="text-xs text-slate-500">
              Record inventory purchases from suppliers and automatically restock variants
            </p>
          </div>
        </div>

        {currentUser.role !== 'CASHIER' && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Purchase Entry</span>
          </button>
        )}
      </div>

      {/* Purchases History Table */}
      <div className="flex-1 overflow-y-auto p-4">
        {purchases.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No purchase records found. Click "New Purchase Entry" to receive stock from a supplier.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Purchase #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Supplier Name</th>
                  <th className="py-2.5 px-3">Invoice Ref</th>
                  <th className="py-2.5 px-3">Items Received</th>
                  <th className="py-2.5 px-3 text-right">Total Bill</th>
                  <th className="py-2.5 px-3 text-right">Paid Amount</th>
                  <th className="py-2.5 px-3 text-right">Balance Due</th>
                  <th className="py-2.5 px-3 text-center">Payment Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                      {p.purchaseNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {new Date(p.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{p.supplierName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{p.invoiceRef || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {p.items.length} variants (
                      {p.items.reduce((acc, i) => acc + i.quantity, 0)} pcs)
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{p.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700">
                      ₹{p.paidAmount.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {p.balanceDue > 0 ? (
                        <span className="text-rose-600 font-bold">₹{p.balanceDue.toFixed(2)}</span>
                      ) : (
                        <span className="text-emerald-600 font-bold">₹0.00</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">
                        {p.paymentMode}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= NEW PURCHASE MODAL ================= */}
      {isNewPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-base">New Purchase Inward Entry</h3>
              <button
                onClick={() => setIsNewPurchaseModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                {/* Header Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Supplier *
                    </label>
                    <select
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.businessName})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Supplier Invoice / Bill Ref
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. INV-98432"
                      value={invoiceRef}
                      onChange={(e) => setInvoiceRef(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Add Item Builder */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="font-bold text-slate-800 text-sm">Add Items to Inward Bill</div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Product</label>
                      <select
                        value={selectedProductId}
                        onChange={(e) => {
                          const pid = e.target.value;
                          setSelectedProductId(pid);
                          const p = products.find((x) => x.id === pid);
                          if (p && p.variants.length > 0) {
                            setSelectedVariantId(p.variants[0].id);
                            setItemRate(p.variants[0].purchasePrice);
                            setItemMrp(p.variants[0].mrp);
                            setItemSellingRate(p.variants[0].sellingPrice);
                          }
                        }}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Size & Color</label>
                      <select
                        value={selectedVariantId}
                        onChange={(e) => {
                          const vid = e.target.value;
                          setSelectedVariantId(vid);
                          const p = products.find((x) => x.id === selectedProductId);
                          const v = p?.variants.find((x) => x.id === vid);
                          if (v) {
                            setItemRate(v.purchasePrice);
                            setItemMrp(v.mrp);
                            setItemSellingRate(v.sellingPrice);
                          }
                        }}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                      >
                        {products
                          .find((p) => p.id === selectedProductId)
                          ?.variants.map((v) => (
                            <option key={v.id} value={v.id}>
                              Size {v.size} / {v.color} (SKU: {v.sku})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={itemQty}
                        onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Purchase Rate (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={itemRate}
                        onChange={(e) => setItemRate(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Selling Rate (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={itemSellingRate}
                        onChange={(e) => setItemSellingRate(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
                    >
                      + Add Item
                    </button>
                  </div>
                </div>

                {/* Items Added Table */}
                <div className="space-y-1">
                  <div className="font-bold text-slate-700">
                    Items in this Inward ({purchaseItems.length})
                  </div>
                  {purchaseItems.length === 0 ? (
                    <div className="p-4 border border-dashed border-slate-300 rounded-lg text-center text-slate-400">
                      No items added yet. Select product variant above and click "+ Add Item".
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-slate-100 font-bold text-slate-600">
                          <tr>
                            <th className="py-1.5 px-3">Item</th>
                            <th className="py-1.5 px-3">Size/Color</th>
                            <th className="py-1.5 px-3 text-center">Qty</th>
                            <th className="py-1.5 px-3 text-right">Rate</th>
                            <th className="py-1.5 px-3 text-right">Total</th>
                            <th className="py-1.5 px-3 text-center">Del</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {purchaseItems.map((item, idx) => (
                            <tr key={item.variantId}>
                              <td className="py-1.5 px-3 font-bold text-slate-900">
                                {item.productName}
                              </td>
                              <td className="py-1.5 px-3 text-slate-600">
                                {item.size} / {item.color}
                              </td>
                              <td className="py-1.5 px-3 text-center font-mono font-bold">
                                {item.quantity}
                              </td>
                              <td className="py-1.5 px-3 text-right font-mono">
                                ₹{item.purchaseRate.toFixed(2)}
                              </td>
                              <td className="py-1.5 px-3 text-right font-mono font-bold text-blue-700">
                                ₹{item.total.toFixed(2)}
                              </td>
                              <td className="py-1.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPurchaseItems(purchaseItems.filter((_, i) => i !== idx))
                                  }
                                  className="text-rose-500 hover:text-rose-700"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Financials & Payment */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Total Bill</label>
                    <div className="text-xl font-black text-slate-900 font-mono">
                      ₹{totalPurchaseBill.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Amount Paid (₹)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={paidAmount || ''}
                      onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Payment Mode</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    >
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI / Bank Transfer</option>
                      <option value="CARD">Card</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsNewPurchaseModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={purchaseItems.length === 0}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md"
                >
                  Confirm Inward & Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
