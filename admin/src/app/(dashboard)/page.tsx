"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Users as UsersIcon,
  Package,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "../../services/apiService";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    revenue: 0,
    users: 0,
    products: 0,
    ordersToday: 0
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, usersRes, productsRes, configRes] = await Promise.all([
          api.get("/orders"),
          api.get("/users/admin/all"),
          api.get("/products"),
          api.get("/config")
        ]);

        setBanners(configRes.data.banners || []);
        // ... rest of logic

        const revenue = ordersRes.data.reduce((acc: number, o: any) => acc + o.totalPrice, 0);
        const today = new Date().toISOString().split('T')[0];
        const ordersToday = ordersRes.data.filter((o: any) => o.createdAt.startsWith(today)).length;

        setData({
          revenue,
          users: usersRes.data.length,
          products: productsRes.data.length,
          ordersToday
        });

        // Get last 5 orders for recent activities
        const recent = ordersRes.data
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        setRecentActivities(recent);

      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: "Total Revenue", value: `₹${data.revenue.toLocaleString()}`, trend: "+12.5%", positive: true, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
    { label: "Active Users", value: data.users.toString(), trend: "+8.2%", positive: true, icon: UsersIcon, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Total Products", value: data.products.toString(), trend: "0%", positive: true, icon: Package, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Orders Today", value: data.ordersToday.toString(), trend: "-2.4%", positive: false, icon: ShoppingBag, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black">Dashboard Overview</h2>
          <p className="text-gray-500 mt-1">Real-time insights for your toy store</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white border border-gray-200 px-4 py-2 rounded-xl font-semibold shadow-sm hover:bg-gray-50 transition-all">
            Download Report
          </button>
          <button className="btn-primary">
            Update App Live
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} p-3 rounded-xl`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${stat.positive ? "text-green-500" : "text-red-500"}`}>
                {stat.trend}
                {stat.positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </div>
            </div>
            <h3 className="text-gray-500 font-medium">{stat.label}</h3>
            <p className="text-2xl font-black mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Real-time App Control Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6">Recent Activities</h3>
          <div className="space-y-6">
            {recentActivities.length > 0 ? (
              recentActivities.map((order) => (
                <div key={order._id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden relative">
                    {order.user?.avatar ? (
                      <Image
                        src={order.user.avatar}
                        alt="User"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      order.user?.name?.charAt(0) || "U"
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">New Order by {order.user?.name || "Customer"}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()} • ₹{order.totalPrice}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/orders")}
                    className="text-primary font-bold text-sm"
                  >
                    View Details
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400">
                No recent activities found
              </div>
            )}
          </div>
        </div>

        <div className="bg-dark rounded-3xl p-8 shadow-xl text-white">
          <h3 className="text-xl font-bold mb-6">App Live Control</h3>
          <div className="space-y-6">
            {banners.slice(0, 2).map((banner) => (
              <div key={banner._id} className="p-5 bg-white/10 rounded-2xl border border-white/10">
                <p className="font-bold mb-2">{banner.title}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    {banner.isActive ? "Currently Active" : "Hidden"}
                  </span>
                  <div className={`w-10 h-5 ${banner.isActive ? "bg-green-500" : "bg-gray-600"} rounded-full relative`}>
                    <div className={`absolute ${banner.isActive ? "right-1" : "left-1"} top-1 w-3 h-3 bg-white rounded-full`} />
                  </div>
                </div>
              </div>
            ))}
            {banners.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No banners configured</p>
            )}
            <button
              onClick={() => router.push("/banners")}
              className="w-full bg-primary py-4 rounded-2xl font-black tracking-wide hover:bg-primary/90 transition-all"
            >
              GO TO BANNER EDITOR
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
