"use client";

import React, { useEffect, useState } from "react";
import { Search, UserCheck, UserMinus, Mail, Phone, MapPin, MoreHorizontal, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../../services/apiService";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users/admin/all");
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

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
        <h2 className="text-3xl font-black text-dark">User Directory</h2>
        <p className="text-gray-500 mt-1">Manage platform users and permissions</p>
      </header>

      {/* Toolbar */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search users by name, email or phone..."
            className="w-full pl-12 pr-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary transition-all outline-none"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {users.map((user, i) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            key={user._id}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:border-primary/20 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl font-black text-gray-400">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-dark text-lg">{user.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${user.role === "admin" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-50 rounded-xl transition-all">
                <MoreHorizontal size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={16} className="text-gray-400" />
                {user.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={16} className="text-gray-400" />
                {user.phone || "No phone"}
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-bold text-green-600">
                  Active
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
