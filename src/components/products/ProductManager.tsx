import React, { useState } from 'react';
import {
  Product,
  ProductVariant,
  ClothingCategory,
  CLOTHING_CATEGORIES,
  STANDARD_SIZES,
  POPULAR_COLORS,
  User,
  ShopSettings,
} from '../../types';
import { StorageService } from '../../lib/storage';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Shirt,
  X,
  PlusCircle,
  Check,
  AlertTriangle,
  Archive,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProductManagerProps {
  currentUser: User;
  shopSettings: ShopSettings;
}

export const ProductManager: React.FC<ProductManagerProps> = ({ currentUser, shopSettings }) => {
  const [products, setProducts] = useState<Product[]>(StorageService.getProducts());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const reload = () => {
    setProducts(StorageService.getProducts());
  };

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchBase =
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q);
    const matchVar = p.variants.some(
      (v) =>
        v.sku.toLowerCase().includes(q) ||
        v.barcode.toLowerCase().includes(q) ||
        v.size.toLowerCase().includes(q) ||
        v.color.toLowerCase().includes(q)
    );
    return matchBase || matchVar;
  });

  const handleOpenAdd = () => {
    const code = 'TC-' + Math.floor(100 + Math.random() * 900);
    const newProduct: Product = {
      id: 'prod_' + Date.now(),
      name: '',
      code: code,
      category: 'Jeans',
      brand: 'Tara Collection',
      description: '',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variants: [
        {
          id: 'var_' + Date.now() + '_1',
          productId: '',
          sku: `${code}-M-BLK`,
          barcode: `${Math.floor(8900000000 + Math.random() * 100000000)}`,
          size: 'M',
          color: 'Black',
          purchasePrice: 400,
          sellingPrice: 799,
          mrp: 999,
          stock: 10,
          minStockAlert: 3,
        },
      ],
    };
    newProduct.variants[0].productId = newProduct.id;
    setEditingProduct(newProduct);
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editingProduct.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (editingProduct.variants.length === 0) {
      toast.error('At least one size/color variant is required');
      return;
    }

    StorageService.saveProduct(editingProduct);
    toast.success(`Saved product: ${editingProduct.name}`);
    setIsEditModalOpen(false);
    setEditingProduct(null);
    reload();
  };

  const handleDeleteProduct = (p: Product) => {
    if (currentUser.role === 'CASHIER') {
      toast.error('Cashiers cannot delete products');
      return;
    }
    if (confirm(`Archive or delete ${p.name}? Historical bills will be preserved.`)) {
      const res = StorageService.deleteProduct(p.id);
      if (res.success) {
        toast.success(`Product ${p.name} updated/archived`);
        reload();
      } else {
        toast.error(res.error || 'Failed to delete');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 select-none">
      {/* Header Bar */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">Product & Variant Master</h2>
            <p className="text-xs text-slate-500">
              Manage clothing catalogue with size, color, barcodes, and rates
            </p>
          </div>
        </div>

        {currentUser.role !== 'CASHIER' && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Clothing Item</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Name, Code, SKU, Barcode, Size..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-1 text-xs overflow-x-auto">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
              categoryFilter === 'ALL'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {CLOTHING_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all ${
                categoryFilter === cat
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No products matching criteria. Click "Add New Clothing Item" to create one.
          </div>
        ) : (
          filteredProducts.map((p) => {
            const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);

            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                {/* Product Summary Row */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        {p.category}
                      </span>
                      <h3 className="font-bold text-base text-slate-900">{p.name}</h3>
                      {!p.active && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded">
                          Archived
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      Code: {p.code} • Brand: {p.brand} • Total Stock: {totalStock} pcs
                    </div>
                  </div>

                  {currentUser.role !== 'CASHIER' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(JSON.parse(JSON.stringify(p)));
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Product & Variants"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Archive Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Variants Matrix Table */}
                <div className="overflow-x-auto bg-slate-50/70 rounded-lg border border-slate-200/80">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-2 px-3">Size</th>
                        <th className="py-2 px-3">Color</th>
                        {currentUser.role !== 'CASHIER' && (
                          <th className="py-2 px-3 text-right">Purchase Cost</th>
                        )}
                        <th className="py-2 px-3 text-right">MRP</th>
                        <th className="py-2 px-3 text-right">Selling Rate</th>
                        <th className="py-2 px-3 text-center">Available Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 font-medium">
                      {p.variants.map((v) => (
                        <tr key={v.id} className="hover:bg-white transition-colors">
                          <td className="py-2 px-3 font-bold text-slate-800">{v.size}</td>
                          <td className="py-2 px-3 text-slate-700">{v.color}</td>
                          {currentUser.role !== 'CASHIER' && (
                            <td className="py-2 px-3 text-right font-mono text-slate-500">
                              ₹{v.purchasePrice.toFixed(2)}
                            </td>
                          )}
                          <td className="py-2 px-3 text-right font-mono text-slate-400 line-through">
                            ₹{v.mrp.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">
                            ₹{v.sellingPrice.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                                v.stock <= 0
                                  ? 'bg-rose-100 text-rose-700'
                                  : v.stock <= (v.minStockAlert || 3)
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {v.stock} pcs
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================= EDIT / ADD PRODUCT MODAL ================= */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-base">
                {editingProduct.id.includes('prod_') && editingProduct.name ? 'Edit' : 'Create'}{' '}
                Clothing Product
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-5 text-xs">
                {/* Product Core Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, name: e.target.value })
                      }
                      placeholder="e.g. Slim Fit Denim Jeans"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Product Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProduct.code}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, code: e.target.value })
                      }
                      placeholder="e.g. JNS-001"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Category *
                    </label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          category: e.target.value as ClothingCategory,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {CLOTHING_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Brand</label>
                    <input
                      type="text"
                      value={editingProduct.brand}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, brand: e.target.value })
                      }
                      placeholder="e.g. Tara Classic"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Status</label>
                    <select
                      value={editingProduct.active ? 'true' : 'false'}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          active: e.target.value === 'true',
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="true">Active (Sellable)</option>
                      <option value="false">Archived / Hidden</option>
                    </select>
                  </div>
                </div>

                {/* Variants Section */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800">
                        Size & Color Variants
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Each variant maintains individual stock, SKU, barcode, and pricing
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newV: ProductVariant = {
                          id: 'var_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
                          productId: editingProduct.id,
                          sku: `${editingProduct.code}-${STANDARD_SIZES[1]}-BLU`,
                          barcode: `${Math.floor(8900000000 + Math.random() * 100000000)}`,
                          size: '32',
                          color: 'Blue',
                          purchasePrice: 400,
                          sellingPrice: 799,
                          mrp: 999,
                          stock: 10,
                          minStockAlert: 3,
                        };
                        setEditingProduct({
                          ...editingProduct,
                          variants: [...editingProduct.variants, newV],
                        });
                      }}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-bold flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Variant</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editingProduct.variants.map((v, idx) => (
                      <div
                        key={v.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-2 items-center"
                      >
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Size</label>
                          <input
                            type="text"
                            value={v.size}
                            onChange={(e) => {
                              const vars = [...editingProduct.variants];
                              vars[idx].size = e.target.value;
                              setEditingProduct({ ...editingProduct, variants: vars });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Color</label>
                          <input
                            type="text"
                            value={v.color}
                            onChange={(e) => {
                              const vars = [...editingProduct.variants];
                              vars[idx].color = e.target.value;
                              setEditingProduct({ ...editingProduct, variants: vars });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Cost (₹)</label>
                          <input
                            type="number"
                            value={v.purchasePrice}
                            onChange={(e) => {
                              const vars = [...editingProduct.variants];
                              vars[idx].purchasePrice = parseFloat(e.target.value) || 0;
                              setEditingProduct({ ...editingProduct, variants: vars });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Rate (₹)</label>
                          <input
                            type="number"
                            value={v.sellingPrice}
                            onChange={(e) => {
                              const vars = [...editingProduct.variants];
                              vars[idx].sellingPrice = parseFloat(e.target.value) || 0;
                              setEditingProduct({ ...editingProduct, variants: vars });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-blue-700"
                          />
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-500">Stock</label>
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => {
                                const vars = [...editingProduct.variants];
                                vars[idx].stock = parseInt(e.target.value) || 0;
                                setEditingProduct({ ...editingProduct, variants: vars });
                              }}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold"
                            />
                          </div>
                          {editingProduct.variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const vars = editingProduct.variants.filter((_, i) => i !== idx);
                                setEditingProduct({ ...editingProduct, variants: vars });
                              }}
                              className="mt-3 p-1.5 text-rose-500 hover:bg-rose-100 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
