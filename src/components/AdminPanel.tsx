/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, Check, X, Edit3, Plus, 
  DollarSign, Wifi, TrendingUp, HelpCircle, EyeOff, Save, KeyRound, Clock, AlertCircle, Trash, Languages
} from 'lucide-react';
import { Dish, Order, Language, Category, OrderStatus } from '../types';
import { AVAILABLE_TABLES, TRANSLATIONS } from '../data';
import { generateQRCode } from '../utils/qr';

interface AdminPanelProps {
  dishes: Dish[];
  onAddDish: (dish: Dish) => void;
  onUpdateDishPrice: (id: string, price: number) => void;
  onToggleDishAvailability: (id: string) => void;
  onDeleteDish: (id: string) => void;
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: OrderStatus) => void;
  currentTableId: string;
  onTableSelect: (id: string) => void;
}

export default function AdminPanel({
  dishes,
  onAddDish,
  onUpdateDishPrice,
  onToggleDishAvailability,
  onDeleteDish,
  orders,
  onUpdateOrderStatus,
  currentTableId,
  onTableSelect
}: AdminPanelProps) {
  const [activeAdminTab, setActiveAdminTab] = useState<'orders' | 'menu' | 'qrs'>('orders');
  
  // New dish form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDishName, setNewDishName] = useState({ en: '', es: '', ja: '', fr: '' });
  const [newDishDesc, setNewDishDesc] = useState({ en: '', es: '', ja: '', fr: '' });
  const [newDishPrice, setNewDishPrice] = useState('');
  const [newDishCategory, setNewDishCategory] = useState<Category>('starters');
  const [newDishImage, setNewDishImage] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400');
  const [newDishAllergens, setNewDishAllergens] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    spicy: false,
    nuts: false
  });

  // Table QR Codes map base64 URL
  const [tableQRs, setTableQRs] = useState<Record<string, string>>({});

  // Generate QR Codes based on dynamic platform URL or standard test simulator params
  useEffect(() => {
    async function loadQRs() {
      const qrCodes: Record<string, string> = {};
      const baseAppUrl = window.location.href.split('?')[0]; // strip current params if any
      
      for (const table of AVAILABLE_TABLES) {
        // Encodable URL that points to this specific tableside menu at runtime when scanned
        const tableUrl = `${baseAppUrl}?table=${table.id}`;
        const qrBase64 = await generateQRCode(tableUrl);
        qrCodes[table.id] = qrBase64;
      }
      setTableQRs(qrCodes);
    }
    loadQRs();
  }, []);

  // Filter Order statistics
  const metrics = React.useMemo(() => {
    const totalRevenue = orders
      .filter(o => o.status === 'completed')
      .reduce((acc, curr) => acc + curr.total, 0);

    const openCount = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
    const completedCount = orders.filter(o => o.status === 'completed').length;
    const servedCount = orders.filter(o => o.status === 'served').length;

    return { totalRevenue, openCount, completedCount, servedCount };
  }, [orders]);

  // Form Submission
  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.en || !newDishPrice) return;

    // Use default values if other language inputs are blank
    const finalName = {
      en: newDishName.en,
      es: newDishName.es || `${newDishName.en} (Traducido)`,
      ja: newDishName.ja || `${newDishName.en} (翻訳)`,
      fr: newDishName.fr || `${newDishName.en} (Traduit)`
    };

    const finalDesc = {
      en: newDishDesc.en || "Handcrafted restaurant specialty.",
      es: newDishDesc.es || "Especialidad artesanal de la casa.",
      ja: newDishDesc.ja || "自家製のこだわり特製料理です。",
      fr: newDishDesc.fr || "Spécialité culinaire maison."
    };

    const newDish: Dish = {
      id: `dish-custom-${Date.now()}`,
      name: finalName,
      description: finalDesc,
      price: parseFloat(newDishPrice) || 5.00,
      category: newDishCategory,
      imageUrl: newDishImage,
      isAvailable: true,
      allergens: { ...newDishAllergens }
    };

    onAddDish(newDish);
    
    // reset form
    setShowAddForm(false);
    setNewDishName({ en: '', es: '', ja: '', fr: '' });
    setNewDishDesc({ en: '', es: '', ja: '', fr: '' });
    setNewDishPrice('');
    setNewDishCategory('starters');
    setNewDishAllergens({ vegetarian: false, vegan: false, glutenFree: false, spicy: false, nuts: false });
  };

  return (
    <div className="flex flex-col h-full bg-natural-light text-natural-text rounded-3xl overflow-hidden border border-natural-border p-1 relative shadow-2xl">
      {/* Top Admin Header */}
      <div className="bg-white p-4 border-b border-natural-border flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-natural-primary rounded-xl text-white">
            <ClipboardList className="w-5 h-5" id="admin-header-icon" />
          </div>
          <div>
            <h2 className="text-sm font-serif font-bold tracking-tight text-natural-primary" id="admin-panel-title">Kitchen & Menu Workspace</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 bg-natural-primary rounded-full animate-bounce"></span>
              <span className="text-[10px] font-mono font-semibold text-natural-primary uppercase tracking-wider">Live Cook Sync Active</span>
            </div>
          </div>
        </div>

        {/* Workspace Tab Buttons */}
        <div className="flex bg-natural-bg border border-natural-border p-1 rounded-xl">
          <button
            onClick={() => setActiveAdminTab('orders')}
            className={`px-3 py-1.5 text-xs font-serif font-bold rounded-lg transition-all ${
              activeAdminTab === 'orders'
                ? 'bg-natural-primary text-white shadow-xs'
                : 'text-natural-muted hover:text-natural-primary'
            }`}
          >
            Orders Queue
          </button>
          <button
            onClick={() => setActiveAdminTab('menu')}
            className={`px-3 py-1.5 text-xs font-serif font-bold rounded-lg transition-all ${
              activeAdminTab === 'menu'
                ? 'bg-natural-primary text-white shadow-xs'
                : 'text-natural-muted hover:text-natural-primary'
            }`}
          >
            Dish Vault
          </button>
          <button
            onClick={() => setActiveAdminTab('qrs')}
            className={`px-3 py-1.5 text-xs font-serif font-bold rounded-lg transition-all ${
              activeAdminTab === 'qrs'
                ? 'bg-natural-primary text-white shadow-xs'
                : 'text-natural-muted hover:text-natural-primary'
            }`}
          >
            Table QR Codes
          </button>
        </div>
      </div>

      {/* Metrics Header strip */}
      <div className="bg-natural-bg/40 border-b border-natural-border px-5 py-3 grid grid-cols-4 gap-2 shrink-0">
        <div className="bg-white p-2 rounded-xl text-center border border-natural-border shadow-xs">
          <span className="text-[9px] font-serif font-bold text-[#5A5A40] uppercase tracking-wider block mb-0.5">Kitchen Workload</span>
          <span className="text-sm font-serif font-bold text-natural-primary">{metrics.openCount} cooking</span>
        </div>
        <div className="bg-white p-2 rounded-xl text-center border border-natural-border shadow-xs">
          <span className="text-[9px] font-serif font-bold text-[#5A5A40] uppercase tracking-wider block mb-0.5">Dishes Served</span>
          <span className="text-sm font-serif font-bold text-green-700">{metrics.servedCount} tables</span>
        </div>
        <div className="bg-white p-2 rounded-xl text-center border border-natural-border shadow-xs">
          <span className="text-[9px] font-serif font-bold text-[#5A5A40] uppercase tracking-wider block mb-0.5">Completed Paid</span>
          <span className="text-sm font-serif font-bold text-[#8C8C70]">{metrics.completedCount} orders</span>
        </div>
        <div className="bg-white p-2 rounded-xl text-center border border-natural-border shadow-xs">
          <span className="text-[9px] font-serif font-bold text-[#5A5A40] uppercase tracking-wider block mb-0.5">Shift Revenue</span>
          <span className="text-sm font-serif font-bold text-natural-primary">${metrics.totalRevenue.toFixed(2)}</span>
        </div>
      </div>

      {/* Main Container Work Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeAdminTab === 'orders' && (
            <motion.div
              key="orders-vault"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {orders.length === 0 ? (
                <div className="border border-dashed border-natural-border bg-white rounded-2xl p-10 text-center text-natural-muted">
                  <ClipboardList className="w-10 h-10 text-[#8C8C70] mx-auto mb-3" />
                  <p className="text-xs font-serif font-bold text-natural-primary">Kitchen order queue is empty.</p>
                  <p className="text-[10px] text-[#5A5A40] mt-1 font-sans">Open table menu and place order to see it sync in real time here!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="admin-orders-grid">
                  {orders.slice().reverse().map((order) => {
                    const statusConfig = {
                      pending: { label: 'Received', color: 'border-amber-300 text-amber-800 bg-amber-50' },
                      preparing: { label: 'In Broiler/Prep', color: 'border-orange-355 text-orange-950 bg-orange-50' },
                      served: { label: 'Served to Table', color: 'border-green-300 text-green-900 bg-green-50' },
                      completed: { label: 'Completed (Paid)', color: 'border-natural-border text-natural-muted bg-natural-bg/50' },
                      cancelled: { label: 'Cancelled', color: 'border-rose-300 text-rose-900 bg-rose-50' }
                    };

                    const sourceTable = AVAILABLE_TABLES.find(t => t.id === order.tableId);

                    return (
                      <div 
                        key={order.id} 
                        className={`border rounded-2xl p-4 space-y-3 transition-all ${
                          order.status === 'completed' || order.status === 'cancelled'
                            ? 'border-natural-border bg-white/40 opacity-70 shadow-xs'
                            : 'border-natural-border bg-white shadow-xs'
                        }`}
                      >
                        {/* Order ID & Timing */}
                        <div className="flex justify-between items-start border-b border-natural-border/60 pb-2">
                          <div>
                            <span className="text-[9px] font-mono font-bold text-[#8C8C70] tracking-wider uppercase">ORDER ID #{order.id.slice(-6).toUpperCase()}</span>
                            <h3 className="text-xs font-serif font-bold text-natural-primary mt-0.5 bg-natural-bg border border-natural-border rounded-md px-2.5 py-1 inline-block">
                              📍 {sourceTable ? sourceTable.name.split(' - ')[0] : `Table ${order.tableId}`}
                            </h3>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-[10px] text-natural-muted font-mono block font-medium">
                              {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <span className={`text-[9px] font-serif font-bold px-2.5 py-0.5 rounded-full mt-1.5 inline-block border ${statusConfig[order.status].color}`}>
                              {statusConfig[order.status].label}
                            </span>
                          </div>
                        </div>

                        {/* Ordered Items list */}
                        <div className="space-y-1 bg-natural-bg/30 rounded-xl p-3 border border-natural-border">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="text-xs text-natural-text py-1.5 border-b border-natural-border/30 last:border-b-0">
                              <div className="flex justify-between font-serif font-semibold">
                                <span>🌿 <span className="font-bold text-natural-primary">{it.quantity}x</span> {it.dishName}</span>
                                <span className="font-serif text-[#5A5A40]">${(it.price * it.quantity).toFixed(2)}</span>
                              </div>
                              {it.selectedSpice && (
                                <p className="text-[10px] text-[#B35446] pl-4 font-bold">🌶️ Spicy level: {it.selectedSpice.toUpperCase()}</p>
                              )}
                              {it.selectedOptions && it.selectedOptions.length > 0 && (
                                <p className="text-[10px] text-natural-primary pl-4 font-bold">+ Add-ons: {it.selectedOptions.join(', ')}</p>
                              )}
                              {it.notes && (
                                <p className="text-[10px] text-[#5A5A40] pl-4 italic bg-white/60 py-1 px-1.5 rounded border border-natural-border/30 mt-1">
                                  "{it.notes}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Customer Checkout general notes */}
                        {order.notes && (
                          <div className="bg-white p-2.5 rounded-xl border border-dashed border-natural-border text-[10px] text-natural-muted italic">
                            <span className="font-serif font-bold uppercase tracking-wider text-natural-primary block not-italic mb-0.5">Guest instructions:</span>
                            "{order.notes}"
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs border-t border-natural-border/50 pt-2 font-serif font-bold">
                          <span className="text-[#8C8C70]">Billed Ticket</span>
                          <span className="font-bold text-natural-primary text-sm">${order.total.toFixed(2)}</span>
                        </div>

                        {/* Task management action buttons */}
                        {order.status !== 'completed' && order.status !== 'cancelled' && (
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-natural-border/50">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                                className="col-span-2 cursor-pointer bg-natural-primary hover:bg-natural-primary-hover text-white font-serif font-bold text-[11px] py-2 rounded-xl shadow-xs transition-all uppercase tracking-wider"
                              >
                                Send to Chef Prep 🧑‍🍳
                              </button>
                            )}
                            {order.status === 'preparing' && (
                              <button
                                onClick={() => onUpdateOrderStatus(order.id, 'served')}
                                className="col-span-2 cursor-pointer bg-[#454530] hover:bg-[#5A5A40] text-white font-serif font-bold text-[11px] py-2 rounded-xl shadow-xs transition-all uppercase tracking-wider"
                              >
                                Dish Completed, Serve 🚀
                              </button>
                            )}
                            {order.status === 'served' && (
                              <button
                                onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                                className="col-span-2 cursor-pointer bg-[#2D2D2A] hover:bg-[#1A1A18] text-white font-serif font-bold text-[11px] py-2 rounded-xl shadow-xs transition-all uppercase tracking-wider"
                              >
                                Paid & Archive Ticket 🧾
                              </button>
                            )}
                            
                            {order.status !== 'served' && (
                              <button
                                onClick={() => onUpdateOrderStatus(order.id, 'cancelled')}
                                className="col-span-2 cursor-pointer bg-transparent border border-[#B35446]/30 hover:bg-[#B35446]/5 text-[#B35446] font-serif font-bold text-[10px] py-1.5 rounded-xl transition-all uppercase tracking-wider"
                              >
                                Cancel Order Ticket
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
          {activeAdminTab === 'menu' && (
            <motion.div
              key="menu-vault"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Add dish slider toggle / trigger */}
              <div className="flex justify-between items-center" id="admin-dish-header">
                <h3 className="text-xs font-serif font-bold text-natural-primary tracking-wider uppercase">Culinary Dish Catalog ({dishes.length})</h3>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-natural-primary hover:bg-natural-primary-hover text-white font-serif font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  Add New Dish
                </button>
              </div>

              {/* Add Dish Drawer Form overlay */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.form
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    onSubmit={handleCreateDish}
                    className="bg-white border border-natural-border p-4 rounded-2xl space-y-4 overflow-hidden shadow-xs"
                  >
                    <div className="flex items-center gap-2 border-b border-natural-border pb-2">
                      <Languages className="w-4 h-4 text-natural-primary" />
                      <h4 className="text-xs font-serif font-bold text-natural-primary">Multilingual Dish Definition</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Name inputs */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-[#5A5A40] font-mono block font-semibold">English Name *</label>
                        <input
                          required
                          type="text"
                          value={newDishName.en}
                          onChange={(e) => setNewDishName({ ...newDishName, en: e.target.value })}
                          placeholder="e.g. Garlic Truffle Bruschetta"
                          className="w-full bg-natural-bg/50 border border-natural-border rounded-xl p-2.5 text-natural-text outline-none focus:ring-1 focus:ring-natural-primary transition-all font-serif font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-[#5A5A40] font-mono block font-semibold">Spanish Name</label>
                        <input
                          type="text"
                          value={newDishName.es}
                          onChange={(e) => setNewDishName({ ...newDishName, es: e.target.value })}
                          placeholder="p. ej. Bruschetta de ajo y trufa"
                          className="w-full bg-natural-bg/50 border border-natural-border rounded-xl p-2.5 text-natural-text outline-none focus:ring-1 focus:ring-natural-primary transition-all font-serif"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-[#5A5A40] font-mono block font-semibold">Japanese Name</label>
                        <input
                          type="text"
                          value={newDishName.ja}
                          onChange={(e) => setNewDishName({ ...newDishName, ja: e.target.value })}
                          placeholder="例：ガーリックトリュフのブルスケッタ"
                          className="w-full bg-natural-bg/50 border border-natural-border rounded-xl p-2.5 text-natural-text outline-none focus:ring-1 focus:ring-natural-primary transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-[#5A5A40] font-mono block font-semibold">French Name</label>
                        <input
                          type="text"
                          value={newDishName.fr}
                          onChange={(e) => setNewDishName({ ...newDishName, fr: e.target.value })}
                          placeholder="ex. Bruschetta de Truffe à l'Ail"
                          className="w-full bg-natural-bg/50 border border-natural-border rounded-xl p-2.5 text-natural-text outline-none focus:ring-1 focus:ring-natural-primary transition-all font-serif"
                        />
                      </div>

                      {/* Pricing & Category */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-[#5A5A40] font-mono block font-semibold">Base Price ($) *</label>
                        <input
                          required
                          type="number"
                          step="0.01"
                          value={newDishPrice}
                          onChange={(e) => setNewDishPrice(e.target.value)}
                          placeholder="14.50"
                          className="w-full bg-natural-bg/50 border border-natural-border rounded-xl p-2.5 text-natural-text outline-none focus:ring-1 focus:ring-natural-primary transition-all font-serif font-bold"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-[#5A5A40] font-mono block font-semibold">Menu Category *</label>
                        <select
                          value={newDishCategory}
                          onChange={(e) => setNewDishCategory(e.target.value as Category)}
                          className="w-full bg-natural-bg/50 border border-natural-border rounded-xl p-2.5 text-natural-text outline-none focus:ring-1 focus:ring-natural-primary transition-all font-serif font-bold"
                        >
                          <option value="starters">Starters</option>
                          <option value="mains">Signature Mains</option>
                          <option value="desserts">Artisanal Desserts</option>
                          <option value="drinks">Designer Drinks</option>
                        </select>
                      </div>

                      {/* High-quality Unsplash image */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] text-[#5A5A40] font-mono block font-semibold">Culinary Photo URL</label>
                        <input
                          type="url"
                          value={newDishImage}
                          onChange={(e) => setNewDishImage(e.target.value)}
                          className="w-full bg-natural-bg/50 border border-natural-border rounded-xl p-2.5 text-natural-text outline-none focus:ring-1 focus:ring-natural-primary transition-all text-[11px] font-mono font-medium"
                        />
                      </div>

                      {/* Multilingual description (English is baseline, others mapped or autosaved) */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] text-[#5A5A40] font-mono block font-semibold">English Description *</label>
                        <textarea
                          required
                          value={newDishDesc.en}
                          onChange={(e) => setNewDishDesc({ ...newDishDesc, en: e.target.value })}
                          placeholder="Describe the flavors, texture, technique, and ingredients..."
                          className="w-full bg-natural-bg/50 border border-natural-border rounded-xl p-2.5 text-natural-text outline-none focus:ring-1 focus:ring-natural-primary transition-all min-h-16 resize-none font-serif"
                        />
                      </div>
                    </div>

                    {/* Allergens Flags checkboxes */}
                    <div className="space-y-2 bg-natural-bg p-3 rounded-xl border border-natural-border">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#5A5A40] block mb-1 font-bold">Dietary Qualifications</span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                        {Object.keys(newDishAllergens).map((key) => {
                          const allergenKey = key as keyof typeof newDishAllergens;
                          const labels: Record<string, string> = {
                            vegetarian: '🌿 Veggie',
                            vegan: '🥬 Vegan',
                            glutenFree: '🌾 GF',
                            spicy: '🌶️ Spicy',
                            nuts: '🥜 Nuts'
                          };
                          return (
                            <label
                              key={allergenKey}
                              className="flex items-center gap-2 bg-white p-2 rounded-lg cursor-pointer border border-natural-border hover:bg-natural-bg transition-all select-none shadow-xs"
                            >
                              <input
                                type="checkbox"
                                checked={newDishAllergens[allergenKey]}
                                onChange={(e) => setNewDishAllergens({ ...newDishAllergens, [allergenKey]: e.target.checked })}
                                className="rounded border-natural-border text-natural-primary focus:ring-natural-primary w-3.5 h-3.5 bg-white accent-natural-primary"
                              />
                              <span className="font-serif font-bold text-[10px] text-natural-text">{labels[key]}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Form actions */}
                    <button
                      type="submit"
                      className="w-full cursor-pointer bg-natural-primary hover:bg-natural-primary-hover text-white font-serif font-bold text-xs py-3 rounded-xl shadow-xs transition-all uppercase tracking-widest flex items-center justify-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      Add & Sync Menu Item
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Vault dishes display grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="admin-dish-cards-box">
                {dishes.map((dish) => (
                  <div key={dish.id} className="bg-white border border-natural-border p-3.5 rounded-2xl flex gap-3 shadow-xs">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-natural-bg border border-natural-border relative">
                      <img 
                        src={dish.imageUrl} 
                        alt={dish.name.en} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {!dish.isAvailable && (
                        <div className="absolute inset-0 bg-[#2D2D2A]/80 flex items-center justify-center text-center">
                          <span className="text-[8px] bg-[#B35446] font-serif font-bold px-1.5 py-0.5 rounded text-white tracking-wider animate-pulse">SOLD OUT</span>
                        </div>
                      )}
                    </div>

                    {/* Manage elements */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-xs font-serif font-bold text-natural-primary truncate">{dish.name.en}</h4>
                          <span className="text-[10px] font-mono font-bold text-natural-primary bg-natural-bg/80 border border-natural-border px-1.5 rounded uppercase">{dish.category}</span>
                        </div>
                        <p className="text-[9px] text-[#5A5A40] truncate leading-relaxed mt-0.5">{dish.description.en}</p>
                      </div>

                      {/* Interactive Price changer & Actions */}
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-natural-border/40">
                        {/* Price Input directly */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-[#5A5A40] font-serif font-bold">$</span>
                          <input
                            type="number"
                            step="0.50"
                            value={dish.price}
                            onChange={(e) => onUpdateDishPrice(dish.id, parseFloat(e.target.value) || 0)}
                            className="w-16 bg-natural-bg border border-natural-border rounded px-1.5 py-0.5 text-xs text-natural-text font-serif font-bold text-center focus:ring-1 focus:ring-natural-primary outline-none"
                          />
                        </div>

                        {/* Status Toggle & Delete */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onToggleDishAvailability(dish.id)}
                            className={`px-2 py-1 rounded text-[9px] font-serif font-bold uppercase transition-all border cursor-pointer ${
                              dish.isAvailable
                                ? 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100/50'
                                : 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100/50'
                            }`}
                          >
                            {dish.isAvailable ? 'In Stock' : 'Sold Out'}
                          </button>
                          
                          <button
                            onClick={() => onDeleteDish(dish.id)}
                            className="p-1.5 text-[#8C8C70] hover:text-[#B35446] hover:bg-[#B35446]/10 rounded-lg transition-all cursor-pointer"
                            title="Remove From Vault"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeAdminTab === 'qrs' && (
            <motion.div
              key="qrs-vault"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-white p-4 border border-natural-border rounded-2xl flex gap-3 items-start shadow-xs">
                <div className="bg-natural-bg p-2.5 rounded-xl text-natural-primary shrink-0 border border-natural-border">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-serif font-bold text-natural-primary">Table QR Marketing Core</h4>
                  <p className="text-[10px] text-natural-muted leading-relaxed font-sans font-medium">
                    Each table flyer serves real, scan-receptive web payloads! Scanning a dining room QR from a physical mobile device instantly loads that specific table menu view. 
                    <span className="text-natural-primary block font-serif font-bold mt-1">Click "Simulate Scan View" to immediately snap the mobile frame here.</span>
                  </p>
                </div>
              </div>

              {/* Table flyer template lists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="table-flyers-matrix">
                {AVAILABLE_TABLES.map((tab) => {
                  const isCurrentTable = tab.id === currentTableId;
                  const qrCodeBase64 = tableQRs[tab.id];

                  return (
                    <div 
                      key={tab.id}
                      className={`bg-white border p-4 rounded-2xl flex flex-col justify-between text-center relative overflow-hidden transition-all duration-350 shadow-xs ${
                        isCurrentTable 
                          ? 'border-natural-primary ring-2 ring-natural-primary/30 bg-natural-bg/40' 
                          : 'border-natural-border hover:border-natural-muted'
                      }`}
                    >
                      {/* Top Corner Ribbon */}
                      {isCurrentTable && (
                        <span className="absolute top-0 right-0 bg-natural-primary text-[8px] font-serif uppercase tracking-widest font-bold text-white px-2.5 py-1 rounded-bl-lg shadow-xs">
                          CONNECTED
                        </span>
                      )}

                      {/* Header */}
                      <div className="space-y-1 text-center">
                        <span className="text-[9px] font-serif font-semibold text-[#8C8C70] uppercase tracking-wider block">TABLE FLYER</span>
                        <h4 className="text-sm font-serif font-bold text-natural-primary">{tab.name.split(' - ')[0]}</h4>
                        <span className="text-[9px] font-mono text-natural-muted block font-medium">{tab.name.split(' - ')[1]}</span>
                      </div>

                      {/* QR Display Container */}
                      <div className="my-4 mx-auto w-32 h-32 bg-white rounded-xl p-2.5 shadow-xs border border-natural-border flex items-center justify-center relative group">
                        {qrCodeBase64 ? (
                          <img 
                            src={qrCodeBase64} 
                            alt={`Table QR ${tab.id}`} 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-5 h-5 border-2 border-natural-primary border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>

                      <div className="space-y-2.5 mt-1">
                        <p className="text-[9px] text-natural-muted font-serif font-bold italic tracking-wide leading-relaxed font-sans">
                          "Point camera to browse menu, customize spices, and trigger instant kitchen prep"
                        </p>
                        
                        <button
                          type="button"
                          onClick={() => onTableSelect(tab.id)}
                          className={`w-full cursor-pointer py-2 rounded-xl font-serif font-bold text-[10px] uppercase tracking-widest transition-all ${
                            isCurrentTable
                              ? 'bg-natural-primary hover:bg-natural-primary-hover text-white shadow-xs'
                              : 'bg-natural-bg hover:bg-white text-natural-muted border border-natural-border shadow-xs'
                          }`}
                        >
                          {isCurrentTable ? 'Table Connected' : 'Simulate Scan View'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
