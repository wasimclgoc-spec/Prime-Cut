import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const [contactSettings, setContactSettings] = useState({
    phone: '+966 50 123 4567',
    email: 'info@primecuts.com',
    address: '123 Meat Market St, Riyadh, Saudi Arabia'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
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
    <footer className="bg-secondary text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">PC</span>
              </div>
              <span className="text-2xl font-bold tracking-tighter text-white">
                PRIME<span className="text-primary">CUTS</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Providing the freshest and highest quality meat since 1995. Hygienically processed and delivered straight to your doorstep.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 border-b-2 border-primary w-fit pb-1">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link to="/shop" className="text-gray-400 hover:text-primary transition-colors">Shop Products</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-primary transition-colors">Our Services</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/tracking" className="text-gray-400 hover:text-primary transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xl font-bold mb-6 border-b-2 border-primary w-fit pb-1">Categories</h3>
            <ul className="space-y-4">
              <li><Link to="/shop?category=Mutton" className="text-gray-400 hover:text-primary transition-colors">Fresh Mutton</Link></li>
              <li><Link to="/shop?category=Beef" className="text-gray-400 hover:text-primary transition-colors">Premium Beef</Link></li>
              <li><Link to="/shop?category=Chicken" className="text-gray-400 hover:text-primary transition-colors">Fresh Chicken</Link></li>
              <li><Link to="/shop?category=Kleji" className="text-gray-400 hover:text-primary transition-colors">Kleji & Liver</Link></li>
              <li><Link to="/shop?category=Paye" className="text-gray-400 hover:text-primary transition-colors">Fresh Paye</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 border-b-2 border-primary w-fit pb-1">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="text-primary shrink-0" size={20} />
                <span className="text-gray-400">{contactSettings.address}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="text-primary shrink-0" size={20} />
                <span className="text-gray-400">{contactSettings.phone}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="text-primary shrink-0" size={20} />
                <span className="text-gray-400">{contactSettings.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © 2026 Prime Cuts Fresh Meat Shop. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/terms" className="text-gray-500 hover:text-white text-sm">Terms of Service</Link>
            <Link to="/privacy" className="text-gray-500 hover:text-white text-sm">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
