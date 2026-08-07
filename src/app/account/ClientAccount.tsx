"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, MapPin, Package, LogOut, Loader2, CheckCircle2, Truck, RefreshCcw, X, AlertCircle } from "lucide-react";

interface Order {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  currency_symbol: string;
  line_items: any[];
}

interface ClientAccountProps {
  user: any;
  initialProfile: any;
  initialOrders: Order[];
}

export default function ClientAccount({ user, initialProfile, initialOrders }: ClientAccountProps) {
  const router = useRouter();
  
  // UI States
  const [activeTab, setActiveTab] = useState("orders");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Return Modal States
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Form States (Profile)
  const [firstName, setFirstName] = useState(initialProfile?.first_name || "");
  const [lastName, setLastName] = useState(initialProfile?.last_name || "");
  const [phone, setPhone] = useState(initialProfile?.billing?.phone || "");
  const [address, setAddress] = useState(initialProfile?.billing?.address_1 || "");
  const [city, setCity] = useState(initialProfile?.billing?.city || "");
  const [state, setState] = useState(initialProfile?.billing?.state || "");
  const [postcode, setPostcode] = useState(initialProfile?.billing?.postcode || "");
  const [country, setCountry] = useState(initialProfile?.billing?.country || "");

  // Profile Update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, firstName, lastName, phone, address, city, state, postcode, country }),
      });
      if (!res.ok) throw new Error("Update failed");

      const updatedUser = { ...user, firstName, lastName };
      document.cookie = `user_session=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; max-age=604800; SameSite=Lax`;
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("user_session"); 
    router.push("/auth");
    router.refresh(); 
  };

  // Return Request Handler
  const handleReturnRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !returnReason.trim()) return;

    setIsSubmittingReturn(true);
    try {
      const res = await fetch("/api/orders/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrder, reason: returnReason }),
      });

      if (!res.ok) throw new Error("Return request failed");
      
      setReturnModalOpen(false);
      setReturnReason("");
      alert("Return request submitted successfully. Our team will review it.");
      router.refresh(); // Refresh page to show updated status
    } catch (error) {
      alert("Failed to submit return request. Try again.");
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  // Helper for Order Status Colors
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'on-hold': return 'bg-yellow-100 text-yellow-700';
      case 'refunded': case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Helper for Tracking Progress Bar
  const getTrackingProgress = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed') return 3;
    if (s === 'processing') return 2;
    if (s === 'on-hold') return 3; // If on-hold (return requested), it was already delivered.
    if (s === 'pending') return 1;
    return 0; // cancelled/refunded
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] py-12 px-4 sm:px-6 relative">
      <div className="max-w-[1200px] mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-wider uppercase">My Account</h1>
          <p className="text-sm text-gray-500 mt-2">Welcome back, {firstName || user?.email?.split('@')[0]}!</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* SIDEBAR NAVIGATION */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <nav className="flex flex-col">
                <button onClick={() => setActiveTab("profile")} className={`flex items-center gap-3 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === "profile" ? "bg-pink-50 text-[#d81b60] border-l-4 border-[#d81b60]" : "text-gray-600 hover:bg-gray-50 border-l-4 border-transparent"}`}>
                  <User className="w-5 h-5" /> Account Details
                </button>
                <button onClick={() => setActiveTab("orders")} className={`flex items-center gap-3 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === "orders" ? "bg-pink-50 text-[#d81b60] border-l-4 border-[#d81b60]" : "text-gray-600 hover:bg-gray-50 border-l-4 border-transparent"}`}>
                  <Package className="w-5 h-5" /> Order History
                </button>
                <button onClick={handleLogout} className="flex items-center gap-3 px-6 py-4 text-sm font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-colors border-l-4 border-transparent">
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </nav>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
              
              {/* ORDERS TAB */}
              {activeTab === "orders" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-wide">Order History & Tracking</h2>
                  
                  {!initialOrders || initialOrders.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-500">You haven't placed any orders yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {initialOrders.map((order) => {
                        const progress = getTrackingProgress(order.status);
                        const isRefunded = order.status.toLowerCase() === 'refunded';
                        const isCancelled = order.status.toLowerCase() === 'cancelled';
                        const isReturnRequested = order.status.toLowerCase() === 'on-hold';
                        
                        return (
                          <div key={order.id} className="border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow bg-white">
                            {/* Header */}
                            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 pb-4 mb-4">
                              <div>
                                <span className="text-lg font-black text-gray-900">Order #{order.number}</span>
                                <p className="text-xs text-gray-500 mt-1">Placed on {new Date(order.date_created).toLocaleDateString()}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                 <span className="font-black text-gray-900 text-lg">{order.currency_symbol}{order.total}</span>
                                 <span className={`px-4 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                   {order.status}
                                 </span>
                              </div>
                            </div>

                            {/* Show UI based on Status */}
                            {isRefunded || isCancelled ? (
                              <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl p-4 flex items-center gap-3 mb-6">
                                <AlertCircle className="w-6 h-6" />
                                <div>
                                  <h4 className="font-bold text-sm uppercase tracking-wider">{isRefunded ? 'Refund Processed' : 'Order Cancelled'}</h4>
                                  <p className="text-xs mt-1">This order has been {order.status}. If you have any questions, please contact support.</p>
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Tracking Timeline (Only show if not refunded/cancelled) */}
                                <div className="relative mb-8 mt-2 max-w-xl mx-auto">
                                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full"></div>
                                  <div className={`absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 rounded-full transition-all duration-500`} style={{ width: `${(progress / 3) * 100}%` }}></div>
                                  <div className="relative flex justify-between">
                                    <div className="flex flex-col items-center">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${progress >= 1 ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 text-gray-400'}`}><Package className="w-4 h-4" /></div>
                                      <span className="text-[10px] font-bold mt-2 uppercase text-gray-500">Confirmed</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${progress >= 2 ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 text-gray-400'}`}><Truck className="w-4 h-4" /></div>
                                      <span className="text-[10px] font-bold mt-2 uppercase text-gray-500">Processing</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${progress >= 3 ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 text-gray-400'}`}><CheckCircle2 className="w-4 h-4" /></div>
                                      <span className="text-[10px] font-bold mt-2 uppercase text-gray-500">Delivered</span>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Return Status Alert (If On-Hold) */}
                            {isReturnRequested && (
                              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 flex items-center gap-3 mb-6">
                                <RefreshCcw className="w-5 h-5 animate-spin-slow" />
                                <div>
                                  <h4 className="font-bold text-sm uppercase tracking-wider">Return Requested</h4>
                                  <p className="text-xs mt-0.5">Your return request is currently under review by our team.</p>
                                </div>
                              </div>
                            )}

                            {/* Line Items */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                              {order.line_items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                  <span className="text-gray-700 font-medium line-clamp-1">{item.name} <span className="text-gray-400 mx-2 text-xs">Qty: {item.quantity}</span></span>
                                  <span className="font-bold text-gray-900">{order.currency_symbol}{item.total}</span>
                                </div>
                              ))}
                            </div>

                            {/* Actions: Request Return Button (Only if Completed) */}
                            {order.status.toLowerCase() === 'completed' && (
                              <div className="mt-5 flex justify-end">
                                <button 
                                  onClick={() => { setSelectedOrder(order.id); setReturnModalOpen(true); }}
                                  className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#d81b60] border border-[#d81b60] px-5 py-2.5 rounded-lg hover:bg-[#d81b60] hover:text-white transition-colors"
                                >
                                  <RefreshCcw className="w-3.5 h-3.5" /> Request Return / Refund
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* PROFILE TAB (Unchanged) */}
              {activeTab === "profile" && (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-wide">Account Details</h2>
                  {message.text && (
                    <div className={`mb-8 p-4 text-sm rounded-xl font-medium flex items-center gap-2 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                      {message.text}
                    </div>
                  )}
                  <form onSubmit={handleUpdate} className="space-y-8">
                    {/* Form Fields... (same as before) */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3 mb-5">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">First Name</label><input required type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d81b60] text-sm" /></div>
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Last Name</label><input required type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d81b60] text-sm" /></div>
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label><input type="email" value={user?.email || ""} disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 text-sm cursor-not-allowed" /></div>
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Phone Number</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d81b60] text-sm" /></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3 mb-5 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> Address Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1 md:col-span-2"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Street Address</label><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d81b60] text-sm" /></div>
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">City</label><input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d81b60] text-sm" /></div>
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">State / Province</label><input type="text" value={state} onChange={(e) => setState(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d81b60] text-sm" /></div>
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">ZIP Code</label><input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d81b60] text-sm" /></div>
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Country</label><input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d81b60] text-sm" /></div>
                      </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                      <button type="submit" disabled={isUpdating} className="px-8 py-4 bg-[#d81b60] text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-[#c2185b] transition-all disabled:opacity-50 flex items-center gap-2">
                        {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />} {isUpdating ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RETURN & REFUND MODAL */}
      {returnModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="font-black text-lg text-gray-900 uppercase tracking-wider">Request Return</h3>
              <button onClick={() => setReturnModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleReturnRequest} className="p-6 space-y-4">
              <p className="text-sm text-gray-500">Please provide a valid reason for returning Order #{selectedOrder}. Our team will review this and process your refund within 5-7 business days.</p>
              <div>
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Reason for Return</label>
                <textarea 
                  required 
                  rows={4}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="e.g. Item damaged, changed my mind, etc." 
                  className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d81b60]"
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={isSubmittingReturn}
                className="w-full bg-[#d81b60] text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#c2185b] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmittingReturn && <Loader2 className="w-4 h-4 animate-spin" />} 
                {isSubmittingReturn ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}