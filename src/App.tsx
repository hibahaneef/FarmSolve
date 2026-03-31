/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, createContext, useContext } from "react";
import { 
  Sprout, 
  Droplets, 
  Search, 
  Bug, 
  Leaf, 
  TrendingUp, 
  Menu, 
  X,
  ChevronRight,
  LogOut,
  User as UserIcon,
  LogIn,
  Bookmark
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import BeginnerGuide from "./components/BeginnerGuide";
import IrrigationAdvisor from "./components/IrrigationAdvisor";
import CropSuitability from "./components/CropSuitability";
import DiseaseDiagnosis from "./components/DiseaseDiagnosis";
import CropHealth from "./components/CropHealth";
import MarketAdvisor from "./components/MarketAdvisor";
import SavedPlans from "./components/SavedPlans";

import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User, db, doc, setDoc, getDoc, serverTimestamp } from "./firebase";

// Auth Context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

const tabs = [
  { id: "beginner", label: "Beginner Guide", icon: Sprout, color: "emerald" },
  { id: "irrigation", label: "Irrigation", icon: Droplets, color: "blue" },
  { id: "suitability", label: "Suitability", icon: Search, color: "emerald" },
  { id: "disease", label: "Disease", icon: Bug, color: "red" },
  { id: "health", label: "Crop Health", icon: Leaf, color: "emerald" },
  { id: "market", label: "Market", icon: TrendingUp, color: "indigo" },
  { id: "saved", label: "Saved Plans", icon: Bookmark, color: "amber" },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("beginner");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Sync user to Firestore
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            createdAt: serverTimestamp(),
            role: 'user'
          });
        }
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setActiveTab("beginner");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-emerald-600 p-4 rounded-2xl animate-bounce">
            <Sprout className="text-white" size={48} />
          </div>
          <p className="text-stone-500 font-medium animate-pulse">Growing your experience...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-stone-200 text-center"
        >
          <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sprout className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Welcome to farmsolve</h1>
          <p className="text-stone-500 mb-8">Your AI-powered smart farming decision assistant. Sign in to start growing.</p>
          
          <button
            onClick={login}
            className="w-full bg-white border-2 border-stone-200 hover:border-emerald-500 text-stone-700 font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 group"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
          
          <p className="mt-8 text-xs text-stone-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "beginner": return <BeginnerGuide />;
      case "irrigation": return <IrrigationAdvisor />;
      case "suitability": return <CropSuitability />;
      case "disease": return <DiseaseDiagnosis />;
      case "health": return <CropHealth />;
      case "market": return <MarketAdvisor />;
      case "saved": return <SavedPlans />;
      default: return <BeginnerGuide />;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
        {/* Header */}
        <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-600 p-2 rounded-xl">
                  <Sprout className="text-white" size={24} />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-stone-900">
                  farmsolve
                </h1>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-stone-500 hover:bg-stone-100"
                    }`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* User Profile / Logout */}
              <div className="hidden md:flex items-center gap-4 ml-4 pl-4 border-l border-stone-200">
                <div className="flex items-center gap-2">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ""} className="w-8 h-8 rounded-full border border-stone-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                      <UserIcon size={16} />
                    </div>
                  )}
                  <span className="text-sm font-semibold text-stone-700 max-w-[100px] truncate">
                    {user.displayName?.split(' ')[0]}
                  </span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden p-2 text-stone-500"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              className="fixed inset-0 z-40 md:hidden bg-white pt-16"
            >
              <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ""} className="w-10 h-10 rounded-full border border-stone-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                      <UserIcon size={20} />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-stone-900">{user.displayName}</p>
                    <p className="text-xs text-stone-500">{user.email}</p>
                  </div>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-red-500"
                >
                  <LogOut size={20} />
                </button>
              </div>
              <div className="p-4 space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full p-4 rounded-2xl text-left flex items-center justify-between group ${
                      activeTab === tab.id
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon size={20} />
                      <span className="font-semibold">{tab.label}</span>
                    </div>
                    <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-stone-900 tracking-tight">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <p className="text-stone-500 mt-1">
              {activeTab === 'beginner' && "Start your farming journey with a personalized plan."}
              {activeTab === 'irrigation' && "Smart watering recommendations based on real-time weather."}
              {activeTab === 'suitability' && "Discover the best crops for your specific location."}
              {activeTab === 'disease' && "Identify and treat crop diseases before they spread."}
              {activeTab === 'health' && "Optimize your crop yield with expert nutrient advice."}
              {activeTab === 'market' && "Make informed decisions on when to sell for maximum profit."}
              {activeTab === 'saved' && "Access and manage your previously generated farming plans."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-stone-200 py-12 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Sprout className="text-emerald-600" size={20} />
              <span className="font-bold text-stone-900">farmsolve</span>
            </div>
            <p className="text-stone-500 text-sm">
              Empowering farmers with AI-driven insights for a sustainable future.
            </p>
          </div>
        </footer>
      </div>
    </AuthContext.Provider>
  );
}
