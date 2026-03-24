import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';

const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["Mutton", "Beef", "Chicken", "Kleji", "Paye"]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const categoryFilter = searchParams.get('category') as Category | null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        const allProducts = snap.docs.map(doc => {
          const data = doc.data() as Product;
          // Normalize Kleji products
          if (data.category.toLowerCase() === 'mutton kleji' || (data.category === 'Mutton' && data.name.toLowerCase().includes('kleji'))) {
            data.category = 'Kleji';
          }
          return { id: doc.id, ...data };
        });
        setProducts(allProducts);

        const catSnap = await getDocs(collection(db, 'categories'));
        const customCategories = catSnap.docs.map(doc => doc.data().name);
        
        let allCategories = Array.from(new Set([...customCategories, "Mutton", "Beef", "Chicken", "Kleji", "Paye"]));
        // Remove 'Mutton kleji' tab
        allCategories = allCategories.filter(c => c.toLowerCase() !== 'mutton kleji');
        setCategories(allCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = products;
    if (categoryFilter) {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredProducts(filtered);
  }, [products, categoryFilter, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-secondary mb-2">Our Fresh Shop</h1>
          <p className="text-gray-500">Premium quality meat delivered to your doorstep.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search meat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-64"
            />
          </div>
          <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-secondary text-white rounded-xl font-bold hover:bg-primary transition-colors">
            <SlidersHorizontal size={20} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 space-y-8">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Filter size={18} className="mr-2 text-primary" />
              Categories
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setSearchParams({})}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${!categoryFilter ? 'bg-primary text-white font-bold' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                All Products
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSearchParams({ category: cat })}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${categoryFilter === cat ? 'bg-primary text-white font-bold' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
            <h4 className="font-bold text-primary mb-2">Free Delivery!</h4>
            <p className="text-sm text-gray-600">Enjoy free delivery on all orders above SAR 100.</p>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-[400px]" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl">
              <p className="text-xl text-gray-500 font-medium">No products found matching your criteria.</p>
              <button 
                onClick={() => { setSearchParams({}); setSearchTerm(''); }}
                className="mt-4 text-primary font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
