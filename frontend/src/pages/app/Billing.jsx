import { useState, useEffect } from 'react';
import { CreditCard, Check, ShieldCheck, Zap, History, IndianRupee } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Loader } from '../../components/ui/Loader';
import { AlertCircle, PartyPopper, X } from 'lucide-react';
import { billingService } from '../../services/billingService';
import { useAuth } from '../../context/AuthContext';

const KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export default function Billing() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [showSuccess, setShowSuccess] = useState(false);
  const isTestMode = KEY_ID?.startsWith('rzp_test_');

  useEffect(() => {
    async function fetchData() {
      try {
        const hist = await billingService.getBillingHistory();
        setHistory(hist);
        // If they have a successful transaction, we might set them to premium
        if (hist.some(h => h.status === 'success')) {
           setCurrentPlan('premium');
        }
      } catch (err) {
        console.error("Failed to load billing details", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleUpgrade = async () => {
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded. Please refresh the page.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create order on backend
      const order = await billingService.createOrder(5000);
      
      const options = {
        key: KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "DevDestany Premium",
        description: "Pro CV Model Subscription",
        image: "/logo.png",
        order_id: order.id, // This is the crucial part
        handler: async function (response) {
          setLoading(true);
          try {
            await billingService.saveTransaction({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan: 'premium',
              amount: 5000,
              currency: 'INR'
            });
            setCurrentPlan('premium');
            const hist = await billingService.getBillingHistory();
            setHistory(hist);
            setShowSuccess(true);
          } catch (error) {
            console.error("Transaction save error", error);
            alert("Payment was successful but we failed to update our records. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name || "DevDestany User",
          email: user?.email || "",
          contact: "",
        },
        theme: { color: "#2563eb" },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Order creation failed", err);
      alert("Failed to initiate payment. Please try again later.");
      setLoading(false);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto py-4 relative">
      {/* Test Mode / Missing Key Warning */}
      {!KEY_ID && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800 shadow-sm">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">
            <span className="font-bold">Configuration Missing:</span> Razorpay Key ID is not set in your environment variables. Payments will not work.
          </p>
        </div>
      )}

      {isTestMode && KEY_ID && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3 text-amber-800 shadow-sm">
          <div className="flex items-center gap-3">
             <AlertCircle size={20} />
             <p className="text-sm font-medium">
               <span className="font-bold">Test Mode Active:</span> You are using a Razorpay Test Key. No real money will be charged.
             </p>
          </div>
          <Badge variant="warning" className="bg-amber-200 text-amber-900 border-amber-300">Sandbox</Badge>
        </div>
      )}

      {/* Success Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
           <Card className="max-w-md w-full bg-white shadow-2xl border-none p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                 <PartyPopper size={40} />
              </div>
              <div>
                 <h3 className="text-2xl font-bold text-gray-900">Upgrade Successful!</h3>
                 <p className="text-gray-500 mt-2">Welcome to DevDestany Premium. Your advanced CV models are now active.</p>
              </div>
              <Button fullWidth onClick={() => setShowSuccess(false)}>
                 Get Started
              </Button>
           </Card>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Billing & Subscription</h1>
          <p className="text-sm text-gray-500 mt-2">Manage your plan, payment methods, and view your billing history.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100 text-blue-700">
           <ShieldCheck size={18} />
           <span className="text-sm font-semibold tracking-wide uppercase">Secure Payments</span>
        </div>
      </div>

      {/* Current Plan Overview */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white overflow-hidden relative border-none">
         <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Zap size={140} weight="fill" />
         </div>
         <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div>
               <p className="text-blue-100 font-medium mb-1">CURRENT PLAN</p>
               <h2 className="text-4xl font-bold mb-4 flex items-baseline gap-2">
                  {currentPlan === 'premium' ? 'Premium Pro' : 'Free Standard'}
                  <span className="text-lg font-normal opacity-80">/{currentPlan === 'premium' ? 'month' : 'forever'}</span>
               </h2>
               <div className="flex flex-wrap gap-3">
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                     {currentPlan === 'premium' ? 'Highly Optimized CV Model' : 'Standard CV Model'}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                     Next billing: May 03, 2026
                  </Badge>
               </div>
            </div>
            {currentPlan === 'free' && (
               <Button 
                 variant="secondary" 
                 className="bg-white text-blue-600 hover:bg-gray-50 px-8 h-12 text-base font-bold shadow-xl"
                 onClick={handleUpgrade}
               >
                  Upgrade to Pro
               </Button>
            )}
         </div>
      </Card>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className={`border-2 transition-all ${currentPlan === 'free' ? 'border-blue-500 bg-blue-50/10' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-bold text-gray-900">Standard Tier</h3>
               {currentPlan === 'free' && <Badge variant="success">Active</Badge>}
            </div>
            <div className="mb-8">
               <span className="text-4xl font-black text-gray-900">₹0</span>
               <span className="text-gray-500 ml-2">/month</span>
            </div>
            <ul className="space-y-4 mb-10">
               <li className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-0.5 rounded-full bg-blue-100 text-blue-600"><Check size={14} /></div>
                  Standard CV model for basic inference
               </li>
               <li className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-0.5 rounded-full bg-blue-100 text-blue-600"><Check size={14} /></div>
                  Up to 10 products tracking
               </li>
               <li className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-0.5 rounded-full bg-blue-100 text-blue-600"><Check size={14} /></div>
                  Standard support frequency
               </li>
            </ul>
            <Button variant="secondary" fullWidth disabled={currentPlan === 'free'}>
               {currentPlan === 'free' ? 'Current Plan' : 'Select Free'}
            </Button>
         </Card>

         <Card className={`border-2 transition-all relative overflow-hidden ${currentPlan === 'premium' ? 'border-blue-500 bg-blue-50/10 shadow-lg' : 'border-gray-200 shadow-md'}`}>
            {currentPlan === 'free' && (
               <div className="absolute top-4 right-4 rotate-12 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm z-10">
                  MOST POPULAR
               </div>
            )}
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-bold text-gray-900">Pro Tier</h3>
               {currentPlan === 'premium' && <Badge variant="success">Active Plan</Badge>}
            </div>
            <div className="mb-8">
               <span className="text-4xl font-black text-gray-900 tracking-tight">₹5,000</span>
               <span className="text-gray-500 ml-2">/month</span>
            </div>
            <ul className="space-y-4 mb-10">
               <li className="flex items-center gap-3 text-sm font-semibold text-gray-900">
                  <div className="p-0.5 rounded-full bg-blue-600 text-white"><Check size={14} /></div>
                  Heavy & Highly Optimized Pro CV Model
               </li>
               <li className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-0.5 rounded-full bg-blue-600 text-white"><Check size={14} /></div>
                  Infinite products tracking
               </li>
               <li className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-0.5 rounded-full bg-blue-600 text-white"><Check size={14} /></div>
                  Real-time high-speed inference
               </li>
               <li className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-0.5 rounded-full bg-blue-600 text-white"><Check size={14} /></div>
                  24/7 Priority engineering support
               </li>
            </ul>
            <Button 
               variant={currentPlan === 'premium' ? 'secondary' : 'primary'} 
               fullWidth 
               onClick={handleUpgrade}
               disabled={currentPlan === 'premium'}
            >
               {currentPlan === 'premium' ? 'Current Active Pro' : 'Upgrade to Pro'}
            </Button>
         </Card>
      </div>

      {/* Payment History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <History size={20} className="text-blue-600" />
              Billing History
            </h2>
          </div>
          
          <Card padding={false} className="overflow-hidden bg-white border border-gray-200">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Transaction ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((row) => (
                  <tr key={row.razorpay_payment_id || row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-500 truncate max-w-[150px]">
                       {row.razorpay_payment_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                       {new Date(row.date || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 flex items-center gap-1">
                       <IndianRupee size={14} /> {row.amount}
                    </td>
                    <td className="px-6 py-4 text-center">
                       <Badge variant={row.status === 'success' || row.status === 'captured' ? 'success' : 'danger'} size="sm">
                          {(row.status || 'Success').toUpperCase()}
                       </Badge>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500 italic">No payment records found in the database. Successful upgrades will appear here.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
      </div>
    </div>
  );
}
