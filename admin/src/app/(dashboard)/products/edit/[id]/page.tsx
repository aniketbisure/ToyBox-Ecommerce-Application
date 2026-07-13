"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Save,
  Package,
  ShieldAlert,
  FileText,
  Image as ImageIcon,
  Tag,
  Settings,
  Loader2,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import api from "../../../../../services/apiService";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("identity");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    manufacturer: "",
    sku: "",
    modelNumber: "",
    countryOfOrigin: "India",
    minimumAge: 36,
    ageRangeDescription: "Kids 3-5",
    smallPartsWarning: false,
    safetyWarningText: "",
    description: "",
    bulletPoints: ["", "", "", "", ""],
    image: "",
    images: [] as string[],
    materialType: "",
    dimensions: "",
    weight: "",
    batteriesRequired: false,
    batteryType: "No",
    listPrice: 0,
    price: 0,
    salePrice: 0,
    stock: 10,
    subCategory: "Plush",
    productType: "Toy",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setFormData({
          ...data,
          bulletPoints: data.bulletPoints || ["", "", "", "", ""],
          images: data.images || [],
        });
      } catch (error) {
        window.alert("Failed to fetch product details");
        router.back();
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchProduct();
  }, [id, router]);

  const set = (field: string, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleUpdate = async () => {
    if (!formData.name || !formData.sku || !formData.price || !formData.image) {
      window.alert(
        "Please fill in at minimum: Product Title, SKU, Price, and Image URL."
      );
      return;
    }
    setLoading(true);
    try {
      await api.put(`/products/${id}`, {
        ...formData,
        bulletPoints: formData.bulletPoints.filter(Boolean),
      });
      router.push("/products");
    } catch (error: any) {
      window.alert(
        error?.response?.data?.message || "Failed to update product"
      );
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "identity", label: "Identity", icon: Package },
    { id: "safety", label: "Safety & Age", icon: ShieldAlert },
    { id: "content", label: "Content", icon: FileText },
    { id: "media", label: "Images", icon: ImageIcon },
    { id: "specs", label: "Specifications", icon: Settings },
    { id: "pricing", label: "Pricing", icon: Tag },
  ];

  if (fetching) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-5 lg:space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-white rounded-xl transition-all shrink-0"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl lg:text-3xl font-black">Edit Toy Listing</h1>
      </div>

      <div className="flex gap-1.5 p-1 bg-gray-100 rounded-2xl flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all text-xs lg:text-sm ${
              activeTab === tab.id
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-dark"
            }`}
          >
            <tab.icon size={15} />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-5 lg:p-8 shadow-sm border border-gray-100">
        {/* Render correct tab content based on activeTab */}
        {activeTab === "identity" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-8">
            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Product Title *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. LEGO Star Wars Millennium Falcon Building Set"
                className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary outline-none transition-all"
              />
            </div>
            {/* ... other identity fields ... */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Brand Name *
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => set("brand", e.target.value)}
                placeholder="e.g. LEGO"
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Manufacturer *
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => set("manufacturer", e.target.value)}
                placeholder="The LEGO Group"
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                SKU *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => set("sku", e.target.value)}
                placeholder="TOY-12345"
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Model Number
              </label>
              <input
                type="text"
                value={formData.modelNumber}
                onChange={(e) => set("modelNumber", e.target.value)}
                placeholder="75192"
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Sub-Category *
              </label>
              <select
                value={formData.subCategory}
                onChange={(e) => set("subCategory", e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none appearance-none"
              >
                {[
                  "Plush",
                  "Building",
                  "Electronics",
                  "Wooden",
                  "Action Figures",
                  "Outdoor",
                  "Puzzles",
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Country of Origin *
              </label>
              <input
                type="text"
                value={formData.countryOfOrigin}
                onChange={(e) => set("countryOfOrigin", e.target.value)}
                placeholder="India"
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
              />
            </div>
          </div>
        )}

        {/* ... (reusing same UI components from add/page.tsx for other tabs) ... */}
        {activeTab === "safety" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Minimum Age (Months) *
              </label>
              <input
                type="number"
                value={formData.minimumAge}
                onChange={(e) => set("minimumAge", Number(e.target.value))}
                placeholder="36"
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Age Range Description
              </label>
              <select
                value={formData.ageRangeDescription}
                onChange={(e) => set("ageRangeDescription", e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none appearance-none"
              >
                {["Toddlers", "Kids 3-5", "Kids 6-12", "Teens", "All Ages"].map(
                  (a) => (
                    <option key={a}>{a}</option>
                  )
                )}
              </select>
            </div>
            <div className="sm:col-span-2 flex items-center gap-4 bg-red-50 p-5 lg:p-6 rounded-2xl">
              <ShieldAlert className="text-red-500 shrink-0" size={28} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-red-900 text-sm lg:text-base">
                  Small Parts Warning
                </p>
                <p className="text-xs lg:text-sm text-red-700">
                  Does this toy contain small parts that could be a choking hazard?
                </p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 accent-red-500 shrink-0"
                checked={formData.smallPartsWarning}
                onChange={(e) => set("smallPartsWarning", e.target.checked)}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Safety Warning Text
              </label>
              <textarea
                rows={3}
                value={formData.safetyWarningText}
                onChange={(e) => set("safetyWarningText", e.target.value)}
                placeholder="WARNING: CHOKING HAZARD – Small parts. Not for children under 3 yrs."
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
              />
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="space-y-6 lg:space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                5 Key Feature Bullets
              </label>
              {formData.bulletPoints.map((bp, i) => (
                <input
                  key={i}
                  type="text"
                  value={bp}
                  onChange={(e) => {
                    const updated = [...formData.bulletPoints];
                    updated[i] = e.target.value;
                    set("bulletPoints", updated);
                  }}
                  placeholder={`Bullet Point ${i + 1}`}
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none mb-2"
                />
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Product Description *
              </label>
              <textarea
                rows={6}
                value={formData.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the toy in detail..."
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
              />
            </div>
          </div>
        )}

        {activeTab === "media" && (
          <div className="space-y-5 lg:space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Main Image URL *
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => set("image", e.target.value)}
                placeholder="https://example.com/product-image.jpg"
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-primary transition-all"
              />
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="mt-2 h-36 lg:h-40 rounded-2xl object-contain border border-gray-100"
                />
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Additional Image URLs (one per line)
              </label>
              <textarea
                rows={4}
                value={formData.images.join("\n")}
                onChange={(e) =>
                  set(
                    "images",
                    e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  )
                }
                placeholder={
                  "https://example.com/img1.jpg\nhttps://example.com/img2.jpg"
                }
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-mono text-sm"
              />
            </div>
          </div>
        )}

        {activeTab === "specs" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Material
              </label>
              <input
                type="text"
                value={formData.materialType}
                onChange={(e) => set("materialType", e.target.value)}
                placeholder="e.g. Plastic, Wood"
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Dimensions (L×W×H)
              </label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => set("dimensions", e.target.value)}
                placeholder="20 x 15 x 10 cm"
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Weight
              </label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => set("weight", e.target.value)}
                placeholder="500g"
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Battery Required
              </label>
              <select
                value={formData.batteryType}
                onChange={(e) => {
                  set("batteryType", e.target.value);
                  set("batteriesRequired", e.target.value !== "No");
                }}
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none appearance-none"
              >
                <option>No</option>
                <option>Yes - AA</option>
                <option>Yes - AAA</option>
                <option>Built-in Rechargeable</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                MRP / List Price (₹) *
              </label>
              <input
                type="number"
                value={formData.listPrice || ""}
                onChange={(e) => set("listPrice", Number(e.target.value))}
                placeholder="0.00"
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                value={formData.price || ""}
                onChange={(e) => set("price", Number(e.target.value))}
                placeholder="0.00"
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Sale Price (Optional)
              </label>
              <input
                type="number"
                value={formData.salePrice || ""}
                onChange={(e) => set("salePrice", Number(e.target.value))}
                placeholder="0.00"
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Stock Quantity *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => set("stock", Number(e.target.value))}
                placeholder="100"
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <button
          onClick={() => router.back()}
          className="px-6 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="px-8 lg:px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Save size={20} />
          )}
          UPDATE PRODUCT
        </button>
      </div>
    </div>
  );
}
