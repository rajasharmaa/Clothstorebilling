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
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

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
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 select-none">
      {/* Left: Shop Tagline & Fast Action */}
      <div className="flex items-center space-x-4">
        <div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {shopSettings.tagline}
          </span>
          <p className="text-xs text-slate-500 mt-0.5">{shopSettings.address}</p>
        </div>
      </div>

      {/* Right: Actions, Clock, User Profile */}
      <div className="flex items-center space-x-4">
        {/* Live Clock */}
        <div className="hidden sm:flex items-center space-x-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{currentTime}</span>
        </div>

        {/* Current User & Role Switcher */}
        <button
          onClick={onSwitchUserClick}
          className="flex items-center space-x-2.5 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
          title="Click to Switch User / Role"
        >
          <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
            {currentUser.name.charAt(0)}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">
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
