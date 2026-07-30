"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, MapPin, Package, LogOut, Loader2, Eye } from "lucide-react";

// --- TypeScript Interfaces ---
interface Order {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  currency_symbol: string;
  line_items: any[];
}

export default function AccountPage() {
  const router = useRouter();
  
  // Base State
  const [user, setUser] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("profile");

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  
  // Address States
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("");

  // Initialize and Fetch Data
  useEffect(() => {
    const initAccount = async () => {
      const session = localStorage.getItem("user_session");
      if (!session) {
        router.push("/auth");
        return;
      }

      try {
        const sessionData = JSON.parse(session);
        setUser(sessionData);
        
        // 1. Hydrate Profile (Get latest from DB in case it changed)
        const profileRes = await fetch(`/api/user/profile?userId=${sessionData.id}`);
        if (profileRes.ok) {
          const { customer } = await profileRes.json();
          setFirstName(customer.first_name || "");
          setLastName(customer.last_name || "");
          setPhone(customer.billing?.phone || "");
          setAddress(customer.billing?.address_1 || "");
          setCity(customer.billing?.city || "");
          setState(customer.billing?.state || "");
          setPostcode(customer.billing?.postcode || "");
          setCountry(customer.billing?.country || "");
        }

        // 2. Fetch Orders
        setIsLoadingOrders(true);
        const ordersRes = await fetch(`/api/user/orders?userId=${sessionData.id}`);
        if (ordersRes.ok) {
          const { orders } = await ordersRes.json();
          setOrders(orders);
        }
      } catch (error) {
        console.error("Error initializing account:", error);
      } finally {
        setIsChecking(false);
        setIsLoadingOrders(false);
      }
    };

    initAccount();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user.id, 
          firstName, lastName, phone, address, city, state, postcode, country
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      // Update LocalStorage
      const updatedUser = { 
        ...user, firstName, lastName, phone, address, city, state, postcode, country 
      };
      localStorage.setItem("user_session", JSON.stringify(updatedUser));

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    router.push("/auth");
  };

  // Helper for Order Status Colors
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#d81b60]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] py-12 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-wider uppercase">My Account</h1>
          <p className="text-sm text-gray-500 mt-2">Welcome back, {firstName || user?.email.split('@')[0]}!</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* SIDEBAR NAVIGATION */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <nav className="flex flex-col">
                <button 
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center gap-3 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === "profile" ? "bg-pink-50 text-[#d81b60] border-l-4 border-[#d81b60]" : "text-gray-600 hover:bg-gray-50 border-l-4 border-transparent"}`}
                >
                  <User className="w-5 h-5" /> Account Details
                </button>
                <button 
                  onClick={() => setActiveTab("orders")}
                  className={`flex items-center gap-3 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === "orders" ? "bg-pink-50 text-[#d81b60] border-l-4 border-[#d81b60]" : "text-gray-600 hover:bg-gray-50 border-l-4 border-transparent"}`}
                >
                  <Package className="w-5 h-5" /> Order History
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-6 py-4 text-sm font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-colors border-l-4 border-transparent"
                >
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
                  <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-wide">Order History</h2>
                  
                  {isLoadingOrders ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[#d81b60]" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-500">You haven't placed any orders yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-400">
                            <th className="pb-4 font-bold">Order</th>
                            <th className="pb-4 font-bold">Date</th>
                            <th className="pb-4 font-bold">Status</th>
                            <th className="pb-4 font-bold">Total</th>
                            <th className="pb-4 font-bold text-right">Items</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                              <td className="py-4 text-sm font-bold text-gray-900">#{order.number}</td>
                              <td className="py-4 text-sm text-gray-500">
                                {new Date(order.date_created).toLocaleDateString()}
                              </td>
                              <td className="py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                  {order.status}
                               </span>
                              </td>
                              <td className="py-4 text-sm font-bold text-[#d81b60]">
                                {order.currency_symbol}{order.total}
                              </td>
                              <td className="py-4 text-sm text-gray-500 text-right">
                                {order.line_items.length} item(s)
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-wide">Account Details</h2>
                  
                  {message.text && (
                    <div className={`mb-8 p-4 text-sm rounded-xl font-medium flex items-center gap-2 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                      {message.text}
                    </div>
                  )}

                  <form onSubmit={handleUpdate} className="space-y-8">
                    
                    {/* PERSONAL INFORMATION */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3 mb-5">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                           <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">First Name</label>
                           <input required type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d81b60] focus:ring-1 focus:ring-[#d81b60] text-sm transition-all" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
                           <input required type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d81b60] focus:ring-1 focus:ring-[#d81b60] text-sm transition-all" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                           <input type="email" value={user?.email || ""} disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 text-sm cursor-not-allowed" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                           <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d81b60] focus:ring-1 focus:ring-[#d81b60] text-sm transition-all" />
                        </div>
                      </div>
                    </div>

                    {/* ADDRESS DETAILS */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" /> Address Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1 md:col-span-2">
                           <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Street Address</label>
                           <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d81b60] focus:ring-1 focus:ring-[#d81b60] text-sm transition-all" placeholder="123 Main St, Apt 4B" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">City</label>
                           <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d81b60] focus:ring-1 focus:ring-[#d81b60] text-sm transition-all" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">State / Province</label>
                           <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d81b60] focus:ring-1 focus:ring-[#d81b60] text-sm transition-all" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">ZIP / Postal Code</label>
                           <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d81b60] focus:ring-1 focus:ring-[#d81b60] text-sm transition-all" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Country</label>
                           <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d81b60] focus:ring-1 focus:ring-[#d81b60] text-sm transition-all" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="px-8 py-4 bg-[#d81b60] text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-[0_4px_14px_0_rgba(216,27,96,0.39)] hover:shadow-[0_6px_20px_rgba(216,27,96,0.23)] hover:bg-[#c2185b] transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isUpdating ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}