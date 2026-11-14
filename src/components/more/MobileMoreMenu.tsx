import React, { useState } from 'react';
import { User, ShopSettings } from '../../types';
import {
  LayoutDashboard,
  Truck,
  Users,
  RotateCcw,
  Wallet,
  BarChart3,
  Settings,
  ShoppingBag,
  ArrowLeft,
  UserCheck,
  Building,
  Phone,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { ShopDashboard } from '../dashboard/ShopDashboard';
import { PurchaseManager } from '../purchases/PurchaseManager';
import { SupplierManager } from '../suppliers/SupplierManager';
import { CustomerManager } from '../customers/CustomerManager';
import { ReturnManager } from '../returns/ReturnManager';
import { ExpenseManager } from '../expenses/ExpenseManager';
import { ReportsManager } from '../reports/ReportsManager';
import { SettingsManager } from '../settings/SettingsManager';

export type MoreSubView =
  | 'dashboard'
  | 'purchases'
  | 'suppliers'
  | 'customers'
  | 'returns'
  | 'expenses'
  | 'reports'
  | 'settings'
  | null;

interface MobileMoreMenuProps {
  currentUser: User;
  shopSettings: ShopSettings;
  onSettingsUpdated: (settings: ShopSettings) => void;
  onSwitchUser: () => void;
  onNavigateToBilling: () => void;
  initialSubView?: MoreSubView;
}

export const MobileMoreMenu: React.FC<MobileMoreMenuProps> = ({
  currentUser,
  shopSettings,
  onSettingsUpdated,
  onSwitchUser,
  onNavigateToBilling,
  initialSubView = null,
}) => {
  const [subView, setSubView] = useState<MoreSubView>(initialSubView);

  const menuItems = [
    {
      id: 'dashboard' as const,
      title: 'दुकान डैशबोर्ड',
      subtitle: 'Dashboard & Daily Stats',
      icon: LayoutDashboard,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      id: 'purchases' as const,
      title: 'खरीदी एंट्री',
      subtitle: 'Purchase Stock In',
      icon: Truck,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      id: 'customers' as const,
      title: 'ग्राहक व उधारी',
      subtitle: 'Customer & Khata Dues',
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      id: 'suppliers' as const,
      title: 'सप्लायर (थोक विक्रेता)',
      subtitle: 'Suppliers & Vendors',
      icon: Building,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      id: 'returns' as const,
      title: 'वापसी व एक्सचेंज',
      subtitle: 'Returns & Exchange',
      icon: RotateCcw,
      color: 'bg-orange-50 text-orange-600 border-orange-200',
    },
    {
      id: 'expenses' as const,
      title: 'दुकान खर्चे',
      subtitle: 'Daily Expenses',
      icon: Wallet,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
    },
    {
      id: 'reports' as const,
      title: 'रिपोर्ट व हिसाब',
      subtitle: 'Sales & Profit Reports',
      icon: BarChart3,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      id: 'settings' as const,
      title: 'दुकान सेटिंग',
      subtitle: 'Receipt & Shop Settings',
      icon: Settings,
      color: 'bg-slate-100 text-slate-700 border-slate-300',
    },
  ];

  // If a subview is selected, render the subview with a top back bar
  if (subView !== null) {
    const currentItem = menuItems.find((m) => m.id === subView);

    return (
      <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden pb-16">
        {/* Subview Sticky Back Header */}
        <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between shadow-xs shrink-0 select-none">
          <button
            onClick={() => setSubView(null)}
            className="flex items-center space-x-2 text-slate-700 active:scale-95 transition-all font-bold text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>मेन्यू (Back)</span>
          </button>

          <div className="text-right">
            <h2 className="text-sm font-black text-slate-900 leading-tight">
              {currentItem?.title}
            </h2>
            <p className="text-[10px] text-slate-500 font-medium">
              {currentItem?.subtitle}
            </p>
          </div>
        </div>

        {/* Subview Content */}
        <div className="flex-1 overflow-y-auto">
          {subView === 'dashboard' && (
            <ShopDashboard
              setActiveTab={(tab) => {
                if (tab === 'billing') onNavigateToBilling();
                else if (
                  tab === 'purchases' ||
                  tab === 'suppliers' ||
                  tab === 'customers' ||
                  tab === 'returns' ||
                  tab === 'expenses' ||
                  tab === 'reports' ||
                  tab === 'settings'
                ) {
                  setSubView(tab as MoreSubView);
                }
              }}
              shopSettings={shopSettings}
              currentUser={currentUser}
            />
          )}

          {subView === 'purchases' && (
            <PurchaseManager currentUser={currentUser} shopSettings={shopSettings} />
          )}

          {subView === 'suppliers' && (
            <SupplierManager currentUser={currentUser} shopSettings={shopSettings} />
          )}

          {subView === 'customers' && (
            <CustomerManager currentUser={currentUser} shopSettings={shopSettings} />
          )}

          {subView === 'returns' && (
            <ReturnManager currentUser={currentUser} shopSettings={shopSettings} />
          )}

          {subView === 'expenses' && (
            <ExpenseManager currentUser={currentUser} shopSettings={shopSettings} />
          )}

          {subView === 'reports' && (
            <ReportsManager currentUser={currentUser} shopSettings={shopSettings} />
          )}

          {subView === 'settings' && (
            <SettingsManager
              currentUser={currentUser}
              shopSettings={shopSettings}
              onSettingsUpdated={onSettingsUpdated}
            />
          )}
        </div>
      </div>
    );
  }

  // Primary Grid Menu
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-y-auto p-4 pb-24 select-none">
      {/* Current User Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-slate-900 text-sm">{currentUser.name}</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">लॉगिन स्टाफ खाता</p>
          </div>
        </div>

        <button
          onClick={onSwitchUser}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs font-bold text-slate-700 rounded-xl transition-all"
        >
          बदलें (Switch)
        </button>
      </div>

      {/* Title */}
      <div className="px-1 mb-2.5 flex items-center justify-between">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
          अन्य प्रबंधन टूल (Management Menu)
        </h3>
      </div>

      {/* 2-Column Touch Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setSubView(item.id)}
              className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-400 active:scale-95 transition-all shadow-xs text-left flex flex-col justify-between h-32 group"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.color}`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>

              <div>
                <div className="font-black text-sm text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {item.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Shop Info Footer Card */}
      <div className="bg-slate-200/70 rounded-2xl p-4 text-center border border-slate-300/60">
        <h4 className="font-black text-xs text-slate-800 tracking-wide uppercase">
          {shopSettings.shopName}
        </h4>
        <p className="text-[11px] text-slate-600 mt-0.5">{shopSettings.tagline}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{shopSettings.address}</p>
        <p className="text-[11px] text-slate-600 font-bold mt-1">फोन: {shopSettings.phone}</p>
        <div className="mt-3 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          Non-GST Retail Cash Memo System • Mobile POS
        </div>
      </div>
    </div>
  );
};
