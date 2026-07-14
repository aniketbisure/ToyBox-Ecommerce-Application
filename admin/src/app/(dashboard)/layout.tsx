"use client";

import React, { useEffect, useState } from "react";
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
  ShieldCheck,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import Logo from "../../components/Logo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      const userInfoRaw = localStorage.getItem("userInfo");

      if (!userInfoRaw) {
        router.replace("/login");
        return;
      }

      try {
        const userInfo = JSON.parse(userInfoRaw);
        if (!userInfo?.token) {
          localStorage.removeItem("userInfo");
          router.replace("/login");
          return;
        }

        // SECURITY FIX: Verify session with backend instead of just decoding JWT locally
        const res = await api.get("/auth/verify");
        if (res.data?.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        setIsVerified(true);
      } catch (error) {
        localStorage.removeItem("userInfo");
        router.replace("/login");
      }
    };

    verifySession();
  }, [router]);

  // Close sidebar on route change (mobile nav)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/" },
    { name: "Products", icon: Package, href: "/products" },
    { name: "Banners", icon: ImageIcon, href: "/banners" },
    { name: "Categories", icon: Tags, href: "/categories" },
    { name: "Orders", icon: ShoppingCart, href: "/orders" },
    { name: "Users", icon: Users, href: "/users" },
    { name: "Settings", icon: Settings, href: "/settings" },
  ];

  if (!isVerified) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <Logo className="mb-10 px-2" size={48} />

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          // Robust path highlighting
          const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
          const isActive =
            item.href === "/"
              ? pathname === basePath + "/" || pathname === basePath
              : pathname.startsWith(basePath + item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`sidebar-link ${
                isActive
                  ? "sidebar-link-active"
                  : "text-gray-500 hover:text-dark hover:bg-gray-50"
              }`}
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
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Desktop Sidebar (lg+) ── */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col p-6 shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile Drawer Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ── */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white flex flex-col p-6 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 text-gray-500"
        >
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Top Navbar */}
        <header className="lg:hidden flex items-center gap-4 bg-white border-b border-gray-200 px-4 py-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-600"
          >
            <Menu size={22} />
          </button>
          <Logo size={32} />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
