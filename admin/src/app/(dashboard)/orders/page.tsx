"use client";

import React, { useEffect, useState } from "react";
import { Search, Filter, Eye, ShoppingCart, User, Calendar, CreditCard, Loader2 } from "lucide-react";
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
    } catch (error) {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isDelivered: boolean) => {
    return isDelivered ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600";
  };

  const handleDeliver = async (id: string) => {
    try {
      await api.put(`/orders/${id}/deliver`);
      fetchOrders();
    } catch (error) {
      alert("Failed to update status");
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
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-black text-dark">Customer Orders</h2>
        <p className="text-gray-500 mt-1">Monitor and manage store transactions</p>
      </header>

      {/* Toolbar */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search orders by ID or customer name..."
            className="w-full pl-12 pr-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary transition-all outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold text-gray-600">
          <Filter size={18} />
          Filter
        </button>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-4 font-bold text-sm text-gray-500">ORDER ID</th>
              <th className="px-8 py-4 font-bold text-sm text-gray-500">CUSTOMER</th>
              <th className="px-8 py-4 font-bold text-sm text-gray-500">DATE</th>
              <th className="px-8 py-4 font-bold text-sm text-gray-500">TOTAL</th>
              <th className="px-8 py-4 font-bold text-sm text-gray-500">STATUS</th>
              <th className="px-8 py-4 font-bold text-sm text-gray-500 text-right">ACTION</th>
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
                <td className="px-8 py-5">
                  <span className="font-bold text-dark">{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User size={14} className="text-gray-400" />
                    </div>
                    <span className="font-medium text-gray-700">{order.user?.name || "Deleted User"}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar size={14} />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div>
                    <p className="font-black text-dark">₹{order.totalPrice}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{order.paymentMethod}</p>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.isDelivered)}`}>
                    {order.isDelivered ? "Delivered" : "Processing"}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  {!order.isDelivered && (
                    <button
                      onClick={() => handleDeliver(order._id)}
                      className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all"
                    >
                      Mark Delivered
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
