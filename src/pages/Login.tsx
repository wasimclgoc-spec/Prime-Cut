import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithRedirect, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, Phone, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginWithPhone } = useAuth();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
      // Note: navigate('/') will not be called immediately because the page redirects.
      // The redirect result is handled by the AuthContext's onAuthStateChanged listener.
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to login with Google');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Only allow the specific admin email to register as admin
        if (email !== 'wasimclgoc@gmail.com') {
          throw new Error('This email is not authorized for admin registration.');
        }
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      let message = 'Invalid admin credentials.';
      if (err.code === 'auth/user-not-found') {
        message = 'Admin account not found. Please switch to "Sign Up" to create it.';
      } else if (err.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'Account already exists. Please switch to "Login".';
      } else if (err.message) {
        message = err.message;
      }
      setError(message + ' Alternatively, use Google Login with your admin email.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!isLogin && !name) {
        throw new Error('Please enter your name');
      }
      if (!phone) {
        throw new Error('Please enter your mobile number');
      }
      await loginWithPhone(name, phone);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-xl w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">PC</span>
          </div>
          <h2 className="text-3xl font-black text-secondary mb-2">
            {authMode === 'phone' ? (isLogin ? 'Login with Mobile' : 'Sign Up') : (isLogin ? 'Admin Login' : 'Create Admin')}
          </h2>
          <p className="text-gray-500">Premium Fresh Meat Shop</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 border border-red-100">
            {error}
          </div>
        )}

        <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
          <button
            onClick={() => setAuthMode('phone')}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${authMode === 'phone' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
          >
            Customer
          </button>
          <button
            onClick={() => setAuthMode('email')}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${authMode === 'email' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
          >
            Admin
          </button>
        </div>

        {authMode === 'phone' ? (
          <form onSubmit={handlePhoneAuth} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Your Name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="05XXXXXXXX"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-secondary text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 hover:bg-primary transition-all active:scale-95"
            >
              <LogIn size={20} />
              <span>{loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="admin@primecuts.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-secondary text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 hover:bg-primary transition-all active:scale-95 disabled:opacity-50"
            >
              <LogIn size={20} />
              <span>{loading ? 'Processing...' : (isLogin ? 'Login as Admin' : 'Register Admin')}</span>
            </button>
          </form>
        )}

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-400 font-medium">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border-2 border-gray-100 text-secondary py-4 rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-gray-50 transition-all active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="google" />
          <span>Google Account</span>
        </button>

        <p className="text-center mt-10 text-gray-500 font-medium">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
