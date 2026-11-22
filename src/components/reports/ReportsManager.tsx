import React, { useState } from 'react';
import { StorageService } from '../../lib/storage';
import { Sale, Product, Expense, ShopSettings, User } from '../../types';
import {
  BarChart3,
  Calendar,
  Download,
  IndianRupee,
  TrendingUp,
  Tag,
  Package,
  ArrowUpRight,
  ShieldAlert,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../lib/i18n';
import { exportToCSV } from '../../lib/csvExport';

interface ReportsManagerProps {
  currentUser: User;
  shopSettings: ShopSettings;
}

export const ReportsManager: React.FC<ReportsManagerProps> = ({ currentUser, shopSettings }) => {
  const { tr, language } = useLanguage();
  const [reportTab, setReportTab] = useState<'sales' | 'profit' | 'categories' | 'inventory'>(
    'sales'
  );
  const [timeRange, setTimeRange] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('MONTH');

  const sales = StorageService.getSales();
  const products = StorageService.getProducts();
  const expenses = StorageService.getExpenses();

  // Date filtering
  const filteredSales = sales.filter((s) => {
    if (s.status === 'CANCELLED') return false;
    const saleDate = new Date(s.date);
    const now = new Date();
    if (timeRange === 'TODAY') {
      const todayStr = now.toISOString().split('T')[0];
      return s.date.startsWith(todayStr);
    } else if (timeRange === 'WEEK') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return saleDate >= weekAgo;
    } else if (timeRange === 'MONTH') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return saleDate >= monthAgo;
    }
    return true;
  });

  const filteredExpenses = expenses.filter((e) => {
    const expDate = new Date(e.date);
    const now = new Date();
    if (timeRange === 'TODAY') {
      const todayStr = now.toISOString().split('T')[0];
      return e.date.startsWith(todayStr);
    } else if (timeRange === 'WEEK') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return expDate >= weekAgo;
    } else if (timeRange === 'MONTH') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return expDate >= monthAgo;
    }
    return true;
  });

  // Financial Metrics
  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.finalPayable, 0);
  const totalOriginal = filteredSales.reduce((acc, s) => acc + s.totalOriginalAmount, 0);
  const totalDiscount = filteredSales.reduce((acc, s) => acc + s.totalDiscount, 0);
  const totalItemsSold = filteredSales.reduce(
    (acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0),
    0
  );

  // Historical COGS: sum of (item.purchasePriceSnapshot * item.quantity)
  const totalCOGS = filteredSales.reduce(
    (acc, s) =>
      acc +
      s.items.reduce(
        (sum, item) => sum + (item.purchasePriceSnapshot || 0) * item.quantity,
        0
      ),
    0
  );
  const grossProfit = totalRevenue - totalCOGS;
  const totalExpenseVal = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netOperatingProfit = grossProfit - totalExpenseVal;

  // Category breakdown
  const categoryStats: Record<
    string,
    { revenue: number; quantity: number; discount: number; count: number }
  > = {};
  filteredSales.forEach((s) => {
    s.items.forEach((i) => {
      if (!categoryStats[i.category]) {
        categoryStats[i.category] = { revenue: 0, quantity: 0, discount: 0, count: 0 };
      }
      categoryStats[i.category].revenue += i.finalAmount;
      categoryStats[i.category].quantity += i.quantity;
      categoryStats[i.category].discount += i.discountAmount;
      categoryStats[i.category].count += 1;
    });
  });

  // CSV Export
  const handleExportCSV = () => {
    if (reportTab === 'sales') {
      const headers = ['Bill Number', 'Date', 'Customer', 'Items Count', 'Subtotal', 'Discount', 'Final Payable', 'Payment Mode'];
      const rows = filteredSales.map((s) => [
        s.billNumber,
        new Date(s.date).toLocaleString('en-IN'),
        s.customerName || 'Walk-in',
        s.items.length,
        s.totalOriginalAmount,
        s.totalDiscount,
        s.finalPayable,
        s.paymentMode,
      ]);
      exportToCSV(`report_sales_${timeRange}`, headers, rows);
    } else if (reportTab === 'categories') {
      const headers = ['Category', 'Revenue (₹)', 'Quantity Sold (Pcs)', 'Discount Given (₹)'];
      const rows = Object.entries(categoryStats).map(([cat, stats]) => [
        cat,
        stats.revenue.toFixed(2),
        stats.quantity,
        stats.discount.toFixed(2),
      ]);
      exportToCSV(`report_categories_${timeRange}`, headers, rows);
    } else if (reportTab === 'profit') {
      const headers = ['Metric', 'Amount (₹)'];
      const rows = [
        ['Sales Revenue', totalRevenue.toFixed(2)],
        ['Cost of Goods Sold (COGS)', totalCOGS.toFixed(2)],
        ['Gross Profit', grossProfit.toFixed(2)],
        ['Operating Expenses', totalExpenseVal.toFixed(2)],
        ['Net Operating Profit', netOperatingProfit.toFixed(2)],
      ];
      exportToCSV(`report_profit_${timeRange}`, headers, rows);
    } else if (reportTab === 'inventory') {
      const headers = ['Product', 'SKU', 'Category', 'Stock Qty', 'Cost Price', 'Selling Price', 'Total Stock Valuation'];
      const rows = products.flatMap((p) =>
        p.variants.map((v) => [
          p.name,
          v.sku,
          p.category,
          v.stock,
          v.purchasePrice,
          v.sellingPrice,
          v.stock * v.purchasePrice,
        ])
      );
      exportToCSV(`report_inventory_valuation`, headers, rows);
    }
    toast.success('Report exported to CSV');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 select-none">
      {/* Header Bar */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">
              {language === 'hi' ? 'दुकान रिपोर्ट व व्यापार विश्लेषण' : 'Business Reports & Analytics'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'hi' ? 'दैनिक बिक्री, सकल मुनाफा, केटेगरी अनुसार सेल और स्टॉक स्थिति' : 'Retail sales analysis, gross profit with historical cost accounting, and category metrics'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Time range selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {(['TODAY', 'WEEK', 'MONTH', 'ALL'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeRange === r
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'TODAY'
                  ? (language === 'hi' ? 'आज' : 'Today')
                  : r === 'WEEK'
                  ? (language === 'hi' ? '7 दिन' : '7 Days')
                  : r === 'MONTH'
                  ? (language === 'hi' ? '30 दिन' : '30 Days')
                  : (language === 'hi' ? 'सभी समय' : 'All Time')}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{language === 'hi' ? 'CSV डाउनलोड' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Report Tab Selector */}
      <div className="p-4 border-b border-slate-200 bg-white flex items-center space-x-2 shrink-0 text-xs font-bold">
        <button
          onClick={() => setReportTab('sales')}
          className={`px-4 py-2 rounded-xl transition-all ${
            reportTab === 'sales'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {language === 'hi' ? 'बिक्री व छूट' : 'Sales & Discounts'}
        </button>
        <button
          onClick={() => setReportTab('profit')}
          className={`px-4 py-2 rounded-xl transition-all ${
            reportTab === 'profit'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {language === 'hi' ? 'मुनाफा व लाभ (P&L)' : 'Profit & Loss'}
        </button>
        <button
          onClick={() => setReportTab('categories')}
          className={`px-4 py-2 rounded-xl transition-all ${
            reportTab === 'categories'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {language === 'hi' ? 'केटेगरी रिपोर्ट' : 'Categories'}
        </button>
        <button
          onClick={() => setReportTab('inventory')}
          className={`px-4 py-2 rounded-xl transition-all ${
            reportTab === 'inventory'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {language === 'hi' ? 'स्टॉक मूल्यांकन' : 'Inventory Valuation'}
        </button>
      </div>

      {/* Report Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: SALES & DISCOUNTS */}
        {reportTab === 'sales' && (
          <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-slate-500 text-xs font-semibold">Net Sales Revenue</div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-2">
                  ₹{totalRevenue.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Across {filteredSales.length} bills
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-slate-500 text-xs font-semibold">Total Discounts Given</div>
                <div className="text-2xl font-black text-emerald-600 font-mono mt-2">
                  ₹{totalDiscount.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {totalOriginal > 0 ? ((totalDiscount / totalOriginal) * 100).toFixed(1) : 0}% avg
                  discount
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-slate-500 text-xs font-semibold">Total Items Sold</div>
                <div className="text-2xl font-black text-blue-700 font-mono mt-2">
                  {totalItemsSold} Pcs
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Clothing apparel units</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-slate-500 text-xs font-semibold">Average Ticket Value</div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-2">
                  ₹
                  {filteredSales.length > 0
                    ? (totalRevenue / filteredSales.length).toFixed(2)
                    : '0.00'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Per cash memo</div>
              </div>
            </div>

            {/* Sales Table Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Bill Number</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3 text-right">Original Subtotal</th>
                    <th className="py-2.5 px-3 text-right">Discount (Savings)</th>
                    <th className="py-2.5 px-3 text-right">Final Amount</th>
                    <th className="py-2.5 px-3 text-center">Payment Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredSales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80">
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">{s.billNumber}</td>
                      <td className="py-2 px-3 text-slate-500">
                        {new Date(s.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-slate-900">{s.customerName || 'Walk-in'}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-500">
                        ₹{s.totalOriginalAmount.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-600">
                        -₹{s.totalDiscount.toFixed(2)} ({s.effectiveDiscountPercent}%)
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{s.finalPayable.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">
                          {s.paymentMode}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORIES */}
        {reportTab === 'categories' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Quantity Sold</th>
                  <th className="py-2.5 px-3 text-right">Total Revenue</th>
                  <th className="py-2.5 px-3 text-right">Discounts Absorbed</th>
                  <th className="py-2.5 px-3 text-right">Share of Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {Object.entries(categoryStats).map(([cat, stats]) => {
                  const share = totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0;
                  return (
                    <tr key={cat} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{cat}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        {stats.quantity} pcs
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                        ₹{stats.revenue.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-600">
                        ₹{stats.discount.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                        {share.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: PROFIT & LOSS */}
        {reportTab === 'profit' && currentUser.role !== 'CASHIER' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl">
              <h3 className="font-extrabold text-slate-900 text-base mb-1">
                Statement of Profit & Loss (COGS Basis)
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Calculated strictly using historical inventory purchase costs saved at transaction time
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-700">Gross Sales Revenue:</span>
                  <span className="font-bold font-mono text-slate-900">
                    ₹{totalRevenue.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100 text-rose-600">
                  <span className="font-semibold">
                    Less: Cost of Goods Sold (Historical COGS):
                  </span>
                  <span className="font-bold font-mono">-₹{totalCOGS.toFixed(2)}</span>
                </div>

                <div className="flex justify-between py-2.5 border-b-2 border-slate-200 bg-slate-50 px-3 rounded-lg">
                  <span className="font-extrabold text-slate-900">ESTIMATED GROSS PROFIT:</span>
                  <span className="font-black font-mono text-blue-700 text-base">
                    ₹{grossProfit.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100 text-rose-600">
                  <span className="font-semibold">Less: Operating Expenses:</span>
                  <span className="font-bold font-mono">-₹{totalExpenseVal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between py-3 bg-emerald-50 border border-emerald-200 px-3 rounded-lg text-emerald-900">
                  <span className="font-extrabold text-base">NET OPERATING PROFIT:</span>
                  <span className="font-black font-mono text-xl text-emerald-700">
                    ₹{netOperatingProfit.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
