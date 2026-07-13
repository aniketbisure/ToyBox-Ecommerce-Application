"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Trash2, Tag, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../../services/apiService";

export default function CategoriesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/config");
      setCategories(data.categories);
    } catch (_error) {
      console.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory) return;
    try {
      await api.post("/config/categories", { name: newCategory });
      setCategories([...categories, newCategory]);
      setNewCategory("");
      setShowAddModal(false);
    } catch (_error) {
      window.alert("Failed to add category");
    }
  };

  const handleDelete = async (name: string) => {
    if (window.confirm(`Delete category "${name}"?`)) {
      try {
        await api.delete(`/config/categories/${name}`);
        setCategories(categories.filter((c) => c !== name));
      } catch (_error) {
        window.alert("Failed to delete category");
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
            Category Management
          </h2>
          <p className="text-gray-500 mt-1 text-sm lg:text-base">
            Organize your products into collections
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto text-sm"
        >
          <Plus size={18} />
          Add New Category
        </button>
      </header>

      {/* Toolbar */}
      <div className="flex gap-3 items-center bg-white p-3 lg:p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary transition-all outline-none text-sm"
          />
        </div>
      </div>

      {/* Categories Grid — 1 col mobile, 2 col sm, 3 col lg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {categories.map((category, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={category}
            className="bg-white p-4 lg:p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                <Tag className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-dark text-base lg:text-lg">
                  {category}
                </h3>
              </div>
            </div>
            <button
              onClick={() => handleDelete(category)}
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={18} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 lg:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl lg:text-2xl font-black">Add Category</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-dark transition-all"
              >
                <Trash2 size={22} />
              </button>
            </div>

            <div className="p-6 lg:p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Action Figures"
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-2 ring-primary/20 transition-all border-none"
                />
              </div>
            </div>

            <div className="p-6 lg:p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 lg:py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="flex-[2] bg-primary text-white py-3 lg:py-4 rounded-2xl font-black tracking-wide shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all"
              >
                CREATE CATEGORY
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
