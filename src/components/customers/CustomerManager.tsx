import React, { useState } from 'react';
import { Customer, User, ShopSettings } from '../../types';
import { StorageService } from '../../lib/storage';
import { Users, Plus, Search, Phone, MapPin, IndianRupee, Edit2, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../lib/i18n';

interface CustomerManagerProps {
  currentUser: User;
  shopSettings: ShopSettings;
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({ currentUser, shopSettings }) => {
  const { tr, language } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>(StorageService.getCustomers());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const reload = () => setCustomers(StorageService.getCustomers());

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.mobile.includes(q);
  });

  const handleOpenAdd = () => {
    setEditingCustomer({
      id: 'cust_' + Date.now(),
      name: '',
      mobile: '',
      address: '',
      customerType: 'Regular',
      totalBills: 0,
      totalPurchases: 0,
      outstandingDue: 0,
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    if (!editingCustomer.name.trim() || !editingCustomer.mobile.trim()) {
      toast.error('Customer name and mobile number are required');
      return;
    }
    StorageService.saveCustomer(editingCustomer);
    toast.success('Customer profile saved');
    setIsModalOpen(false);
    reload();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 select-none">
      {/* Header Bar */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">
              {language === 'hi' ? 'ग्राहक व उधारी खाता' : 'Customer Directory & Credit'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'hi' ? 'ग्राहक फोन नंबर, उधारी बाकी और खरीदारी का पूरा हिसाब' : 'Manage retail customers, store credits, purchase history, and contact details'}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'hi' ? 'नया ग्राहक जोड़ें' : 'Add Customer'}</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-white flex items-center shrink-0">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'ग्राहक का नाम या मोबाइल नंबर से खोजें...' : 'Search by Customer Name, Mobile Number...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Customer Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-slate-900">{c.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        c.customerType === 'VIP'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {c.customerType}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">{c.mobile}</div>
                </div>
                <button
                  onClick={() => {
                    setEditingCustomer(c);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {c.address && (
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{c.address}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-slate-500 text-[10px]">Total Bills</div>
                  <div className="font-bold font-mono text-slate-800">{c.totalBills || 0}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-slate-500 text-[10px]">Total Spent</div>
                  <div className="font-bold font-mono text-blue-700">
                    ₹{(c.totalPurchases || 0).toFixed(0)}
                  </div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-slate-500 text-[10px]">Due Balance</div>
                  <div
                    className={`font-bold font-mono ${
                      c.outstandingDue > 0 ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    ₹{(c.outstandingDue || 0).toFixed(0)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Edit Modal */}
      {isModalOpen && editingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Customer Profile</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingCustomer.name}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, name: e.target.value })
                  }
                  placeholder="e.g. Vikas Sharma"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={editingCustomer.mobile}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, mobile: e.target.value })
                  }
                  placeholder="e.g. 9827012345"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Customer Type
                </label>
                <select
                  value={editingCustomer.customerType}
                  onChange={(e) =>
                    setEditingCustomer({
                      ...editingCustomer,
                      customerType: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Regular">Regular Customer</option>
                  <option value="VIP">VIP Customer</option>
                  <option value="Wholesale">Wholesale / Bulk Buyer</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Address / Area
                </label>
                <input
                  type="text"
                  value={editingCustomer.address || ''}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, address: e.target.value })
                  }
                  placeholder="e.g. Chhawni / Navlakha, Indore"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
