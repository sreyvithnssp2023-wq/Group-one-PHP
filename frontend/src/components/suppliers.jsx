import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiTruck,
  FiPlus,
  FiPackage,
  FiPhone,
  FiMail,
  FiMapPin,
  FiUser,
  FiTrash2,
  FiEdit3,
} from 'react-icons/fi';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1/phone-shop/Backend/public/api';

export default function Suppliers() {
  const [activeTab, setActiveTab] = useState('suppliers'); // 'suppliers' or 'add-product'
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Supplier Form State
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
  });
  const [editSupplierId, setEditSupplierId] = useState(null);
  const [submittingSupplier, setSubmittingSupplier] = useState(false);

  // Comprehensive Add Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category_id: '',
    supplier_id: '',
    cost_price: '',
    price: '',
    stock: '',
    description: '',
    image: null,
  });
  const [submittingProduct, setSubmittingProduct] = useState(false);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/suppliers`);
      setSuppliers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/categories`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCategories(list);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchSuppliers(), fetchCategories()]);
      setLoading(false);
    };
    init();
  }, []);

  // Save or Update Supplier
  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    if (!supplierForm.name.trim()) {
      toast.error('សូមបញ្ចូលឈ្មោះអ្នកផ្គត់ផ្គង់!');
      return;
    }

    setSubmittingSupplier(true);
    try {
      if (editSupplierId) {
        await axios.put(`${API_BASE}/suppliers/${editSupplierId}`, supplierForm);
        toast.success('បានធ្វើបច្ចុប្បន្នភាពអ្នកផ្គត់ផ្គង់ជោគជ័យ!');
      } else {
        await axios.post(`${API_BASE}/suppliers`, supplierForm);
        toast.success('បានបន្ថែមអ្នកផ្គត់ផ្គង់ថ្មីជោគជ័យ!');
      }
      setSupplierForm({ name: '', contact_person: '', phone: '', email: '', address: '' });
      setEditSupplierId(null);
      fetchSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ!');
    } finally {
      setSubmittingSupplier(false);
    }
  };

  const handleEditSupplier = (sup) => {
    setEditSupplierId(sup.id);
    setSupplierForm({
      name: sup.name || '',
      contact_person: sup.contact_person || '',
      phone: sup.phone || '',
      email: sup.email || '',
      address: sup.address || '',
    });
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm('តើអ្នកពិតជាចង់លុបអ្នកផ្គត់ផ្គង់នេះមែនទេ?')) return;
    try {
      await axios.delete(`${API_BASE}/suppliers/${id}`);
      toast.success('បានលុបអ្នកផ្គត់ផ្គង់រួចរាល់!');
      fetchSuppliers();
    } catch (err) {
      toast.error('មិនអាចលុបអ្នកផ្គត់ផ្គង់បានទេ!');
    }
  };

  // Submit Comprehensive Product
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.stock) {
      toast.error('សូមបញ្ចូលឈ្មោះ តម្លៃ និងចំនួនស្តុក!');
      return;
    }

    setSubmittingProduct(true);
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('sku', productForm.sku || '');
      formData.append('category_id', productForm.category_id || '');
      formData.append('supplier_id', productForm.supplier_id || '');
      formData.append('cost_price', productForm.cost_price || 0);
      formData.append('price', productForm.price);
      formData.append('stock', productForm.stock);
      formData.append('description', productForm.description || '');
      if (productForm.image) {
        formData.append('image', productForm.image);
      }

      await axios.post(`${API_BASE}/products/full-add`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('🎉 បានបន្ថែមទំនិញថ្មីដោយជោគជ័យ!');
      setProductForm({
        name: '',
        sku: '',
        category_id: '',
        supplier_id: '',
        cost_price: '',
        price: '',
        stock: '',
        description: '',
        image: null,
      });
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'មិនអាចបន្ថែមទំនិញបានទេ!');
    } finally {
      setSubmittingProduct(false);
    }
  };

  return (
    <div className="p-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Suppliers & Stock Management</h1>
          <p className="text-xs text-slate-500">គ្រប់គ្រងអ្នកផ្គត់ផ្គង់ និងបន្ថែមទំនិញចូលស្តុកពេញលេញ</p>
        </div>

        <div className="flex bg-slate-200/60 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'suppliers' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            <FiTruck /> Suppliers List
          </button>
          <button
            onClick={() => setActiveTab('add-product')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'add-product' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            <FiPackage /> Full Add Product
          </button>
        </div>
      </div>

      {activeTab === 'suppliers' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Supplier Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FiTruck className="text-indigo-600" />
              {editSupplierId ? 'Edit Supplier' : 'Add New Supplier'}
            </h2>

            <form onSubmit={handleSupplierSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Company / Supplier Name *</label>
                <div className="relative">
                  <FiTruck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Angkor Electronics Supplier Co."
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Person</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    placeholder="e.g. Mr. Sokha"
                    value={supplierForm.contact_person}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                    <input
                      type="text"
                      placeholder="012 345 678"
                      value={supplierForm.phone}
                      onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                    <input
                      type="email"
                      placeholder="supplier@mail.com"
                      value={supplierForm.email}
                      onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Address</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-3 text-slate-400 text-xs" />
                  <textarea
                    rows="2"
                    placeholder="Phnom Penh, Cambodia"
                    value={supplierForm.address}
                    onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {editSupplierId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditSupplierId(null);
                      setSupplierForm({ name: '', contact_person: '', phone: '', email: '', address: '' });
                    }}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submittingSupplier}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                >
                  <FiPlus /> {editSupplierId ? 'Update Supplier' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>

          {/* Supplier Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Suppliers List ({suppliers.length})</h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading suppliers...</div>
            ) : suppliers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No suppliers found. Add your first supplier.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-[11px] uppercase text-slate-400 font-bold border-b border-slate-100">
                    <th className="px-5 py-3">SUPPLIER / COMPANY</th>
                    <th className="px-5 py-3">CONTACT</th>
                    <th className="px-5 py-3">ADDRESS</th>
                    <th className="px-5 py-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {suppliers.map((sup) => (
                    <tr key={sup.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3.5 font-bold text-slate-800">
                        {sup.name}
                        {sup.contact_person && <div className="text-[11px] font-medium text-slate-400">👤 {sup.contact_person}</div>}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {sup.phone || 'N/A'}
                        {sup.email && <div className="text-[11px] text-slate-400">{sup.email}</div>}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">{sup.address || 'N/A'}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditSupplier(sup)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <FiEdit3 />
                          </button>
                          <button
                            onClick={() => handleDeleteSupplier(sup.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* Full Add Product Form */
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm max-w-3xl mx-auto">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-3">
            <FiPackage className="text-indigo-600" />
            Complete Product Entry / Stock-In
          </h2>

          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone 16 Pro Max 256GB"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">SKU / Barcode Code</label>
                <input
                  type="text"
                  placeholder="e.g. APP-IP16P-256"
                  value={productForm.sku}
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                <select
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Supplier (អ្នកផ្គត់ផ្គង់)</label>
                <select
                  value={productForm.supplier_id}
                  onChange={(e) => setProductForm({ ...productForm, supplier_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Select Supplier --</option>
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Cost Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 950.00"
                  value={productForm.cost_price}
                  onChange={(e) => setProductForm({ ...productForm, cost_price: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Selling Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 1199.00"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Stock Quantity *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 25"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Description / Notes</label>
              <textarea
                rows="2"
                placeholder="Specifications, warranty info..."
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProductForm({ ...productForm, image: e.target.files[0] })}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
              />
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                type="submit"
                disabled={submittingProduct}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <FiPackage /> {submittingProduct ? 'Saving Product...' : 'Add Product to Inventory'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}