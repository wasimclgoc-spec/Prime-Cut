import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Plus, Minus, Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(product.minQty);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      quantity: quantity,
      price: product.pricePerKg,
      image: product.image,
    });
  };

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

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col h-full"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </Link>
        <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-primary transition-colors">
          <Heart size={20} />
        </button>
        {product.stockStatus === 'Out of Stock' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-secondary px-4 py-1 rounded-full font-bold text-sm">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">{product.category}</span>
          <div className="flex items-center text-accent">
            <Star size={14} fill="currentColor" />
            <span className="text-xs font-bold ml-1 text-gray-600">4.8</span>
          </div>
        </div>
        
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-lg font-bold text-secondary mb-1 hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-secondary">SAR {product.pricePerKg}</span>
            <span className="text-xs text-gray-400">per KG</span>
          </div>
          
          <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
            <button 
              onClick={decrement}
              className="p-1 hover:text-primary transition-colors"
              disabled={quantity <= product.minQty}
            >
              <Minus size={18} />
            </button>
            <span className="w-10 text-center font-bold text-sm">{quantity} <span className="text-[10px]">KG</span></span>
            <button 
              onClick={increment}
              className="p-1 hover:text-primary transition-colors"
              disabled={quantity >= product.maxQty}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stockStatus === 'Out of Stock'}
          className="w-full bg-secondary text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-primary transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={20} />
          <span>Add to Cart</span>
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
