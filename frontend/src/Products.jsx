import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEdit, FiEye, FiTrash2, FiX } from 'react-icons/fi';
import axios from 'axios';

const API_URL = 'http://localhost/phone-shop/Backend/public/api/products';
const IMAGE_BASE_URL = 'http://localhost/phone-shop/Backend/public/';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // States សម្រាប់គ្រប់គ្រង Modal Edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    price: '',
    stock_qty: '',
    status: 'Active',
    image: null,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('មិនអាចទាញយកទិន្នន័យពី Server បានឡើយ!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Helper Function រៀបចំ URL រូបភាព ការពារបាក់ Link
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    let cleanPath = imagePath.replace(/^\/+/, '');
    if (!cleanPath.includes('/')) {
      cleanPath = `uploads/products/${cleanPath}`;
    }
    return `${IMAGE_BASE_URL}${cleanPath}`;
  };

  // 1. មុខងារពេលចុចប៊ូតុង Edit (FiEdit)
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name || product.name || '',
      price: product.price || '',
      stock_qty: product.stock_qty !== undefined ? product.stock_qty : (product.quantity || 0),
      status: product.status || 'Active',
      image: null,
    });
    setIsEditOpen(true);
  };

  // 2. មុខងារ Update ទិន្នន័យទៅ Backend (Laravel)
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const id = editingProduct.product_id || editingProduct.id;
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('_method', 'PUT'); // Laravel spoofing សម្រាប់ Multipart Form
      data.append('product_name', formData.product_name);
      data.append('price', formData.price);
      data.append('stock_qty', formData.stock_qty);
      data.append('status', formData.status);

      if (formData.image) {
        data.append('image', formData.image);
      }

      await axios.post(`${API_URL}/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('កែប្រែទិន្នន័យទំនិញជោគជ័យ!');
      setIsEditOpen(false);
      fetchProducts(); // Refresh ទិន្នន័យថ្មី
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('មានបញ្ហាក្នុងការកែប្រែទិន្នន័យ!');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (product) => {
    const id = product.product_id || product.id;
    const name = product.product_name || product.name;

    if (!window.confirm(`តើអ្នកពិតជាចង់លុបទំនិញ "${name}" នេះមែនទេ?`)) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      setProducts((prev) => prev.filter((p) => (p.product_id || p.id) !== id));
      toast.success('លុបទំនិញបានជោគជ័យ!');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('មានបញ្ហាក្នុងការលុបទំនិញ!');
    }
  };

  const filtered = products.filter((p) => {
    const productName = p.product_name || p.name || '';
    const categoryName = p.category_name || '';
    return (
      productName.toLowerCase().includes(search.toLowerCase()) ||
      categoryName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          to="/products/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
        >
          + Add Product
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full md:w-72 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">កំពុងទាញយកទិន្នន័យទំនិញ...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {products.length === 0
              ? 'មិនទាន់មានទំនិញឡើយ។ សូមបន្ថែមទំនិញដំបូងរបស់អ្នក!'
              : 'រកមិនឃើញទំនិញដែលត្រូវនឹងការស្វែងរកឡើយ។'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs uppercase text-gray-500 border-b">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((p) => {
                const id = p.product_id || p.id;
                const name = p.product_name || p.name;
                const price = Number(p.price || 0);
                const stock = p.stock_qty !== undefined ? p.stock_qty : p.quantity;
                const imageUrl = getImageUrl(p.image);

                return (
                  <tr key={id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                          {imageUrl ? (
                            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <span>📱</span>
                          )}
                        </div>
                        <span className="font-semibold text-slate-800">{name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-indigo-600">${price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {stock <= 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          Out of stock
                        </span>
                      ) : stock <= 5 ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                          Low ({stock})
                        </span>
                      ) : (
                        <span className="font-semibold text-emerald-600">{stock}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {p.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => toast('Preview mode only', { icon: 'ℹ️' })}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                          title="View"
                        >
                          <FiEye />
                        </button>

                        {/* ប៊ូតុង Edit បើក Modal Popup */}
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                          title="Edit"
                        >
                          <FiEdit />
                        </button>

                        <button
                          onClick={() => remove(p)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= MODAL EDIT POPUP ================= */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-lg font-bold text-slate-800">Edit Product</h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    Stock Qty
                  </label>
                  <input
                    type="number"
                    value={formData.stock_qty}
                    onChange={(e) => setFormData({ ...formData, stock_qty: e.target.value })}
                    className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Change Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                  className="w-full p-1.5 border rounded-xl text-xs bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}