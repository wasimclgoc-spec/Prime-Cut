import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, subtotal, deliveryFee, total } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={48} className="text-gray-300" />
        </div>
        <h2 className="text-3xl font-black text-secondary mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven't added any fresh cuts to your cart yet. Start shopping now!</p>
        <Link to="/shop" className="bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-red-700 transition-all inline-block">
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-black text-secondary mb-12">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <motion.div
              layout
              key={item.productId}
              className="flex flex-col sm:flex-row items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-6"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              
              <div className="flex-grow text-center sm:text-left">
                <h3 className="text-lg font-bold text-secondary mb-1">{item.name}</h3>
                <p className="text-primary font-bold">SAR {item.price} <span className="text-gray-400 text-xs">/ KG</span></p>
              </div>

              <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
                <button 
                  onClick={() => updateQuantity(item.productId, Math.max(0.5, item.quantity - 0.5))}
                  className="p-2 hover:text-primary transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="w-16 text-center font-bold">{item.quantity} <span className="text-[10px]">KG</span></span>
                <button 
                  onClick={() => updateQuantity(item.productId, item.quantity + 0.5)}
                  className="p-2 hover:text-primary transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="text-right min-w-[100px]">
                <p className="text-xl font-black text-secondary">SAR {(item.price * item.quantity).toFixed(2)}</p>
              </div>

              <button 
                onClick={() => removeFromCart(item.productId)}
                className="p-2 text-gray-400 hover:text-primary transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-32">
            <h2 className="text-2xl font-black text-secondary mb-8">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold">SAR {subtotal.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                <span className="text-xl font-bold">Total</span>
                <span className="text-3xl font-black text-secondary">SAR {subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-secondary text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 hover:bg-primary transition-all shadow-lg shadow-primary/10 active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={20} />
            </button>

            <Link to="/shop" className="block text-center mt-6 text-gray-400 font-bold hover:text-primary transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
