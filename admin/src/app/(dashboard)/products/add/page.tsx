"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  Save,
  Package,
  ShieldAlert,
  FileText,
  Truck,
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
    name: "",
    description: "",
    price: 0,
    category: "Plush",
    image: "",
    stock: 10,
    brand: "",
    manufacturer: "",
    sku: "",
    modelNumber: "",
  });

  const handlePublish = async () => {
    setLoading(true);
    try {
      await api.post("/products", formData);
      router.push("/products");
    } catch (error) {
      alert("Failed to publish product");
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

      {/* Amazon-style Vertical/Horizontal Tab Navigation */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
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
        {activeTab === "identity" && (
          <div className="grid grid-cols-2 gap-8">
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Product Title</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. LEGO Star Wars Millennium Falcon Building Set"
                className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Brand Name</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                placeholder="e.g. LEGO" className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Manufacturer</label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                placeholder="The LEGO Group" className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                placeholder="TOY-12345" className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Model Number</label>
              <input
                type="text"
                value={formData.modelNumber}
                onChange={(e) => setFormData({...formData, modelNumber: e.target.value})}
                placeholder="75192" className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
              />
            </div>
          </div>
        )}

        {activeTab === "safety" && (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Minimum Age (Months)</label>
              <input type="number" placeholder="36" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Age Range Description</label>
              <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none appearance-none">
                <option>Toddlers</option>
                <option>Kids 3-5</option>
                <option>Kids 6-12</option>
                <option>Teens</option>
              </select>
            </div>
            <div className="col-span-2 flex items-center gap-4 bg-red-50 p-6 rounded-2xl">
              <ShieldAlert className="text-red-500" size={32} />
              <div className="flex-1">
                <p className="font-bold text-red-900">Small Parts Warning</p>
                <p className="text-sm text-red-700">Does this toy contain small parts that could be a choking hazard?</p>
              </div>
              <input type="checkbox" className="w-6 h-6 accent-red-500" />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Safety Warning Text</label>
              <textarea rows={3} placeholder="WARNING: CHOKING HAZARD – Small parts. Not for children under 3 yrs." className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">5 Key Feature Bullets</label>
              {[1,2,3,4,5].map(i => (
                <input key={i} type="text" placeholder={`Bullet Point ${i}`} className="w-full p-4 bg-gray-50 rounded-2xl outline-none mb-2" />
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Product Description</label>
              <textarea rows={6} className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
          </div>
        )}

        {activeTab === "media" && (
          <div className="space-y-8">
            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center text-gray-400 hover:border-primary/50 transition-all">
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                <ImageIcon size={48} />
              </div>
              <p className="font-bold text-dark">Upload Product Images</p>
              <p className="text-sm">Drag and drop or click to browse</p>
              <button className="mt-6 px-6 py-2 bg-white border border-gray-200 rounded-xl font-bold text-dark hover:bg-gray-50 transition-all">
                Select Files
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
               {[1,2,3].map(i => (
                 <div key={i} className="aspect-square bg-gray-50 rounded-2xl border-2 border-gray-100 flex items-center justify-center text-gray-300">
                   <ImageIcon size={24} />
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === "specs" && (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Material</label>
              <input type="text" placeholder="e.g. Plastic, Wood" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Dimensions</label>
              <input type="text" placeholder="20 x 15 x 10 cm" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Weight</label>
              <input type="text" placeholder="500g" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Battery Required</label>
              <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none appearance-none">
                <option>No</option>
                <option>Yes - AA</option>
                <option>Yes - AAA</option>
                <option>Built-in Rechargeable</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">List Price (₹)</label>
              <input type="number" placeholder="0.00" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Sale Price (Optional)</label>
              <input type="number" placeholder="0.00" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Stock Quantity</label>
              <input type="number" placeholder="100" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Tax Category</label>
              <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none appearance-none">
                <option>Standard 18% GST</option>
                <option>Reduced 12% GST</option>
                <option>Zero Rated</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <button className="px-8 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-all">
          Save Draft
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
