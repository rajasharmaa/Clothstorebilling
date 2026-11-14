import React from 'react';
import {
  LucideIcon,
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  Layers,
  ShoppingBag,
  Truck,
  Users,
  RotateCcw,
  Wallet,
  BarChart3,
  Settings,
  Sparkles,
  Shirt,
} from 'lucide-react';
import { useLanguage } from '../../lib/i18n';

export type ActiveTab =
  | 'dashboard'
  | 'billing'
  | 'sales'
  | 'products'
  | 'inventory'
  | 'purchases'
  | 'suppliers'
  | 'customers'
  | 'returns'
  | 'expenses'
  | 'reports'
  | 'settings';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: LucideIcon;
  highlight?: boolean;
  badge?: string;
}

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  shopName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, shopName }) => {
  const { tr, language } = useLanguage();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: tr('Dashboard'), icon: LayoutDashboard },
    {
      id: 'billing',
      label: tr('New Billing'),
      icon: ShoppingCart,
      highlight: true,
      badge: 'F1',
    },
    { id: 'sales', label: tr('Sales History'), icon: Receipt },
    { id: 'products', label: tr('Products'), icon: Shirt },
    { id: 'inventory', label: tr('Inventory / Stock'), icon: Layers },
    { id: 'purchases', label: tr('Purchase Entry'), icon: ShoppingBag },
    { id: 'suppliers', label: tr('Suppliers'), icon: Truck },
    { id: 'customers', label: tr('Customers'), icon: Users },
    { id: 'returns', label: tr('Returns & Exchange'), icon: RotateCcw },
    { id: 'expenses', label: tr('Expenses'), icon: Wallet },
    { id: 'reports', label: tr('Reports & Analytics'), icon: BarChart3 },
    { id: 'settings', label: tr('Settings'), icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col h-screen shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/40">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-xl tracking-wider">
          TC
        </div>
        <div className="overflow-hidden">
          <h1 className="font-bold text-white text-base leading-tight truncate tracking-wide">
            {shopName}
          </h1>
          <p className="text-[11px] text-blue-400 font-medium tracking-tight">
            {language === 'hi' ? 'कपड़ा बिलिंग व स्टॉक' : 'Retail POS & Stock'}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.highlight) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg font-semibold text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-blue-950/60 text-blue-300 hover:bg-blue-900/60 border border-blue-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-blue-200" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-blue-500/30 text-blue-200 px-1.5 py-0.5 rounded font-mono border border-blue-400/20">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold border-l-4 border-blue-500'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Non-GST Retail Memo</span>
        </span>
        <span className="text-slate-500 font-mono">v2.0</span>
      </div>
    </aside>
  );
};
