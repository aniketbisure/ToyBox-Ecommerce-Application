"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  ImageIcon,
  Layout,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import api from "../../../services/apiService";

export default function BannersPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [newBanner, setNewBanner] = useState({
    title: "",
    subtitle: "",
    image: "",
    color: "#FF6B6B",
    icon: "gift",
    isActive: true,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Generate a local preview URL
      const previewUrl = URL.createObjectURL(file);
      setNewBanner({ ...newBanner, image: previewUrl });
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data } = await api.get("/config");
      setBanners(data.banners);
    } catch (_error) {
      console.error("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  const uploadBannerImage = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("image", file);
    const { data } = await api.post("/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
  };

  const handleCreateBanner = async () => {
    if (!newBanner.title || !newBanner.subtitle || !imageFile) {
      window.alert("Please fill all fields including the image file");
      return;
    }
    setIsSubmitting(true);
    try {
      const imageUrl = await uploadBannerImage(imageFile);
      const bannerToCreate = { ...newBanner, image: imageUrl };
      await api.post("/config/banners", bannerToCreate);
      setShowAddModal(false);
      setNewBanner({
        title: "",
        subtitle: "",
        image: "",
        color: "#FF6B6B",
        icon: "gift",
        isActive: true,
      });
      setImageFile(null);
      fetchBanners();
    } catch (_error) {
      window.alert("Failed to create banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (id: string) => {
    const banner = banners.find((b) => b._id === id);
    if (!banner) return;
    try {
      const updatedBanners = banners.map((b) =>
        b._id === id ? { ...b, isActive: !b.isActive } : b
      );
      await api.put("/config/banners/bulk", { banners: updatedBanners });
      setBanners(updatedBanners);
    } catch (_error) {
      window.alert("Failed to toggle banner status");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this banner?")) {
      try {
        await api.delete(`/config/banners/${id}`);
        setBanners(banners.filter((b) => b._id !== id));
      } catch (_error) {
        window.alert("Failed to delete banner");
      }
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
      <header className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-end">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-dark">
            Promotional Banners
          </h2>
          <p className="text-gray-500 mt-1 text-sm lg:text-base">
            Control the marketing carousel on the mobile app
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto text-sm"
        >
          <Plus size={18} />
          Create New Banner
        </button>
      </header>

      {/* Banners Grid — 1 col mobile, 2 col md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {banners.map((banner, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={banner._id}
            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col"
          >
            {/* Banner Preview */}
            <div className="h-36 lg:h-40 p-6 lg:p-8 flex flex-col justify-center relative overflow-hidden bg-gray-200">
              {banner.image ? (
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute -right-4 -bottom-4 opacity-20 rotate-12">
                  <Layout size={100} color="gray" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30" />
              <h3 className="text-xl lg:text-2xl font-black text-white relative z-10">
                {banner.title}
              </h3>
              <p className="text-white/80 font-bold relative z-10 text-sm">
                {banner.subtitle}
              </p>
            </div>

            {/* Banner Controls */}
            <div className="p-4 lg:p-6 flex items-center justify-between">
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Status
                  </span>
                  <button
                    onClick={() => toggleActive(banner._id)}
                    className="flex items-center gap-2"
                  >
                    {banner.isActive ? (
                      <>
                        <ToggleRight className="text-green-500" size={22} />
                        <span className="text-sm font-bold text-green-600">
                          Active
                        </span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="text-gray-300" size={22} />
                        <span className="text-sm font-bold text-gray-400">
                          Hidden
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(banner._id)}
                  className="p-2.5 lg:p-3 hover:bg-red-50 text-red-400 rounded-2xl transition-all"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Placeholder for New Banner */}
        <button
          onClick={() => setShowAddModal(true)}
          className="border-2 border-dashed border-gray-200 rounded-3xl h-56 lg:h-64 flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-primary/50 hover:text-primary transition-all group"
        >
          <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-all">
            <ImageIcon size={28} />
          </div>
          <span className="font-bold text-sm lg:text-base">
            Add Marketing Banner
          </span>
        </button>
      </div>

      {/* Add Banner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            <div className="p-6 lg:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="text-xl lg:text-2xl font-black">Create Banner</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-dark transition-all"
              >
                <Trash2 size={22} />
              </button>
            </div>

            <div className="p-6 lg:p-8 space-y-5 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Banner Image
                </label>
                <div className="flex items-center gap-4 flex-wrap">
                  {newBanner.image ? (
                    <img
                      src={newBanner.image}
                      alt="Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-200 text-gray-400">
                      <ImageIcon size={22} />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1 text-sm file:mr-3 file:py-2 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Banner Title
                </label>
                <input
                  type="text"
                  value={newBanner.title}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, title: e.target.value })
                  }
                  placeholder="e.g. Mega Holiday Sale"
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={newBanner.subtitle}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, subtitle: e.target.value })
                  }
                  placeholder="e.g. Get 20% cashback on all orders"
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Accent Color
                  </label>
                  <input
                    type="color"
                    value={newBanner.color}
                    onChange={(e) =>
                      setNewBanner({ ...newBanner, color: e.target.value })
                    }
                    className="w-full h-12 lg:h-14 bg-gray-50 rounded-2xl p-1 cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Icon
                  </label>
                  <select
                    value={newBanner.icon}
                    onChange={(e) =>
                      setNewBanner({ ...newBanner, icon: e.target.value })
                    }
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none appearance-none"
                  >
                    <option>gift</option>
                    <option>star</option>
                    <option>zap</option>
                    <option>shopping-bag</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 lg:p-8 bg-gray-50 border-t border-gray-100 flex gap-4 shrink-0">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 lg:py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleCreateBanner}
                className="flex-[2] bg-primary text-white py-3 lg:py-4 rounded-2xl font-black tracking-wide shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "CREATING..." : "CREATE BANNER"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
