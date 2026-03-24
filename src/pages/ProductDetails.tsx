import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Heart, Plus, Minus, Star, ShieldCheck, Truck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Product;
          setProduct({ id: docSnap.id, ...data });
          setQuantity(data.minQty);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-20 text-center">Loading product...</div>;
  if (!product) return <div className="p-20 text-center">Product not found.</div>;

  const increment = () => {
    if (quantity < product.maxQty) {
      setQuantity(prev => prev + (product.category === 'Chicken' ? 1 : 0.5));
    }
  };

  const decrement = () => {
    if (quantity > product.minQty) {
      setQuantity(prev => prev - (product.category === 'Chicken' ? 1 : 0.5));
    }
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      quantity: quantity,
      price: product.pricePerKg,
      image: product.image,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Image Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-gray-100 cursor-pointer hover:border-primary transition-colors">
                <img src={product.image} className="w-full h-full object-cover" alt="thumb" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <div className="mb-6">
            <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider mb-4 inline-block">
              {product.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-secondary mb-4">{product.name}</h1>
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center text-accent">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill={i < 4 ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-gray-400 font-medium">(4.8 / 5.0 - 124 Reviews)</span>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {product.description}
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 mb-8">
            <div className="flex items-end space-x-2 mb-6">
              <span className="text-4xl font-black text-secondary">SAR {product.pricePerKg}</span>
              <span className="text-gray-400 font-bold mb-1">/ KG</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex items-center bg-white rounded-2xl p-2 border border-gray-200 w-fit">
                <button 
                  onClick={decrement}
                  className="w-12 h-12 flex items-center justify-center hover:text-primary transition-colors"
                  disabled={quantity <= product.minQty}
                >
                  <Minus size={24} />
                </button>
                <div className="w-20 text-center">
                  <span className="text-xl font-black">{quantity}</span>
                  <span className="text-xs font-bold block text-gray-400">KG</span>
                </div>
                <button 
                  onClick={increment}
                  className="w-12 h-12 flex items-center justify-center hover:text-primary transition-colors"
                  disabled={quantity >= product.maxQty}
                >
                  <Plus size={24} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-grow bg-primary text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 hover:bg-red-700 transition-all shadow-lg shadow-primary/20 active:scale-95"
              >
                <ShoppingCart size={24} />
                <span>Add to Cart - SAR {(product.pricePerKg * quantity).toFixed(2)}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 text-gray-600">
              <Truck className="text-primary" size={24} />
              <span className="text-sm font-bold">Fast Delivery</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600">
              <ShieldCheck className="text-primary" size={24} />
              <span className="text-sm font-bold">Hygienic Process</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600">
              <Clock className="text-primary" size={24} />
              <span className="text-sm font-bold">Fresh Daily</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetails;
