import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

const API_URL = 'http://localhost/phone-shop/Backend/public/api/products';
const IMAGE_BASE_URL = 'http://localhost/phone-shop/Backend/public/';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  const [formData, setFormData] = useState({
    product_name: '',
    price: '',
    stock_qty: '',
    status: 'Active',
    image: null,
  });

  // ទាញយកទិន្នន័យទំនិញចាស់តាម ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/${id}`);
        const data = res.data.data || res.data;

        setFormData({
          product_name: data.product_name || data.name || '',
          price: data.price || '',
          stock_qty: data.stock_qty !== undefined ? data.stock_qty : (data.quantity || 0),
          status: data.status || 'Active',
          image: null,
        });

        if (data.image) {
          let imgPath = data.image.replace(/^\/+/, '');
          if (!imgPath.includes('/') && !imgPath.startsWith('http')) {
            imgPath = `uploads/products/${imgPath}`;
          }
          setCurrentImage(imgPath.startsWith('http') ? imgPath : `${IMAGE_BASE_URL}${imgPath}`);
        }
      } catch (err) {
        console.error('Fetch edit product error:', err);
        toast.error('មិនអាចទាញយកទិន្នន័យទំនិញបានទេ!');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ផ្ញើទិន្នន័យដែលកែប្រែទៅ Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('_method', 'PUT'); // Laravel Requirement ពេលប្រើ Multipart Form
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
      navigate('/products'); // ត្រឡប់ទៅទំព័រដើមវិញ
    } catch (err) {
      console.error('Update product error:', err);
      toast.error('មានបញ្ហាក្នុងការកែប្រែទិន្នន័យ!');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">កំពុងទាញយកទិន្នន័យទំនិញ...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/products"
          className="p-2 bg-white border rounded-lg hover:bg-slate-50 text-slate-600 transition"
        >
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Edit Product #{id}</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Product Name
            </label>
            <input
              type="text"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
                className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
                className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
              className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Product Image
            </label>
            {currentImage && (
              <div className="mb-3 w-24 h-24 border rounded-xl overflow-hidden bg-slate-50">
                <img src={currentImage} alt="Current Product" className="w-full h-full object-cover" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
              className="w-full p-2 border rounded-xl text-xs bg-slate-50"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link
              to="/products"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow disabled:opacity-50"
            >
              <FiSave />
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}