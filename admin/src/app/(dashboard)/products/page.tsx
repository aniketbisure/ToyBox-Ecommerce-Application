"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Package, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "../../../services/apiService";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products?pageNumber=${page}`);
      // FIX: Access .products from the paginated response
      setProducts(data.products || []);
      setPagination({
        page: data.page,
        pages: data.pages,
        total: data.total
      });
    } catch (error) {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(products.filter(p => p._id !== id));
      } catch (error) {
        alert("Failed to delete product");
      }
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-dark">Inventory Management</h2>
          <p className="text-gray-500 mt-1">Manage your catalog and stock levels</p>
        </div>
        <button
          onClick={() => router.push("/products/add")}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Product
        </button>
      </header>

      {/* Toolbar */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-12 pr-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary transition-all outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold text-gray-600">
          <Filter size={18} />
          Filter
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-4 font-bold text-sm text-gray-500">PRODUCT</th>
              <th className="px-8 py-4 font-bold text-sm text-gray-500">CATEGORY</th>
              <th className="px-8 py-4 font-bold text-sm text-gray-500">PRICE</th>
              <th className="px-8 py-4 font-bold text-sm text-gray-500">STOCK</th>
              <th className="px-8 py-4 font-bold text-sm text-gray-500">STATUS</th>
              <th className="px-8 py-4 font-bold text-sm text-gray-500 text-right">ACTIONS</th>
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
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden relative">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Package className="text-gray-400" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-dark">{product.name}</p>
                      <p className="text-xs text-gray-400">ID: {product._id.substring(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {product.category}
                  </span>
                </td>
                <td className="px-8 py-5 font-black text-dark">₹{product.price}</td>
                <td className="px-8 py-5 text-gray-500 font-medium">{product.stock} units</td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-green-500" : "bg-red-500"}`} />
                    <span className={`text-xs font-bold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                      {product.stock > 0 ? "Active" : "Out of Stock"}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => router.push(`/products/edit/${product._id}`)}
                      className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal (Simple Version) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-2xl font-black">Add New Toy</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-dark transition-all">
                <Trash2 size={24} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Product Name</label>
                <input type="text" placeholder="e.g. Superhero Action Figure" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-2 ring-primary/20 transition-all border-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Category</label>
                <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-2 ring-primary/20 transition-all border-none appearance-none">
                  <option>Plush</option>
                  <option>Building</option>
                  <option>Electronics</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Price (₹)</label>
                <input type="number" placeholder="0.00" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-2 ring-primary/20 transition-all border-none" />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Description</label>
                <textarea rows={4} placeholder="Describe the toy..." className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-2 ring-primary/20 transition-all border-none" />
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-all">
                Cancel
              </button>
              <button className="flex-[2] bg-primary text-white py-4 rounded-2xl font-black tracking-wide shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all">
                SAVE PRODUCT
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
