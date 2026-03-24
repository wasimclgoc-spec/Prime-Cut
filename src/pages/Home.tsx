import React, { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Offer } from '../types';
import BannerRotator from '../components/BannerRotator';

const HomeProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      quantity: 1,
      price: product.pricePerKg,
      image: product.image,
    });
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col h-full"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50 p-4">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </Link>
      </div>
      <div className="p-5 flex flex-col flex-grow text-center">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-bold text-secondary mb-2 hover:text-primary transition-colors line-clamp-2 min-h-[56px]">
            {product.name}
          </h3>
        </Link>
        <div className="text-xl font-black text-primary mb-4">
          SAR {product.pricePerKg.toLocaleString()}
        </div>
        <button
          onClick={handleAddToCart}
          className="w-full bg-secondary text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-primary transition-all active:scale-95 mt-auto"
        >
          <ShoppingCart size={20} />
          <span>Add to Cart</span>
        </button>
      </div>
    </motion.div>
  );
};

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<{name: string, image: string}[]>([
    { name: 'Mutton', image: 'https://www.themeathub.com/cdn/shop/collections/PKMTN009FreshMuttonChops.png' },
    { name: 'Beef', image: 'https://www.themeathub.com/cdn/shop/collections/Untitled_design_24.png' },
    { name: 'Chicken', image: 'https://www.themeathub.com/cdn/shop/collections/Untitled_design_19.png' },
    { name: 'Steaks', image: 'https://www.themeathub.com/cdn/shop/collections/Untitled_design_26.png' },
    { name: 'BBQ', image: 'https://www.themeathub.com/cdn/shop/collections/Untitled_design_27.png' },
    { name: 'Deals', image: 'https://www.themeathub.com/cdn/shop/collections/product_mh.png' },
  ]);
  const [homeSettings, setHomeSettings] = useState<any>({
    heroBanners: [
      'https://cdn.shopify.com/s/files/1/0718/1851/0530/files/banner_-_Meathub_Hero_1_02b4b2c4-3774-4c22-8106-1fb94c0b672c.png',
      'https://cdn.shopify.com/s/files/1/0718/1851/0530/files/banner_-_Meathub_Hero_fa39af79-639a-48d0-a92e-c6c487cedd08.png'
    ],
    promoBanner: 'https://www.themeathub.com/cdn/shop/files/Side_banner_1250x1620_3cb52387-6cf4-4eb1-9491-3bb976fa62a8.png',
    features: [
      { icon: 'https://www.themeathub.com/cdn/shop/files/imgi_27_beef_309006.png', title: 'Premium Quality' },
      { icon: 'https://www.themeathub.com/cdn/shop/files/imgi_28_seal_14255258.png', title: '100% Halal' },
      { icon: 'https://www.themeathub.com/cdn/shop/files/imgi_29_meat_18805983.png', title: 'Fresh Daily' },
      { icon: 'https://www.themeathub.com/cdn/shop/files/imgi_30_shield_14234803.png', title: 'Hygienic' },
    ],
    blogs: [
      { title: 'Small Family Feast Platter', img: 'https://www.themeathub.com/cdn/shop/articles/Recipe_Images_Blog_Meat_Hub_Broadcast.png' },
      { title: 'Ramadan Special: Beef Keema', img: 'https://www.themeathub.com/cdn/shop/articles/Recipe_Images_Blog_Broadcast_2_52d1f8d7-0a77-4539-b9d8-44b0bf92a723.png' },
      { title: 'Juicy BBQ Lamb Chops Recipe', img: 'https://www.themeathub.com/cdn/shop/articles/Recipe_Images_Blog_Broadcast_1_f9537571-4910-46d9-8859-3022a4c62589.png' }
    ]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

        const offersSnap = await getDocs(collection(db, 'offers'));
        setOffers(offersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer)));

        const catSnap = await getDocs(collection(db, 'categories'));
        if (!catSnap.empty) {
          setCategories(catSnap.docs.map(doc => doc.data() as {name: string, image: string}));
        }

        const homeSnap = await getDoc(doc(db, 'settings', 'home'));
        if (homeSnap.exists()) {
          setHomeSettings(homeSnap.data());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const bachatPacks = products.filter(p => p.homeSection === 'bachatPacks');
  const bestCuts = products.filter(p => p.homeSection === 'bestCuts');
  const muttonChoice = products.filter(p => p.homeSection === 'muttonChoice');
  const freshCuts = products.filter(p => p.homeSection === 'freshCuts');

  const defaultDbOffers: Offer[] = [
    {
      id: 'default-1',
      title: "Premium Local Mutton",
      description: "Freshly sourced local mutton delivered to your doorstep daily.",
      image: "https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=1200&auto=format&fit=crop",
      discount: "FRESH DAILY",
      isActive: true
    },
    {
      id: 'default-2',
      title: "Fresh Farm Chicken",
      description: "100% organic, hormone-free chicken processed with strict hygiene.",
      image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?q=80&w=1200&auto=format&fit=crop",
      discount: "HYGIENIC",
      isActive: true
    },
    {
      id: 'default-3',
      title: "Fresh Mutton Kleji",
      description: "Nutrient-rich fresh goat liver, tender and delicious.",
      image: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?q=80&w=1200&auto=format&fit=crop",
      discount: "HEALTHY",
      isActive: true
    },
    {
      id: 'default-4',
      title: "Beef Paye (Feet)",
      description: "Traditional beef paye, cleaned and ready for slow cooking.",
      image: "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=1200&auto=format&fit=crop",
      discount: "TRADITIONAL",
      isActive: true
    }
  ];

  const activeOffers = offers.length > 0 ? offers.filter(o => o.isActive).map(o => {
    // Replace broken input_file_*.png with working Unsplash images
    let image = o.image;
    if (image.includes('input_file_2.png')) image = "https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=1200&auto=format&fit=crop";
    if (image.includes('input_file_1.png')) image = "https://images.unsplash.com/photo-1587593810167-a84920ea0781?q=80&w=1200&auto=format&fit=crop";
    if (image.includes('input_file_3.png')) image = "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?q=80&w=1200&auto=format&fit=crop";
    if (image.includes('input_file_0.png')) image = "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=1200&auto=format&fit=crop";
    return { ...o, image };
  }) : defaultDbOffers;

  const combinedOffers: Offer[] = [
    ...activeOffers,
    ...homeSettings.heroBanners.map((url: string, idx: number) => ({
      id: `hero-${idx}`,
      title: idx === 0 ? 'Welcome to Prime Cuts' : 'Fresh & Premium',
      description: idx === 0 ? 'Your trusted source for premium quality meat.' : 'Discover our wide range of fresh cuts.',
      image: url,
      discount: 'SPECIAL',
      isActive: true
    }))
  ];

  return (
    <div className="space-y-16 pb-20 bg-[#f8f9fa]">
      {/* Hero Banner */}
      <section className="w-full">
        <BannerRotator offers={combinedOffers} />
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center gap-4 md:gap-8 overflow-x-auto pb-4 hide-scrollbar">
          {categories.map((cat, i) => (
            <Link to="/shop" key={i} className="flex flex-col items-center group min-w-[100px]">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-white shadow-sm border border-gray-100 p-2 mb-3 group-hover:shadow-md transition-all group-hover:scale-105">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-contain rounded-full" referrerPolicy="no-referrer" />
              </div>
              <span className="font-bold text-secondary text-sm md:text-base">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Fresh Mega Bachat Packs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Choose the Freshness You Prefer</h2>
          <h3 className="text-3xl md:text-4xl font-black text-secondary">Fresh Mega Bachat Packs</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {bachatPacks.map(product => <HomeProductCard key={product.id} product={product} />)}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {homeSettings.promoBanner && (
          <img src={homeSettings.promoBanner} alt="Promo" className="w-full rounded-3xl shadow-sm" referrerPolicy="no-referrer" />
        )}
      </section>

      {/* Shop Our Best Cuts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h3 className="text-3xl md:text-4xl font-black text-secondary">Shop Our Best Cuts</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestCuts.map(product => <HomeProductCard key={product.id} product={product} />)}
        </div>
      </section>

      {/* Mutton Choice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h3 className="text-3xl md:text-4xl font-black text-secondary">Mutton Choice</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {muttonChoice.map(product => <HomeProductCard key={product.id} product={product} />)}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-black text-secondary">Fresh Meat You Can Trust</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {homeSettings.features.map((f: any, i: number) => (
              <div key={i} className="flex flex-col items-center text-center">
                <img src={f.icon} alt={f.title} className="w-16 h-16 mb-4" referrerPolicy="no-referrer" />
                <h4 className="font-bold text-secondary">{f.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fresh Cuts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h3 className="text-3xl md:text-4xl font-black text-secondary">Fresh Cuts</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {freshCuts.map(product => <HomeProductCard key={product.id} product={product} />)}
        </div>
      </section>
    </div>
  );
};

export default Home;
