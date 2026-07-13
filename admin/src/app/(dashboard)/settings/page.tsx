"use client";

import React, { useEffect, useState } from "react";
import { Save, Globe, Truck, Smartphone, Loader2, Baby, Trash2, Plus } from "lucide-react";
import api from "../../../services/apiService";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    storeName: "",
    supportEmail: "",
    currency: "INR",
    shippingFee: 0,
    freeShippingThreshold: 0,
    taxRate: 0,
    maintenanceMode: false,
    ageRanges: [] as any[],
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await api.get("/config");
        setConfig({
          storeName: data.storeName || "",
          supportEmail: data.supportEmail || "",
          currency: data.currency || "INR",
          shippingFee: data.shippingFee || 0,
          freeShippingThreshold: data.freeShippingThreshold || 0,
          taxRate: data.taxRate || 0,
          maintenanceMode: data.maintenanceMode || false,
          ageRanges: data.ageRanges || [],
        });
      } catch (_error) {
        console.error("Failed to fetch settings");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/config", config);
      window.alert("Settings saved successfully");
    } catch (_error) {
      window.alert("Failed to save settings");
    } finally {
      setSaving(false);
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
    <div className="space-y-5 lg:space-y-8 max-w-4xl">
      <header>
        <h2 className="text-2xl lg:text-3xl font-black text-dark">
          Store Settings
        </h2>
        <p className="text-gray-500 mt-1 text-sm lg:text-base">
          Configure your marketplace and preferences
        </p>
      </header>

      <div className="space-y-4 lg:space-y-6">
        <section className="bg-white rounded-3xl p-5 lg:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5 lg:mb-6">
            <div className="p-2 bg-gray-100 rounded-lg shrink-0">
              <Globe size={18} className="text-gray-500" />
            </div>
            <h3 className="text-lg lg:text-xl font-bold">General Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Store Name
              </label>
              <input
                type="text"
                value={config.storeName}
                onChange={(e) =>
                  setConfig({ ...config, storeName: e.target.value })
                }
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-2 ring-primary/20 transition-all border-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Support Email
              </label>
              <input
                type="email"
                value={config.supportEmail}
                onChange={(e) =>
                  setConfig({ ...config, supportEmail: e.target.value })
                }
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-2 ring-primary/20 transition-all border-none"
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Store Currency
              </label>
              <select
                value={config.currency}
                onChange={(e) =>
                  setConfig({ ...config, currency: e.target.value })
                }
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none appearance-none"
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
              </select>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-5 lg:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5 lg:mb-6">
            <div className="p-2 bg-gray-100 rounded-lg shrink-0">
              <Truck size={18} className="text-gray-500" />
            </div>
            <h3 className="text-lg lg:text-xl font-bold">Shipping & Taxes</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Standard Shipping Fee
              </label>
              <input
                type="number"
                value={config.shippingFee}
                onChange={(e) =>
                  setConfig({ ...config, shippingFee: Number(e.target.value) })
                }
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-2 ring-primary/20 transition-all border-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Free Shipping Threshold
              </label>
              <input
                type="number"
                value={config.freeShippingThreshold}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    freeShippingThreshold: Number(e.target.value),
                  })
                }
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-2 ring-primary/20 transition-all border-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">
                GST / Tax Rate (%)
              </label>
              <input
                type="number"
                value={config.taxRate}
                onChange={(e) =>
                  setConfig({ ...config, taxRate: Number(e.target.value) })
                }
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-2 ring-primary/20 transition-all border-none"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-5 lg:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5 lg:mb-6">
            <div className="p-2 bg-gray-100 rounded-lg shrink-0">
              <Baby size={18} className="text-gray-500" />
            </div>
            <h3 className="text-lg lg:text-xl font-bold">Age Range Management</h3>
          </div>

          <div className="space-y-4">
            {config.ageRanges.map((range: any, index: number) => (
              <div key={index} className="flex gap-4 items-end bg-gray-50 p-4 rounded-2xl">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Label</label>
                  <input
                    type="text"
                    value={range.name}
                    onChange={(e) => {
                      const newRanges = [...config.ageRanges];
                      newRanges[index] = { ...newRanges[index], name: e.target.value };
                      setConfig({ ...config, ageRanges: newRanges });
                    }}
                    className="w-full bg-white p-2 rounded-lg text-sm border-none outline-none"
                  />
                </div>
                <div className="w-20 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Min</label>
                  <input
                    type="number"
                    value={range.minAge}
                    onChange={(e) => {
                      const newRanges = [...config.ageRanges];
                      newRanges[index] = { ...newRanges[index], minAge: Number(e.target.value) };
                      setConfig({ ...config, ageRanges: newRanges });
                    }}
                    className="w-full bg-white p-2 rounded-lg text-sm border-none outline-none"
                  />
                </div>
                <div className="w-20 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Max</label>
                  <input
                    type="number"
                    value={range.maxAge}
                    onChange={(e) => {
                      const newRanges = [...config.ageRanges];
                      newRanges[index] = { ...newRanges[index], maxAge: Number(e.target.value) };
                      setConfig({ ...config, ageRanges: newRanges });
                    }}
                    className="w-full bg-white p-2 rounded-lg text-sm border-none outline-none"
                  />
                </div>
                <button
                  onClick={() => {
                    const newRanges = config.ageRanges.filter((_, i) => i !== index);
                    setConfig({ ...config, ageRanges: newRanges });
                  }}
                  className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              onClick={() => setConfig({
                ...config,
                ageRanges: [...config.ageRanges, { name: "New Age", minAge: 0, maxAge: 10 }]
              })}
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-400 hover:text-primary hover:border-primary/50 transition-all font-bold text-sm"
            >
              <Plus size={16} /> Add Age Range
            </button>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-5 lg:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5 lg:mb-6">
            <div className="p-2 bg-gray-100 rounded-lg shrink-0">
              <Smartphone size={18} className="text-gray-500" />
            </div>
            <h3 className="text-lg lg:text-xl font-bold">App Configuration</h3>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div className="space-y-0.5">
              <h4 className="font-bold text-dark">Maintenance Mode</h4>
              <p className="text-xs text-gray-500">
                Disable the mobile app for maintenance
              </p>
            </div>
            <button
              onClick={() =>
                setConfig({ ...config, maintenanceMode: !config.maintenanceMode })
              }
              className={`w-12 h-6 rounded-full transition-colors relative ${
                config.maintenanceMode ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  config.maintenanceMode ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>
        </section>

        <div className="flex justify-end gap-4 pt-2">
          <button
            disabled={saving}
            onClick={handleSave}
            className="w-full sm:w-auto px-8 lg:px-10 py-4 bg-dark text-white rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
            SAVE ALL SETTINGS
          </button>
        </div>
      </div>
    </div>
  );
}
