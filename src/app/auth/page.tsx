"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  // Simplified state for demonstration
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, handle auth. For now, simulate success and go to home.
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] bg-[#fcfcfc] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 overflow-hidden">
        
        {/* Header Toggle */}
        <div className="flex bg-gray-50">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${
              activeTab === "login" ? "bg-white text-[#d81b60] border-t-2 border-[#d81b60]" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${
              activeTab === "register" ? "bg-white text-[#d81b60] border-t-2 border-[#d81b60]" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Register
          </button>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
             <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#d81b60] text-sm"
                  placeholder="you@example.com"
                />
             </div>
             
             <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#d81b60] text-sm"
                  placeholder="••••••••"
                />
             </div>

             <button
               type="submit"
               className="w-full py-3.5 mt-4 bg-ss-gradient text-white rounded-lg font-bold uppercase tracking-wide text-sm shadow-md hover:opacity-90 transition-opacity"
             >
               {activeTab === 'login' ? 'Login to Account' : 'Register Now'}
             </button>
          </form>
        </div>
      </div>
    </div>
  );
}