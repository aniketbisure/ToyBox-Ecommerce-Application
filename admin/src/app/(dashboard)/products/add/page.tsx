"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  Save,
  Package,
  ShieldAlert,
  FileText,
  Image as ImageIcon,
  Tag,
  Settings,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "../../../../services/apiService";

export default function AddProductPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("identity");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Identity
    name: "",
    brand: "",
    manufacturer: "",
    sku: "",
    modelNumber: "",
    countryOfOrigin: "India",
    // Safety
    minimumAge: 36,
    ageRangeDescription: "Kids 3-5",
    smallPartsWarning: false,
    safetyWarningText: "",
    // Content
    description: "",
    bulletPoints: ["", "", "", "", ""],
    // Media
    image: "",
    images: [] as string[],
    // Specs
    materialType: "",
    dimensions: "",
    weight: "",
    batteriesRequired: false,
    batteryType: "No",
    // Pricing
    listPrice: 0,
    price: 0,
    salePrice: 0,
    stock: 10,
    subCategory: "Plush",
    productType: "Toy",
  });

  const set = (field: string, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handlePublish = async () => {
    if (!formData.name || !formData.sku || !formData.price || !formData.image) {
      alert("Please fill in at minimum: Product Title, SKU, Price, and Image URL.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/products", {
        ...formData,
        bulletPoints: formData.bulletPoints.filter(Boolean),
      });
      router.push("/products");
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to publish product");
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-xl transition-all">
          <ChevronLeft />
        </button>
        <h1 className="text-3xl font-black">Add New Toy Listing</h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === tab.id ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-dark"
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">

        {/* ── IDENTITY ── */}
        {activeTab === "identity" && (
          <div className="grid grid-cols-2 gap-8">
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Product Title *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. LEGO Star Wars Millennium Falcon Building Set"
                className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Brand Name *</label>
              <input type="text" value={formData.brand} onChange={(e) => set("brand", e.target.value)}
                placeholder="e.g. LEGO" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Manufacturer *</label>
              <input type="text" value={formData.manufacturer} onChange={(e) => set("manufacturer", e.target.value)}
                placeholder="The LEGO Group" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">SKU *</label>
              <input type="text" value={formData.sku} onChange={(e) => set("sku", e.target.value)}
                placeholder="TOY-12345" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Model Number</label>
              <input type="text" value={formData.modelNumber} onChange={(e) => set("modelNumber", e.target.value)}
                placeholder="75192" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Sub-Category *</label>
              <select value={formData.subCategory} onChange={(e) => set("subCategory", e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none appearance-none">
                {["Plush", "Building", "Electronics", "Wooden", "Action Figures", "Outdoor", "Puzzles"].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Country of Origin *</label>
              <input type="text" value={formData.countryOfOrigin} onChange={(e) => set("countryOfOrigin", e.target.value)}
                placeholder="India" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
          </div>
        )}

        {/* ── SAFETY ── */}
        {activeTab === "safety" && (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Minimum Age (Months) *</label>
              <input type="number" value={formData.minimumAge} onChange={(e) => set("minimumAge", Number(e.target.value))}
                placeholder="36" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Age Range Description</label>
              <select value={formData.ageRangeDescription} onChange={(e) => set("ageRangeDescription", e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none appearance-none">
                {["Toddlers", "Kids 3-5", "Kids 6-12", "Teens", "All Ages"].map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="col-span-2 flex items-center gap-4 bg-red-50 p-6 rounded-2xl">
              <ShieldAlert className="text-red-500 shrink-0" size={32} />
              <div className="flex-1">
                <p className="font-bold text-red-900">Small Parts Warning</p>
                <p className="text-sm text-red-700">Does this toy contain small parts that could be a choking hazard?</p>
              </div>
              <input
                type="checkbox"
                className="w-6 h-6 accent-red-500"
                checked={formData.smallPartsWarning}
                onChange={(e) => set("smallPartsWarning", e.target.checked)}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Safety Warning Text</label>
              <textarea rows={3} value={formData.safetyWarningText} onChange={(e) => set("safetyWarningText", e.target.value)}
                placeholder="WARNING: CHOKING HAZARD – Small parts. Not for children under 3 yrs."
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
          </div>
        )}

        {/* ── CONTENT ── */}
        {activeTab === "content" && (
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">5 Key Feature Bullets</label>
              {formData.bulletPoints.map((bp, i) => (
                <input key={i} type="text" value={bp}
                  onChange={(e) => {
                    const updated = [...formData.bulletPoints];
                    updated[i] = e.target.value;
                    set("bulletPoints", updated);
                  }}
                  placeholder={`Bullet Point ${i + 1}`}
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none mb-2" />
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Product Description *</label>
              <textarea rows={6} value={formData.description} onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the toy in detail..."
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
          </div>
        )}

        {/* ── MEDIA ── */}
        {activeTab === "media" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Main Image URL *</label>
              <input type="url" value={formData.image} onChange={(e) => set("image", e.target.value)}
                placeholder="https://example.com/product-image.jpg"
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-primary transition-all" />
              {formData.image && (
                <img src={formData.image} alt="Preview" className="mt-2 h-40 rounded-2xl object-contain border border-gray-100" />
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Additional Image URLs (one per line)</label>
              <textarea rows={4}
                value={formData.images.join("\n")}
                onChange={(e) => set("images", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))}
                placeholder={"https://example.com/img1.jpg\nhttps://example.com/img2.jpg"}
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-mono text-sm" />
            </div>
          </div>
        )}

        {/* ── SPECS ── */}
        {activeTab === "specs" && (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Material</label>
              <input type="text" value={formData.materialType} onChange={(e) => set("materialType", e.target.value)}
                placeholder="e.g. Plastic, Wood" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Dimensions (L×W×H)</label>
              <input type="text" value={formData.dimensions} onChange={(e) => set("dimensions", e.target.value)}
                placeholder="20 x 15 x 10 cm" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Weight</label>
              <input type="text" value={formData.weight} onChange={(e) => set("weight", e.target.value)}
                placeholder="500g" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Battery Required</label>
              <select value={formData.batteryType} onChange={(e) => {
                set("batteryType", e.target.value);
                set("batteriesRequired", e.target.value !== "No");
              }} className="w-full p-4 bg-gray-50 rounded-2xl outline-none appearance-none">
                <option>No</option>
                <option>Yes - AA</option>
                <option>Yes - AAA</option>
                <option>Built-in Rechargeable</option>
              </select>
            </div>
          </div>
        )}

        {/* ── PRICING ── */}
        {activeTab === "pricing" && (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">MRP / List Price (₹) *</label>
              <input type="number" value={formData.listPrice || ""} onChange={(e) => set("listPrice", Number(e.target.value))}
                placeholder="0.00" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Selling Price (₹) *</label>
              <input type="number" value={formData.price || ""} onChange={(e) => set("price", Number(e.target.value))}
                placeholder="0.00" className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Sale Price (Optional)</label>
              <input type="number" value={formData.salePrice || ""} onChange={(e) => set("salePrice", Number(e.target.value))}
                placeholder="0.00" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Stock Quantity *</label>
              <input type="number" value={formData.stock} onChange={(e) => set("stock", Number(e.target.value))}
                placeholder="100" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <button onClick={() => router.back()} className="px-8 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-all">
          Cancel
        </button>
        <button
          onClick={handlePublish}
          disabled={loading}
          className="px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          PUBLISH TO LIVE APP
        </button>
      </div>
    </div>
  );
}
