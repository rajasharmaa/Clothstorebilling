import React from 'react';
import { User, ShopSettings } from '../../types';
import { UserCheck, Shield, ChevronDown } from 'lucide-react';

interface MobileHeaderProps {
  currentUser: User;
  shopSettings: ShopSettings;
  onSwitchUser: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentUser,
  shopSettings,
  onSwitchUser,
}) => {
  return (
    <header className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between shrink-0 shadow-md select-none sticky top-0 z-30">
      <div className="flex items-center space-x-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
          TC
        </div>
        <div className="min-w-0 overflow-hidden">
          <h1 className="font-black text-sm text-white tracking-wide truncate uppercase leading-tight">
            {shopSettings.shopName}
          </h1>
          <p className="text-[10px] text-blue-300 font-medium truncate">
            {shopSettings.tagline} • Non-GST Retail
          </p>
        </div>
      </div>

      <button
        onClick={onSwitchUser}
        className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 px-2.5 py-1.5 rounded-xl transition-all"
        title="Switch Staff Account"
      >
        <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
          {currentUser.name.charAt(0)}
        </div>
        <div className="text-left hidden xs:block">
          <div className="text-[11px] font-bold leading-tight max-w-[80px] truncate">
            {currentUser.name}
          </div>
          <div className="text-[9px] text-blue-400 font-mono leading-none">{currentUser.role}</div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>
    </header>
  );
};
