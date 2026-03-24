import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Offer } from '../types';

interface BannerRotatorProps {
  offers: Offer[];
}

const defaultOffers: Offer[] = [
  {
    id: 'default-1',
    title: 'Premium Quality Meat',
    description: 'Fresh, hygienic, and halal meat delivered to your doorstep.',
    image: 'https://picsum.photos/seed/meat1/1200/600',
    discount: '0',
    isActive: true
  },
  {
    id: 'default-2',
    title: 'Fresh Daily Cuts',
    description: 'Expertly butchered cuts for your perfect meal.',
    image: 'https://picsum.photos/seed/meat2/1200/600',
    discount: '0',
    isActive: true
  },
  {
    id: 'default-3',
    title: 'Special BBQ Selection',
    description: 'Get ready for the weekend with our premium BBQ cuts.',
    image: 'https://picsum.photos/seed/meat3/1200/600',
    discount: '0',
    isActive: true
  }
];

const BannerRotator: React.FC<BannerRotatorProps> = ({ offers }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const displayOffers = offers && offers.length > 0 ? offers : defaultOffers;

  useEffect(() => {
    if (displayOffers.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayOffers.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [displayOffers.length]);

  if (displayOffers.length === 0) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1) % displayOffers.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + displayOffers.length) % displayOffers.length);

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-3xl group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
          <img
            src={displayOffers[currentIndex].image}
            alt={displayOffers[currentIndex].title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-accent font-bold tracking-widest uppercase mb-4"
            >
              Special Offer
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight"
            >
              {displayOffers[currentIndex].title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-200 mb-8"
            >
              {displayOffers[currentIndex].description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button className="bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-red-700 transition-all transform hover:scale-105 active:scale-95">
                Shop Now
              </button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {displayOffers.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-3 h-3 rounded-full transition-all ${
              idx === currentIndex ? 'bg-primary w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerRotator;
