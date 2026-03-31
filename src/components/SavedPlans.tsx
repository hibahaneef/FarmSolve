import React, { useEffect, useState } from "react";
import { db, collection, query, where, orderBy, onSnapshot, auth, OperationType, handleFirestoreError, deleteDoc, doc } from "../firebase";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Calendar, MapPin, Trash2, ChevronRight, Sprout } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface FarmingPlan {
  id: string;
  location: string;
  bestCrop: string;
  farmingPlan: string;
  sevenDayActionPlan: string[];
  commonMistakes: string[];
  createdAt: any;
}

export default function SavedPlans() {
  const [plans, setPlans] = useState<FarmingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<FarmingPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "plans"),
      where("uid", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plansData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FarmingPlan[];
      setPlans(plansData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "plans");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async () => {
    if (!planToDelete) return;
    try {
      await deleteDoc(doc(db, "plans", planToDelete));
      if (selectedPlan?.id === planToDelete) setSelectedPlan(null);
      setPlanToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `plans/${planToDelete}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
        <p className="text-stone-500 font-medium">Loading your saved plans...</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-4">
        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto">
          <Sprout className="text-stone-300" size={32} />
        </div>
        <h3 className="text-xl font-bold text-stone-900">No saved plans yet</h3>
        <p className="text-stone-500 max-w-xs mx-auto">
          Generate a farming plan in the "Beginner Guide" and save it to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {planToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-6 rounded-3xl shadow-xl max-w-sm w-full space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 size={24} />
                </div>
                <h3 className="text-xl font-bold text-stone-900">Delete Plan?</h3>
                <p className="text-stone-500">This action cannot be undone. Are you sure you want to delete this plan?</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPlanToDelete(null)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar List */}
      <div className="lg:col-span-1 space-y-4">
        <h3 className="text-lg font-bold text-stone-900 px-2">Your Saved Plans</h3>
        <div className="space-y-3">
          {plans.map((plan) => (
            <motion.div
              layout
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedPlan?.id === plan.id
                  ? "bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200"
                  : "bg-white border-stone-200 hover:border-emerald-200 hover:bg-stone-50"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  {plan.bestCrop}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPlanToDelete(plan.id);
                  }}
                  className="text-stone-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <h4 className="font-bold text-stone-900 flex items-center gap-2 mb-1">
                <MapPin size={14} className="text-stone-400" />
                {plan.location}
              </h4>
              <p className="text-xs text-stone-500 flex items-center gap-1">
                <Calendar size={12} />
                {plan.createdAt?.toDate().toLocaleDateString()}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail View */}
      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">
          {selectedPlan ? (
            <motion.div
              key={selectedPlan.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-8"
            >
              <div className="flex justify-between items-start border-b border-stone-100 pb-6">
                <div>
                  <h2 className="text-3xl font-bold text-stone-900 mb-2">{selectedPlan.bestCrop}</h2>
                  <p className="text-stone-500 flex items-center gap-2">
                    <MapPin size={18} />
                    {selectedPlan.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Saved On</p>
                  <p className="font-medium text-stone-900">
                    {selectedPlan.createdAt?.toDate().toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-stone-900 flex items-center gap-2">
                    <Calendar className="text-emerald-600" />
                    7-Day Action Plan
                  </h4>
                  <ul className="space-y-3">
                    {selectedPlan.sevenDayActionPlan.map((step, i) => (
                      <li key={i} className="flex gap-3 text-stone-600 text-sm">
                        <span className="font-bold text-emerald-600">Day {i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-stone-900 flex items-center gap-2">
                    <Sprout className="text-emerald-600" />
                    Common Mistakes to Avoid
                  </h4>
                  <ul className="space-y-3">
                    {selectedPlan.commonMistakes.map((mistake, i) => (
                      <li key={i} className="flex gap-3 text-stone-600 text-sm">
                        <span className="text-amber-500">•</span>
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="prose prose-stone max-w-none pt-6 border-t border-stone-100">
                <h4 className="font-bold text-stone-900 mb-4">Detailed Farming Plan</h4>
                <ReactMarkdown>{selectedPlan.farmingPlan}</ReactMarkdown>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[400px] bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center p-8 text-center">
              <ChevronRight className="text-stone-300 mb-4" size={48} />
              <h3 className="text-xl font-bold text-stone-400">Select a plan to view details</h3>
              <p className="text-stone-400 max-w-xs mt-2">
                Click on any of your saved plans from the list on the left.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
