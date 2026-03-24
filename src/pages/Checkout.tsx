import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { CreditCard, Truck, MapPin, Phone, User, CheckCircle2 } from 'lucide-react';

const Checkout: React.FC = () => {
  const { cart, total, subtotal, deliveryFee, clearCart } = useCart();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.displayName || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    paymentMethod: 'Cash on Delivery'
  });

  const isPickup = formData.paymentMethod === 'Pickup';
  const finalDeliveryFee = isPickup ? 0 : deliveryFee;
  const finalTotal = subtotal + finalDeliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderData = {
        userId: profile?.uid || 'guest',
        customerName: formData.name,
        items: cart,
        totalAmount: finalTotal,
        deliveryFee: finalDeliveryFee,
        status: 'Pending',
        address: isPickup ? 'Store Pickup' : formData.address,
        phone: formData.phone,
        createdAt: serverTimestamp(),
        paymentMethod: formData.paymentMethod
      };
      await addDoc(collection(db, 'orders'), orderData);
      setOrderSuccess(true);
      clearCart();
      setTimeout(() => navigate('/tracking'), 3000);
    } catch (error) {
      console.error("Error placing order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 size={64} className="text-green-600" />
        </motion.div>
        <h2 className="text-4xl font-black text-secondary mb-4">Order Placed Successfully!</h2>
        <p className="text-gray-500 text-lg mb-8">Thank you for shopping with Prime Cuts. Your order is being processed.</p>
        <p className="text-primary font-bold">Redirecting to tracking page...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-black text-secondary mb-12">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Delivery Info */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold mb-8 flex items-center">
              <Truck className="mr-3 text-primary" />
              Delivery Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-600">Delivery Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-gray-400" size={18} />
                  <textarea
                    required={!isPickup}
                    disabled={isPickup}
                    rows={3}
                    value={isPickup ? 'Store Pickup' : formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold mb-8 flex items-center">
              <CreditCard className="mr-3 text-primary" />
              Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Cash on Delivery', 'Pickup'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setFormData({...formData, paymentMethod: method})}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    formData.paymentMethod === method 
                    ? 'border-primary bg-primary/5 text-primary font-bold' 
                    : 'border-gray-100 hover:border-gray-200 text-gray-600'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-32">
            <h2 className="text-2xl font-black text-secondary mb-8">Your Order</h2>
            
            <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.productId} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{item.name} x {item.quantity}kg</span>
                  <span className="font-bold">SAR {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-8 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold">SAR {subtotal.toFixed(2)}</span>
              </div>
              {!isPickup && (
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className={finalDeliveryFee === 0 ? "text-green-600 font-bold" : "font-bold"}>
                    {finalDeliveryFee === 0 ? 'FREE' : `SAR ${finalDeliveryFee.toFixed(2)}`}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                <span className="text-xl font-bold">Total</span>
                <span className="text-3xl font-black text-secondary">SAR {finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 hover:bg-red-700 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Place Order - SAR ${finalTotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
