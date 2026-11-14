import React, { useState } from 'react';
import {
  ReturnTransaction,
  ReturnItem,
  Sale,
  Product,
  ProductVariant,
  User,
  ShopSettings,
  PaymentMode,
} from '../../types';
import { StorageService } from '../../lib/storage';
import {
  RotateCcw,
  Search,
  CheckCircle,
  AlertTriangle,
  Receipt,
  Plus,
  Trash2,
  Shirt,
  IndianRupee,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface ReturnManagerProps {
  currentUser: User;
  shopSettings: ShopSettings;
}

export const ReturnManager: React.FC<ReturnManagerProps> = ({ currentUser, shopSettings }) => {
  const [returns, setReturns] = useState<ReturnTransaction[]>(StorageService.getReturns());
  const [sales] = useState<Sale[]>(StorageService.getSales());
  const [products] = useState<Product[]>(StorageService.getProducts());

  const [isNewReturnModalOpen, setIsNewReturnModalOpen] = useState(false);
  const [searchBillQuery, setSearchBillQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Return items form
  const [returnItems, setReturnItems] = useState<
    Array<{
      variantId: string;
      productName: string;
      size: string;
      color: string;
      sku: string;
      quantity: number;
      originalRate: number;
      refundRate: number;
      condition: 'GOOD' | 'DAMAGED';
    }>
  >([]);
  const [returnReason, setReturnReason] = useState<string>('');
  const [refundMethod, setRefundMethod] = useState<PaymentMode>('CASH');

  // Exchange states
  const [isExchange, setIsExchange] = useState(false);
  const [exchangeVariantId, setExchangeVariantId] = useState<string>('');
  const [exchangeQty, setExchangeQty] = useState<number>(1);

  const reload = () => setReturns(StorageService.getReturns());

  const handleSearchBill = () => {
    if (!searchBillQuery.trim()) return;
    const found = sales.find(
      (s) =>
        s.billNumber.toLowerCase() === searchBillQuery.trim().toLowerCase() &&
        s.status !== 'CANCELLED'
    );
    if (found) {
      setSelectedSale(found);
      setReturnItems(
        found.items.map((i) => ({
          variantId: i.variantId,
          productName: i.productName,
          size: i.size,
          color: i.color,
          sku: i.sku,
          quantity: 0,
          originalRate: i.rate,
          refundRate: i.rate - i.discountAmount / i.quantity,
          condition: 'GOOD',
        }))
      );
    } else {
      toast.error('Valid completed bill not found. Please check bill number.');
      setSelectedSale(null);
    }
  };

  const handleProcessReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale) return;

    const itemsToReturn = returnItems.filter((i) => i.quantity > 0);
    if (itemsToReturn.length === 0) {
      toast.error('Select at least one item and quantity to return');
      return;
    }

    const totalRefundAmount = itemsToReturn.reduce(
      (acc, i) => acc + i.refundRate * i.quantity,
      0
    );

    const res = StorageService.processReturn({
      originalBillNumber: selectedSale.billNumber,
      customerName: selectedSale.customerName,
      customerMobile: selectedSale.customerMobile,
      items: itemsToReturn,
      totalRefundAmount,
      refundMethod,
      reason: returnReason.trim() || 'Customer return',
      processedBy: currentUser.name,
      isExchange,
      exchangeBillNumber: undefined,
    });

    if (res.success && res.returnTx) {
      toast.success(`Return #${res.returnTx.returnNumber} processed & stock updated`);
      setIsNewReturnModalOpen(false);
      setSelectedSale(null);
      setReturnReason('');
      reload();
    } else {
      toast.error(res.error || 'Failed to process return');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 select-none">
      {/* Header Bar */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">Customer Returns & Exchanges</h2>
            <p className="text-xs text-slate-500">
              Process customer item returns, exchange differences, and stock condition routing
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedSale(null);
            setSearchBillQuery('');
            setIsNewReturnModalOpen(true);
          }}
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Process Return / Exchange</span>
        </button>
      </div>

      {/* Return Transactions Table */}
      <div className="flex-1 overflow-y-auto p-4">
        {returns.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No return or exchange records found.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Return #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Original Bill</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Items Returned</th>
                  <th className="py-2.5 px-3 text-right">Refund Amount</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Processed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {returns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                      {r.returnNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {new Date(r.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                      {r.originalBillNumber}
                    </td>
                    <td className="py-2.5 px-3">{r.customerName || 'Walk-in'}</td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {r.items.map((i) => (
                        <div key={i.variantId} className="text-[11px]">
                          {i.quantity}x {i.productName} ({i.size}/{i.color}) -{' '}
                          <span
                            className={
                              i.condition === 'GOOD'
                                ? 'text-emerald-700 font-bold'
                                : 'text-rose-600 font-bold'
                            }
                          >
                            {i.condition}
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{r.totalRefundAmount.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">{r.reason}</td>
                    <td className="py-2.5 px-3 text-slate-500">{r.processedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= NEW RETURN / EXCHANGE MODAL ================= */}
      {isNewReturnModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-base">Process Customer Return / Exchange</h3>
              <button
                onClick={() => setIsNewReturnModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessReturn} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                {/* Search Original Bill */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Enter Original Bill Number (e.g. TC-2026-001001)..."
                    value={searchBillQuery}
                    onChange={(e) => setSearchBillQuery(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSearchBill}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg"
                  >
                    Find Bill
                  </button>
                </div>

                {selectedSale && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between">
                      <div>
                        <div className="font-bold text-slate-900">
                          Bill #{selectedSale.billNumber}
                        </div>
                        <div className="text-slate-500">
                          Customer: {selectedSale.customerName || 'Walk-in'} (
                          {selectedSale.customerMobile || 'No phone'})
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-blue-700 font-mono">
                          Total: ₹{selectedSale.finalPayable.toFixed(2)}
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          Date: {new Date(selectedSale.date).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Return Items Selection */}
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-2">
                        Select Return Quantities & Item Condition:
                      </label>
                      <div className="space-y-2">
                        {returnItems.map((item, idx) => {
                          const originalItem = selectedSale.items.find(
                            (i) => i.variantId === item.variantId
                          );
                          const maxQty = originalItem?.quantity || 1;

                          return (
                            <div
                              key={item.variantId}
                              className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between"
                            >
                              <div>
                                <div className="font-bold text-slate-900">{item.productName}</div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  Size {item.size} / {item.color} • Purchased: {maxQty} pcs @ ₹
                                  {item.originalRate}
                                </div>
                              </div>

                              <div className="flex items-center space-x-3">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 block">
                                    Return Qty
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max={maxQty}
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const val = Math.min(
                                        maxQty,
                                        Math.max(0, parseInt(e.target.value) || 0)
                                      );
                                      const updated = [...returnItems];
                                      updated[idx].quantity = val;
                                      setReturnItems(updated);
                                    }}
                                    className="w-16 px-2 py-1 border border-slate-300 rounded font-mono font-bold text-center"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 block">
                                    Condition
                                  </label>
                                  <select
                                    value={item.condition}
                                    onChange={(e) => {
                                      const updated = [...returnItems];
                                      updated[idx].condition = e.target.value as any;
                                      setReturnItems(updated);
                                    }}
                                    className="px-2 py-1 border border-slate-300 rounded font-semibold text-xs"
                                  >
                                    <option value="GOOD">Good (Restock)</option>
                                    <option value="DAMAGED">Damaged (Log Only)</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">
                        Reason for Return *
                      </label>
                      <input
                        type="text"
                        required
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        placeholder="e.g. Size fitting issue; or fabric flaw"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">
                        Refund Payment Mode
                      </label>
                      <select
                        value={refundMethod}
                        onChange={(e) => setRefundMethod(e.target.value as PaymentMode)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      >
                        <option value="CASH">Cash Refund</option>
                        <option value="UPI">UPI Refund</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsNewReturnModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedSale || returnItems.every((i) => i.quantity === 0)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md"
                >
                  Confirm Return & Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
