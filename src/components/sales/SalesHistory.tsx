import React, { useState } from 'react';
import { Sale, User, ShopSettings, PaymentMode } from '../../types';
import { StorageService } from '../../lib/storage';
import {
  Receipt,
  Search,
  Calendar,
  Printer,
  Share2,
  XCircle,
  Eye,
  CheckCircle,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { ReceiptModal } from '../pos/ReceiptModal';
import { generateWhatsAppMessage } from '../../lib/receipt';
import { sharePDFOnWhatsApp } from '../../lib/pdfGenerator';

interface SalesHistoryProps {
  currentUser: User;
  shopSettings: ShopSettings;
}

export const SalesHistory: React.FC<SalesHistoryProps> = ({ currentUser, shopSettings }) => {
  const [sales, setSales] = useState<Sale[]>(StorageService.getSales());
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH'>(
    'ALL'
  );
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Preview / Reprint Modal
  const [selectedSaleForModal, setSelectedSaleForModal] = useState<Sale | null>(null);

  // Cancel prompt
  const [cancellingSale, setCancellingSale] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  const reload = () => setSales(StorageService.getSales());

  const filteredSales = sales.filter((s) => {
    // Date filter
    if (dateFilter !== 'ALL') {
      const saleDate = new Date(s.date);
      const now = new Date();
      if (dateFilter === 'TODAY') {
        const todayStr = now.toISOString().split('T')[0];
        if (!s.date.startsWith(todayStr)) return false;
      } else if (dateFilter === 'YESTERDAY') {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        const yStr = y.toISOString().split('T')[0];
        if (!s.date.startsWith(yStr)) return false;
      } else if (dateFilter === 'WEEK') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (saleDate < weekAgo) return false;
      } else if (dateFilter === 'MONTH') {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        if (saleDate < monthAgo) return false;
      }
    }

    // Payment mode filter
    if (paymentFilter !== 'ALL' && s.paymentMode !== paymentFilter) return false;

    // Status filter
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;

    // Search query
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchBill = s.billNumber.toLowerCase().includes(q);
    const matchCust =
      (s.customerName && s.customerName.toLowerCase().includes(q)) ||
      (s.customerMobile && s.customerMobile.includes(q));
    const matchCashier = s.cashierName.toLowerCase().includes(q);
    const matchItems = s.items.some((i) => i.productName.toLowerCase().includes(q));
    return matchBill || matchCust || matchCashier || matchItems;
  });

  const handleCancelConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingSale) return;

    if (currentUser.role === 'CASHIER') {
      toast.error('Cashiers cannot cancel finalized bills');
      return;
    }

    if (!cancelReason.trim()) {
      toast.error('Please specify a reason for cancellation');
      return;
    }

    const res = StorageService.cancelBill(cancellingSale.billNumber, cancelReason);
    if (res.success) {
      toast.success(`Bill #${cancellingSale.billNumber} cancelled & stock restored`);
      setCancellingSale(null);
      setCancelReason('');
      reload();
    } else {
      toast.error(res.error || 'Failed to cancel bill');
    }
  };

  const handleWhatsAppShare = async (sale: Sale) => {
    toast.loading('WhatsApp PDF तैयार हो रहा है...', { id: 'sales-pdf' });
    try {
      const res = await sharePDFOnWhatsApp(sale, shopSettings, sale.customerMobile);
      if (res.method === 'web_share') {
        toast.success('WhatsApp पर बिल PDF शेयर कर दिया गया!', { id: 'sales-pdf' });
      } else {
        toast.success('PDF डाउनलोड हो गया! WhatsApp खुल गया है।', { id: 'sales-pdf' });
      }
    } catch (e) {
      toast.error('WhatsApp शेयर करने में समस्या आई', { id: 'sales-pdf' });
    }
  };

  // Summary figures for filtered list
  const totalSalesFiltered = filteredSales
    .filter((s) => s.status !== 'CANCELLED')
    .reduce((acc, s) => acc + s.finalPayable, 0);
  const totalDiscountFiltered = filteredSales
    .filter((s) => s.status !== 'CANCELLED')
    .reduce((acc, s) => acc + s.totalDiscount, 0);
  const totalDueFiltered = filteredSales
    .filter((s) => s.status !== 'CANCELLED')
    .reduce((acc, s) => acc + s.balanceDue, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 select-none">
      {/* Header Bar */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">Sales History & Cash Memos</h2>
            <p className="text-xs text-slate-500">
              Auditable retail billing logs, reprint, WhatsApp share, and refund tracking
            </p>
          </div>
        </div>

        {/* Quick totals badge */}
        <div className="flex items-center space-x-3 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-medium">
          <div>
            Bills: <span className="font-bold text-slate-900">{filteredSales.length}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div>
            Sales: <span className="font-bold text-blue-700">₹{totalSalesFiltered.toFixed(2)}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div>
            Discount:{' '}
            <span className="font-bold text-emerald-700">₹{totalDiscountFiltered.toFixed(2)}</span>
          </div>
          {totalDueFiltered > 0 && (
            <>
              <span className="text-slate-300">|</span>
              <div>
                Due: <span className="font-bold text-rose-600">₹{totalDueFiltered.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Bill #, Customer Name, Mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center space-x-1">
          {(['ALL', 'TODAY', 'YESTERDAY', 'WEEK', 'MONTH'] as const).map((df) => (
            <button
              key={df}
              onClick={() => setDateFilter(df)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                dateFilter === df
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {df === 'ALL'
                ? 'All Dates'
                : df === 'TODAY'
                ? 'Today'
                : df === 'YESTERDAY'
                ? 'Yesterday'
                : df === 'WEEK'
                ? 'Last 7 Days'
                : 'This Month'}
            </button>
          ))}
        </div>

        {/* Payment mode filter */}
        <div className="flex items-center space-x-2">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-700"
          >
            <option value="ALL">All Payment Modes</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="SPLIT">Split</option>
            <option value="DUE">Due</option>
          </select>
        </div>
      </div>

      {/* Sales List Table */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredSales.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No sales matching your filter criteria.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Bill Number</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Items Sold</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 text-right">Discount</th>
                  <th className="py-2.5 px-3 text-right">Final Amount</th>
                  <th className="py-2.5 px-3 text-center">Payment</th>
                  <th className="py-2.5 px-3 text-center">Cashier</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">{s.billNumber}</td>
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(s.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{s.customerName || 'Walk-in'}</div>
                      {s.customerMobile && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          {s.customerMobile}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {s.items.length} items (
                      {s.items.reduce((acc, i) => acc + i.quantity, 0)} pcs)
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      ₹{s.totalOriginalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700">
                      {s.totalDiscount > 0 ? (
                        <span>
                          -₹{s.totalDiscount.toFixed(2)} ({s.effectiveDiscountPercent}%)
                        </span>
                      ) : (
                        '₹0.00'
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                      ₹{s.finalPayable.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">
                        {s.paymentMode}
                      </span>
                      {s.balanceDue > 0 && (
                        <div className="text-[10px] text-rose-600 font-bold mt-0.5">
                          Due: ₹{s.balanceDue.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600">{s.cashierName}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          s.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => setSelectedSaleForModal(s)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="View & Reprint Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleWhatsAppShare(s)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Share on WhatsApp"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        {currentUser.role !== 'CASHIER' && s.status !== 'CANCELLED' && (
                          <button
                            onClick={() => {
                              setCancellingSale(s);
                              setCancelReason('');
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Cancel Bill & Restore Stock"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= REPRINT RECEIPT MODAL ================= */}
      <ReceiptModal
        isOpen={!!selectedSaleForModal}
        onClose={() => setSelectedSaleForModal(null)}
        sale={selectedSaleForModal}
        settings={shopSettings}
        onNewBill={() => setSelectedSaleForModal(null)}
      />

      {/* ================= CANCEL BILL MODAL ================= */}
      {cancellingSale && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-rose-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-300" />
                <h3 className="font-bold text-base">Cancel Finalized Bill</h3>
              </div>
              <button onClick={() => setCancellingSale(null)} className="text-rose-300 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCancelConfirm} className="p-6 space-y-4 text-xs">
              <div className="bg-rose-50 p-3 rounded-lg border border-rose-200 text-rose-900">
                <p className="font-bold">
                  Are you sure you want to cancel Bill #{cancellingSale.billNumber}?
                </p>
                <p className="mt-1 text-[11px]">
                  All sold items ({cancellingSale.items.length} items) will be automatically returned to
                  sellable inventory, and an audit stock ledger entry will be recorded.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Reason for Cancellation *
                </label>
                <textarea
                  required
                  rows={2}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Customer cancelled order immediately; or cashier entered wrong product"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingSale(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-md"
                >
                  Confirm Cancel & Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
