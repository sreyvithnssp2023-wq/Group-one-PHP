import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_PRODUCTS = 'http://localhost/phone-shop/Backend/public/api/products';
const API_SALES    = 'http://localhost/phone-shop/Backend/public/api/sales';
const IMAGE_BASE   = 'http://localhost/phone-shop/Backend/public/';

export default function PosSale() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedImages, setFailedImages] = useState({});

  // ទាញយកបញ្ជីទំនិញពី Backend
  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_PRODUCTS);
      const productList = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setProducts(productList);
    } catch (err) {
      console.error('Fetch error:', err);
      alert('មិនអាចទាញយកទំនិញបានទេ!');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Helper Function រៀបចំ URL រូបភាព ការពារ Double Slashes និង 403 Forbidden
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // ១. ប្រសិនបើជា URL ពេញលេញស្រាប់ (http://...)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // ២. លុបសញ្ញា / ខាងមុខ
    let cleanPath = imagePath.replace(/^\/+/, '');

    // ៣. ប្រសិនបើក្នុង Database មានត្រឹមតែឈ្មោះរូប (ឧ. "iphone.jpg")
    // វានឹងថែម uploads/products/ ឱ្យដោយស្វ័យប្រវត្តិ
    if (!cleanPath.includes('/')) {
      cleanPath = `uploads/products/${cleanPath}`;
    }

    return `${IMAGE_BASE}${cleanPath}`;
  };

  // មុខងារបន្ថែមទំនិញចូល Cart (ជាមួយការឆែកស្តុក)
  const addToCart = (product) => {
    const stock = Number(product.stock_qty ?? product.stock ?? product.quantity ?? 0);

    if (stock <= 0) {
      alert('ទំនិញនេះអស់ពីស្តុកហើយ (Out of stock)!');
      return;
    }

    setCart((prevCart) => {
      const pId = product.product_id || product.id;
      const exist = prevCart.find((item) => (item.product_id || item.id) === pId);

      if (exist) {
        if (exist.qty >= stock) {
          alert(`មិនអាចបន្ថែមទៀតបានទេ! ទំនិញនេះសល់ត្រឹមតែ ${stock} ក្នុងស្តុក។`);
          return prevCart;
        }
        return prevCart.map((item) =>
          (item.product_id || item.id) === pId
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  // បន្ថែមចំនួន (+) ក្នុង Cart
  const increaseQty = (productId) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        const id = item.product_id || item.id;
        if (id === productId) {
          const stock = Number(item.stock_qty ?? item.stock ?? item.quantity ?? 0);
          if (item.qty + 1 > stock) {
            alert(`ស្តុកមានត្រឹមតែ ${stock} ប៉ុណ្ណោះ!`);
            return item;
          }
          return { ...item, qty: item.qty + 1 };
        }
        return item;
      })
    );
  };

  // បន្ថយចំនួន (-) ក្នុង Cart
  const decreaseQty = (productId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          const id = item.product_id || item.id;
          if (id === productId) {
            return { ...item, qty: item.qty - 1 };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  // គណនាសរុបទឹកប្រាក់
  const totalAmount = cart.reduce((sum, item) => sum + Number(item.price || 0) * item.qty, 0);

  // មុខងារ Checkout គិតលុយ
  const handleCheckout = async (paymentMethod) => {
    if (cart.length === 0) {
      alert('សូមជ្រើសរើសទំនិញចូល Cart ជាមុនសិន!');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        total_amount: totalAmount,
        payment_method: paymentMethod,
        customer_name: customerName || 'POS Customer',
        customer_phone: customerPhone || null,
        items: cart.map((item) => ({
          product_id: item.product_id || item.id,
          quantity: item.qty,
          unit_price: item.price,
        })),
      };

      await axios.post(API_SALES, payload);
      alert(`ទូទាត់ប្រាក់ (${paymentMethod}) ជោគជ័យ!`);

      // Reset Form និង Fetch ទំនិញសារថ្មីដើម្បី Update ស្តុក
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      fetchProducts();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || 'មានបញ្ហាក្នុងការទូទាត់ប្រាក់!';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    (p.product_name || p.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex gap-6 p-6 min-h-screen bg-slate-50">
      {/* ផ្នែកខាងឆ្វេង៖ បញ្ជីទំនិញ */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">POS Sale</h1>
          <span className="text-sm text-gray-500">{products.length} products</span>
        </div>

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border rounded-xl mb-6 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="grid grid-cols-3 gap-4">
          {filteredProducts.map((p) => {
            const pId = p.product_id || p.id;
            const stock = Number(p.stock_qty ?? p.stock ?? p.quantity ?? 0);
            const name = p.product_name || p.name;
            const price = Number(p.price || 0);

            const imageUrl = getImageUrl(p.image);
            const isImageBroken = failedImages[pId];

            return (
              <div
                key={pId}
                onClick={() => addToCart(p)}
                className="p-4 bg-white rounded-2xl shadow-sm border transition cursor-pointer hover:shadow-md hover:border-indigo-500 relative overflow-hidden"
              >
                <div className="flex justify-between text-xs mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold ${
                      stock > 0 ? 'bg-black text-white' : 'bg-red-500 text-white'
                    }`}
                  >
                    {stock > 0 ? `${stock} left` : 'Out of stock'}
                  </span>
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                    ${price.toFixed(2)}
                  </span>
                </div>

                {/* បង្ហាញរូបភាពទំនិញ ជាមួយ Fallback Emoji ករណីទាញរូបមិនបាន */}
                <div className="h-28 bg-slate-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden border">
                  {imageUrl && !isImageBroken ? (
                    <img
                      src={imageUrl}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={() => {
                        setFailedImages((prev) => ({ ...prev, [pId]: true }));
                      }}
                    />
                  ) : (
                    <span className="text-3xl">📱</span>
                  )}
                </div>

                <h3 className="font-semibold text-sm truncate">{name}</h3>
              </div>
            );
          })}
        </div>
      </div>

      {/* ផ្នែកខាងស្តាំ៖ Cart & Checkout */}
      <div className="w-96 bg-white p-6 rounded-2xl shadow-sm border flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold mb-4">🛒 Cart ({cart.length})</h2>

          <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
            {cart.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Add products to start a sale.</p>
            ) : (
              cart.map((item) => {
                const id = item.product_id || item.id;
                return (
                  <div key={id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">{item.product_name || item.name}</div>
                      <div className="text-gray-500 text-xs">${item.price} x {item.qty}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decreaseQty(id)}
                        className="px-2 py-0.5 bg-gray-200 rounded font-bold hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="font-bold">{item.qty}</span>
                      <button
                        onClick={() => increaseQty(id)}
                        className="px-2 py-0.5 bg-gray-200 rounded font-bold hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="space-y-3 border-t pt-4">
            <input
              type="text"
              placeholder="POS Customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-2 border rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Phone (optional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full p-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="border-t pt-4 mt-6">
          <div className="flex justify-between items-center text-xl font-bold mb-4">
            <span>Total</span>
            <span className="text-indigo-600">${totalAmount.toFixed(2)}</span>
          </div>

          <div className="space-y-2">
            <button
              disabled={loading || cart.length === 0}
              onClick={() => handleCheckout('Cash')}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'បង់ប្រាក់ផ្ទាល់ (Cash)'}
            </button>
            <button
              disabled={loading || cart.length === 0}
              onClick={() => handleCheckout('ABA KHQR')}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'KHQR (ABA Pay)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}