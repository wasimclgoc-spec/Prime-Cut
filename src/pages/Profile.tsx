import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { User, MapPin, Phone, Mail, Package, LogOut } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Profile: React.FC = () => {
  const { profile, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    address: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
  }, [profile]);

  if (loading) return <div className="p-20 text-center">Loading...</div>;

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <User size={64} className="mx-auto text-gray-300 mb-6" />
        <h1 className="text-3xl font-black text-secondary mb-4">Not Logged In</h1>
        <p className="text-gray-500 mb-8">Please login to view your profile and manage your details.</p>
        <div className="space-y-4">
          <Link to="/login" className="block w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors">
            Login to your account
          </Link>
          <Link to="/tracking" className="block w-full bg-gray-100 text-secondary py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
            Track order as guest
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        displayName: formData.displayName,
        phone: formData.phone,
        address: formData.address
      });
      
      const updatedProfile = {
        ...profile,
        displayName: formData.displayName,
        phone: formData.phone,
        address: formData.address
      };
      localStorage.setItem('prime_cuts_session', JSON.stringify(updatedProfile));
      
      setIsEditing(false);
      alert("Profile updated successfully! Refresh the page to see changes everywhere.");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black text-secondary">My Profile</h1>
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-2 text-gray-500 hover:text-primary transition-colors font-bold"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={40} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-secondary">{profile.displayName || 'User'}</h2>
            <p className="text-gray-500 text-sm mb-6">{profile.email}</p>
            
            <Link 
              to="/tracking" 
              className="flex items-center justify-center space-x-2 w-full bg-secondary text-white py-3 rounded-xl font-bold hover:bg-secondary-light transition-colors"
            >
              <Package size={20} />
              <span>My Orders</span>
            </Link>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-secondary">Personal Details</h3>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-primary font-bold hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        displayName: profile.displayName || '',
                        phone: profile.phone || '',
                        address: profile.address || ''
                      });
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                    <Mail size={20} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                    <p className="font-medium text-secondary">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                    <Phone size={20} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Phone Number</p>
                    <p className="font-medium text-secondary">{profile.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                    <MapPin size={20} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Delivery Address</p>
                    <p className="font-medium text-secondary">{profile.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
