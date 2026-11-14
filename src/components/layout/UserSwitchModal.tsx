import React, { useState } from 'react';
import { User } from '../../types';
import { StorageService } from '../../lib/storage';
import { X, Lock, KeyRound, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../lib/i18n';

interface UserSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUserChanged: (user: User) => void;
}

export const UserSwitchModal: React.FC<UserSwitchModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
}) => {
  const { tr, language } = useLanguage();
  const [users] = useState<User[]>(StorageService.getUsers());
  const [selectedUser, setSelectedUser] = useState<User | null>(currentUser);
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (selectedUser.pin && pin !== selectedUser.pin) {
      setError(language === 'hi' ? 'इस यूज़र के लिए गलत 4-अंकों का पिन है' : 'Invalid 4-digit PIN for this user');
      return;
    }

    StorageService.setCurrentUser(selectedUser);
    onUserChanged(selectedUser);
    toast.success(language === 'hi' ? `सक्रिय यूज़र ${selectedUser.name} में बदला गया` : `Switched active user to ${selectedUser.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">{tr('Switch Cashier / Role')}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSwitch} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {tr('Select Staff Account')}
            </label>
            <div className="space-y-2">
              {users.map((u) => {
                const isSelected = selectedUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(u);
                      setError('');
                      setPin('');
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm">{u.name}</div>
                      <div className="text-xs text-slate-500">
                        Role:{' '}
                        <span className="font-mono font-medium text-slate-700">{u.role}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {tr('Enter 4-Digit Security PIN')}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                placeholder={language === 'hi' ? 'पिन दर्ज करें (उदा. 1234)' : 'Default: Admin 1234, Mgr 2345, Cashier 0000'}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-widest text-center"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-rose-600 font-medium mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {tr('Cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md shadow-blue-500/20"
            >
              {language === 'hi' ? 'सत्यापित करें व बदलें' : 'Authorize & Switch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
