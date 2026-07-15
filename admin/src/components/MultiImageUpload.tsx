"use client";

import React, { useState } from "react";
import { Upload, X, Loader2, ImageIcon, Plus } from "lucide-react";
import api from "../services/apiService";

interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  label: string;
}

export default function MultiImageUpload({ values, onChange, label }: MultiImageUploadProps) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    const newUrls: string[] = [...values];

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("image", files[i]);

        const { data } = await api.post("/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        newUrls.push(data.url);
      }
      onChange(newUrls);
    } catch (error: any) {
      window.alert(error?.response?.data?.message || "Failed to upload some images");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    const updated = values.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
        {label}
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {values.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 group">
            <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-primary transition-all cursor-pointer group min-h-[120px]">
          <div className="flex flex-col items-center justify-center p-4 text-center">
            {loading ? (
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            ) : (
              <>
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors mb-1" />
                <p className="text-[10px] font-bold text-gray-500">Add More</p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
            accept="image/*"
            disabled={loading}
            multiple
          />
        </label>
      </div>
    </div>
  );
}
