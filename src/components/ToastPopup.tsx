// src/components/ToastPopup.tsx
import React from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface ToastPopupProps {
  show: boolean;
  message: string;
  type: "success" | "error" | string;
  onClose: () => void;
}

export default function ToastPopup({ show, message, type, onClose }: ToastPopupProps) {
  return (
    <div 
      className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl bg-white border border-gray-100 transition-all duration-300 ₹{
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
    >
      {type === "success" ? (
        <CheckCircle className="w-6 h-6 text-green-500" />
      ) : (
        <XCircle className="w-6 h-6 text-red-500" />
      )}
      <span className="font-semibold text-gray-800 text-sm whitespace-nowrap">
        {message}
      </span>
      <button 
        onClick={onClose} 
        className="ml-2 text-gray-400 hover:text-gray-800 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}