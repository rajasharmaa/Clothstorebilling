import React, { useState } from 'react';
import { ShopSettings, User } from '../../types';
import { StorageService } from '../../lib/storage';
import {
  Settings,
  Store,
  Printer,
  Shield,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Play,
  KeyRound,
  Plus,
  Trash2,
  Sun,
  Moon,
} from 'lucide-react';
import { toast } from 'sonner';
import { runDiscountVerification } from '../../lib/discount.test';
import { LanguageSelector } from '../../lib/i18n';
import { useTheme } from '../../lib/theme';

interface SettingsManagerProps {
  currentUser: User;
  shopSettings: ShopSettings;
  onSettingsUpdated: (settings: ShopSettings) => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  currentUser,
  shopSettings,
  onSettingsUpdated,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'shop' | 'billing' | 'users' | 'backup' | 'tests'>(
    'shop'
  );
  const { theme, toggleTheme } = useTheme();

  // Settings state
  const [formSettings, setFormSettings] = useState<ShopSettings>({ ...shopSettings });

  // Users state
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<User['role']>('CASHIER');
  const [newUserPin, setNewUserPin] = useState('0000');

  // Test Runner state
  const [testResults, setTestResults] = useState<{ passed: boolean; results: string[] } | null>(
    null
  );

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role === 'CASHIER') {
      toast.error('Cashiers cannot modify system settings');
      return;
    }

    StorageService.saveSettings(formSettings);
    onSettingsUpdated(formSettings);
    toast.success('Shop settings updated successfully');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const newUser: User = {
      id: 'u_' + Date.now(),
      name: newUserName.trim(),
      username: newUserName.trim().toLowerCase().replace(/\s+/g, '_'),
      role: newUserRole,
      pin: newUserPin,
      active: true,
    };

    const updated = [...users, newUser];
    StorageService.saveUsers(updated);
    setUsers(updated);
    setNewUserName('');
    setNewUserPin('0000');
    toast.success(`User ${newUser.name} created`);
  };

  const handleDeleteUser = (id: string) => {
    if (users.length <= 1) {
      toast.error('Cannot delete the only remaining user');
      return;
    }
    const updated = users.filter((u) => u.id !== id);
    StorageService.saveUsers(updated);
    setUsers(updated);
    toast.success('User deleted');
  };

  const handleExportBackup = () => {
    const json = StorageService.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tara_collection_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Database backup downloaded');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (confirm('Importing this backup will overwrite current data. Continue?')) {
        const res = StorageService.importBackup(content);
        if (res.success) {
          toast.success('Database restored successfully! Reloading...');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          toast.error(res.error || 'Failed to parse backup');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (
      confirm(
        'Are you sure you want to reset all data back to the original Tara Collection demo state?'
      )
    ) {
      StorageService.resetToDemo();
      toast.success('Reset complete. Reloading app...');
      setTimeout(() => window.location.reload(), 800);
    }
  };

  const handleRunDiscountTests = () => {
    const results = runDiscountVerification();
    setTestResults(results);
    if (results.passed) {
      toast.success('All dual discount verification tests passed!');
    } else {
      toast.error('One or more discount tests failed');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 select-none">
      {/* Header Bar */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">System Settings & Controls</h2>
            <p className="text-xs text-slate-500">
              Configure shop profile, bill formatting, cashier permissions, backup & diagnostics
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="p-4 border-b border-slate-200 bg-white flex items-center space-x-2 shrink-0 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('shop')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'shop'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Shop Information
        </button>
        <button
          onClick={() => setActiveSubTab('billing')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'billing'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Billing & Hardware
        </button>
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'users'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Staff & Roles
        </button>
        <button
          onClick={() => setActiveSubTab('backup')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'backup'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Backup & Restore
        </button>
        <button
          onClick={() => setActiveSubTab('tests')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'tests'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Self-Check Diagnostics
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          {/* TAB 1: SHOP INFORMATION */}
          {activeSubTab === 'shop' && (
            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Shop Identity & Receipts
                </h3>
              </div>

              {/* Language & Theme Switcher Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                      <span>🌐</span>
                      <span>Language / भाषा</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      English, हिन्दी, मराठी
                    </p>
                  </div>
                  <LanguageSelector />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                      {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-blue-500" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                      <span>Theme Mode</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold shadow-xs hover:bg-slate-100"
                  >
                    {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Shop Name *
                </label>
                <input
                  type="text"
                  required
                  value={formSettings.shopName}
                  onChange={(e) => setFormSettings({ ...formSettings, shopName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Tagline / Specialization *
                </label>
                <input
                  type="text"
                  required
                  value={formSettings.tagline}
                  onChange={(e) => setFormSettings({ ...formSettings, tagline: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSettings.phone}
                    onChange={(e) => setFormSettings({ ...formSettings, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Billing Mode
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formSettings.billingType}
                    className="w-full px-3 py-2 text-sm border border-slate-200 bg-slate-50 text-slate-500 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Shop Address *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formSettings.address}
                  onChange={(e) => setFormSettings({ ...formSettings, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* UPI Dynamic QR Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <div>
                  <label className="block font-bold text-emerald-900 uppercase mb-1">
                    UPI ID (QR Code Payment) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="7000627153@upi"
                    value={formSettings.upiId || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, upiId: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-800 bg-white"
                  />
                  <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                    e.g. 7000627153@upi, 7000627153@okbizaxis, or 7000627153@paytm
                  </p>
                </div>
                <div>
                  <label className="block font-bold text-emerald-900 uppercase mb-1">
                    UPI Payee Name
                  </label>
                  <input
                    type="text"
                    placeholder="TARA COLLECTION"
                    value={formSettings.upiPayeeName || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, upiPayeeName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 bg-white"
                  />
                  <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                    Name displayed inside customer UPI payment app
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Receipt Footer Message
                </label>
                <input
                  type="text"
                  value={formSettings.receiptFooter}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, receiptFooter: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Exchange Policy Condition
                </label>
                <textarea
                  rows={2}
                  value={formSettings.exchangePolicy}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, exchangePolicy: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Shop Profile
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: BILLING & HARDWARE */}
          {activeSubTab === 'billing' && (
            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <h3 className="font-extrabold text-slate-900 text-sm mb-4">
                Billing Rules & Hardware Setup
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Bill Number Prefix
                  </label>
                  <input
                    type="text"
                    value={formSettings.billPrefix}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, billPrefix: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Default Receipt Paper Size
                  </label>
                  <select
                    value={formSettings.receiptPaperSize}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        receiptPaperSize: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="80mm">80mm Thermal (Standard Retail)</option>
                    <option value="58mm">58mm Thermal (Compact)</option>
                    <option value="A4">A4 Full Sheet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Currency & Symbol
                  </label>
                  <select
                    value={formSettings.currencySymbol}
                    onChange={(e) => {
                      const sym = e.target.value;
                      const cur =
                        sym === '₹'
                          ? 'INR'
                          : sym === '$'
                          ? 'USD'
                          : sym === '€'
                          ? 'EUR'
                          : sym === '£'
                          ? 'GBP'
                          : 'INR';
                      setFormSettings({
                        ...formSettings,
                        currencySymbol: sym,
                        currency: cur,
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="₹">₹ INR (Indian Rupee)</option>
                    <option value="$">$ USD (US Dollar)</option>
                    <option value="€">€ EUR (Euro)</option>
                    <option value="£">£ GBP (British Pound)</option>
                    <option value="AED">AED (UAE Dirham)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Default Item Discount (₹/Piece)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formSettings.defaultItemDiscountPerPiece}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        defaultItemDiscountPerPiece: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Cashier Max Discount Limit (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formSettings.cashierMaxDiscount}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        cashierMaxDiscount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Manager Max Discount Limit (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formSettings.managerMaxDiscount}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        managerMaxDiscount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Default Auto Discount Per Piece (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formSettings.defaultItemDiscountPerPiece ?? 50}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        defaultItemDiscountPerPiece: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Default Low Stock Threshold (Pcs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formSettings.lowStockThresholdDefault}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        lowStockThresholdDefault: parseInt(e.target.value) || 3,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="negativeStock"
                  checked={formSettings.allowNegativeStock}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, allowNegativeStock: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label
                  htmlFor="negativeStock"
                  className="font-semibold text-slate-800 cursor-pointer"
                >
                  Allow Negative Stock Billing
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Billing Preferences
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: USERS & ROLES */}
          {activeSubTab === 'users' && (
            <div className="space-y-5 text-xs">
              <h3 className="font-extrabold text-slate-900 text-sm">Staff & Cashier Accounts</h3>

              <div className="space-y-2">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Role: <span className="font-semibold text-blue-700">{u.role}</span> • PIN:{' '}
                        <span className="font-mono">{u.pin}</span>
                      </div>
                    </div>
                    {users.length > 1 && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {currentUser.role === 'ADMIN' && (
                <form
                  onSubmit={handleAddUser}
                  className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3"
                >
                  <div className="font-bold text-blue-900">Add New Staff Member</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Staff Name"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold"
                    >
                      <option value="CASHIER">Cashier</option>
                      <option value="MANAGER">Store Manager</option>
                      <option value="ADMIN">Owner / Admin</option>
                    </select>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="4-digit PIN"
                      value={newUserPin}
                      onChange={(e) => setNewUserPin(e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-mono text-center tracking-widest"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                  >
                    + Create Staff Account
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: BACKUP & RESTORE */}
          {activeSubTab === 'backup' && (
            <div className="space-y-6 text-xs">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm mb-1">
                  Database Backup & Restoration
                </h3>
                <p className="text-slate-500">
                  Export complete catalogue, sales transactions, purchase bills, and audit logs to an
                  offline JSON snapshot.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 text-sm">Export Full Backup</div>
                  <div className="text-slate-500">
                    Saves entire shop state to a single portable file
                  </div>
                </div>
                <button
                  onClick={handleExportBackup}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup</span>
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 text-sm">Restore from Backup</div>
                  <div className="text-slate-500">Upload a previously exported backup file</div>
                </div>
                <label className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Restore File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-rose-700">
                  <div>
                    <div className="font-bold">Reset Demo Database</div>
                    <div className="text-slate-400">
                      Re-initializes fresh Tara Collection apparel catalogue and demo transactions
                    </div>
                  </div>
                  <button
                    onClick={handleResetDemo}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold rounded-xl"
                  >
                    Reset Demo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SELF-CHECK DIAGNOSTICS */}
          {activeSubTab === 'tests' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm mb-1">
                  Automated Self-Check Verification
                </h3>
                <p className="text-slate-500">
                  Executes requirements verification suite (Section 26) testing discount rounding,
                  subtotals, dual sync, and limits.
                </p>
              </div>

              <button
                onClick={handleRunDiscountTests}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center space-x-2 shadow-md"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Run Discount & Math Tests Now</span>
              </button>

              {testResults && (
                <div
                  className={`p-4 rounded-xl border ${
                    testResults.passed
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-rose-50 border-rose-200'
                  }`}
                >
                  <div className="font-bold text-sm mb-2">
                    {testResults.passed ? '✓ ALL TESTS PASSED' : '❌ VERIFICATION FAILED'}
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    {testResults.results.map((r, i) => (
                      <div key={i}>{r}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
