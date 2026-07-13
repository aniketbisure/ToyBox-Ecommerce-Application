"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Edit, Trash2, Package } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "../../../services/apiService";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [_loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [_pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products?pageNumber=${page}`);
      setProducts(data.products || []);
      setPagination({
        page: data.page,
        pages: data.pages,
        total: data.total,
      });
    } catch (_error) {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(products.filter((p) => p._id !== id));
      } catch (_error) {
        window.alert("Failed to delete product");
      }
    }
  };

  return (
    <div className="space-y-5 lg:space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-end">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-dark">
            Inventory Management
          </h2>
          <p className="text-gray-500 mt-1 text-sm lg:text-base">
            Manage your catalog and stock levels
          </p>
        </div>
        <button
          onClick={() => router.push("/products/add")}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto text-sm"
        >
          <Plus size={18} />
          Add New Product
        </button>
      </header>

      {/* Toolbar */}
      <div className="flex gap-3 items-center bg-white p-3 lg:p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary transition-all outline-none text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold text-gray-600 text-sm shrink-0">
          <Filter size={16} />
          <span className="hidden sm:inline">Filter</span>
        </button>
      </div>

      {/* ── Desktop Table (md+) ── */}
      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 lg:px-8 py-4 font-bold text-xs text-gray-500 uppercase">Product</th>
              <th className="px-6 lg:px-8 py-4 font-bold text-xs text-gray-500 uppercase">Category</th>
              <th className="px-6 lg:px-8 py-4 font-bold text-xs text-gray-500 uppercase">Price</th>
              <th className="px-6 lg:px-8 py-4 font-bold text-xs text-gray-500 uppercase">Stock</th>
              <th className="px-6 lg:px-8 py-4 font-bold text-xs text-gray-500 uppercase">Status</th>
              <th className="px-6 lg:px-8 py-4 font-bold text-xs text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((product, i) => (
              <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                key={product._id}
                className="hover:bg-gray-50/50 transition-all cursor-pointer"
              >
                <td className="px-6 lg:px-8 py-4 lg:py-5">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden relative shrink-0">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Package className="text-gray-400" size={18} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-dark text-sm lg:text-base">{product.name}</p>
                      <p className="text-xs text-gray-400">
                        ID: {product._id.substring(0, 8)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 lg:px-8 py-4 lg:py-5">
                  <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 lg:px-8 py-4 lg:py-5 font-black text-dark text-sm">
                  ₹{product.price}
                </td>
                <td className="px-6 lg:px-8 py-4 lg:py-5 text-gray-500 font-medium text-sm">
                  {product.stock} units
                </td>
                <td className="px-6 lg:px-8 py-4 lg:py-5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        product.stock > 0 ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span
                      className={`text-xs font-bold ${
                        product.stock > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {product.stock > 0 ? "Active" : "Out of Stock"}
                    </span>
                  </div>
                </td>
                <td className="px-6 lg:px-8 py-4 lg:py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() =>
                        router.push(`/products/edit/${product._id}`)
                      }
                      className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Card List (< md) ── */}
      <div className="md:hidden space-y-3">
        {products.map((product, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={product._id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden relative shrink-0">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Package className="text-gray-400" size={22} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-dark truncate">{product.name}</p>
                <p className="text-xs text-gray-400 mb-2">
                  ID: {product._id.substring(0, 8)}
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                    {product.category}
                  </span>
                  <span
                    className={`flex items-center gap-1 text-xs font-bold ${
                      product.stock > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        product.stock > 0 ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    {product.stock > 0 ? "Active" : "Out of Stock"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
              <div>
                <span className="font-black text-dark">₹{product.price}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {product.stock} units
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/products/edit/${product._id}`)}
                  className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-all"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 lg:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl lg:text-2xl font-black">Add New Toy</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-dark transition-all"
              >
                <Trash2 size={22} />
              </button>
            </div>

            <div className="p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Superhero Action Figure"
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-2 ring-primary/20 transition-all border-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Category
                </label>
                <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-2 ring-primary/20 transition-all border-none appearance-none">
                  <option>Plush</option>
                  <option>Building</option>
                  <option>Electronics</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-2 ring-primary/20 transition-all border-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the toy..."
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
              <button className="flex-[2] bg-primary text-white py-3 lg:py-4 rounded-2xl font-black tracking-wide shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all">
                SAVE PRODUCT
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
