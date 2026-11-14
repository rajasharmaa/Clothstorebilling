import React from 'react';
import { ShoppingBag, Layers, Receipt, MoreHorizontal } from 'lucide-react';

export type MobileTab = 'billing' | 'stock' | 'bills' | 'more';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  setActiveTab: (tab: MobileTab) => void;
  cartCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
}) => {
  const tabs = [
    {
      id: 'billing' as MobileTab,
      label: 'New Bill',
      sublabel: 'नया बिल',
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      id: 'stock' as MobileTab,
      label: 'Stock',
      sublabel: 'स्टॉक',
      icon: Layers,
    },
    {
      id: 'bills' as MobileTab,
      label: 'History',
      sublabel: 'बिक्री पर्ची',
      icon: Receipt,
    },
    {
      id: 'more' as MobileTab,
      label: 'More',
      sublabel: 'अन्य मेन्यू',
      icon: MoreHorizontal,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-2xl safe-area-pb select-none">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <div
                  className={`w-9 h-7 rounded-xl flex items-center justify-center transition-colors ${
                    isActive ? 'bg-blue-100/80 text-blue-700' : 'text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 min-w-5 h-5 bg-rose-600 text-white text-[11px] font-black rounded-full px-1 flex items-center justify-center border-2 border-white shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] tracking-tight leading-tight mt-0.5 font-bold">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
