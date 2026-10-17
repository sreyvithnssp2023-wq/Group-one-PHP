import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiShield, 
  FiPlus, 
  FiTrash2, 
  FiClock, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiSearch 
} from 'react-icons/fi';

export default function Warranties({ user }) {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    product_name: '',
    serial_number: '',
    customer_name: '',
    customer_phone: '',
    start_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    notes: ''
  });

  // URL របស់ Backend Laravel
  const API_BASE = 'http://localhost/phone-shop/Backend/public/api';

  useEffect(() => {
    fetchWarranties();
  }, []);

  const fetchWarranties = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/warranties`);
      if (Array.isArray(res.data)) {
        setWarranties(res.data);
      } else {
        setWarranties([]);
      }
    } catch (err) {
      console.error("Error fetching warranties:", err);
      setWarranties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/warranties`, formData);
      setShowModal(false);
      setFormData({
        product_name: '',
        serial_number: '',
        customer_name: '',
        customer_phone: '',
        start_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        notes: ''
      });
      fetchWarranties();
    } catch (err) {
      alert('មានបញ្ហាក្នុងការរក្សាទុក!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('តើអ្នកប្រាកដថាលុបប័ណ្ណធានានេះ?')) {
      try {
        await axios.delete(`${API_BASE}/warranties/${id}`);
        fetchWarranties();
      } catch (err) {
        alert('មិនអាចលុបបានទេ!');
      }
    }
  };

  const filtered = warranties.filter(w => 
    (w.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.serial_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FiShield className="text-indigo-600" size={26} />
            គ្រប់គ្រងការធានា (Warranties)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            តាមដាន និងរាប់ថយក្រោយថ្ងៃផុតកំណត់ការធានាជូនអតិថិជន
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition shadow-sm"
        >
          <FiPlus size={18} />
          បន្ថែមការធានាថ្មី
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="ស្វែងរកតាមឈ្មោះទំនិញ, អតិថិជន, ឬ Serial Number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-xs">
              <tr>
                <th className="p-4">ឈ្មោះទំនិញ / Serial No.</th>
                <th className="p-4">អតិថិជន</th>
                <th className="p-4">ថ្ងៃចាប់ផ្តើម</th>
                <th className="p-4">ថ្ងៃផុតកំណត់</th>
                <th className="p-4">រយៈពេលរាប់ថយក្រោយ</th>
                <th className="p-4 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">កំពុងទាញយកទិន្នន័យ...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">មិនទាន់មានទិន្នន័យការធានាឡើយ</td>
                </tr>
              ) : (
                filtered.map((w) => {
                  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  let icon = <FiCheckCircle size={14} />;
                  let statusText = `នៅសល់ ${w.days_remaining} ថ្ងៃ`;

                  if (w.is_expired) {
                    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                    icon = <FiAlertTriangle size={14} />;
                    statusText = `ផុតកំណត់ ${Math.abs(w.days_remaining)} ថ្ងៃមុន`;
                  } else if (w.days_remaining <= 30) {
                    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                    icon = <FiClock size={14} />;
                    statusText = `នៅសល់ ${w.days_remaining} ថ្ងៃ (ជិតផុត)`;
                  }

                  return (
                    <tr key={w.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-medium">
                        <div className="text-slate-900 font-semibold">{w.product_name}</div>
                        <div className="text-xs text-slate-500">S/N: {w.serial_number}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-800">{w.customer_name}</div>
                        <div className="text-xs text-slate-500">{w.customer_phone}</div>
                      </td>
                      <td className="p-4 text-slate-600">{w.start_date}</td>
                      <td className="p-4 text-slate-600">{w.expiry_date}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badgeColor}`}>
                          {icon}
                          {statusText}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(w.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FiShield className="text-indigo-600" />
              បន្ថែមប័ណ្ណធានាថ្មី
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">ឈ្មោះទំនិញ *</label>
                <input
                  type="text"
                  required
                  value={formData.product_name}
                  onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="ឧ. iPhone 15 Pro Max"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Serial Number (S/N)</label>
                <input
                  type="text"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="ឧ. F17X9082KK"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">ឈ្មោះអតិថិជន *</label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">លេខទូរស័ព្ទ</label>
                  <input
                    type="text"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">ថ្ងៃចាប់ផ្តើម *</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">ថ្ងៃផុតកំណត់ *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm text-slate-700 transition"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition"
                >
                  រក្សាទុក
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}