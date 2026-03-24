import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import Login from './pages/Login';
import Admin from './pages/Admin';
import { seedInitialData } from './seedData';

// Placeholder pages for static content
const Services = () => <div className="p-20 text-center max-w-4xl mx-auto">
  <h1 className="text-4xl font-black mb-8">Our Services</h1>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
    <div className="p-8 bg-gray-50 rounded-3xl">
      <h3 className="text-xl font-bold mb-4">Home Delivery</h3>
      <p className="text-gray-600">Fast and reliable delivery within 90 minutes across the city.</p>
    </div>
    <div className="p-8 bg-gray-50 rounded-3xl">
      <h3 className="text-xl font-bold mb-4">Bulk Orders</h3>
      <p className="text-gray-600">Special pricing and handling for restaurants and large events.</p>
    </div>
    <div className="p-8 bg-gray-50 rounded-3xl">
      <h3 className="text-xl font-bold mb-4">Custom Cuts</h3>
      <p className="text-gray-600">Tell us how you want it, and our expert butchers will prepare it.</p>
    </div>
    <div className="p-8 bg-gray-50 rounded-3xl">
      <h3 className="text-xl font-bold mb-4">Hygienic Processing</h3>
      <p className="text-gray-600">All meat is processed in a temperature-controlled, sterile environment.</p>
    </div>
  </div>
</div>;

const About = () => <div className="p-20 text-center max-w-4xl mx-auto">
  <h1 className="text-4xl font-black mb-8">About Prime Cuts</h1>
  <p className="text-lg text-gray-600 leading-relaxed mb-8">
    Founded in 1995, Prime Cuts has been the leading provider of fresh, high-quality meat in Riyadh. We pride ourselves on our direct relationships with local farmers and our commitment to hygiene and quality.
  </p>
  <div className="mb-8">
    <img src="https://www.phoenixmag.com/wp-content/uploads/2020/06/PHM0720EB07-scaled.jpg" className="rounded-3xl w-full object-cover h-[400px]" alt="Our meat shop display" referrerPolicy="no-referrer" />
  </div>
</div>;

const Contact = () => {
  const [contactSettings, setContactSettings] = useState({
    phone: '+966 50 123 4567',
    email: 'support@primecuts.com',
    address: '123 Meat Market St, Riyadh'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('./firebase');
        const snap = await getDoc(doc(db, 'settings', 'contact'));
        if (snap.exists()) {
          setContactSettings(snap.data() as any);
        }
      } catch (error) {
        console.error("Error fetching contact settings:", error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="p-20 text-center max-w-4xl mx-auto">
      <h1 className="text-4xl font-black mb-8">Contact Us</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold">Get in Touch</h3>
          <p className="text-gray-600">Have questions about our products or your order? We're here to help.</p>
          <div className="space-y-4">
            <p className="font-bold">Phone: <span className="text-primary">{contactSettings.phone}</span></p>
            <p className="font-bold">Email: <span className="text-primary">{contactSettings.email}</span></p>
            <p className="font-bold">Address: <span className="text-gray-600">{contactSettings.address}</span></p>
          </div>
        </div>
        <form className="space-y-4">
          <input type="text" placeholder="Your Name" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100" />
          <input type="email" placeholder="Your Email" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100" />
          <textarea placeholder="Your Message" rows={4} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100"></textarea>
          <button className="w-full bg-primary text-white py-4 rounded-xl font-bold">Send Message</button>
        </form>
      </div>
    </div>
  );
};

const Wishlist = () => <div className="p-20 text-center">Wishlist Page Coming Soon</div>;
import Profile from './pages/Profile';

export default function App() {
  useEffect(() => {
    seedInitialData();
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/tracking" element={<OrderTracking />} />
                <Route path="/services" element={<Services />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/login" element={<Login />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
