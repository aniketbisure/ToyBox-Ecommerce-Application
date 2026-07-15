"use client";

import React, { useEffect, useState } from "react";
import { Search, Filter, User, Calendar, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../../services/apiService";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders");
      setOrders(data);
    } catch (_error) {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (order: any) => {
    if (order.status === 'CANCELLED' || order.status === 'REFUNDED') return "bg-red-100 text-red-600";
    return order.isDelivered
      ? "bg-green-100 text-green-600"
      : "bg-orange-100 text-orange-600";
  };

  const handleDeliver = async (id: string) => {
    if (!window.confirm("Mark this order as delivered?")) return;
    try {
      await api.put(`/orders/${id}/deliver`);
      fetchOrders();
    } catch (_error) {
      window.alert("Failed to update status");
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel and refund this order?")) return;
    try {
      await api.put(`/orders/${id}/cancel`);
      fetchOrders();
    } catch (_error: any) {
      window.alert("Failed to cancel order: " + (_error.response?.data?.message || _error.message));
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-5 lg:space-y-8">
      {/* Header */}
      <header>
        <h2 className="text-2xl lg:text-3xl font-black text-dark">
          Customer Orders
        </h2>
        <p className="text-gray-500 mt-1 text-sm lg:text-base">
          Monitor and manage store transactions
        </p>
      </header>

      {/* Toolbar */}
      <div className="flex gap-3 items-center bg-white p-3 lg:p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary transition-all outline-none text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold text-gray-600 text-sm shrink-0">
          <Filter size={16} />
          <span className="hidden sm:inline">Filter</span>
        </button>
      </div>

      {/* ── Desktop Table (md+) ── */}
      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 lg:px-8 py-4 font-bold text-xs text-gray-500 uppercase">Order ID</th>
              <th className="px-6 lg:px-8 py-4 font-bold text-xs text-gray-500 uppercase">Customer</th>
              <th className="px-6 lg:px-8 py-4 font-bold text-xs text-gray-500 uppercase">Date</th>
              <th className="px-6 lg:px-8 py-4 font-bold text-xs text-gray-500 uppercase">Total</th>
              <th className="px-6 lg:px-8 py-4 font-bold text-xs text-gray-500 uppercase">Status</th>
              <th className="px-6 lg:px-8 py-4 font-bold text-xs text-gray-500 uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((order, i) => (
              <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                key={order._id}
                className="hover:bg-gray-50/50 transition-all cursor-pointer group"
              >
                <td className="px-6 lg:px-8 py-4 lg:py-5">
                  <span className="font-bold text-dark text-sm">
                    {order._id
                      .substring(order._id.length - 8)
                      .toUpperCase()}
                  </span>
                </td>
                <td className="px-6 lg:px-8 py-4 lg:py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User size={14} className="text-gray-400" />
                    </div>
                    <span className="font-medium text-gray-700 text-sm">
                      {order.user?.name || "Deleted User"}
                    </span>
                  </div>
                </td>
                <td className="px-6 lg:px-8 py-4 lg:py-5">
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <Calendar size={13} />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 lg:px-8 py-4 lg:py-5">
                  <div>
                    <p className="font-black text-dark text-sm">
                      ₹{order.totalPrice}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">
                      {order.paymentMethod}
                    </p>
                  </div>
                </td>
                <td className="px-6 lg:px-8 py-4 lg:py-5">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                      order
                    )}`}
                  >
                    {order.status || (order.isDelivered ? "Delivered" : "Processing")}
                  </span>
                </td>
                <td className="px-6 lg:px-8 py-4 lg:py-5 text-right flex justify-end gap-2">
                  {!order.isDelivered && order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
                    <>
                      <button
                        onClick={() => handleDeliver(order._id)}
                        className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-all"
                      >
                        Deliver
                      </button>
                      <button
                        onClick={() => handleCancel(order._id)}
                        className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Card List (< md) ── */}
      <div className="md:hidden space-y-3">
        {orders.map((order, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={order._id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            {/* Top row: ID + status */}
            <div className="flex items-center justify-between mb-3">
              <span className="font-black text-dark text-sm">
                #{order._id.substring(order._id.length - 8).toUpperCase()}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(
                  order
                )}`}
              >
                {order.status || (order.isDelivered ? "Delivered" : "Processing")}
              </span>
            </div>

            {/* Customer */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <User size={13} className="text-gray-400" />
              </div>
              <span className="font-medium text-gray-700 text-sm">
                {order.user?.name || "Deleted User"}
              </span>
            </div>

            {/* Date + price row */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <Calendar size={13} />
                {new Date(order.createdAt).toLocaleDateString()}
              </div>
              <div className="text-right">
                <p className="font-black text-dark text-sm">
                  ₹{order.totalPrice}
                </p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">
                  {order.paymentMethod}
                </p>
              </div>
            </div>

            {/* Action */}
            {!order.isDelivered && order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleDeliver(order._id)}
                  className="flex-1 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-all"
                >
                  Mark Delivered
                </button>
                <button
                  onClick={() => handleCancel(order._id)}
                  className="flex-1 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-all"
                >
                  Cancel Order
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
