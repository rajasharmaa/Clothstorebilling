import React from 'react';
import { User, ShopSettings } from '../../types';
import { UserCheck, Shield, ChevronDown, Sun, Moon } from 'lucide-react';
import { LanguageSelector } from '../../lib/i18n';
import { useTheme } from '../../lib/theme';

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
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-slate-900 text-white px-3 py-2 flex items-center justify-between shrink-0 shadow-md select-none sticky top-0 z-30">
      <div className="flex items-center space-x-2 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
          TC
        </div>
        <div className="min-w-0 overflow-hidden">
          <h1 className="font-black text-xs text-white tracking-wide truncate uppercase leading-tight">
            {shopSettings.shopName}
          </h1>
          <p className="text-[9px] text-blue-300 font-medium truncate">
            {shopSettings.tagline}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1.5 shrink-0">
        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:text-white"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
        </button>

        {/* Language Switcher */}
        <LanguageSelector compact className="!text-[11px] !py-0.5 !px-2 bg-slate-800 text-slate-200 border-slate-700" />

        <button
          onClick={onSwitchUser}
          className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 px-2 py-1 rounded-lg transition-all"
          title="Switch Staff Account"
        >
          <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
            {currentUser.name.charAt(0)}
          </div>
          <div className="text-left hidden xs:block">
            <div className="text-[10px] font-bold leading-tight max-w-[60px] truncate">
              {currentUser.name}
            </div>
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
      </div>
    </header>
  );
};
