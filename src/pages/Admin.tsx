import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, orderBy, getDoc, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Product, Order, Category } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, Package, ShoppingBag, Users, DollarSign, Image as ImageIcon, Check, X, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

import { seedInitialData } from '../seedData';

const Admin: React.FC = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'contact' | 'offers' | 'categories' | 'home'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [homeSettings, setHomeSettings] = useState<any>({
    heroBanners: [],
    promoBanner: '',
    features: [],
    blogs: []
  });
  const [contactSettings, setContactSettings] = useState<any>({
    phone: '+966 50 123 4567',
    email: 'support@primecuts.com',
    address: '123 Meat Market St, Riyadh'
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingOffer, setEditingOffer] = useState<any | null>(null);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'product' | 'order' | 'offer' | 'category' } | null>(null);

  const fetchData = async () => {
    try {
      const pSnap = await getDocs(collection(db, 'products'));
      setProducts(pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

      const oSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
      setOrders(oSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));

      const offSnap = await getDocs(collection(db, 'offers'));
      setOffers(offSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const catSnap = await getDocs(collection(db, 'categories'));
      setCategories(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const homeSnap = await getDoc(doc(db, 'settings', 'home'));
      if (homeSnap.exists()) {
        setHomeSettings(homeSnap.data());
      } else {
        // Default settings
        const defaultSettings = {
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
        };
        await setDoc(doc(db, 'settings', 'home'), defaultSettings);
        setHomeSettings(defaultSettings);
      }

      const contactSnap = await getDoc(doc(db, 'settings', 'contact'));
      if (contactSnap.exists()) {
        setContactSettings(contactSnap.data());
      } else {
        const defaultContact = {
          phone: '+966 50 123 4567',
          email: 'support@primecuts.com',
          address: '123 Meat Market St, Riyadh'
        };
        await setDoc(doc(db, 'settings', 'contact'), defaultContact);
        setContactSettings(defaultContact);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
  }, [isAdmin]);

  if (!isAdmin) return <div className="p-20 text-center text-red-600 font-bold">Access Denied. Admin only.</div>;

  const [reseedStatus, setReseedStatus] = useState<string | null>(null);

  const handleReseed = async () => {
    setLoading(true);
    setReseedStatus("Deleting old data...");
    console.log("Starting handleReseed...");
    try {
      // Delete all products
      const pSnap = await getDocs(collection(db, 'products'));
      console.log(`Deleting ${pSnap.docs.length} products...`);
      for (const d of pSnap.docs) {
        await deleteDoc(doc(db, 'products', d.id));
      }
      
      // Delete all offers
      const oSnap = await getDocs(collection(db, 'offers'));
      console.log(`Deleting ${oSnap.docs.length} offers...`);
      for (const d of oSnap.docs) {
        await deleteDoc(doc(db, 'offers', d.id));
      }
      
      setReseedStatus("Seeding new data...");
      console.log("Calling seedInitialData(true)...");
      await seedInitialData(true);
      
      setReseedStatus("Refreshing view...");
      await fetchData();
      setReseedStatus("Success! Data re-seeded.");
      setTimeout(() => setReseedStatus(null), 3000);
    } catch (error) {
      console.error("Error re-seeding data:", error);
      setReseedStatus("Error! Check console.");
      setTimeout(() => setReseedStatus(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      const { id, ...orderData } = editingOrder;
      await updateDoc(doc(db, 'orders', id), orderData);
      setOrders(orders.map(o => o.id === id ? editingOrder : o));
      setIsOrderModalOpen(false);
      setEditingOrder(null);
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    setItemToDelete({ id: orderId, type: 'order' });
    setIsConfirmModalOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    setItemToDelete({ id: productId, type: 'product' });
    setIsConfirmModalOpen(true);
  };

  const handleDeleteOffer = (offerId: string) => {
    setItemToDelete({ id: offerId, type: 'offer' });
    setIsConfirmModalOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setItemToDelete({ id: categoryId, type: 'category' });
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setLoading(true);
    try {
      if (itemToDelete.type === 'order') {
        console.log("Deleting order:", itemToDelete.id);
        await deleteDoc(doc(db, 'orders', itemToDelete.id));
        setOrders(orders.filter(o => o.id !== itemToDelete.id));
      } else if (itemToDelete.type === 'product') {
        console.log("Deleting product:", itemToDelete.id);
        await deleteDoc(doc(db, 'products', itemToDelete.id));
        setProducts(products.filter(p => p.id !== itemToDelete.id));
      } else if (itemToDelete.type === 'offer') {
        console.log("Deleting offer:", itemToDelete.id);
        await deleteDoc(doc(db, 'offers', itemToDelete.id));
        setOffers(offers.filter(o => o.id !== itemToDelete.id));
      } else if (itemToDelete.type === 'category') {
        console.log("Deleting category:", itemToDelete.id);
        await deleteDoc(doc(db, 'categories', itemToDelete.id));
        setCategories(categories.filter(c => c.id !== itemToDelete.id));
      }
      setIsConfirmModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleEditOffer = (offer: any) => {
    setEditingOffer(offer);
    setIsOfferModalOpen(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    if (!editingCategory.name || !editingCategory.image) {
      alert("Please provide both a category name and an image.");
      return;
    }

    console.log("Saving category:", editingCategory.name, "Image size:", editingCategory.image.length);
    setLoading(true);
    try {
      if (editingCategory.id) {
        const { id, ...catData } = editingCategory;
        await updateDoc(doc(db, 'categories', id), catData);
        setCategories(categories.map(c => c.id === id ? editingCategory : c));
      } else {
        const docRef = await addDoc(collection(db, 'categories'), editingCategory);
        const newCategory = { ...editingCategory, id: docRef.id };
        setCategories([...categories, newCategory]);
        console.log("Added new category:", newCategory);
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error("Error saving category:", error);
      handleFirestoreError(error, OperationType.WRITE, 'categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 2MB for processing)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please choose an image smaller than 2MB.");
      return;
    }

    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimensions
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with 0.7 quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        if (editingCategory) {
          setEditingCategory({ ...editingCategory, image: compressedBase64 });
        }
        setIsProcessingImage(false);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;

    setLoading(true);
    try {
      if (editingOffer.id) {
        const { id, ...offerData } = editingOffer;
        await updateDoc(doc(db, 'offers', id), offerData);
        setOffers(offers.map(o => o.id === id ? editingOffer : o));
      } else {
        const docRef = await addDoc(collection(db, 'offers'), editingOffer);
        setOffers([...offers, { ...editingOffer, id: docRef.id }]);
      }
      setIsOfferModalOpen(false);
      setEditingOffer(null);
    } catch (error) {
      console.error("Error saving offer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOfferImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please choose an image smaller than 2MB.");
      return;
    }

    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        if (editingOffer) {
          setEditingOffer({ ...editingOffer, image: compressedBase64 });
        }
        setIsProcessingImage(false);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setLoading(true);
    try {
      if (editingProduct.id) {
        const { id, ...productData } = editingProduct;
        await updateDoc(doc(db, 'products', id), productData);
        setProducts(products.map(p => p.id === id ? editingProduct : p));
      } else {
        const docRef = await addDoc(collection(db, 'products'), editingProduct);
        setProducts([...products, { ...editingProduct, id: docRef.id }]);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHomeImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string, idx?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please choose an image smaller than 2MB.");
      return;
    }

    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        const newSettings = { ...homeSettings };
        if (field === 'heroBanners' && typeof idx === 'number') {
          newSettings.heroBanners[idx] = compressedBase64;
        } else if (field === 'promoBanner') {
          newSettings.promoBanner = compressedBase64;
        } else if (field === 'features' && typeof idx === 'number') {
          newSettings.features[idx].icon = compressedBase64;
        } else if (field === 'blogs' && typeof idx === 'number') {
          newSettings.blogs[idx].img = compressedBase64;
        }
        
        setHomeSettings(newSettings);
        setIsProcessingImage(false);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please choose an image smaller than 2MB.");
      return;
    }

    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        if (editingProduct) {
          setEditingProduct({ ...editingProduct, image: compressedBase64 });
        } else {
          setEditingProduct({
            id: '',
            name: '',
            category: 'Mutton',
            pricePerKg: 0,
            image: compressedBase64,
            description: '',
            minQty: 0.5,
            maxQty: 10,
            isFeatured: false,
            stockStatus: 'In Stock'
          });
        }
        setIsProcessingImage(false);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-secondary mb-2">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your shop, products, and customer orders.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          {reseedStatus && (
            <span className={`text-sm font-bold ${reseedStatus.includes('Error') ? 'text-primary' : 'text-green-600'}`}>
              {reseedStatus}
            </span>
          )}
          <button 
            onClick={handleReseed}
            disabled={loading}
            className="px-6 py-3 rounded-xl font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loading && reseedStatus ? 'Processing...' : 'Re-seed Data'}
          </button>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {(['products', 'orders', 'offers', 'categories', 'home', 'contact'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg font-bold capitalize transition-all ${activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-secondary'}`}
              >
                {tab === 'offers' ? 'Rotator' : tab === 'home' ? 'Home Page' : tab === 'contact' ? 'Contact Page' : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
            <ShoppingBag size={24} />
          </div>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Total Orders</p>
          <h3 className="text-3xl font-black text-secondary">{orders.length}</h3>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-4">
            <DollarSign size={24} />
          </div>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Total Revenue</p>
          <h3 className="text-3xl font-black text-secondary">SAR {orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(0)}</h3>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-4">
            <Package size={24} />
          </div>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Products</p>
          <h3 className="text-3xl font-black text-secondary">{products.length}</h3>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {activeTab === 'products' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Product Management</h2>
              <button 
                onClick={() => { 
                  setEditingProduct({
                    id: '',
                    name: '',
                    category: 'Mutton',
                    pricePerKg: 0,
                    image: '',
                    description: '',
                    minQty: 0.5,
                    maxQty: 10,
                    isFeatured: false,
                    stockStatus: 'In Stock'
                  }); 
                  setIsModalOpen(true); 
                }}
                className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-red-700 transition-colors"
              >
                <Plus size={20} />
                <span>Add New Product</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-gray-100">
                    <th className="pb-4 font-bold">Product</th>
                    <th className="pb-4 font-bold">Category</th>
                    <th className="pb-4 font-bold">Price/KG</th>
                    <th className="pb-4 font-bold">Status</th>
                    <th className="pb-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(p => (
                    <tr key={p.id} className="group">
                      <td className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                            <img src={p.image} className="w-full h-full object-cover" alt={p.name} referrerPolicy="no-referrer" />
                          </div>
                          <span className="font-bold text-secondary">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-gray-600">{p.category}</td>
                      <td className="py-4 font-bold">SAR {p.pricePerKg}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stockStatus === 'In Stock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {p.stockStatus}
                        </span>
                      </td>
                       <td className="py-4 text-right">
                         <div className="flex justify-end space-x-2">
                           <button 
                             onClick={() => handleEditProduct(p)}
                             className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                           >
                             <Edit2 size={18} />
                           </button>
                           <button 
                             onClick={() => handleDeleteProduct(p.id)}
                             className="p-2 text-gray-400 hover:text-primary transition-colors"
                           >
                             <Trash2 size={18} />
                           </button>
                         </div>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Rotator Offers Management</h2>
              <button 
                onClick={() => { 
                  setEditingOffer({
                    title: '',
                    description: '',
                    image: '',
                    discount: '',
                    isActive: true
                  }); 
                  setIsOfferModalOpen(true); 
                }}
                className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-red-700 transition-colors"
              >
                <Plus size={20} />
                <span>Add New Offer</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-gray-100">
                    <th className="pb-4 font-bold">Offer</th>
                    <th className="pb-4 font-bold">Discount Tag</th>
                    <th className="pb-4 font-bold">Status</th>
                    <th className="pb-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {offers.map(o => (
                    <tr key={o.id} className="group">
                      <td className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                            <img src={o.image} className="w-full h-full object-cover" alt={o.title} referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <span className="font-bold text-secondary block">{o.title}</span>
                            <span className="text-xs text-gray-400">{o.description.slice(0, 50)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 font-bold text-primary">{o.discount}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${o.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {o.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                       <td className="py-4 text-right">
                         <div className="flex justify-end space-x-2">
                           <button 
                             onClick={() => handleEditOffer(o)}
                             className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                           >
                             <Edit2 size={18} />
                           </button>
                           <button 
                             onClick={() => handleDeleteOffer(o.id)}
                             className="p-2 text-gray-400 hover:text-primary transition-colors"
                           >
                             <Trash2 size={18} />
                           </button>
                         </div>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Category Management</h2>
              <button 
                onClick={() => { 
                  setEditingCategory({
                    name: '',
                    image: ''
                  }); 
                  setIsCategoryModalOpen(true); 
                }}
                className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-red-700 transition-colors"
              >
                <Plus size={20} />
                <span>Add Category</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-gray-100">
                    <th className="pb-4 font-bold">Category</th>
                    <th className="pb-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categories.map(c => (
                    <tr key={c.id} className="group">
                      <td className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-50 border border-gray-100">
                            <img src={c.image} className="w-full h-full object-cover" alt={c.name} referrerPolicy="no-referrer" />
                          </div>
                          <span className="font-bold text-secondary">{c.name}</span>
                        </div>
                      </td>
                       <td className="py-4 text-right">
                         <div className="flex justify-end space-x-2">
                           <button 
                             onClick={() => handleEditCategory(c)}
                             className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                           >
                             <Edit2 size={18} />
                           </button>
                           <button 
                             onClick={() => handleDeleteCategory(c.id)}
                             className="p-2 text-gray-400 hover:text-primary transition-colors"
                           >
                             <Trash2 size={18} />
                           </button>
                         </div>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'home' && (
          <div className="p-8 space-y-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Home Page Settings</h2>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await setDoc(doc(db, 'settings', 'home'), homeSettings);
                    alert('Home settings saved successfully!');
                  } catch (error) {
                    console.error('Error saving home settings:', error);
                    alert('Failed to save settings.');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="bg-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

            {/* Hero Banners */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-xl font-bold text-secondary">Hero Banners</h3>
              {homeSettings.heroBanners.map((banner: string, idx: number) => (
                <div key={idx} className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={banner}
                    onChange={(e) => {
                      const newBanners = [...homeSettings.heroBanners];
                      newBanners[idx] = e.target.value;
                      setHomeSettings({ ...homeSettings, heroBanners: newBanners });
                    }}
                    className="flex-grow px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Image URL"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleHomeImageUpload(e, 'heroBanners', idx)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors">
                      Upload
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      const newBanners = homeSettings.heroBanners.filter((_: any, i: number) => i !== idx);
                      setHomeSettings({ ...homeSettings, heroBanners: newBanners });
                    }}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setHomeSettings({ ...homeSettings, heroBanners: [...homeSettings.heroBanners, ''] })}
                className="text-primary font-bold hover:underline flex items-center space-x-1"
              >
                <Plus size={16} /> <span>Add Banner</span>
              </button>
            </div>

            {/* Promotional Banner */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-xl font-bold text-secondary">Promotional Banner</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={homeSettings.promoBanner}
                  onChange={(e) => setHomeSettings({ ...homeSettings, promoBanner: e.target.value })}
                  className="flex-grow px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Image URL"
                />
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleHomeImageUpload(e, 'promoBanner')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors">
                    Upload
                  </button>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-xl font-bold text-secondary">Features</h3>
              {homeSettings.features.map((feature: any, idx: number) => (
                <div key={idx} className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => {
                      const newFeatures = [...homeSettings.features];
                      newFeatures[idx].title = e.target.value;
                      setHomeSettings({ ...homeSettings, features: newFeatures });
                    }}
                    className="w-1/3 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Title"
                  />
                  <input
                    type="text"
                    value={feature.icon}
                    onChange={(e) => {
                      const newFeatures = [...homeSettings.features];
                      newFeatures[idx].icon = e.target.value;
                      setHomeSettings({ ...homeSettings, features: newFeatures });
                    }}
                    className="flex-grow px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Icon URL"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleHomeImageUpload(e, 'features', idx)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors">
                      Upload
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      const newFeatures = homeSettings.features.filter((_: any, i: number) => i !== idx);
                      setHomeSettings({ ...homeSettings, features: newFeatures });
                    }}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setHomeSettings({ ...homeSettings, features: [...homeSettings.features, { title: '', icon: '' }] })}
                className="text-primary font-bold hover:underline flex items-center space-x-1"
              >
                <Plus size={16} /> <span>Add Feature</span>
              </button>
            </div>

            {/* Blogs */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-xl font-bold text-secondary">Blogs</h3>
              {homeSettings.blogs.map((blog: any, idx: number) => (
                <div key={idx} className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={blog.title}
                    onChange={(e) => {
                      const newBlogs = [...homeSettings.blogs];
                      newBlogs[idx].title = e.target.value;
                      setHomeSettings({ ...homeSettings, blogs: newBlogs });
                    }}
                    className="w-1/3 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Title"
                  />
                  <input
                    type="text"
                    value={blog.img}
                    onChange={(e) => {
                      const newBlogs = [...homeSettings.blogs];
                      newBlogs[idx].img = e.target.value;
                      setHomeSettings({ ...homeSettings, blogs: newBlogs });
                    }}
                    className="flex-grow px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Image URL"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleHomeImageUpload(e, 'blogs', idx)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors">
                      Upload
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      const newBlogs = homeSettings.blogs.filter((_: any, i: number) => i !== idx);
                      setHomeSettings({ ...homeSettings, blogs: newBlogs });
                    }}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setHomeSettings({ ...homeSettings, blogs: [...homeSettings.blogs, { title: '', img: '' }] })}
                className="text-primary font-bold hover:underline flex items-center space-x-1"
              >
                <Plus size={16} /> <span>Add Blog</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="p-8 space-y-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Contact Page Settings</h2>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await setDoc(doc(db, 'settings', 'contact'), contactSettings);
                    alert('Contact settings saved successfully!');
                  } catch (error) {
                    console.error('Error saving contact settings:', error);
                    alert('Failed to save settings.');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="bg-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

            <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">Phone Number</label>
                <input
                  type="text"
                  value={contactSettings.phone}
                  onChange={(e) => setContactSettings({ ...contactSettings, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">Email Address</label>
                <input
                  type="email"
                  value={contactSettings.email}
                  onChange={(e) => setContactSettings({ ...contactSettings, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">Physical Address</label>
                <textarea
                  rows={3}
                  value={contactSettings.address}
                  onChange={(e) => setContactSettings({ ...contactSettings, address: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-8">Order Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-gray-100">
                    <th className="pb-4 font-bold">Order ID</th>
                    <th className="pb-4 font-bold">Customer</th>
                    <th className="pb-4 font-bold">Date</th>
                    <th className="pb-4 font-bold">Total</th>
                    <th className="pb-4 font-bold">Status</th>
                    <th className="pb-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="py-4 font-mono text-xs text-gray-400">#{o.id.slice(0, 8)}</td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-secondary">{o.customerName || 'Customer'}</span>
                          <span className="text-xs text-gray-400">{o.phone}</span>
                        </div>
                      </td>
                      <td className="py-4 text-gray-600 text-sm">{o.createdAt?.toDate().toLocaleDateString()}</td>
                      <td className="py-4 font-bold text-primary">SAR {o.totalAmount.toFixed(2)}</td>
                      <td className="py-4">
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {["Pending", "Confirmed", "Processing", "Out for Delivery", "Delivered", "Cancelled"].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                       <td className="py-4 text-right">
                         <div className="flex justify-end space-x-2">
                           <button 
                             onClick={() => { setEditingOrder(o); setIsOrderModalOpen(true); }}
                             className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                           >
                             <Edit2 size={18} />
                           </button>
                           <button 
                             onClick={() => handleDeleteOrder(o.id)}
                             className="p-2 text-gray-400 hover:text-primary transition-colors"
                           >
                             <Trash2 size={18} />
                           </button>
                         </div>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">{editingProduct.id ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600">Product Name</label>
                  <input
                    required
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Fresh Mutton"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as Category })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {categories.length > 0 ? categories.map(c => (
                      <option key={c.id || c.name} value={c.name}>{c.name}</option>
                    )) : ["Mutton", "Beef", "Chicken", "Kleji", "Paye"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600">Price per KG (SAR)</label>
                  <input
                    required
                    type="number"
                    value={editingProduct.pricePerKg}
                    onChange={(e) => setEditingProduct({ ...editingProduct, pricePerKg: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600">Stock Status</label>
                  <select
                    value={editingProduct.stockStatus}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockStatus: e.target.value as any })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600">Home Page Section</label>
                  <select
                    value={editingProduct.homeSection || 'none'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, homeSection: e.target.value as any })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="none">None (Shop Only)</option>
                    <option value="bachatPacks">Fresh Mega Bachat Packs</option>
                    <option value="bestCuts">Shop Our Best Cuts</option>
                    <option value="muttonChoice">Mutton Choice</option>
                    <option value="freshCuts">Fresh Cuts</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Product description..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">Product Image</label>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 bg-gray-50 border border-dashed border-gray-300 rounded-2xl flex items-center justify-center overflow-hidden relative">
                    {editingProduct.image ? (
                      <img src={editingProduct.image} className="w-full h-full object-cover" alt="preview" />
                    ) : (
                      <ImageIcon className="text-gray-300" size={32} />
                    )}
                    {isProcessingImage && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="product-image-upload"
                    />
                    <label
                      htmlFor="product-image-upload"
                      className="inline-block px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      Choose from PC
                    </label>
                    <p className="text-xs text-gray-400 mt-2">Recommended: Square image, max 1MB</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={editingProduct.isFeatured}
                  onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                  className="w-5 h-5 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="isFeatured" className="text-sm font-bold text-gray-600">Featured Item (Show on Home Page)</label>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || isProcessingImage}
                  className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : isProcessingImage ? 'Processing...' : 'Save Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Category Edit Modal */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">{editingCategory.id ? 'Edit Category' : 'Add New Category'}</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">Category Name</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. Seafood"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">Category Image</label>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 bg-gray-50 border border-dashed border-gray-300 rounded-full flex items-center justify-center overflow-hidden relative">
                    {editingCategory.image ? (
                      <img src={editingCategory.image} className="w-full h-full object-cover" alt="preview" />
                    ) : (
                      <ImageIcon className="text-gray-300" size={32} />
                    )}
                    {isProcessingImage && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCategoryImageUpload}
                      className="hidden"
                      id="category-image-upload"
                    />
                    <label
                      htmlFor="category-image-upload"
                      className="inline-block px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      Choose from PC
                    </label>
                  </div>
                </div>
                <div className="mt-2">
                  <label className="text-xs font-bold text-gray-400">Or enter Image URL</label>
                  <input
                    type="text"
                    value={editingCategory.image}
                    onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 mt-1 bg-gray-50 border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || isProcessingImage}
                  className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : isProcessingImage ? 'Processing...' : 'Save Category'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Offer Edit Modal */}
      {isOfferModalOpen && editingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">{editingOffer.id ? 'Edit Offer' : 'Add New Offer'}</h2>
              <button onClick={() => setIsOfferModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600">Offer Title</label>
                  <input
                    type="text"
                    required
                    value={editingOffer.title}
                    onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600">Discount Tag (e.g. 20% OFF)</label>
                  <input
                    type="text"
                    required
                    value={editingOffer.discount}
                    onChange={(e) => setEditingOffer({ ...editingOffer, discount: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">Offer Image</label>
                <div className="flex items-center space-x-4">
                  <div className="flex-grow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleOfferImageUpload}
                      className="hidden"
                      id="offer-image-upload"
                    />
                    <label 
                      htmlFor="offer-image-upload"
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <ImageIcon size={20} className="text-gray-400" />
                      <span className="text-sm font-bold text-gray-500">Upload Image</span>
                    </label>
                  </div>
                  {editingOffer.image && (
                    <div className="w-20 h-12 rounded-lg overflow-hidden border border-gray-100 relative">
                      <img src={editingOffer.image} alt="" className="w-full h-full object-cover" />
                      {isProcessingImage && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <label className="text-xs font-bold text-gray-400">Or enter Image URL</label>
                  <input
                    type="text"
                    value={editingOffer.image}
                    onChange={(e) => setEditingOffer({ ...editingOffer, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 mt-1 bg-gray-50 border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingOffer.description}
                  onChange={(e) => setEditingOffer({ ...editingOffer, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingOffer.isActive}
                  onChange={(e) => setEditingOffer({ ...editingOffer, isActive: e.target.checked })}
                  className="w-5 h-5 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-gray-600">Active (Show in Rotator)</label>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || isProcessingImage}
                  className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : isProcessingImage ? 'Processing...' : 'Save Offer'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Order Edit Modal */}
      {isOrderModalOpen && editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Edit Order #{editingOrder.id.slice(0, 8)}</h2>
              <button onClick={() => setIsOrderModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateOrder} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600">Customer Name</label>
                  <input
                    type="text"
                    value={editingOrder.customerName || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customerName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600">Customer Phone</label>
                  <input
                    type="text"
                    value={editingOrder.phone}
                    onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">Order Status</label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value as any })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {["Pending", "Confirmed", "Processing", "Out for Delivery", "Delivered", "Cancelled"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">Delivery Address</label>
                <textarea
                  rows={3}
                  value={editingOrder.address}
                  onChange={(e) => setEditingOrder({ ...editingOrder, address: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-gray-600">Order Items</h3>
                {editingOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white rounded-lg overflow-hidden border border-gray-100">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{item.name}</p>
                        <p className="text-xs text-gray-400">SAR {item.price} / KG</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center bg-white rounded-lg p-1 border border-gray-100">
                        <button 
                          type="button"
                          onClick={() => {
                            const newItems = [...editingOrder.items];
                            newItems[idx].quantity = Math.max(0.5, newItems[idx].quantity - 0.5);
                            const newSubtotal = newItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
                            const newDeliveryFee = newSubtotal >= 100 ? 0 : 15;
                            setEditingOrder({ 
                              ...editingOrder, 
                              items: newItems,
                              totalAmount: newSubtotal + newDeliveryFee,
                              deliveryFee: newDeliveryFee
                            });
                          }}
                          className="p-1 hover:text-primary"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-12 text-center text-sm font-bold">{item.quantity}</span>
                        <button 
                          type="button"
                          onClick={() => {
                            const newItems = [...editingOrder.items];
                            newItems[idx].quantity += 0.5;
                            const newSubtotal = newItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
                            const newDeliveryFee = newSubtotal >= 100 ? 0 : 15;
                            setEditingOrder({ 
                              ...editingOrder, 
                              items: newItems,
                              totalAmount: newSubtotal + newDeliveryFee,
                              deliveryFee: newDeliveryFee
                            });
                          }}
                          className="p-1 hover:text-primary"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-bold text-sm w-20 text-right">SAR {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Total Amount</p>
                  <p className="text-2xl font-black text-primary">SAR {editingOrder.totalAmount.toFixed(2)}</p>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsOrderModalOpen(false)}
                    className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-secondary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary transition-all shadow-lg shadow-primary/10"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full text-center"
          >
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Are you sure?</h2>
            <p className="text-gray-500 mb-8">
              Do you want to delete this {itemToDelete?.type}? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setItemToDelete(null);
                }}
                className="flex-1 px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
              >
                No
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="flex-1 bg-red-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Admin;
