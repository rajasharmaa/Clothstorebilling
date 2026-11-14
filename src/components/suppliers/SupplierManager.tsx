import React, { useState } from 'react';
import { Supplier, User, ShopSettings } from '../../types';
import { StorageService } from '../../lib/storage';
import { Truck, Plus, Search, Phone, MapPin, IndianRupee, Edit2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../lib/i18n';

interface SupplierManagerProps {
  currentUser: User;
  shopSettings: ShopSettings;
}

export const SupplierManager: React.FC<SupplierManagerProps> = ({ currentUser, shopSettings }) => {
  const { tr, language } = useLanguage();
  const [suppliers, setSuppliers] = useState<Supplier[]>(StorageService.getSuppliers());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const reload = () => setSuppliers(StorageService.getSuppliers());

  const filtered = suppliers.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.businessName.toLowerCase().includes(q) ||
      s.mobile.includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingSupplier({
      id: 'sup_' + Date.now(),
      name: '',
      businessName: '',
      mobile: '',
      address: '',
      openingBalance: 0,
      totalPurchases: 0,
      totalPaid: 0,
      outstandingBalance: 0,
      notes: '',
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    if (!editingSupplier.name.trim() || !editingSupplier.mobile.trim()) {
      toast.error('Name and Mobile number are required');
      return;
    }
    StorageService.saveSupplier(editingSupplier);
    toast.success('Supplier details saved');
    setIsModalOpen(false);
    reload();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 select-none">
      {/* Header Bar */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">
              {language === 'hi' ? 'थोक सप्लायर व व्यापारी' : 'Suppliers & Vendor Accounts'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'hi' ? 'कपड़ा निर्माता, होलसेल सप्लायर और बकाया लेन-देन का हिसाब' : 'Manage clothing manufacturers, fabric suppliers, and outstanding purchase dues'}
            </p>
          </div>
        </div>

        {currentUser.role !== 'CASHIER' && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'hi' ? 'नया सप्लायर जोड़ें' : 'Add Supplier'}</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-white flex items-center shrink-0">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'सप्लायर नाम, फर्म या फोन से खोजें...' : 'Search by Supplier Name, Business, Mobile...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Search by Contact Name, Business, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Supplier Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{s.businessName || s.name}</h3>
                  <div className="text-xs text-slate-500 font-medium">Contact: {s.name}</div>
                </div>
                {currentUser.role !== 'CASHIER' && (
                  <button
                    onClick={() => {
                      setEditingSupplier(s);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{s.mobile}</span>
                </div>
                {s.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{s.address}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-slate-500 text-[10px]">Total Purchases</div>
                  <div className="font-bold font-mono text-slate-800">
                    ₹{s.totalPurchases.toFixed(2)}
                  </div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-slate-500 text-[10px]">Outstanding Balance</div>
                  <div
                    className={`font-bold font-mono ${
                      s.outstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    ₹{s.outstandingBalance.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supplier Modal */}
      {isModalOpen && editingSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Supplier Information</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={editingSupplier.name}
                  onChange={(e) =>
                    setEditingSupplier({ ...editingSupplier, name: e.target.value })
                  }
                  placeholder="e.g. Ramesh Bhai"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Business / Firm Name
                </label>
                <input
                  type="text"
                  value={editingSupplier.businessName}
                  onChange={(e) =>
                    setEditingSupplier({ ...editingSupplier, businessName: e.target.value })
                  }
                  placeholder="e.g. Surat Denim Fabrics"
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
                  value={editingSupplier.mobile}
                  onChange={(e) =>
                    setEditingSupplier({ ...editingSupplier, mobile: e.target.value })
                  }
                  placeholder="e.g. 9826011223"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Address / City</label>
                <input
                  type="text"
                  value={editingSupplier.address || ''}
                  onChange={(e) =>
                    setEditingSupplier({ ...editingSupplier, address: e.target.value })
                  }
                  placeholder="e.g. Cloth Market, Indore"
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
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
