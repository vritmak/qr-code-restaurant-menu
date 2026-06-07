/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Star, Utensils, X, Check, Flame, 
  MessageSquare, Clock, ArrowLeft, EyeOff, Sparkles, Filter, ChevronRight
} from 'lucide-react';
import { Dish, CartItem, Order, Language, Category } from '../types';
import { TRANSLATIONS, AVAILABLE_TABLES } from '../data';

interface CustomerPanelProps {
  dishes: Dish[];
  currentTableId: string;
  onTableChange: (id: string) => void;
  orders: Order[];
  onPlaceOrder: (items: CartItem[], notes: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function CustomerPanel({
  dishes,
  currentTableId,
  onTableChange,
  orders,
  onPlaceOrder,
  language,
  onLanguageChange
}: CustomerPanelProps) {
  const t = TRANSLATIONS[language];
  const tableData = AVAILABLE_TABLES.find(t => t.id === currentTableId) || AVAILABLE_TABLES[0];

  // UI States
  const [activeCategory, setActiveCategory] = useState<Category>('starters');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAllergens, setSelectedAllergens] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    spicy: false,
    nuts: false
  });
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<'menu' | 'cart' | 'status'>('menu');
  
  // Customization States for Item Modal
  const [spiceLevel, setSpiceLevel] = useState<'mild' | 'medium' | 'hot' | 'extra-hot'>('medium');
  const [selectedOptions, setSelectedOptions] = useState<Dish['customization'] extends undefined ? [] : any[]>([]);
  const [itemNotes, setItemNotes] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [checkoutNotes, setCheckoutNotes] = useState('');
  const [orderCompleteShow, setOrderCompleteShow] = useState(false);

  // Session table verification states
  const [confirmedTableId, setConfirmedTableId] = useState<string | null>(() => {
    return localStorage.getItem('qr_menu_confirmed_table_id');
  });
  const [enteredTableNo, setEnteredTableNo] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync the entered table input state with standard scanner tableId change
  useEffect(() => {
    if (currentTableId) {
      setEnteredTableNo(currentTableId);
    }
  }, [currentTableId]);

  const handleConfirmTable = (tId: string) => {
    let cleanId = tId.trim();
    if (!cleanId) {
      setValidationError(
        language === 'en' ? 'Please enter a table number.' :
        language === 'es' ? 'Por favor ingrese un número de mesa.' :
        language === 'ja' ? 'テーブル番号を入力してください。' :
        'Veuillez saisir un numéro de table.'
      );
      return;
    }
    // Extract any numerical or identifier part
    const match = cleanId.match(/table\s*(\s*\w+)/i);
    if (match) {
      cleanId = match[1].trim();
    }
    setValidationError(null);
    setConfirmedTableId(cleanId);
    localStorage.setItem('qr_menu_confirmed_table_id', cleanId);
    onTableChange(cleanId);
  };

  // Filter Dishes
  const filteredDishes = useMemo(() => {
    return dishes.filter(dish => {
      // Category match
      if (dish.category !== activeCategory) return false;
      
      // Language-based search match
      const nameMatch = dish.name[language]?.toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = dish.description[language]?.toLowerCase().includes(searchQuery.toLowerCase());
      if (searchQuery && !nameMatch && !descMatch) return false;

      // Allergens match
      if (selectedAllergens.vegetarian && !dish.allergens.vegetarian) return false;
      if (selectedAllergens.vegan && !dish.allergens.vegan) return false;
      if (selectedAllergens.glutenFree && !dish.allergens.glutenFree) return false;
      if (selectedAllergens.spicy && !dish.allergens.spicy) return false;
      if (selectedAllergens.nuts && !dish.allergens.nuts) return false;

      return true;
    });
  }, [dishes, activeCategory, searchQuery, selectedAllergens, language]);

  // Table-specific orders
  const tableOrders = useMemo(() => {
    return orders.filter(o => o.tableId === currentTableId);
  }, [orders, currentTableId]);

  // Open customization modal
  const handleOpenCustomization = (dish: Dish) => {
    if (!dish.isAvailable) return;
    setSelectedDish(dish);
    setSpiceLevel('medium');
    setSelectedOptions([]);
    setItemNotes('');
    setItemQuantity(1);
  };

  const toggleOption = (option: any) => {
    if (selectedOptions.find(o => o.id === option.id)) {
      setSelectedOptions(selectedOptions.filter(o => o.id !== option.id));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  // Calculate customized price
  const currentItemTotalPrice = useMemo(() => {
    if (!selectedDish) return 0;
    const base = selectedDish.price;
    const optionsTotal = selectedOptions.reduce((acc, opt) => acc + opt.price, 0);
    return (base + optionsTotal) * itemQuantity;
  }, [selectedDish, selectedOptions, itemQuantity]);

  // Add customized item to cart
  const handleAddToCart = () => {
    if (!selectedDish) return;
    
    const cartItemId = `${selectedDish.id}-${spiceLevel}-${selectedOptions.map(o => o.id).sort().join(',')}-${itemNotes}`;
    
    const existingIndex = cart.findIndex(item => item.id === cartItemId);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += itemQuantity;
      setCart(updated);
    } else {
      const newItem: CartItem = {
        id: cartItemId,
        dish: selectedDish,
        quantity: itemQuantity,
        selectedSpice: selectedDish.customization?.hasSpiceLevel ? spiceLevel : undefined,
        selectedOptions: selectedOptions,
        notes: itemNotes
      };
      setCart([...cart, newItem]);
    }
    setSelectedDish(null);
  };

  // Cart Management
  const modifyCartQuantity = (cartItemId: string, amount: number) => {
    const item = cart.find(i => i.id === cartItemId);
    if (!item) return;
    
    if (item.quantity + amount <= 0) {
      setCart(cart.filter(i => i.id !== cartItemId));
    } else {
      setCart(cart.map(i => i.id === cartItemId ? { ...i, quantity: i.quantity + amount } : i));
    }
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const optionsTotal = item.selectedOptions.reduce((oAcc, o) => oAcc + o.price, 0);
      return acc + (item.dish.price + optionsTotal) * item.quantity;
    }, 0);
  }, [cart]);

  const handleSendOrder = () => {
    if (cart.length === 0) return;
    onPlaceOrder(cart, checkoutNotes);
    setCart([]);
    setCheckoutNotes('');
    setOrderCompleteShow(true);
    setActiveTab('status');
  };

  const toggleAllergen = (key: keyof typeof selectedAllergens) => {
    setSelectedAllergens(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col h-full bg-natural-light text-natural-text rounded-3xl overflow-hidden shadow-2xl border border-natural-border relative">
      {/* Top Header - Cream Minimalist Paper Style */}
      <div className="bg-white text-natural-text px-5 py-4 shrink-0 shadow-xs border-b border-natural-border">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-natural-primary" id="customer-header-icon" />
            <h1 className="text-lg font-serif font-bold tracking-tight text-natural-primary" id="customer-title-text">{t.appName}</h1>
          </div>
          
          {/* Language Selector */}
          <select 
            id="lang-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            className="bg-natural-bg text-natural-text text-xs rounded-full px-3 py-1.5 border border-natural-border font-medium focus:outline-none focus:ring-1 focus:ring-natural-primary"
          >
            <option value="en" className="text-natural-text bg-white">English🇺🇸</option>
            <option value="es" className="text-natural-text bg-white">Español🇪🇸</option>
            <option value="ja" className="text-natural-text bg-white">日本語🇯🇵</option>
            <option value="fr" className="text-natural-text bg-white">Français🇫🇷</option>
          </select>
        </div>

        <div className="flex justify-between items-center mt-2 pt-2 border-t border-natural-border">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></span>
            <span className="text-xs text-natural-primary font-mono tracking-wide font-semibold uppercase">
              {t.table}: <span className="underline">{tableData.name.split(' - ')[0]}</span>
            </span>
          </div>
          <button 
            id="table-sim-trigger"
            onClick={() => onTableChange(currentTableId === '6' ? '1' : String(Number(currentTableId) + 1))}
            className="text-[9px] bg-natural-primary text-white px-2.5 py-1 rounded shadow-xs hover:bg-natural-primary-hover transition-all font-mono font-bold uppercase tracking-wider"
          >
            {t.tableSelect}
          </button>
        </div>
      </div>

      {/* Main Container Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 animate-fade-in">
        {confirmedTableId !== currentTableId ? (
          <motion.div
            key="onboarding-step"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5 py-2 px-1 text-center"
          >
            <div className="mx-auto w-14 h-14 bg-natural-primary/10 rounded-full flex items-center justify-center border border-natural-primary/25 shadow-xs relative">
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-natural-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-natural-primary"></span>
              </span>
              <span className="text-xl">🛎️</span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base font-serif font-bold text-natural-primary tracking-tight leading-snug">
                {t.confirmTableTitle}
              </h2>
              <p className="text-[11px] text-natural-muted font-sans leading-relaxed px-2">
                {t.confirmTableDesc}
              </p>
            </div>

            {/* Simulated Scanned QR Info Pill */}
            <div className="bg-white border border-natural-border rounded-xl p-2.5 inline-flex items-center gap-1.5 text-[10px] text-natural-primary font-mono font-bold tracking-wide uppercase shadow-xs">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Scanned Payload: {tableData.name.split(' - ')[0]}
            </div>

            {/* Input Form Card with gorgeous typography */}
            <div className="bg-white border border-natural-border rounded-2xl p-4 shadow-sm text-left space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-natural-primary block uppercase tracking-wider font-semibold">
                  Confirm Your Table Number
                </label>
                <div className="relative">
                  <input
                    id="onboarding-table-input"
                    type="text"
                    value={enteredTableNo}
                    onChange={(e) => {
                      setEnteredTableNo(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder={t.enterTablePlaceholder}
                    className="w-full bg-natural-bg/40 border border-natural-border outline-none rounded-xl px-3.5 py-2.5 text-xs text-natural-text focus:ring-1 focus:ring-natural-primary focus:border-transparent transition-all font-mono font-bold"
                  />
                </div>
                {validationError && (
                  <p className="text-[9px] text-rose-600 font-bold font-sans mt-1">
                    ⚠️ {validationError}
                  </p>
                )}
              </div>

              {/* Quick Select Buttons */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-[#8C8C70] block uppercase tracking-wider font-mono">
                  Quick Select Tables
                </span>
                <div className="grid grid-cols-3 gap-1.5 font-mono">
                  {AVAILABLE_TABLES.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setEnteredTableNo(tab.id);
                        setValidationError(null);
                      }}
                      className={`py-2 text-[10px] font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                        enteredTableNo === tab.id
                          ? 'bg-natural-primary text-white border-natural-primary font-bold'
                          : 'bg-white text-natural-text border-natural-border hover:bg-natural-bg/35'
                      }`}
                    >
                      Tab {tab.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Confirm Actions */}
            <div>
              <button
                type="button"
                id="onboarding-confirm-btn"
                onClick={() => handleConfirmTable(enteredTableNo)}
                className="w-full cursor-pointer bg-natural-primary hover:bg-natural-primary-hover text-white font-serif font-bold text-xs py-3.5 rounded-xl shadow-xs transition-colors uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-[0.98] duration-200"
              >
                {t.confirmTableButton}
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex bg-natural-bg/75 p-1 rounded-xl mb-4 border border-natural-border shrink-0" id="customer-nav-tabs">
          <button
            id="nav-menu"
            onClick={() => setActiveTab('menu')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-serif font-bold rounded-lg transition-all ${
              activeTab === 'menu' 
                ? 'bg-natural-primary text-white shadow-xs' 
                : 'text-natural-muted hover:text-natural-primary'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            Menu
          </button>
          <button
            id="nav-basket"
            onClick={() => setActiveTab('cart')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-serif font-bold rounded-lg transition-all relative ${
              activeTab === 'cart' 
                ? 'bg-natural-primary text-white shadow-xs' 
                : 'text-natural-muted hover:text-natural-primary'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {t.cart}
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-0.5 bg-natural-accent text-natural-primary border border-natural-border text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold font-mono">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
          <button
            id="nav-status"
            onClick={() => setActiveTab('status')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-serif font-bold rounded-lg transition-all relative ${
              activeTab === 'status' 
                ? 'bg-natural-primary text-white shadow-xs' 
                : 'text-natural-muted hover:text-natural-primary'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Status
            {tableOrders.length > 0 && tableOrders.some(o => o.status !== 'completed' && o.status !== 'cancelled') && (
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-[#5A5A40] rounded-full animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'menu' && (
            <motion.div
              key="menu-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Promo Banner */}
              <div className="bg-natural-bg/50 border border-natural-border rounded-2xl p-4 flex gap-3 items-start shadow-xs relative overflow-hidden">
                <div className="bg-natural-primary/10 p-2 rounded-xl text-natural-primary self-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-serif font-bold text-natural-primary tracking-wider uppercase mb-0.5">{t.popularDishes}</h4>
                  <p className="text-[11px] text-natural-text leading-relaxed font-sans">
                    {language === 'en' && "Craft ingredients made from scratch daily. Gluten-free and Vegan highlights marked clearly."}
                    {language === 'es' && "Ingredientes artesanales hechos desde cero a diario. Opciones vegetarianas y sin gluten descritas."}
                    {language === 'ja' && "毎日店内で丁寧に仕込む極上の味わい。ベジタリアンやグルテンフリーの表記も直感的。"}
                    {language === 'fr' && "Ingrédients frais cuisinés chaque jour. Mentions sans gluten et végétaliennes bien indiquées."}
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-[0.03] font-serif text-7xl select-none translate-x-3 translate-y-3 font-bold text-natural-primary leading-none">🌿</div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  id="search-input"
                  type="text"
                  placeholder={language === 'en' ? "Search dishes..." : language === 'es' ? "Buscar platos..." : language === 'ja' ? "おいしい料理を検索..." : "Rechercher un plat..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-natural-border outline-none rounded-xl pl-4 pr-10 py-2.5 text-xs text-natural-text focus:ring-1 focus:ring-natural-primary focus:border-transparent transition-all shadow-xs"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-natural-muted hover:text-natural-text">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Dietary Filter Buttons */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#5A5A40] uppercase tracking-widest font-serif block mb-1">
                  <Filter className="w-3 h-3" />
                  <span>{t.filters}</span>
                </div>
                <div className="flex flex-wrap gap-1.5" id="dietary-filter-container">
                  <button
                    onClick={() => toggleAllergen('vegetarian')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 border ${
                      selectedAllergens.vegetarian
                        ? 'bg-natural-primary text-white border-natural-primary shadow-xs'
                        : 'bg-white text-natural-text border-natural-border hover:bg-natural-bg/35'
                    }`}
                  >
                    🌱 {t.vegetarian}
                  </button>
                  <button
                    onClick={() => toggleAllergen('vegan')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 border ${
                      selectedAllergens.vegan
                        ? 'bg-[#454530] text-white border-[#454530] shadow-xs'
                        : 'bg-white text-natural-text border-natural-border hover:bg-natural-bg/35'
                    }`}
                  >
                    🥬 {t.vegan}
                  </button>
                  <button
                    onClick={() => toggleAllergen('glutenFree')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 border ${
                      selectedAllergens.glutenFree
                        ? 'bg-natural-muted text-white border-natural-muted shadow-xs'
                        : 'bg-white text-natural-text border-natural-border hover:bg-natural-bg/35'
                    }`}
                  >
                    🌾 {t.glutenFree}
                  </button>
                  <button
                    onClick={() => toggleAllergen('spicy')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 border ${
                      selectedAllergens.spicy
                        ? 'bg-[#B35446] text-white border-[#B35446] shadow-xs'
                        : 'bg-white text-natural-text border-natural-border hover:bg-natural-bg/35'
                    }`}
                  >
                    🌶️ {t.spicy}
                  </button>
                </div>
              </div>

              {/* Culinary Category Selector Cards */}
              <div className="grid grid-cols-4 gap-1.5 bg-natural-bg/60 p-1 rounded-xl border border-natural-border" id="category-scroller">
                {(['starters', 'mains', 'desserts', 'drinks'] as Category[]).map((cat) => (
                  <button
                    id={`cat-tab-${cat}`}
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`py-2 text-[10px] font-serif font-bold rounded-lg text-center transition-all ${
                      activeCategory === cat
                        ? 'bg-white text-natural-primary shadow-xs'
                        : 'text-natural-muted hover:text-natural-primary'
                    }`}
                  >
                    {t.categories[cat]}
                  </button>
                ))}
              </div>

              {/* Menu Dishes List */}
              <div className="space-y-3" id="dish-list-element">
                {filteredDishes.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-natural-border text-natural-muted font-sans text-xs">
                    No dishes match this category or dietary criteria.
                  </div>
                ) : (
                  filteredDishes.map((dish) => (
                    <motion.div
                      layoutId={`dish-card-${dish.id}`}
                      key={dish.id}
                      onClick={() => handleOpenCustomization(dish)}
                      className={`bg-white rounded-2xl p-3 border border-natural-border hover:border-natural-accent transition-all flex gap-3 shadow-xs cursor-pointer ${
                        !dish.isAvailable ? 'opacity-65' : ''
                      }`}
                    >
                      {/* Dish Image */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden relative shrink-0 bg-natural-bg border border-natural-border">
                        <img 
                          src={dish.imageUrl} 
                          alt={dish.name[language]} 
                          className="w-full h-full object-cover animate-fade-in"
                          referrerPolicy="no-referrer"
                        />
                        {!dish.isAvailable && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center">
                            <span className="text-[9px] text-white font-bold tracking-widest uppercase bg-rose-700 px-1.5 py-0.5 rounded-sm">
                              {t.soldOut}
                            </span>
                          </div>
                        )}
                        {dish.allergens.spicy && (
                          <div className="absolute top-1 right-1 bg-white/80 backdrop-blur-xs p-1 rounded-full text-[9px] shadow-xs">
                            🌶️
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <h3 className="text-xs font-serif font-semibold text-natural-text leading-tight">
                              {dish.name[language]}
                            </h3>
                            <span className="text-xs font-serif font-bold text-natural-primary shrink-0">
                              {t.currencySymbol}{dish.price.toFixed(2)}
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-natural-muted line-clamp-2 mt-1 leading-relaxed font-sans">
                            {dish.description[language]}
                          </p>
                        </div>

                        {/* Dietary flags on card */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {dish.allergens.vegan && <span className="text-[8px] bg-natural-bg text-[#5A5A40] font-bold px-1.5 py-0.5 rounded uppercase font-mono border border-natural-border/60">Vegan</span>}
                          {dish.allergens.vegetarian && !dish.allergens.vegan && <span className="text-[8px] bg-natural-bg/50 text-natural-primary font-bold px-1.5 py-0.5 rounded border border-natural-border/40 uppercase font-mono">Veg</span>}
                          {dish.allergens.glutenFree && <span className="text-[8px] bg-natural-bg text-natural-muted font-bold px-1.5 py-0.5 rounded border border-natural-border/50 uppercase font-sans">GF</span>}
                          {dish.customization?.options && <span className="text-[8px] bg-[#FDFCF9] text-natural-muted border border-natural-border/30 text-[8px] font-medium px-1.5 py-0.5 rounded font-mono">Customizable</span>}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'cart' && (
            <motion.div
              key="cart-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <h2 className="text-sm font-serif font-bold text-[#4A4A30] tracking-tight">{t.cart}</h2>

              {cart.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-natural-border text-natural-muted font-sans text-xs flex flex-col items-center gap-2">
                  <ShoppingBag className="w-8 h-8 text-natural-muted stroke-1" />
                  <p>{t.emptyCart}</p>
                  <button 
                    onClick={() => setActiveTab('menu')}
                    className="mt-2 text-xs font-serif font-bold text-natural-primary hover:underline"
                  >
                    Browse Delicious Menu
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-2">
                    {cart.map((item) => {
                      const itemOptionsTotal = item.selectedOptions.reduce((acc, o) => acc + o.price, 0);
                      const unitPrice = item.dish.price + itemOptionsTotal;
                      return (
                        <div key={item.id} className="bg-white rounded-2xl p-3 border border-natural-border flex justify-between gap-2 shadow-xs">
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between">
                              <h4 className="text-xs font-serif font-bold text-natural-text">{item.dish.name[language]}</h4>
                              <span className="text-xs font-serif font-bold text-natural-primary">
                                {t.currencySymbol}{(unitPrice * item.quantity).toFixed(2)}
                              </span>
                            </div>

                            {/* Customs */}
                            <div className="text-[10px] text-natural-muted space-y-0.5 font-sans leading-normal">
                              {item.selectedSpice && (
                                <p className="text-[#B35446] flex items-center gap-1 font-semibold">
                                  🌶️ Spicy: {t.spiceLevels[item.selectedSpice].split(' - ')[0]}
                                </p>
                              )}
                              {item.selectedOptions.length > 0 && (
                                <p className="text-natural-primary font-serif font-bold">
                                  + {item.selectedOptions.map(o => o.name[language]).join(', ')}
                                </p>
                              )}
                              {item.notes && (
                                <p className="italic text-natural-muted flex items-center gap-1 bg-natural-bg/40 p-1.5 rounded mt-1 border border-natural-border/40">
                                  <MessageSquare className="w-2.5 h-2.5 shrink-0" />
                                  "{item.notes}"
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Quantities selector */}
                          <div className="flex flex-col justify-between items-end pl-2 border-l border-natural-border/30">
                            <span className="text-[10px] text-natural-muted font-mono">Qty</span>
                            <div className="flex items-center gap-2 bg-natural-bg rounded-lg p-1 mt-1">
                              <button
                                onClick={() => modifyCartQuantity(item.id, -1)}
                                className="w-5 h-5 bg-white text-natural-text hover:bg-natural-light flex items-center justify-center font-bold text-xs rounded shadow-xs active:bg-natural-bg"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold text-natural-text font-mono min-w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => modifyCartQuantity(item.id, 1)}
                                className="w-5 h-5 bg-white text-natural-text hover:bg-natural-light flex items-center justify-center font-bold text-xs rounded shadow-xs active:bg-natural-bg"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Checkout instructions */}
                  <div className="bg-white rounded-2xl p-3.5 border border-natural-border space-y-2">
                    <label className="text-[10px] font-bold text-[#5A5A40] block uppercase tracking-wider font-serif">{t.specialInstructions}</label>
                    <textarea
                      value={checkoutNotes}
                      onChange={(e) => setCheckoutNotes(e.target.value)}
                      placeholder={t.instructionsPlaceholder}
                      className="w-full bg-natural-bg/30 border border-natural-border rounded-xl p-2.5 text-xs text-natural-text outline-none focus:ring-1 focus:ring-natural-primary min-h-16 font-sans resize-none"
                    />
                  </div>

                  {/* Pricing Overview */}
                  <div className="bg-natural-bg/50 rounded-2xl p-4 space-y-2 border border-natural-border">
                    <div className="flex justify-between items-center text-xs text-natural-muted font-serif font-bold uppercase tracking-wider">
                      <span>Subtotal</span>
                      <span className="font-mono">{t.currencySymbol}{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-natural-muted font-serif font-bold uppercase tracking-wider">
                      <span>Table Tax & Service fee</span>
                      <span className="text-[#8C8C70] font-mono">Complimentary</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-natural-border">
                      <span className="text-xs font-serif font-bold text-natural-text uppercase tracking-tight">{t.total}</span>
                      <span className="text-lg font-serif font-black text-natural-primary">{t.currencySymbol}{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSendOrder}
                    className="w-full cursor-pointer bg-natural-primary hover:bg-natural-primary-hover text-white font-serif font-bold text-xs py-3.5 rounded-xl shadow-xs transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {t.placeOrder}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'status' && (
            <motion.div
              key="status-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <h2 className="text-sm font-serif font-bold text-natural-primary tracking-tight">{t.orderHistory}</h2>

              {tableOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-natural-border text-natural-muted font-sans text-xs flex flex-col items-center gap-2">
                  <Clock className="w-8 h-8 text-natural-muted stroke-1" />
                  <p>No orders placed yet for {tableData.name.split(' - ')[0]}. Place an order to see its live cook status here.</p>
                </div>
              ) : (
                <div className="space-y-3" id="cooking-order-status-list">
                  {tableOrders.slice().reverse().map((order) => {
                    const orderStatusColors = {
                      pending: 'bg-amber-50 text-amber-900 border-amber-200',
                      preparing: 'bg-orange-50 text-orange-950 border-orange-200',
                      served: 'bg-green-50 text-green-900 border-green-200',
                      completed: 'bg-natural-bg text-[#5A5A40] border-natural-border',
                      cancelled: 'bg-rose-50 text-rose-900 border-rose-200'
                    };
                    const isStillCooking = order.status === 'pending' || order.status === 'preparing';

                    return (
                      <div key={order.id} className="bg-white rounded-2xl p-3.5 border border-natural-border space-y-3 shadow-xs">
                        {/* Header Status */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-mono font-bold text-[#8C8C70]">ORDER #{order.id.slice(-6).toUpperCase()}</span>
                            <div className="text-[10px] text-natural-muted mt-0.5">
                              {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            {isStillCooking && <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>}
                            <span className={`text-[10px] font-serif font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${orderStatusColors[order.status]}`}>
                              {t.orderStatuses[order.status]}
                            </span>
                          </div>
                        </div>

                        {/* Order Items list */}
                        <div className="bg-natural-bg/40 rounded-xl p-2.5 divide-y divide-natural-border/30 text-xs font-sans text-natural-text">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="py-1.5 flex justify-between gap-1 first:pt-0 last:pb-0">
                              <span className="font-serif font-semibold text-natural-text">
                                {it.quantity}x {it.dishName}
                                {it.selectedSpice && <span className="text-[9px] block text-[#B35446] font-bold">🌶️ {it.selectedSpice}</span>}
                                {it.selectedOptions && it.selectedOptions.length > 0 && (
                                  <span className="text-[9px] block text-natural-primary font-bold">+ {it.selectedOptions.join(', ')}</span>
                                )}
                              </span>
                              <span className="font-serif font-bold text-[#5A5A40]">{t.currencySymbol}{(it.price * it.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center text-xs font-serif font-bold pt-1">
                          <span className="text-[#5A5A40]">Total Billed</span>
                          <span className="font-serif font-bold text-natural-primary text-sm">{t.currencySymbol}{order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
          </>
        )}
      </div>

      {/* Cart Quick Drawer Footer Bar */}
      {confirmedTableId === currentTableId && cart.length > 0 && activeTab !== 'cart' && (
        <div className="absolute bottom-0 inset-x-0 bg-white border-t border-natural-border px-4 py-3 flex justify-between items-center z-10 shadow-lg shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-natural-primary text-white p-2 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] text-natural-muted font-mono uppercase tracking-wider">{t.cart}</p>
              <p className="text-xs font-serif font-bold text-natural-text">
                {cart.reduce((s, i) => s + i.quantity, 0)} Items • <span className="text-natural-primary font-serif font-bold">{t.currencySymbol}{cartTotal.toFixed(2)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('cart')}
            className="bg-natural-primary hover:bg-natural-primary-hover text-white font-serif font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-1 uppercase tracking-wider"
          >
            Review Cart
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dish Detailed Customization Drawer */}
      <AnimatePresence>
        {selectedDish && (
          <div className="absolute inset-0 bg-[#2D2D2A]/60 backdrop-blur-xs z-50 flex flex-col justify-end">
            {/* Background tap-to-dismiss */}
            <div className="absolute inset-0" onClick={() => setSelectedDish(null)} />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-white rounded-t-3xl overflow-hidden max-h-[85%] flex flex-col shadow-2xl relative z-10 border-t border-natural-border"
            >
              {/* Header */}
              <div className="px-5 py-3 border-b border-natural-border flex justify-between items-center bg-natural-light sticky top-0">
                <span className="text-[10px] font-serif font-bold tracking-widest text-[#5A5A40] uppercase">Customization</span>
                <button
                  onClick={() => setSelectedDish(null)}
                  className="bg-natural-bg hover:bg-natural-border text-natural-text p-1.5 rounded-full transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content */}
              <div className="overflow-y-auto px-5 py-4 space-y-4 flex-1 bg-natural-light/20">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-natural-bg border border-natural-border shrink-0">
                    <img 
                      src={selectedDish.imageUrl} 
                      alt={selectedDish.name[language]} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-bold text-natural-text leading-snug">{selectedDish.name[language]}</h3>
                    <p className="text-sm font-serif font-bold text-natural-primary mt-1">{t.currencySymbol}{selectedDish.price.toFixed(2)}</p>
                    <p className="text-[10px] text-natural-muted leading-relaxed font-sans mt-1.5">{selectedDish.description[language]}</p>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedDish.allergens.vegetarian && <span className="text-[8px] bg-natural-bg text-[#5A5A40] font-bold px-1.5 py-0.5 rounded border border-natural-border/50 uppercase font-mono">Veg</span>}
                      {selectedDish.allergens.glutenFree && <span className="text-[8px] bg-natural-bg text-[#5A5A40] font-bold px-1.5 py-0.5 rounded border border-natural-border/50 uppercase font-sans">GF</span>}
                      {selectedDish.allergens.spicy && <span className="text-[8px] bg-[#B35446]/10 text-[#B35446] font-bold px-1.5 py-0.5 rounded border border-[#B35446]/20 uppercase font-sans">Spicy 🌶️</span>}
                    </div>
                  </div>
                </div>

                {/* Spiciness Level Option */}
                {selectedDish.customization?.hasSpiceLevel && (
                  <div className="border border-natural-border bg-white rounded-2xl p-3.5 space-y-2 shadow-xs">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-serif font-bold text-natural-text flex items-center gap-1 uppercase tracking-wider">
                        <Flame className="w-3.5 h-3.5 text-[#B35446]" />
                        {t.spiceLevel}
                      </label>
                      <span className="text-[8px] bg-natural-primary text-white px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">Required</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {(['mild', 'medium', 'hot', 'extra-hot'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setSpiceLevel(level)}
                          type="button"
                          className={`py-2 text-[10px] font-serif font-bold rounded-xl text-center border capitalize transition-all ${
                            spiceLevel === level
                              ? 'bg-natural-primary text-white border-natural-primary'
                              : 'bg-white text-natural-text border-natural-border hover:bg-natural-bg/35'
                          }`}
                        >
                          {level.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-[#8C8C70] italic mt-1 leading-normal font-sans">
                      {t.spiceLevels[spiceLevel]}
                    </p>
                  </div>
                )}

                {/* Upgrades Option list */}
                {selectedDish.customization?.options && selectedDish.customization.options.length > 0 && (
                  <div className="border border-natural-border bg-white rounded-2xl p-3.5 space-y-2 shadow-xs">
                    <label className="text-xs font-serif font-bold text-natural-text block uppercase tracking-wider">{t.options}</label>
                    <div className="space-y-1.5">
                      {selectedDish.customization.options.map((opt) => {
                        const isChecked = selectedOptions.find(o => o.id === opt.id);
                        return (
                          <div
                            key={opt.id}
                            onClick={() => toggleOption(opt)}
                            className={`flex justify-between items-center p-2.5 rounded-xl border cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-natural-primary/5 border-natural-primary'
                                : 'bg-white border-natural-border hover:border-natural-muted'
                            }`}
                          >
                            <span className="text-xs font-serif font-bold text-natural-text flex items-center gap-2">
                              {isChecked ? (
                                <span className="w-4 h-4 bg-natural-primary text-white rounded flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 stroke-3" />
                                </span>
                              ) : (
                                <span className="w-4 h-4 rounded border border-natural-border bg-white" />
                              )}
                              {opt.name[language]}
                            </span>
                            <span className="text-xs font-serif font-bold text-natural-primary">+{t.currencySymbol}{opt.price.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Individual item cooking notes */}
                <div className="border border-natural-border bg-white rounded-2xl p-3.5 space-y-2 shadow-xs">
                  <label className="text-xs font-serif font-bold text-natural-text block uppercase tracking-wider">{t.specialInstructions}</label>
                  <input
                    type="text"
                    placeholder={t.instructionsPlaceholder}
                    value={itemNotes}
                    onChange={(e) => setItemNotes(e.target.value)}
                    className="w-full bg-white border border-natural-border rounded-xl p-2.5 text-xs text-natural-text outline-none focus:ring-1 focus:ring-natural-primary font-sans"
                  />
                </div>

                {/* Item Quantity control */}
                <div className="flex justify-between items-center py-2 border-t border-natural-border/30">
                  <span className="text-xs font-serif font-bold text-natural-text uppercase tracking-wider">Quantity</span>
                  <div className="flex items-center gap-3 bg-natural-bg p-1.5 rounded-xl border border-natural-border">
                    <button
                      onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                      className="w-7 h-7 bg-white text-natural-text flex items-center justify-center font-bold text-sm rounded shadow-xs active:bg-natural-bg"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold font-mono text-natural-text min-w-4 text-center">{itemQuantity}</span>
                    <button
                      onClick={() => setItemQuantity(itemQuantity + 1)}
                      className="w-7 h-7 bg-white text-natural-text flex items-center justify-center font-bold text-sm rounded shadow-xs active:bg-natural-bg"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>

              {/* Action Floating Footer for Modal */}
              <div className="p-4 border-t border-natural-border bg-white shadow-xs">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full cursor-pointer bg-natural-primary hover:bg-natural-primary-hover text-white font-serif font-bold text-xs py-3.5 rounded-xl shadow-xs transition-all uppercase tracking-widest flex justify-between px-5 items-center animate-fade-in"
                >
                  <span>{t.addToCart}</span>
                  <span className="font-serif text-xs font-bold tracking-wider">
                    {t.currencySymbol}{currentItemTotalPrice.toFixed(2)}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Sent Order Splash Modal Overlay */}
      <AnimatePresence>
        {orderCompleteShow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#2D2D2A]/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-50 text-white"
          >
            <motion.div
              initial={{ scale: 0.8, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 15 }}
              className="space-y-4"
            >
              <div className="mx-auto w-16 h-16 bg-natural-primary text-white rounded-full flex items-center justify-center animate-bounce border border-white/20">
                <Check className="w-8 h-8 stroke-3" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold tracking-tight">{t.orderSent}</h3>
                <p className="text-[11px] text-[#F9F6F0]/80 font-sans tracking-wide leading-relaxed px-4">
                  {t.orderSentDesc}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 inline-block text-xs font-serif font-bold">
                {t.table}: <span className="underline">{tableData.name.split(' - ')[0]}</span>
              </div>

              <div>
                <button
                  onClick={() => setOrderCompleteShow(false)}
                  className="cursor-pointer bg-white text-natural-primary font-serif font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-natural-light shadow-lg active:scale-95 transition-all uppercase tracking-widest"
                >
                  Dismiss & Track Status
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
