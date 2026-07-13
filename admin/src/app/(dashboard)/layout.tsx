"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Image as ImageIcon,
  Tags,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  ShieldCheck
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) {
      router.push("/login");
    }
  }, [router]);

  const navItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/" },
    { name: "Products", icon: Package, href: "/products" },
    { name: "Banners", icon: ImageIcon, href: "/banners" },
    { name: "Categories", icon: Tags, href: "/categories" },
    { name: "Orders", icon: ShoppingCart, href: "/orders" },
    { name: "Users", icon: Users, href: "/users" },
    { name: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-primary p-2 rounded-xl">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <h1 className="font-black text-xl tracking-tight">ToyBox <span className="text-primary">Admin</span></h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`sidebar-link ${isActive ? "sidebar-link-active" : "text-gray-500 hover:text-dark hover:bg-gray-50"}`}
              >
                <item.icon size={20} />
                <span className="font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-gray-100">
          <button
            onClick={() => {
              localStorage.removeItem("userInfo");
              window.location.href = "/login";
            }}
            className="sidebar-link text-red-500 w-full hover:bg-red-50"
          >
            <LogOut size={20} />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-10">
        {children}
      </main>
    </div>
  );
}
