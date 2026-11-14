import React, { useState } from 'react';
import { Sale, User, ShopSettings } from '../../types';
import { StorageService } from '../../lib/storage';
import {
  Receipt,
  Search,
  Printer,
  Share2,
  XCircle,
  Calendar,
  IndianRupee,
  Phone,
  User as UserIcon,
  X,
  AlertTriangle,
  Clock,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { ReceiptModal } from '../pos/ReceiptModal';
import { generateWhatsAppMessage } from '../../lib/receipt';
import { sharePDFOnWhatsApp } from '../../lib/pdfGenerator';

interface MobileSalesHistoryProps {
  currentUser: User;
  shopSettings: ShopSettings;
}

export const MobileSalesHistory: React.FC<MobileSalesHistoryProps> = ({
  currentUser,
  shopSettings,
}) => {
  const [sales, setSales] = useState<Sale[]>(StorageService.getSales());
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<'TODAY' | 'YESTERDAY' | 'WEEK' | 'ALL'>('TODAY');
  const [selectedSaleForModal, setSelectedSaleForModal] = useState<Sale | null>(null);
  const [cancellingSale, setCancellingSale] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

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
      }
    }

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

  const totalFilteredSalesAmount = filteredSales
    .filter((s) => s.status !== 'CANCELLED')
    .reduce((acc, curr) => acc + curr.total, 0);

  const handleCancelConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingSale) return;

    if (currentUser.role === 'CASHIER') {
      toast.error('कैशियर बिल कैंसिल नहीं कर सकते (Owner/Manager required)');
      return;
    }

    if (!cancelReason.trim()) {
      toast.error('कृपया बिल कैंसिल करने का कारण लिखें');
      return;
    }

    const res = StorageService.cancelBill(cancellingSale.billNumber, cancelReason);
    if (res.success) {
      toast.success(`बिल #${cancellingSale.billNumber} कैंसिल कर दिया गया व स्टॉक रिस्टोर हुआ`);
      setCancellingSale(null);
      setCancelReason('');
      reload();
    } else {
      toast.error(res.error || 'बिल कैंसिल नहीं हो सका');
    }
  };

  const handleWhatsAppShare = async (sale: Sale) => {
    toast.loading('WhatsApp PDF तैयार हो रहा है...', { id: 'mob-sales-pdf' });
    try {
      const res = await sharePDFOnWhatsApp(sale, shopSettings, sale.customerMobile);
      if (res.method === 'web_share') {
        toast.success('WhatsApp पर बिल PDF शेयर कर दिया गया!', { id: 'mob-sales-pdf' });
      } else {
        toast.success('PDF डाउनलोड हो गया! WhatsApp खुल गया है।', { id: 'mob-sales-pdf' });
      }
    } catch (e) {
      toast.error('WhatsApp शेयर करने में समस्या आई', { id: 'mob-sales-pdf' });
    }
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden select-none pb-20">
      {/* Search & Filter Header */}
      <div className="bg-white p-3 border-b border-slate-200 shrink-0 space-y-2.5 shadow-sm">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="बिल नंबर, मोबाइल या ग्राहक खोजें..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-9 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Date Filter Chips & Totals */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-1.5 shrink-0">
            {[
              { id: 'TODAY', label: 'आज (Today)' },
              { id: 'YESTERDAY', label: 'कल (Yesterday)' },
              { id: 'WEEK', label: '7 दिन (Week)' },
              { id: 'ALL', label: 'सभी (All)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setDateFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  dateFilter === f.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Banner */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 font-semibold">
          <span>{filteredSales.length} बिल मिले</span>
          <span className="font-bold text-blue-700">
            कुल: ₹{totalFilteredSalesAmount.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Bills Cards Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredSales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center">
            <Receipt className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">कोई बिल नहीं मिला</p>
            <p className="text-xs text-slate-400 mt-0.5">
              फ़िल्टर बदलकर देखें या नया बिल बनाएं
            </p>
          </div>
        ) : (
          filteredSales.map((sale) => {
            const isCancelled = sale.status === 'CANCELLED';
            const isExpanded = expandedSaleId === sale.id;

            return (
              <div
                key={sale.id}
                className={`bg-white rounded-2xl border shadow-sm transition-all overflow-hidden ${
                  isCancelled
                    ? 'border-rose-200 bg-rose-50/20 opacity-80'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {/* Card Top: Bill #, Status, Date/Time */}
                <div className="p-3.5 pb-2.5">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-sm text-slate-900">
                          #{sale.billNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isCancelled
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isCancelled ? 'रद्द (CANCELLED)' : sale.paymentMode}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formatDate(sale.date)}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatTime(sale.date)}</span>
                        </span>
                        <span>•</span>
                        <span>{sale.cashierName}</span>
                      </div>
                    </div>

                    {/* Total Amount Badge */}
                    <div className="text-right shrink-0">
                      <div
                        className={`text-lg font-black tracking-tight leading-none ${
                          isCancelled ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        ₹{sale.total.toLocaleString('en-IN')}
                      </div>
                      {sale.discount > 0 && !isCancelled && (
                        <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
                          बचत ₹{sale.discount.toFixed(0)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Info (if any) */}
                  {(sale.customerName || sale.customerMobile) && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center space-x-1.5 truncate">
                        <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium truncate">
                          {sale.customerName || 'Customer'}
                        </span>
                      </div>
                      {sale.customerMobile && (
                        <div className="flex items-center space-x-1 font-mono text-slate-700 shrink-0">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{sale.customerMobile}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Items Summary */}
                  <div
                    onClick={() => setExpandedSaleId(isExpanded ? null : sale.id)}
                    className="mt-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-700">
                      <span className="font-semibold text-slate-800">
                        {sale.items.reduce((s, i) => s + i.quantity, 0)} कपड़े (Items)
                      </span>
                      <span className="text-[11px] text-blue-600 font-bold flex items-center">
                        {isExpanded ? 'कम दिखाएं' : 'सामान सूची देखें'}
                        <ChevronRight
                          className={`w-3.5 h-3.5 ml-0.5 transition-transform ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                      </span>
                    </div>

                    {/* Detailed item list if expanded */}
                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t border-slate-200/80 space-y-1.5">
                        {sale.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs text-slate-600"
                          >
                            <div className="truncate pr-2">
                              <span className="font-bold text-slate-800 mr-1.5">
                                {item.quantity}x
                              </span>
                              <span>{item.productName}</span>
                              <span className="text-[10px] text-slate-400 ml-1">
                                ({item.size}/{item.color})
                              </span>
                            </div>
                            <span className="font-semibold text-slate-800 shrink-0">
                              ₹{item.total.toFixed(0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Bar */}
                <div className="bg-slate-50 border-t border-slate-100 px-3 py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedSaleForModal(sale)}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>प्रिंट पर्ची (Print)</span>
                    </button>

                    <button
                      onClick={() => handleWhatsAppShare(sale)}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  {!isCancelled && currentUser.role !== 'CASHIER' && (
                    <button
                      onClick={() => setCancellingSale(sale)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors active:scale-95"
                      title="बिल कैंसिल करें"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cancellation Bottom Sheet */}
      {cancellingSale && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-5 border-t border-slate-200 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-black text-base text-slate-900">
                  बिल #{cancellingSale.billNumber} कैंसिल करें
                </h3>
              </div>
              <button
                onClick={() => setCancellingSale(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              बिल कैंसिल करने पर बिका हुआ सामान वापस इन्वेंट्री स्टॉक में जोड़ दिया जाएगा।
            </p>

            <form onSubmit={handleCancelConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  कैंसिल करने का कारण (Reason):
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="उदा. ग्राहक ने सामान लेने से मना किया / गलत बिल बन गया..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCancellingSale(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl active:scale-95 text-sm"
                >
                  रद्द न करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl active:scale-95 text-sm shadow-md"
                >
                  हाँ, कैंसिल करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Thermal Receipt Preview Modal */}
      {selectedSaleForModal && (
        <ReceiptModal
          isOpen={true}
          onClose={() => setSelectedSaleForModal(null)}
          sale={selectedSaleForModal}
          shopSettings={shopSettings}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};
