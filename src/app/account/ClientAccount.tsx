"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User, MapPin, Package, LogOut, Loader2, CheckCircle2, 
  AlertCircle, CreditCard, Pencil, X, Mail, Phone, Building, Home 
} from "lucide-react";

// Import our new separated component
import OrderHistory, { Order } from "./OrderHistory"; 

interface ClientAccountProps {
  user: any;
  initialProfile: any;
  initialOrders: Order[];
}

export default function ClientAccount({ user, initialProfile, initialOrders }: ClientAccountProps) {
  const router = useRouter();
  
  // UI States
  const [activeTab, setActiveTab] = useState("orders");
  const [isEditing, setIsEditing] = useState(false); // Controls Edit mode
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form States (Working Copies)
  const [profile, setProfile] = useState({
    first_name: initialProfile?.first_name || "",
    last_name: initialProfile?.last_name || "",
  });

  const [billing, setBilling] = useState({
    first_name: initialProfile?.billing?.first_name || "",
    last_name: initialProfile?.billing?.last_name || "",
    company: initialProfile?.billing?.company || "",
    address_1: initialProfile?.billing?.address_1 || "",
    address_2: initialProfile?.billing?.address_2 || "",
    city: initialProfile?.billing?.city || "",
    state: initialProfile?.billing?.state || "",
    postcode: initialProfile?.billing?.postcode || "",
    country: initialProfile?.billing?.country || "",
    phone: initialProfile?.billing?.phone || "",
    email: initialProfile?.billing?.email || user?.email || "",
  });

  const [shipping, setShipping] = useState({
    first_name: initialProfile?.shipping?.first_name || "",
    last_name: initialProfile?.shipping?.last_name || "",
    company: initialProfile?.shipping?.company || "",
    address_1: initialProfile?.shipping?.address_1 || "",
    address_2: initialProfile?.shipping?.address_2 || "",
    city: initialProfile?.shipping?.city || "",
    state: initialProfile?.shipping?.state || "",
    postcode: initialProfile?.shipping?.postcode || "",
    country: initialProfile?.shipping?.country || "",
  });

  // Sync state if server data changes after an update & refresh
  useEffect(() => {
    if (initialProfile) {
      setProfile({ first_name: initialProfile.first_name || "", last_name: initialProfile.last_name || "" });
      if (initialProfile.billing) setBilling({ ...billing, ...initialProfile.billing });
      if (initialProfile.shipping) setShipping({ ...shipping, ...initialProfile.shipping });
    }
  }, [initialProfile]);

  // Tab Switch Handler - Resets Edit Mode
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsEditing(false);
    setMessage({ type: "", text: "" });
    
    // Reset forms to saved data if user discards unsaved changes
    if (initialProfile) {
      setProfile({ first_name: initialProfile.first_name || "", last_name: initialProfile.last_name || "" });
      if (initialProfile.billing) setBilling({ ...billing, ...initialProfile.billing });
      if (initialProfile.shipping) setShipping({ ...shipping, ...initialProfile.shipping });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset back to server data
    setProfile({ first_name: initialProfile?.first_name || "", last_name: initialProfile?.last_name || "" });
    if (initialProfile?.billing) setBilling({ ...billing, ...initialProfile.billing });
    if (initialProfile?.shipping) setShipping({ ...shipping, ...initialProfile.shipping });
  };

  // Handle Profile / Address Updates
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, profile, billing, shipping }),
      });
      
      if (!res.ok) throw new Error("Update failed");

      // Update local cookie for top-level name changes
      const updatedUser = { ...user, firstName: profile.first_name, lastName: profile.last_name };
      document.cookie = `user_session=₹{encodeURIComponent(JSON.stringify(updatedUser))}; path=/; max-age=604800; SameSite=Lax`;
      
      setMessage({ type: "success", text: "Details updated successfully!" });
      setIsEditing(false); // Close edit mode on success
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update information." });
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

  // Helper for displaying fields in read-only mode
  const DisplayField = ({ label, value, icon: Icon }: any) => (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
      {Icon && <Icon className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />}
      <div>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value || <span className="text-gray-400 italic">Not provided</span>}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f9fafb] py-8 sm:py-12 px-4 sm:px-6 relative">
      <div className="max-w-[1200px] mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-wider uppercase">My Account</h1>
          <p className="text-sm text-gray-500 mt-2">Welcome back, {profile.first_name || user?.email?.split('@')[0]}!</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* SIDEBAR NAVIGATION - Responsive */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible hide-scrollbar whitespace-nowrap">
                {[
                  { id: "orders", label: "Order History", icon: Package },
                  { id: "profile", label: "Profile", icon: User },
                  { id: "shipping", label: "Shipping Address", icon: MapPin },
                  { id: "billing", label: "Billing Address", icon: CreditCard },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-3 px-6 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors md:border-l-4 md:border-b-0 border-b-4 md:w-full ₹{
                      activeTab === tab.id 
                      ? "bg-pink-50 text-[#d81b60] border-[#d81b60]" 
                      : "text-gray-600 hover:bg-gray-50 border-transparent"
                    }`}
                  >
                    <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> 
                    <span>{tab.label}</span>
                  </button>
                ))}
                
                <button onClick={handleLogout} className="flex items-center gap-3 px-6 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-colors md:border-l-4 md:border-b-0 border-b-4 border-transparent md:w-full">
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> 
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 min-h-[400px]">
              
              {/* GLOBAL MESSAGE FOR PROFILE FORMS */}
              {message.text && activeTab !== "orders" && (
                <div className={`mb-8 p-4 text-sm rounded-xl font-medium flex items-center gap-3 shadow-sm border ₹{message.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                  {message.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  {message.text}
                </div>
              )}

              {/* OUTSOURCED ORDERS SECTION */}
              {activeTab === "orders" && (
                <OrderHistory initialOrders={initialOrders} />
              )}

              {/* PROFILE SECTION */}
              {activeTab === "profile" && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                      <User className="w-6 h-6 text-[#d81b60]" /> Personal Details
                    </h2>
                    {!isEditing && (
                      <button onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider text-[#d81b60] bg-pink-50 px-5 py-2.5 rounded-lg hover:bg-pink-100 transition-colors">
                        <Pencil className="w-4 h-4" /> Edit Profile
                      </button>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DisplayField label="First Name" value={profile.first_name} icon={User} />
                      <DisplayField label="Last Name" value={profile.last_name} icon={User} />
                      <DisplayField label="Email Address" value={user?.email} icon={Mail} />
                    </div>
                  ) : (
                    <form onSubmit={handleUpdate} className="space-y-6 animate-in slide-in-from-bottom-2 fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">First Name</label><input required type="text" value={profile.first_name} onChange={(e) => setProfile({...profile, first_name: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] text-sm shadow-sm transition-all" /></div>
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Last Name</label><input required type="text" value={profile.last_name} onChange={(e) => setProfile({...profile, last_name: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] text-sm shadow-sm transition-all" /></div>
                        <div className="space-y-1 md:col-span-2"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Email Address (Read Only)</label><input type="email" value={user?.email || ""} disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 text-sm cursor-not-allowed shadow-sm" /></div>
                      </div>
                      <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
                        <button type="button" onClick={handleCancelEdit} disabled={isUpdating} className="px-6 py-3.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-50 transition-all shadow-sm">Cancel</button>
                        <button type="submit" disabled={isUpdating} className="px-8 py-3.5 bg-[#d81b60] text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-md hover:bg-[#c2185b] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                          {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />} {isUpdating ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* SHIPPING ADDRESS SECTION */}
              {activeTab === "shipping" && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-[#d81b60]" /> Shipping Address
                    </h2>
                    {!isEditing && (
                      <button onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider text-[#d81b60] bg-pink-50 px-5 py-2.5 rounded-lg hover:bg-pink-100 transition-colors">
                        <Pencil className="w-4 h-4" /> Edit Address
                      </button>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DisplayField label="Full Name" value={`₹{shipping.first_name} ₹{shipping.last_name}`.trim()} icon={User} />
                      <DisplayField label="Company" value={shipping.company} icon={Building} />
                      <div className="md:col-span-2">
                        <DisplayField 
                          label="Address" 
                          icon={Home}
                          value={
                            [shipping.address_1, shipping.address_2, shipping.city, shipping.state, shipping.postcode, shipping.country]
                            .filter(Boolean).join(", ")
                          } 
                        />
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdate} className="space-y-6 animate-in slide-in-from-bottom-2 fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">First Name</label><input required type="text" value={shipping.first_name} onChange={(e) => setShipping({...shipping, first_name: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] text-sm shadow-sm" /></div>
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Last Name</label><input required type="text" value={shipping.last_name} onChange={(e) => setShipping({...shipping, last_name: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] text-sm shadow-sm" /></div>
                        <div className="space-y-1 md:col-span-2"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Company (Optional)</label><input type="text" value={shipping.company} onChange={(e) => setShipping({...shipping, company: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] text-sm shadow-sm" /></div>
                        <div className="space-y-1 md:col-span-2"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Street Address</label>
                          <input required type="text" value={shipping.address_1} onChange={(e) => setShipping({...shipping, address_1: e.target.value})} placeholder="House number and street name" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] text-sm shadow-sm mb-3" />
                          <input type="text" value={shipping.address_2} onChange={(e) => setShipping({...shipping, address_2: e.target.value})} placeholder="Apartment, suite, unit, etc. (optional)" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] text-sm shadow-sm" />
                        </div>
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Town / City</label><input required type="text" value={shipping.city} onChange={(e) => setShipping({...shipping, city: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] text-sm shadow-sm" /></div>
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">State / Province</label><input required type="text" value={shipping.state} onChange={(e) => setShipping({...shipping, state: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] text-sm shadow-sm" /></div>
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">ZIP / Postcode</label><input required type="text" value={shipping.postcode} onChange={(e) => setShipping({...shipping, postcode: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] text-sm shadow-sm" /></div>
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Country</label><input required type="text" value={shipping.country} onChange={(e) => setShipping({...shipping, country: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] text-sm shadow-sm" /></div>
                      </div>
                      <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
                        <button type="button" onClick={handleCancelEdit} disabled={isUpdating} className="px-6 py-3.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-50 transition-all shadow-sm">Cancel</button>
                        <button type="submit" disabled={isUpdating} className="px-8 py-3.5 bg-[#d81b60] text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-md hover:bg-[#c2185b] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                          {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />} {isUpdating ? "Saving..." : "Save Address"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* BILLING ADDRESS SECTION */}
              {activeTab === "billing" && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                      <CreditCard className="w-6 h-6 text-[#d81b60]" /> Billing Address
                    </h2>
                    {!isEditing && (
                      <button onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider text-[#d81b60] bg-pink-50 px-5 py-2.5 rounded-lg hover:bg-pink-100 transition-colors">
                        <Pencil className="w-4 h-4" /> Edit Address
                      </button>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DisplayField label="Full Name" value={`₹{billing.first_name} ₹{billing.last_name}`.trim()} icon={User} />
                      <DisplayField label="Phone Number" value={billing.phone} icon={Phone} />
                      <DisplayField label="Email Address" value={billing.email} icon={Mail} />
                      <div className="md:col-span-2 mt-2">
                        <DisplayField 
                          label="Address" 
                          icon={Home}
                          value={
                            [billing.address_1, billing.address_2, billing.city, billing.state, billing.postcode, billing.country]
                            .filter(Boolean).join(", ")
                          } 
                        />
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdate} className="space-y-6 animate-in slide-in-from-bottom-2 fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">First Name</label><input required type="text" value={billing.first_name} onChange={(e) => setBilling({...billing, first_name: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] text-sm shadow-sm" /></div>
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Last Name</label><input required type="text" value={billing.last_name} onChange={(e) => setBilling({...billing, last_name: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] text-sm shadow-sm" /></div>
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Phone</label><input required type="tel" value={billing.phone} onChange={(e) => setBilling({...billing, phone: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] text-sm shadow-sm" /></div>
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Email</label><input required type="email" value={billing.email} onChange={(e) => setBilling({...billing, email: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] text-sm shadow-sm" /></div>
                        <div className="space-y-1 md:col-span-2"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Street Address</label>
                          <input required type="text" value={billing.address_1} onChange={(e) => setBilling({...billing, address_1: e.target.value})} placeholder="House number and street name" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] text-sm shadow-sm mb-3" />
                          <input type="text" value={billing.address_2} onChange={(e) => setBilling({...billing, address_2: e.target.value})} placeholder="Apartment, suite, unit, etc. (optional)" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] text-sm shadow-sm" />
                        </div>
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Town / City</label><input required type="text" value={billing.city} onChange={(e) => setBilling({...billing, city: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] text-sm shadow-sm" /></div>
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">State / Province</label><input required type="text" value={billing.state} onChange={(e) => setBilling({...billing, state: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] text-sm shadow-sm" /></div>
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">ZIP / Postcode</label><input required type="text" value={billing.postcode} onChange={(e) => setBilling({...billing, postcode: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] text-sm shadow-sm" /></div>
                        <div className="space-y-1"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Country</label><input required type="text" value={billing.country} onChange={(e) => setBilling({...billing, country: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] text-sm shadow-sm" /></div>
                      </div>
                      <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
                        <button type="button" onClick={handleCancelEdit} disabled={isUpdating} className="px-6 py-3.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-50 transition-all shadow-sm">Cancel</button>
                        <button type="submit" disabled={isUpdating} className="px-8 py-3.5 bg-[#d81b60] text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-md hover:bg-[#c2185b] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                          {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />} {isUpdating ? "Saving..." : "Save Address"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}