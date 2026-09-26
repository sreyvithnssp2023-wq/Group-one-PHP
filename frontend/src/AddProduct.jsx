import React, { useState } from 'react';
import axios from 'axios';

export default function AddProduct() {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('product_name', productName);
    formData.append('price', price);
    formData.append('stock_qty', stockQty);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      await axios.post(
        'http://localhost/phone-shop/Backend/public/api/products',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      alert('បន្ថែមទំនិញ និងរូបភាពជោគជ័យ!');
      setProductName('');
      setPrice('');
      setStockQty('');
      setImageFile(null);
      setPreview(null);
    } catch (error) {
      console.error(error);
      alert('មានបញ្ហាក្នុងការ Upload!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-2xl shadow-md border">
      <h2 className="text-xl font-bold mb-6 text-gray-800">📦 បន្ថែមទំនិញថ្មី</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">ឈ្មោះទំនិញ</label>
          <input
            type="text"
            placeholder="ឧទាហរណ៍: iPhone 15 Pro Max"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">តម្លៃ ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder="999.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">ចំនួនស្តុក</label>
            <input
              type="number"
              placeholder="10"
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              className="w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">រូបភាពទំនិញ</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-1.5 border rounded-xl text-sm bg-slate-50"
          />
        </div>

        {preview && (
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500 mb-1">រូបភាពដែលបានជ្រើសរើស ៖</p>
            <img src={preview} alt="Preview" className="h-32 mx-auto object-cover rounded-xl border shadow-sm" />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow disabled:opacity-50 mt-4"
        >
          {loading ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកទំនិញ'}
        </button>
      </form>
    </div>
  );
}