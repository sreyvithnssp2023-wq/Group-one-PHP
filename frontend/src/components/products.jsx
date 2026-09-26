import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEdit, FiEye, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';

// API URL របស់ Laravel Backend
const API_URL = 'http://localhost/phone-shop/Backend/public/api/products';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // ១. ទាញយកទិន្នន័យពី Laravel API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setProducts(response.data);
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

  // ២. លុបទំនិញតាម API
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

  // ៣. Search ទំនិញ
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
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
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
              <tr className="bg-slate-50 text-left text-xs uppercase text-gray-500">
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

                return (
                  <tr key={id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                          📱
                        </div>
                        <span className="font-semibold">{name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold">${price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {stock <= 0 ? (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Out of stock</span>
                      ) : stock <= 5 ? (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Low ({stock})</span>
                      ) : (
                        <span className="font-semibold text-green-600">{stock}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
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
                        <Link
                          to={`/products/${id}/edit`}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                          title="Edit"
                        >
                          <FiEdit />
                        </Link>
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
    </div>
  );
}