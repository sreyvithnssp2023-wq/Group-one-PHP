import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit3, FiTrash2, FiArrowUp, FiArrowDown, FiX } from 'react-icons/fi';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1/phone-shop/Backend/public/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    sort_order: 1,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/categories`);
      const list = Array.isArray(res.data) ? res.data : [];
      setCategories(list);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('មិនអាចទាញយកទិន្នន័យ Categories បានទេ!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditId(cat.id);
      setForm({
        name: cat.name,
        slug: cat.slug,
        sort_order: cat.sort_order || 1,
      });
    } else {
      setEditId(null);
      setForm({
        name: '',
        slug: '',
        sort_order: categories.length + 1,
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('សូមបញ្ចូលឈ្មោះ Category!');
      return;
    }

    try {
      if (editId) {
        await axios.put(`${API_BASE}/categories/${editId}`, form);
        toast.success('បានបច្ចុប្បន្នភាព Category រួចរាល់!');
      } else {
        await axios.post(`${API_BASE}/categories`, form);
        toast.success('បានបន្ថែម Category ថ្មីជោគជ័យ!');
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || 'មានបញ្ហាក្នុងការរក្សាទុក!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('តើអ្នកពិតជាចង់លុប Category នេះមែនទេ?')) return;
    try {
      await axios.delete(`${API_BASE}/categories/${id}`);
      toast.success('បានលុប Category រួចរាល់!');
      fetchCategories();
    } catch (err) {
      toast.error('មិនអាចលុបបានទេ!');
    }
  };

  const handleSortChange = async (cat, direction) => {
    const newSort = direction === 'up' ? cat.sort_order - 1 : cat.sort_order + 1;
    if (newSort < 1) return;

    try {
      await axios.put(`${API_BASE}/categories/${cat.id}`, {
        name: cat.name,
        slug: cat.slug,
        sort_order: newSort,
      });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-2">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Categories</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <FiPlus size={16} /> Add Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-slate-50 text-[11px] uppercase text-slate-400 font-bold border-b border-slate-100">
              <th className="px-6 py-4">NAME</th>
              <th className="px-6 py-4">SLUG</th>
              <th className="px-6 py-4">SORT</th>
              <th className="px-6 py-4">PRODUCTS</th>
              <th className="px-6 py-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                  Loading categories...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                  No categories found. Click "+ Add Category" to create one.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/80 transition">
                  {/* Name */}
                  <td className="px-6 py-4 font-bold text-slate-800">{cat.name}</td>

                  {/* Slug */}
                  <td className="px-6 py-4 text-slate-400 font-normal">{cat.slug}</td>

                  {/* Sort Order */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <button
                        onClick={() => handleSortChange(cat, 'up')}
                        className="hover:text-indigo-600 transition p-0.5"
                      >
                        <FiArrowUp size={12} />
                      </button>
                      <span className="font-semibold text-slate-700 w-4 text-center">
                        {cat.sort_order}
                      </span>
                      <button
                        onClick={() => handleSortChange(cat, 'down')}
                        className="hover:text-indigo-600 transition p-0.5"
                      >
                        <FiArrowDown size={12} />
                      </button>
                    </div>
                  </td>

                  {/* Products Count */}
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {cat.products_count}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleOpenModal(cat)}
                        className="text-slate-400 hover:text-indigo-600 transition"
                      >
                        <FiEdit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="text-rose-400 hover:text-rose-600 transition"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">
                {editId ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smartphones"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Slug (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. smartphones"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                >
                  {editId ? 'Update' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}