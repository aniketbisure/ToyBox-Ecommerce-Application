"use client";

import React, { useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import api from "../services/apiService";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
}

export default function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    try {
      const { data } = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      onChange(data.url);
    } catch (error: any) {
      window.alert(error?.response?.data?.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    onChange("");
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
        {label}
      </label>

      {value ? (
        <div className="relative w-full aspect-video sm:aspect-square sm:w-48 rounded-2xl overflow-hidden border-2 border-gray-100 group">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full sm:w-48 aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-primary transition-all cursor-pointer group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {loading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors mb-2" />
                <p className="text-xs font-bold text-gray-500">Click to upload</p>
              </>
            )}
          </div>
          <input type="file" className="hidden" onChange={handleUpload} accept="image/*" disabled={loading} />
        </label>
      )}
    </div>
  );
}
