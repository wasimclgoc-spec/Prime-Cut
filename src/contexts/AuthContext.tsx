import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithPhone: (name: string, phone: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  loginWithPhone: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loginWithPhone = async (name: string, phone: string) => {
    const phoneUid = `phone_${phone}`;
    const docRef = doc(db, 'users', phoneUid);
    const docSnap = await getDoc(docRef);
    
    let newProfile: UserProfile;
    if (docSnap.exists()) {
      newProfile = docSnap.data() as UserProfile;
    } else {
      newProfile = {
        uid: phoneUid,
        email: '',
        displayName: name,
        phone: phone,
        role: 'customer',
      };
      await setDoc(docRef, newProfile);
    }
    setProfile(newProfile);
    localStorage.setItem('prime_cuts_session', JSON.stringify(newProfile));
  };

  const logout = () => {
    auth.signOut();
    setProfile(null);
    setUser(null);
    localStorage.removeItem('prime_cuts_session');
  };

  useEffect(() => {
    const checkSession = async () => {
      const savedSession = localStorage.getItem('prime_cuts_session');
      if (savedSession) {
        const savedProfile = JSON.parse(savedSession) as UserProfile;
        setProfile(savedProfile);
      }

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const p = docSnap.data() as UserProfile;
            setProfile(p);
            localStorage.setItem('prime_cuts_session', JSON.stringify(p));
          } else {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Customer',
              role: firebaseUser.email === 'wasimclgoc@gmail.com' ? 'admin' : 'customer',
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
            localStorage.setItem('prime_cuts_session', JSON.stringify(newProfile));
          }
        } else if (!savedSession) {
          setProfile(null);
          setUser(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    };

    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin: profile?.role === 'admin', loginWithPhone, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
