import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FiBox,
  FiDollarSign,
  FiPackage,
  FiShoppingBag,
  FiUsers,
} from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1/phone-shop/Backend/public/api';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${color}`}>
        {icon}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [overview, setOverview] = useState({
    today_orders: 0,
    today_revenue: 0,
    total_products: 0,
    total_customers: 0,
    total_revenue: 0,
    recent_orders: [],
  });

  const [salesChart, setSalesChart] = useState({
    daily: [
      { date: 'Mon', revenue: 0 },
      { date: 'Tue', revenue: 0 },
      { date: 'Wed', revenue: 0 },
      { date: 'Thu', revenue: 0 },
      { date: 'Fri', revenue: 0 },
      { date: 'Sat', revenue: 0 },
      { date: 'Sun', revenue: 0 },
    ],
    weekly: [
      { date: 'Week 1', revenue: 0 },
      { date: 'Week 2', revenue: 0 },
      { date: 'Week 3', revenue: 0 },
      { date: 'Week 4', revenue: 0 },
    ],
    monthly: [
      { date: 'Jan', revenue: 0 },
      { date: 'Feb', revenue: 0 },
      { date: 'Mar', revenue: 0 },
      { date: 'Apr', revenue: 0 },
      { date: 'May', revenue: 0 },
      { date: 'Jun', revenue: 0 },
      { date: 'Jul', revenue: 0 },
      { date: 'Aug', revenue: 0 },
      { date: 'Sep', revenue: 0 },
      { date: 'Oct', revenue: 0 },
      { date: 'Nov', revenue: 0 },
      { date: 'Dec', revenue: 0 },
    ],
  });

  const [period, setPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (selectedPeriod = period) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/dashboard?period=${selectedPeriod}`);
      if (res.data) {
        const data = res.data;

        const formattedRecentOrders = (data.recent_orders || []).map((o) => ({
          id: o.sale_id || o.id,
          order_number: `${o.sale_id || o.id}`,
          customer_name: o.customer_name || 'POS Customer',
          total: Number(o.total_amount || 0),
          currency: 'USD',
          payment_status: o.payment_status ? o.payment_status.toLowerCase() : 'paid',
          order_status: 'completed',
        }));

        setOverview({
          today_orders: data.todays_orders ?? data.today_orders ?? 0,
          today_revenue: Number(data.todays_revenue ?? data.today_revenue ?? 0),
          total_products: data.total_products ?? 0,
          total_customers: data.total_customers ?? 0,
          total_revenue: Number(data.total_revenue ?? 0),
          recent_orders: formattedRecentOrders,
        });

        // 🔄 ទាញយក Keys គ្រប់ទម្រង់ពី Backend
        const rawDaily = data.daily || data.daily_chart || data.chart_data || data.chartData || [];
        const rawWeekly = data.weekly || data.weekly_chart || data.weekly_chart_data || [];
        const rawMonthly = data.monthly || data.monthly_chart || data.monthly_chart_data || [];

        // Helper function សម្រាប់ចាប់យក ថ្ងៃ/ខែ និង ទឹកប្រាក់ឱ្យត្រូវ
        const mapChartItems = (arr, fallbackArr) => {
          if (!Array.isArray(arr) || arr.length === 0) return fallbackArr;
          return arr.map((item) => ({
            date: item.day || item.date || item.name || '',
            revenue: Number(item.revenue ?? item.amount ?? item.sales ?? 0),
          }));
        };

        setSalesChart({
          daily: mapChartItems(rawDaily, salesChart.daily),
          weekly: mapChartItems(rawWeekly, salesChart.weekly),
          monthly: mapChartItems(rawMonthly, salesChart.monthly),
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(period);
  }, [period]);

  // 📊 ទាញយកទិន្នន័យ Chart ដោយផ្ទាល់តាម Period (Daily / Weekly / Monthly)
  const currentChartData = salesChart[period] || [];

  const chartData = {
    labels: currentChartData.map((d) => d.date),
    datasets: [
      {
        label: 'Revenue ($)',
        data: currentChartData.map((d) => d.revenue),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.15)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#4f46e5',
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value}`,
        },
      },
    },
  };

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <button
          onClick={() => alert('Storefront preview coming soon.')}
          className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition"
        >
          View my storefront ↗
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Today's Orders"
          value={loading ? '...' : overview.today_orders}
          icon={<FiShoppingBag />}
          color="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          label="Today's Revenue"
          value={loading ? '...' : `$${overview.today_revenue.toFixed(2)}`}
          icon={<FiDollarSign />}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          label="Total Products"
          value={loading ? '...' : overview.total_products}
          icon={<FiPackage />}
          color="bg-amber-100 text-amber-600"
        />
        <StatCard
          label="Total Customers"
          value={loading ? '...' : overview.total_customers}
          icon={<FiUsers />}
          color="bg-rose-100 text-rose-600"
        />
        <StatCard
          label="Total Revenue"
          value={loading ? '...' : `$${overview.total_revenue.toFixed(2)}`}
          icon={<FiBox />}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 mt-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">Sales Chart</h2>
          <div className="flex gap-2">
            {['daily', 'weekly', 'monthly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  period === p
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          <Line
            key={`${period}-${JSON.stringify(chartData)}`}
            redraw={true}
            data={chartData}
            options={chartOptions}
          />
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl shadow-sm mt-6 overflow-hidden border border-gray-100">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Recent Orders</h2>
          <Link to="/pos" className="text-sm text-indigo-600 hover:underline font-semibold">
            Go to POS ➔
          </Link>
        </div>
        {overview.recent_orders.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            {loading ? 'Loading stats...' : 'No orders recorded.'}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {overview.recent_orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-800">
                    #{o.order_number}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{o.customer_name}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">
                    ${o.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[o.order_status] || STATUS_COLORS.completed}`}>
                      {o.order_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}