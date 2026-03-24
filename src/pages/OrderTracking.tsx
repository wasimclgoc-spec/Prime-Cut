import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Order } from '../types';
import { Package, Truck, CheckCircle2, Clock, MapPin, Phone, ShoppingBag, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const OrderTracking: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [phoneToTrack, setPhoneToTrack] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (authLoading) return;
      if (!profile) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', profile.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [profile, authLoading]);

  const handleTrackByPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneToTrack.trim()) return;
    try {
      setLoading(true);
      const q = query(
        collection(db, 'orders'),
        where('phone', '==', phoneToTrack.trim()),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setHasSearched(true);
    } catch (error) {
      console.error("Error fetching orders by phone:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="p-20 text-center">Loading...</div>;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="text-yellow-500" />;
      case 'Confirmed': return <CheckCircle2 className="text-blue-500" />;
      case 'Processing': return <Package className="text-purple-500" />;
      case 'Out for Delivery': return <Truck className="text-orange-500" />;
      case 'Delivered': return <CheckCircle2 className="text-green-500" />;
      default: return <Clock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Confirmed': return 'bg-blue-100 text-blue-700';
      case 'Processing': return 'bg-purple-100 text-purple-700';
      case 'Out for Delivery': return 'bg-orange-100 text-orange-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-black text-secondary mb-8">Track Your Orders</h1>

      {!profile && !hasSearched && orders.length === 0 && (
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-12">
          <h2 className="text-2xl font-bold text-secondary mb-4">Guest Tracking</h2>
          <p className="text-gray-500 mb-6">Enter the phone number you used during checkout to track your orders.</p>
          <form onSubmit={handleTrackByPhone} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={phoneToTrack}
                  onChange={(e) => setPhoneToTrack(e.target.value)}
                  className="pl-10 w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="e.g., +966 50 123 4567"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Search size={20} />
              <span>{loading ? 'Searching...' : 'Track Orders'}</span>
            </button>
          </form>
        </div>
      )}

      {loading && profile ? (
        <div className="p-20 text-center">Loading orders...</div>
      ) : orders.length === 0 ? (
        (profile || hasSearched) && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-500 font-medium">
              {hasSearched ? "No orders found for this phone number." : "You haven't placed any orders yet."}
            </p>
            <Link to="/shop" className="mt-4 text-primary font-bold hover:underline inline-block">Start Shopping</Link>
            {!profile && hasSearched && (
              <button 
                onClick={() => { setHasSearched(false); setPhoneToTrack(''); }}
                className="block mx-auto mt-4 text-gray-500 hover:text-secondary underline"
              >
                Try another number
              </button>
            )}
          </div>
        )
      ) : (
        <div className="space-y-8">
          {!profile && (
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">Showing orders for <span className="font-bold">{phoneToTrack}</span></p>
              <button 
                onClick={() => { setOrders([]); setHasSearched(false); setPhoneToTrack(''); }}
                className="text-primary font-bold hover:underline text-sm"
              >
                Track different number
              </button>
            </div>
          )}
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Order ID: {order.id.slice(0, 8)}</p>
                  <h3 className="text-xl font-black text-secondary">Placed on {order.createdAt?.toDate().toLocaleDateString()}</h3>
                </div>
                <div className={`px-6 py-2 rounded-full font-bold flex items-center space-x-2 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span>{order.status}</span>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                  <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest">Items</h4>
                  <div className="space-y-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white rounded-lg overflow-hidden border border-gray-100">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <p className="font-bold text-secondary">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.quantity} KG x SAR {item.price}</p>
                          </div>
                        </div>
                        <p className="font-black text-secondary">SAR {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest mb-4">Delivery Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 text-sm">
                        <MapPin size={18} className="text-primary shrink-0" />
                        <span className="text-gray-600">{order.address}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <Phone size={18} className="text-primary shrink-0" />
                        <span className="text-gray-600">{order.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest mb-4">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-bold">SAR {(order.totalAmount - order.deliveryFee).toFixed(2)}</span>
                      </div>
                      {order.paymentMethod !== 'Pickup' && (
                        <div className="flex justify-between text-gray-600">
                          <span>Delivery</span>
                          <span className="font-bold">{order.deliveryFee === 0 ? 'FREE' : `SAR ${order.deliveryFee}`}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center">
                        <span className="font-bold">Total</span>
                        <span className="text-xl font-black text-primary">SAR {order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
