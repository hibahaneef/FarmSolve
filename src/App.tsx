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
    const handleTabChange = (e: any) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener('changeTab', handleTabChange);
    return () => window.removeEventListener('changeTab', handleTabChange);
  }, []);

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
      <div className="min-h-screen bg-stone-50 font-sans text-stone-900 flex flex-col md:flex-row">
        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden md:flex flex-col w-72 bg-white border-r border-stone-200 sticky top-0 h-screen z-50">
          <div className="p-6 flex items-center gap-3 border-b border-stone-100">
            <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-100">
              <Sprout className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900">
              farmsolve
            </h1>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 group relative ${
                  activeTab === tab.id
                    ? "bg-emerald-50 text-emerald-700 shadow-sm"
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                <tab.icon size={20} className={activeTab === tab.id ? "text-emerald-600" : "text-stone-400 group-hover:text-stone-600"} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-6 bg-emerald-600 rounded-r-full"
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-stone-100">
            <div className="bg-stone-50 p-4 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ""} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500">
                    <UserIcon size={20} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-stone-900 truncate">{user.displayName}</p>
                  <p className="text-xs text-stone-500 truncate">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-stone-200 sticky top-0 z-50 px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <Sprout className="text-white" size={18} />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-stone-900">
              farmsolve
            </h1>
          </div>
          <button 
            className="p-2 text-stone-500 hover:bg-stone-50 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-40 md:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-80 bg-white z-50 md:hidden flex flex-col shadow-2xl"
              >
                <div className="p-6 flex items-center justify-between border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="bg-emerald-600 p-2 rounded-xl">
                      <Sprout className="text-white" size={20} />
                    </div>
                    <h1 className="text-xl font-bold text-stone-900">farmsolve</h1>
                  </div>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 text-stone-400">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 p-4 space-y-1 overflow-y-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full p-4 rounded-2xl text-left flex items-center gap-4 transition-all ${
                        activeTab === tab.id
                          ? "bg-emerald-50 text-emerald-700 font-bold"
                          : "text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <tab.icon size={20} className={activeTab === tab.id ? "text-emerald-600" : "text-stone-400"} />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="p-6 border-t border-stone-100">
                  <div className="flex items-center gap-3 mb-6">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || ""} className="w-12 h-12 rounded-full border-2 border-white shadow-md" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                        <UserIcon size={24} />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-stone-900">{user.displayName}</p>
                      <p className="text-xs text-stone-500">{user.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={logout}
                    className="w-full py-3 rounded-2xl bg-red-50 text-red-600 font-bold flex items-center justify-center gap-2"
                  >
                    <LogOut size={20} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 md:py-12">
            <header className="mb-8 md:mb-10">
              <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-2 md:mb-3">
                <span className="w-6 md:w-8 h-px bg-stone-200" />
                {tabs.find(t => t.id === activeTab)?.label}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-stone-900 tracking-tight mb-3 md:mb-4">
                {activeTab === 'beginner' && "Start Your Journey"}
                {activeTab === 'irrigation' && "Smart Irrigation"}
                {activeTab === 'suitability' && "Crop Suitability"}
                {activeTab === 'disease' && "Disease Diagnosis"}
                {activeTab === 'health' && "Crop Health"}
                {activeTab === 'market' && "Market Advisor"}
                {activeTab === 'saved' && "Saved Plans"}
              </h2>
              <p className="text-base md:text-lg text-stone-500 max-w-2xl leading-relaxed">
                {activeTab === 'beginner' && "Get a personalized farming plan tailored to your land and goals."}
                {activeTab === 'irrigation' && "Optimize your water usage with real-time weather-based advice."}
                {activeTab === 'suitability' && "Find out which crops will thrive in your specific location."}
                {activeTab === 'disease' && "Identify plant diseases instantly and get effective treatments."}
                {activeTab === 'health' && "Boost your yield with expert nutrient and fertilizer guidance."}
                {activeTab === 'market' && "Analyze market trends to maximize your profit on every harvest."}
                {activeTab === 'saved' && "Manage and review your previously generated farming strategies."}
              </p>
            </header>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          <footer className="max-w-5xl mx-auto px-4 sm:px-8 py-12 border-t border-stone-200 mt-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <Sprout className="text-emerald-600" size={20} />
                <span className="font-bold text-stone-900 tracking-tight">farmsolve</span>
              </div>
              <p className="text-stone-400 text-sm">
                &copy; 2026 farmsolve. Empowering sustainable agriculture.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-xs font-bold text-stone-400 hover:text-emerald-600 transition-colors uppercase tracking-widest">Privacy</a>
                <a href="#" className="text-xs font-bold text-stone-400 hover:text-emerald-600 transition-colors uppercase tracking-widest">Terms</a>
                <a href="#" className="text-xs font-bold text-stone-400 hover:text-emerald-600 transition-colors uppercase tracking-widest">Support</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </AuthContext.Provider>
  );
}
