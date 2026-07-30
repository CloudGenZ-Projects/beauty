"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (activeTab === "register") {
        // --- REGISTER ---
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");

        setSuccessMsg("Account created! Please sign in.");
        setEmail("");
        setPassword("");
        setActiveTab("login"); 
      } else {
        // --- LOGIN ---
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Invalid email or password");
        }

        // SAVE USER TO LOCAL STORAGE
        localStorage.setItem("user_session", JSON.stringify(data.user));

        // REDIRECT TO ACCOUNT PAGE
        router.push('/account');
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#fcfcfc] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 overflow-hidden">
        
        <div className="flex bg-gray-50">
          <button
            type="button"
            onClick={() => { setActiveTab("login"); setErrorMsg(""); setSuccessMsg(""); }}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${
              activeTab === "login" ? "bg-white text-[#d81b60] border-t-2 border-[#d81b60]" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("register"); setErrorMsg(""); setSuccessMsg(""); }}
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

          {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium border border-red-100">{errorMsg}</div>}
          {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg font-medium border border-green-100">{successMsg}</div>}

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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
             </div>

             <button
               type="submit"
               disabled={isLoading}
               className="w-full py-3.5 mt-4 bg-gradient-to-r from-[#d81b60] to-[#f48fb1] text-white rounded-lg font-bold uppercase tracking-wide text-sm shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
             >
               {isLoading ? "Processing..." : (activeTab === 'login' ? 'Login to Account' : 'Register Now')}
             </button>
          </form>
        </div>
      </div>
    </div>
  );
}