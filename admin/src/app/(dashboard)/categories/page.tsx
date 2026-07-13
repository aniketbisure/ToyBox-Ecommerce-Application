"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Trash2, Tags, Tag, Loader2 } from "lucide-react";
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
    } catch (error) {
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
    } catch (error) {
      alert("Failed to add category");
    }
  };

  const handleDelete = async (name: string) => {
    if (confirm(`Delete category "${name}"?`)) {
      try {
        await api.delete(`/config/categories/${name}`);
        setCategories(categories.filter(c => c !== name));
      } catch (error) {
        alert("Failed to delete category");
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
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-dark">Category Management</h2>
          <p className="text-gray-500 mt-1">Organize your products into collections</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Category
        </button>
      </header>

      {/* Toolbar */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search categories..."
            className="w-full pl-12 pr-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary transition-all outline-none"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={category}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Tag className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-dark text-lg">{category}</h3>
              </div>
            </div>
            <button
              onClick={() => handleDelete(category)}
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={20} />
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
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-2xl font-black">Add Category</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-dark transition-all">
                <Trash2 size={24} />
              </button>
            </div>

            <div className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Category Name</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Action Figures"
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-2 ring-primary/20 transition-all border-none"
                />
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-all">
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-[2] bg-primary text-white py-4 rounded-2xl font-black tracking-wide shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all"
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
