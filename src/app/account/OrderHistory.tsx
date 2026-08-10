"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Package, CheckCircle2, Truck, RefreshCcw, X, 
  AlertCircle, Eye, EyeOff, Mail, Ban, Clock, Receipt, 
  Loader2, ShoppingBag, ChevronLeft, ChevronRight 
} from "lucide-react";

export interface Order {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  currency_symbol: string;
  line_items: any[];
  shipping: any;
  billing: any;
  shipping_total: string;
  total_tax: string;
}

interface OrderHistoryProps {
  initialOrders: Order[];
}

export default function OrderHistory({ initialOrders }: OrderHistoryProps) {
  const router = useRouter();

  // Local State
  const [localOrders, setLocalOrders] = useState<Order[]>(initialOrders || []);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // Filter & Pagination State
  const [orderFilter, setOrderFilter] = useState<"all" | "active" | "completed" | "returns" | "cancelled">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Adjust this to show more/less items per page

  // Action States
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [emailingOrderId, setEmailingOrderId] = useState<number | null>(null);

  // Helper to show temporary toasts
  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  // --- FILTER & PAGINATION LOGIC ---
  const filteredOrders = useMemo(() => {
    return localOrders.filter(order => {
      const status = order.status.toLowerCase();
      if (orderFilter === "active") return ["pending", "processing"].includes(status);
      if (orderFilter === "completed") return ["completed"].includes(status);
      if (orderFilter === "returns") return ["on-hold", "refunded"].includes(status);
      if (orderFilter === "cancelled") return ["cancelled", "failed"].includes(status);
      return true; // "all"
    });
  }, [localOrders, orderFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (filter: any) => {
    setOrderFilter(filter);
    setCurrentPage(1); // Reset to page 1 on filter change
    setExpandedOrder(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedOrder(null); // Close expanded details when paginating
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Optional: scroll to top of list
  };

  // --- API ACTIONS ---
  const handleReturnRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !returnReason.trim()) return;

    setIsSubmittingAction(true);
    try {
      const res = await fetch("/api/orders/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrder, reason: returnReason }),
      });
      if (!res.ok) throw new Error("Return request failed");
      
      setLocalOrders(prev => prev.map(o => o.id === selectedOrder ? { ...o, status: "on-hold" } : o));
      setReturnModalOpen(false);
      setReturnReason("");
      showMessage("success", "Return request submitted successfully. Our team will review it.");
      router.refresh(); 
    } catch (error) {
      showMessage("error", "Failed to submit return request. Please try again.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    setIsSubmittingAction(true);
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrder }),
      });
      if (!res.ok) throw new Error("Cancel failed");
      
      setLocalOrders(prev => prev.map(o => o.id === selectedOrder ? { ...o, status: "cancelled" } : o));
      setCancelModalOpen(false);
      showMessage("success", "Order has been cancelled successfully.");
    } catch (error) {
      showMessage("error", "Failed to cancel order.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleEmailReceipt = async (orderId: number) => {
    setEmailingOrderId(orderId);
    try {
      const res = await fetch("/api/orders/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) throw new Error("Email failed");
      showMessage("success", "Receipt has been sent to your registered email address.");
    } catch (error) {
      showMessage("error", "Failed to send receipt email.");
    } finally {
      setEmailingOrderId(null);
    }
  };

  // --- UI HELPERS ---
  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'completed': return { color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', text: 'Delivered', progress: 3 };
      case 'processing': return { color: 'bg-blue-50 text-blue-700 ring-blue-600/20', text: 'Processing', progress: 2 };
      case 'pending': return { color: 'bg-amber-50 text-amber-700 ring-amber-600/20', text: 'Order Placed', progress: 1 };
      case 'on-hold': return { color: 'bg-orange-50 text-orange-700 ring-orange-600/20', text: 'Return Pending', progress: 3 };
      case 'cancelled': case 'failed': return { color: 'bg-rose-50 text-rose-700 ring-rose-600/20', text: 'Cancelled', progress: 0 };
      case 'refunded': return { color: 'bg-slate-100 text-slate-700 ring-slate-600/20', text: 'Refunded', progress: 0 };
      default: return { color: 'bg-gray-50 text-gray-700 ring-gray-600/20', text: status, progress: 0 };
    }
  };

  const tabs = [
    { id: "all", label: "All Orders" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
    { id: "returns", label: "Returns / Refunds" },
    { id: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Order Management</h2>
        
        {/* Segmented Control Filter (Mobile Scrollable) */}
        <div className="flex space-x-1 bg-gray-100/70 p-1 rounded-xl overflow-x-auto hide-scrollbar border border-gray-200/50">
          {tabs.map((tab) => {
            const isActive = orderFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleFilterChange(tab.id)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TOAST MESSAGE */}
      {message.text && (
        <div className={`p-4 text-sm rounded-xl font-medium flex items-center gap-3 shadow-sm border ${message.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200"}`}>
          {message.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" /> : <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />}
          {message.text}
        </div>
      )}
      
      {/* ORDERS LIST */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-2xl border border-gray-200 border-dashed text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            {orderFilter === "all" ? "You haven't placed any orders yet. Once you do, they will appear here." : `You have no ${orderFilter} orders matching your criteria.`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {currentOrders.map((order) => {
            const { color, text, progress } = getStatusBadge(order.status);
            const isExpanded = expandedOrder === order.id;
            const isPending = order.status.toLowerCase() === 'pending';
            const isCompleted = order.status.toLowerCase() === 'completed';
            
            return (
              <div key={order.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                
                {/* CARD HEADER */}
                <div className="bg-gray-50/50 px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="text-lg font-bold text-gray-900">Order #{order.number}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ring-1 ring-inset ${color}`}>
                      {text}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <Clock className="w-4 h-4" /> 
                    {new Date(order.date_created).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>

                {/* CARD BODY */}
                <div className="p-5 sm:p-6">
                  
                  {/* TRACKING TIMELINE */}
                  {progress > 0 && order.status.toLowerCase() !== 'on-hold' && (
                    <div className="relative max-w-2xl mx-auto py-4 mb-8 hidden sm:block">
                      <div className="absolute top-1/2 left-[10%] right-[10%] h-1 bg-gray-100 -translate-y-1/2 rounded-full"></div>
                      <div className={`absolute top-1/2 left-[10%] h-1 bg-emerald-500 -translate-y-1/2 rounded-full transition-all duration-700 ease-in-out`} style={{ width: `${((progress - 1) / 2) * 80}%` }}></div>
                      
                      <div className="relative flex justify-between z-10">
                        <div className="flex flex-col items-center w-1/3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${progress >= 1 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}><Receipt className="w-5 h-5" /></div>
                          <span className={`text-[11px] font-bold mt-3 uppercase tracking-wider ${progress >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Placed</span>
                        </div>
                        <div className="flex flex-col items-center w-1/3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${progress >= 2 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}><Truck className="w-5 h-5" /></div>
                          <span className={`text-[11px] font-bold mt-3 uppercase tracking-wider ${progress >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Processing</span>
                        </div>
                        <div className="flex flex-col items-center w-1/3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${progress >= 3 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}><CheckCircle2 className="w-5 h-5" /></div>
                          <span className={`text-[11px] font-bold mt-3 uppercase tracking-wider ${progress >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>Delivered</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ORDER SUMMARY PREVIEW */}
                  <div className="flex flex-col sm:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex -space-x-3 overflow-hidden">
                        {order.line_items.slice(0, 4).map((item, idx) => (
                          <div key={idx} className="inline-block h-14 w-14 rounded-full ring-2 ring-white bg-gray-100 overflow-hidden">
                            {item.image?.src ? (
                              <img src={item.image.src} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-400" /></div>
                            )}
                          </div>
                        ))}
                        {order.line_items.length > 4 && (
                          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full ring-2 ring-white bg-gray-50 text-xs font-bold text-gray-500">
                            +{order.line_items.length - 4}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-3 font-medium">
                        {order.line_items.length} item{order.line_items.length > 1 ? 's' : ''} in this order
                      </p>
                    </div>
                    
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Order Total</p>
                      <span className="font-black text-gray-900 text-2xl">{order.currency_symbol}{order.total}</span>
                    </div>
                  </div>

                  {/* EXPANDED DETAILS */}
                  {isExpanded && (
                    <div className="mt-8 pt-6 border-t border-gray-100 animate-in slide-in-from-top-2 fade-in duration-200">
                      <h4 className="text-sm font-bold text-gray-900 mb-4">Items Summary</h4>
                      <div className="space-y-3 mb-8">
                        {order.line_items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4">
                              {item.image?.src ? (
                                <img src={item.image.src} alt={item.name} className="w-12 h-12 object-cover rounded-lg bg-gray-50 border border-gray-100" />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center"><Package className="w-5 h-5 text-gray-300" /></div>
                              )}
                              <div>
                                <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × {order.currency_symbol}{(item.total / item.quantity).toFixed(2)}</p>
                              </div>
                            </div>
                            <span className="font-bold text-gray-900">{order.currency_symbol}{item.total}</span>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Shipping Address</h4>
                          <p className="text-sm text-gray-900 font-medium leading-relaxed">
                            {order.shipping.first_name} {order.shipping.last_name}<br />
                            {order.shipping.address_1} {order.shipping.address_2 && `, ${order.shipping.address_2}`}<br />
                            {order.shipping.city}, {order.shipping.state} {order.shipping.postcode}<br />
                            {order.shipping.country}
                          </p>
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Order Breakdown</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{order.currency_symbol}{(parseFloat(order.total) - parseFloat(order.total_tax) - parseFloat(order.shipping_total)).toFixed(2)}</span></div>
                            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.currency_symbol}{order.shipping_total}</span></div>
                            <div className="flex justify-between text-gray-600"><span>Tax</span><span>{order.currency_symbol}{order.total_tax}</span></div>
                            <div className="flex justify-between font-bold text-base text-gray-900 pt-3 border-t border-gray-200 mt-2"><span>Total</span><span>{order.currency_symbol}{order.total}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* CARD FOOTER (ACTIONS) */}
                <div className="bg-gray-50/50 px-5 py-4 border-t border-gray-200 flex flex-wrap-reverse sm:flex-nowrap justify-between items-center gap-3">
                  <div className="w-full sm:w-auto flex gap-3">
                    <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200">
                      {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} {isExpanded ? "Hide Details" : "View Details"}
                    </button>
                    
                    <button onClick={() => handleEmailReceipt(order.id)} disabled={emailingOrderId === order.id} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                      {emailingOrderId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} Email Receipt
                    </button>
                  </div>

                  <div className="w-full sm:w-auto flex gap-3">
                    {isPending && (
                      <button onClick={() => { setSelectedOrder(order.id); setCancelModalOpen(true); }} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-4 py-2 rounded-lg hover:bg-rose-100 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-200">
                        <Ban className="w-4 h-4" /> Cancel Order
                      </button>
                    )}

                    {isCompleted && (
                      <button onClick={() => { setSelectedOrder(order.id); setReturnModalOpen(true); }} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ring-offset-1">
                        <RefreshCcw className="w-4 h-4" /> Request Return
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}

          {/* --- PAGINATION CONTROLS --- */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-2xl shadow-sm border mt-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 font-medium">
                    Showing <span className="font-bold text-gray-900">{startIndex + 1}</span> to <span className="font-bold text-gray-900">{Math.min(startIndex + itemsPerPage, filteredOrders.length)}</span> of <span className="font-bold text-gray-900">{filteredOrders.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-lg px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ring-1 ring-inset ${
                          currentPage === page 
                            ? "z-10 bg-gray-900 text-white ring-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900" 
                            : "text-gray-900 ring-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-lg px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- MODALS --- */}
      {/* CANCEL MODAL */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-black text-xl tracking-tight text-gray-900">Cancel Order?</h3>
            </div>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">Are you sure you want to cancel this order? This action cannot be undone. Any paid amounts will be automatically refunded to your original payment method within 3-5 business days.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setCancelModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Keep Order</button>
              <button onClick={handleCancelOrder} disabled={isSubmittingAction} className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm">
                {isSubmittingAction && <Loader2 className="w-4 h-4 animate-spin" />} Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RETURN MODAL */}
      {returnModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900 tracking-tight">Request Return / Refund</h3>
              <button onClick={() => setReturnModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-1 rounded-full border border-gray-200 transition-colors shadow-sm"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleReturnRequest} className="p-6 space-y-5">
              <p className="text-sm text-gray-500 leading-relaxed">Please provide a valid reason for returning Order #{selectedOrder}. Our team will review this and process your refund within 5-7 business days upon receipt of the item.</p>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Reason for Return</label>
                <select 
                  required
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent mb-4 shadow-sm"
                >
                  <option value="">Select a reason...</option>
                  <option value="Defective or Damaged">Defective or Damaged Product</option>
                  <option value="Wrong Item">Received Wrong Item</option>
                  <option value="Quality Issue">Not Satisfied with Quality</option>
                  <option value="Changed Mind">Changed My Mind</option>
                  <option value="Other">Other (Please explain below)</option>
                </select>
                
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Additional Details</label>
                <textarea 
                  required 
                  rows={3}
                  placeholder="Provide additional context for your return..." 
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent shadow-sm resize-none"
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={isSubmittingAction}
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-gray-800 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-md"
              >
                {isSubmittingAction && <Loader2 className="w-4 h-4 animate-spin" />} 
                {isSubmittingAction ? "Submitting Request..." : "Submit Return Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}