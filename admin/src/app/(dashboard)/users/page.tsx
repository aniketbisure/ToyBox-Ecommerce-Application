"use client";

import React, { useEffect, useState } from "react";
import { Search, Mail, Phone, MoreHorizontal, Loader2 } from "lucide-react";
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
      } catch (_error) {
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
    <div className="space-y-5 lg:space-y-8">
      {/* Header */}
      <header>
        <h2 className="text-2xl lg:text-3xl font-black text-dark">
          User Directory
        </h2>
        <p className="text-gray-500 mt-1 text-sm lg:text-base">
          Manage platform users and permissions
        </p>
      </header>

      {/* Toolbar */}
      <div className="flex gap-3 items-center bg-white p-3 lg:p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search users by name, email or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary transition-all outline-none text-sm"
          />
        </div>
      </div>

      {/* Users Grid — 1 col mobile, 2 col xl */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {users.map((user, i) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            key={user._id}
            className="bg-white p-4 lg:p-6 rounded-3xl shadow-sm border border-gray-100 group hover:border-primary/20 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-xl lg:text-2xl font-black text-gray-400 shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-dark text-base lg:text-lg">
                      {user.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs lg:text-sm text-gray-400">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-50 rounded-xl transition-all shrink-0">
                <MoreHorizontal size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 lg:mt-6">
              <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600 min-w-0">
                <Mail size={14} className="text-gray-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                <Phone size={14} className="text-gray-400 shrink-0" />
                {user.phone || "No phone"}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-bold text-green-600">Active</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
