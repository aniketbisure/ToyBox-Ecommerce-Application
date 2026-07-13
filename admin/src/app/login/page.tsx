"use client";

import React, { useState } from "react";
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api from "../../services/apiService";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", { email, password });

      if (data.user.role !== 'admin') {
        setError("Access denied: You are not an admin.");
        setLoading(false);
        return;
      }

      localStorage.setItem("userInfo", JSON.stringify(data));
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-primary/5 p-10 border border-gray-100">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-primary p-4 rounded-3xl mb-4 shadow-lg shadow-primary/30">
              <ShieldCheck className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">ToyBox <span className="text-primary">Admin</span></h1>
            <p className="text-gray-400 font-medium mt-1">Authorized Personnel Only</p>
          </div>

          {error ? (
            <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-bold mb-6 text-center border border-red-100">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 text-gray-300" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@toybox.com"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-2 ring-primary/20 border-2 border-transparent focus:border-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-gray-300" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-2 ring-primary/20 border-2 border-transparent focus:border-primary/20 transition-all"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-dark text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl shadow-dark/10 active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  ENTER DASHBOARD
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          Problems logging in? <span className="text-primary font-bold cursor-pointer">Contact IT Support</span>
        </p>
      </motion.div>
    </div>
  );
}
