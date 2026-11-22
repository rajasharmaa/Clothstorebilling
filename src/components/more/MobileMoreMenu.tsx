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
  Database,
  Download,
  Upload,
} from 'lucide-react';
import { StorageService } from '../../lib/storage';
import { toast } from 'sonner';
import { ShopDashboard } from '../dashboard/ShopDashboard';
import { PurchaseManager } from '../purchases/PurchaseManager';
import { SupplierManager } from '../suppliers/SupplierManager';
import { CustomerManager } from '../customers/CustomerManager';
import { ReturnManager } from '../returns/ReturnManager';
import { ExpenseManager } from '../expenses/ExpenseManager';
import { ReportsManager } from '../reports/ReportsManager';
import { SettingsManager } from '../settings/SettingsManager';
import { useLanguage, LanguageSelector } from '../../lib/i18n';

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
  const { t, language } = useLanguage();
  const [subView, setSubView] = useState<MoreSubView>(initialSubView);

  const handleExportBackup = () => {
    const json = StorageService.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tara_pos_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(language === 'hi' ? 'डेटा बैकअप डाउनलोड हो गया' : 'Database backup downloaded');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (confirm(language === 'hi' ? 'बैकअप रिस्टोर करने से वर्तमान डेटा बदल जाएगा। क्या आप जारी रखना चाहते हैं?' : 'Importing will replace current data. Continue?')) {
        const res = StorageService.importBackup(content);
        if (res.success) {
          toast.success(language === 'hi' ? 'डेटा सफलतापूर्वक रिस्टोर हुआ! ऐप रिलोड हो रहा है...' : 'Database restored! Reloading...');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          toast.error(res.error || 'Failed to parse backup');
        }
      }
    };
    reader.readAsText(file);
  };

  const menuItems = [
    {
      id: 'dashboard' as const,
      title: language === 'hi' ? 'दुकान डैशबोर्ड' : 'Store Dashboard',
      subtitle: language === 'hi' ? 'दैनिक बिक्री व ग्राफ' : 'Daily Stats & Analytics',
      icon: LayoutDashboard,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      id: 'purchases' as const,
      title: language === 'hi' ? 'खरीदी एंट्री' : 'Purchase Stock In',
      subtitle: language === 'hi' ? 'नया माल स्टॉक में जोड़ें' : 'Add wholesale stock',
      icon: Truck,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      id: 'customers' as const,
      title: language === 'hi' ? 'ग्राहक व उधारी' : 'Customers & Dues',
      subtitle: language === 'hi' ? 'उधारी खाता व लेन-देन' : 'Khata & Credit ledger',
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      id: 'suppliers' as const,
      title: language === 'hi' ? 'सप्लायर (थोक विक्रेता)' : 'Suppliers & Vendors',
      subtitle: language === 'hi' ? 'होलसेल व्यापारी लिस्ट' : 'Wholesale vendor list',
      icon: Building,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      id: 'returns' as const,
      title: language === 'hi' ? 'वापसी व एक्सचेंज' : 'Returns & Exchange',
      subtitle: language === 'hi' ? 'कपड़ा वापसी व रिफंड' : 'Item return & refund',
      icon: RotateCcw,
      color: 'bg-orange-50 text-orange-600 border-orange-200',
    },
    {
      id: 'expenses' as const,
      title: language === 'hi' ? 'दुकान खर्चे' : 'Store Expenses',
      subtitle: language === 'hi' ? 'चाय, किराया, बिजली बिल' : 'Tea, rent, electricity',
      icon: Wallet,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
    },
    {
      id: 'reports' as const,
      title: language === 'hi' ? 'रिपोर्ट व हिसाब' : 'Reports & Accounts',
      subtitle: language === 'hi' ? 'मुनाफा व बिक्री रिपोर्ट' : 'Sales & profit reports',
      icon: BarChart3,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      id: 'settings' as const,
      title: language === 'hi' ? 'दुकान सेटिंग' : 'Shop Settings',
      subtitle: language === 'hi' ? 'दुकान नाम, UPI व प्रिंट' : 'Receipt, UPI & profile',
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
            <span>{language === 'hi' ? 'वापस मेन्यू' : 'Back to Menu'}</span>
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
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'hi' ? 'लॉगिन स्टाफ खाता' : 'Logged-in Staff'}
            </p>
          </div>
        </div>

        <button
          onClick={onSwitchUser}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs font-bold text-slate-700 rounded-xl transition-all"
        >
          {language === 'hi' ? 'बदलें (Switch)' : 'Switch'}
        </button>
      </div>

      {/* Language Switcher Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
            🌐
          </div>
          <div>
            <div className="font-black text-slate-900 text-sm">
              {language === 'hi' ? 'ऐप भाषा (Language)' : 'App Language'}
            </div>
            <p className="text-xs text-slate-500">
              {language === 'hi' ? 'वर्तमान: हिन्दी' : 'Current: English'}
            </p>
          </div>
        </div>
        <LanguageSelector />
      </div>

      {/* Title */}
      <div className="px-1 mb-2.5 flex items-center justify-between">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
          {language === 'hi' ? 'अन्य प्रबंधन टूल (Management Menu)' : 'Management Menu'}
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

      {/* Quick Data Backup & Restore Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs mb-4">
        <div className="flex items-center space-x-2 mb-2.5">
          <Database className="w-4 h-4 text-blue-600" />
          <span className="font-extrabold text-xs text-slate-800">
            {language === 'hi' ? 'डेटा बैकअप व रिस्टोर' : 'Data Backup & Restore'}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mb-3">
          {language === 'hi'
            ? 'अपनी दुकान का पूरा बिलिंग व स्टॉक डेटा JSON फाइल में सुरक्षित करें।'
            : 'Export or restore complete shop bills, inventory and customer database.'}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 hover:bg-blue-100 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'डाउनलोड बैकअप' : 'Download Backup'}</span>
          </button>
          <label className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'रिस्टोर बैकअप' : 'Restore Backup'}</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
        </div>
      </div>

      {/* Shop Info Footer Card */}
      <div className="bg-slate-200/70 rounded-2xl p-4 text-center border border-slate-300/60">
        <h4 className="font-black text-xs text-slate-800 tracking-wide uppercase">
          {shopSettings.shopName}
        </h4>
        <p className="text-[11px] text-slate-600 mt-0.5">{shopSettings.tagline}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{shopSettings.address}</p>
        <p className="text-[11px] text-slate-600 font-bold mt-1">
          {language === 'hi' ? 'फोन:' : 'Phone:'} {shopSettings.phone}
        </p>
        <div className="mt-3 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          Non-GST Retail Cash Memo System • Mobile POS
        </div>
      </div>
    </div>
  );
};
