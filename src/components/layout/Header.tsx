import React, { useState, useEffect } from 'react';
import { User, ShopSettings } from '../../types';
import {
  UserCheck,
  Clock,
  Printer,
  Keyboard,
  LogOut,
  Shield,
  Store,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { LanguageSelector } from '../../lib/i18n';
import { useTheme } from '../../lib/theme';

interface HeaderProps {
  currentUser: User;
  onSwitchUserClick: () => void;
  shopSettings: ShopSettings;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchUserClick,
  shopSettings,
  setActiveTab,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MANAGER':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 select-none">
      {/* Left: Shop Tagline & Fast Action */}
      <div className="flex items-center space-x-4">
        <div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full uppercase tracking-wider dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
            {shopSettings.tagline}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{shopSettings.address}</p>
        </div>
      </div>

      {/* Right: Actions, Theme, Language, Clock, User Profile */}
      <div className="flex items-center space-x-3">
        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Language Switcher */}
        <LanguageSelector compact />

        {/* Live Clock */}
        <div className="hidden sm:flex items-center space-x-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
          <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>{currentTime}</span>
        </div>

        {/* Current User & Role Switcher */}
        <button
          onClick={onSwitchUserClick}
          className="flex items-center space-x-2.5 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          title="Click to Switch User / Role"
        >
          <div className="w-7 h-7 rounded-full bg-slate-800 dark:bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
            {currentUser.name.charAt(0)}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
              {currentUser.name}
            </div>
            <div className="flex items-center space-x-1">
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${getRoleBadge(
                  currentUser.role
                )}`}
              >
                {currentUser.role}
              </span>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </header>
  );
};
