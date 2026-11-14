import React, { useMemo } from 'react';
import { StorageService } from '../../lib/storage';
import { Product, Sale, Purchase, Expense, ReturnTransaction, ShopSettings, User } from '../../types';
import {
  IndianRupee,
  ShoppingCart,
  TrendingUp,
  Tag,
  AlertTriangle,
  Package,
  Layers,
  ArrowUpRight,
  Clock,
  Shirt,
  Receipt,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { ActiveTab } from '../layout/Sidebar';
import { useLanguage } from '../../lib/i18n';

interface ShopDashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
  shopSettings: ShopSettings;
  currentUser: User;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export const ShopDashboard: React.FC<ShopDashboardProps> = ({
  setActiveTab,
  shopSettings,
  currentUser,
}) => {
  const { tr, language, t } = useLanguage();
  const products = StorageService.getProducts();
  const sales = StorageService.getSales();
  const purchases = StorageService.getPurchases();
  const expenses = StorageService.getExpenses();
  const returns = StorageService.getReturns();
  const stockLedger = StorageService.getStockLedger();

  // Filter today's sales
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter((s) => s.status !== 'CANCELLED' && s.date.startsWith(todayStr));

  // Today metrics
  const todayRevenue = todaySales.reduce((acc, s) => acc + s.finalPayable, 0);
  const todayBillsCount = todaySales.length;
  const todayItemsCount = todaySales.reduce(
    (acc, s) => acc + s.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );
  const todayDiscount = todaySales.reduce((acc, s) => acc + s.totalDiscount, 0);
  const todayCollected = todaySales.reduce((acc, s) => acc + s.amountReceived, 0);
  const todayDues = todaySales.reduce((acc, s) => acc + s.balanceDue, 0);

  // Today's Gross Profit: Revenue - Historical COGS
  const todayCOGS = todaySales.reduce(
    (acc, s) =>
      acc +
      s.items.reduce(
        (sum, item) => sum + (item.purchasePriceSnapshot || 0) * item.quantity,
        0
      ),
    0
  );
  const todayGrossProfit = todayRevenue - todayCOGS;

  // Inventory Overview
  const totalVariants = products.reduce((acc, p) => acc + p.variants.length, 0);
  const totalStockQty = products.reduce(
    (acc, p) => acc + p.variants.reduce((sum, v) => sum + v.stock, 0),
    0
  );
  const lowStockThreshold = shopSettings.lowStockThresholdDefault || 3;
  const lowStockVariants = products.flatMap((p) =>
    p.variants.filter((v) => v.stock > 0 && v.stock <= (v.minStockAlert || lowStockThreshold))
  );
  const outOfStockVariants = products.flatMap((p) => p.variants.filter((v) => v.stock <= 0));

  const inventoryPurchaseValue = products.reduce(
    (acc, p) => acc + p.variants.reduce((sum, v) => sum + v.stock * v.purchasePrice, 0),
    0
  );
  const inventorySellingValue = products.reduce(
    (acc, p) => acc + p.variants.reduce((sum, v) => sum + v.stock * v.sellingPrice, 0),
    0
  );

  // Category wise sales data for charts
  const categorySalesMap: Record<string, number> = {};
  sales
    .filter((s) => s.status !== 'CANCELLED')
    .forEach((s) => {
      s.items.forEach((item) => {
        categorySalesMap[item.category] =
          (categorySalesMap[item.category] || 0) + item.finalAmount;
      });
    });

  const categoryChartData = Object.entries(categorySalesMap).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }));

  // Payment mode data for chart
  const paymentModeMap: Record<string, number> = {};
  sales
    .filter((s) => s.status !== 'CANCELLED')
    .forEach((s) => {
      paymentModeMap[s.paymentMode] = (paymentModeMap[s.paymentMode] || 0) + s.finalPayable;
    });

  const paymentChartData = Object.entries(paymentModeMap).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }));

  // Daily sales chart for past 7 days
  const past7DaysData = useMemo(() => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      const daySales = sales.filter((s) => s.status !== 'CANCELLED' && s.date.startsWith(str));
      const total = daySales.reduce((acc, s) => acc + s.finalPayable, 0);
      list.push({ date: dayLabel, sales: total });
    }
    return list;
  }, [sales]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/70 select-none">
      {/* Top Banner & Quick Action */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-900/60 px-2.5 py-1 rounded-full border border-blue-700/50">
            Real-Time Shop Overview
          </span>
          <h2 className="text-2xl font-black mt-2 tracking-tight">
            Welcome to {shopSettings.shopName}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {shopSettings.tagline} • Non-GST Retail POS & Automated Stock Ledger
          </p>
        </div>

        <button
          onClick={() => setActiveTab('billing')}
          className="flex items-center space-x-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{tr('Quick Billing')}</span>
        </button>
      </div>

      {/* KPI Cards: Today's Business */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          {language === 'hi' ? 'आज का व्यापार (Today Performance)' : "Today's Performance"}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>{tr("Today's Sales")}</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-slate-900 font-mono">
                ₹{todayRevenue.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {todayBillsCount} {language === 'hi' ? 'बिल' : 'bills'} • {todayItemsCount} {language === 'hi' ? 'कपड़े' : 'items'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>{language === 'hi' ? 'कुल दी गई छूट' : 'Total Discounts Given'}</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Tag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-emerald-600 font-mono">
                ₹{todayDiscount.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{language === 'hi' ? 'ग्राहकों की बचत' : 'Dual discount savings'}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>{language === 'hi' ? 'जमा कैश / उधारी' : 'Collected / Dues'}</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-slate-900 font-mono">
                ₹{todayCollected.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {todayDues > 0 ? (
                  <span className="text-rose-600 font-bold">₹{todayDues.toFixed(2)} {language === 'hi' ? 'उधारी बाकी' : 'Pending Due'}</span>
                ) : (
                  <span className="text-emerald-600 font-bold">{language === 'hi' ? 'कोई उधारी नहीं' : 'No Dues Pending'}</span>
                )}
              </div>
            </div>
          </div>

          {currentUser.role !== 'CASHIER' && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Est. Gross Profit</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-blue-700 font-mono">
                  ₹{todayGrossProfit.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Based on historical COGS</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards: Inventory Overview */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Inventory Valuation & Alerts
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Total Live Stock</span>
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono mt-2">
              {totalStockQty} Pcs
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {products.length} Products • {totalVariants} Variants
            </div>
          </div>

          <div
            onClick={() => setActiveTab('inventory')}
            className="bg-white rounded-xl p-4 border border-slate-200 hover:border-amber-400 shadow-xs cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
              <span>Low Stock Alerts</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-600 font-mono mt-2">
              {lowStockVariants.length} Variants
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Stock &lt;= {lowStockThreshold} pcs</div>
          </div>

          <div
            onClick={() => setActiveTab('inventory')}
            className="bg-white rounded-xl p-4 border border-slate-200 hover:border-rose-400 shadow-xs cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-rose-700 text-xs font-semibold">
              <span>Out of Stock</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-600 font-mono mt-2">
              {outOfStockVariants.length} Variants
            </div>
            <div className="text-xs text-slate-500 mt-0.5">0 pcs available</div>
          </div>

          {currentUser.role !== 'CASHIER' && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Inventory Valuation</span>
                <Layers className="w-4 h-4 text-slate-600" />
              </div>
              <div className="text-xl font-black text-slate-900 font-mono mt-2">
                ₹{inventoryPurchaseValue.toFixed(0)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Selling value: ₹{inventorySellingValue.toFixed(0)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Past 7 Days Sales Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">7-Day Sales Trend</h4>
              <p className="text-xs text-slate-500">Daily retail collection (₹)</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={past7DaysData}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: number) => [`₹${val.toFixed(2)}`, 'Sales']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="sales" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Sales by Category</h4>
              <p className="text-xs text-slate-500">Clothing category revenue share</p>
            </div>
          </div>
          <div className="h-56">
            {categoryChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No sales recorded yet. Generate your first bill to see live analytics!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`₹${val.toFixed(2)}`, 'Revenue']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Recent Cash Memos</h4>
            <p className="text-xs text-slate-500">Latest completed retail sales</p>
          </div>
          <button
            onClick={() => setActiveTab('sales')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            View All Sales →
          </button>
        </div>

        {sales.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No sales recorded yet. Click "New Cash Memo" to make your first sale.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Bill Number</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 text-right">Discount</th>
                  <th className="py-2.5 px-3 text-right">Grand Total</th>
                  <th className="py-2.5 px-3 text-center">Payment</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {sales.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-blue-600">{s.billNumber}</td>
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(s.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 text-slate-800">
                      {s.customerName || 'Walk-in'}
                      {s.customerMobile && (
                        <div className="text-[10px] text-slate-400 font-mono">{s.customerMobile}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{s.items.length} items</td>
                    <td className="py-3 px-3 text-right font-mono">
                      ₹{s.totalOriginalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-600 font-mono">
                      {s.totalDiscount > 0 ? `-₹${s.totalDiscount.toFixed(2)}` : '₹0.00'}
                    </td>
                    <td className="py-3 px-3 text-right font-black font-mono text-slate-900">
                      ₹{s.finalPayable.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">
                        {s.paymentMode}
                      </span>
                    </td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
