/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Laptop, Sparkles, QrCode, HelpCircle, 
  RefreshCw, Bell, Info, Wifi, Battery, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Dish, Order, Language, OrderStatus, CartItem } from './types';
import { INITIAL_DISHES, AVAILABLE_TABLES, TRANSLATIONS } from './data';
import CustomerPanel from './components/CustomerPanel';
import AdminPanel from './components/AdminPanel';

// Key for storage persistence
const DISH_STORAGE_KEY = 'qr_menu_dishes_v1';
const ORDER_STORAGE_KEY = 'qr_menu_orders_v1';

export default function App() {
  // Parsing the table parameter from URL to allow physical scan routing
  const [currentTableId, setCurrentTableId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('table') || '3'; // Defaults to Table 3 - Cozy Corner
  });

  // Track if scanned via actual external QR
  const [scannedViaUrl, setScannedViaUrl] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('table')) {
      setScannedViaUrl(true);
    }
  }, []);

  // Shared React States
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [triggerSoundAlert, setTriggerSoundAlert] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load from local storage or seed initial dummy data
  useEffect(() => {
    const savedDishes = localStorage.getItem(DISH_STORAGE_KEY);
    if (savedDishes) {
      try {
        setDishes(JSON.parse(savedDishes));
      } catch (e) {
        setDishes(INITIAL_DISHES);
      }
    } else {
      setDishes(INITIAL_DISHES);
    }

    const savedOrders = localStorage.getItem(ORDER_STORAGE_KEY);
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) {
        seedInitialOrders();
      }
    } else {
      seedInitialOrders();
    }
  }, []);

  // Seed baseline simulated orders for stats on first boot
  const seedInitialOrders = () => {
    const baseOrders: Order[] = [
      {
        id: `ord-seed-1`,
        tableId: '1',
        items: [
          {
            dishId: 'starter-1',
            dishName: INITIAL_DISHES[0].name.en,
            quantity: 2,
            price: INITIAL_DISHES[0].price,
            selectedOptions: []
          },
          {
            dishId: 'drink-1',
            dishName: INITIAL_DISHES[5].name.en,
            quantity: 1,
            price: INITIAL_DISHES[5].price,
            selectedOptions: []
          }
        ],
        status: 'completed',
        timestamp: Date.now() - 3600000 * 2, // 2 hours ago
        total: (INITIAL_DISHES[0].price * 2) + INITIAL_DISHES[5].price,
        notes: 'Dressing on the side, please.'
      },
      {
        id: `ord-seed-2`,
        tableId: '2',
        items: [
          {
            dishId: 'main-1',
            dishName: INITIAL_DISHES[2].name.en,
            quantity: 1,
            price: INITIAL_DISHES[2].price,
            selectedOptions: ['Add Crispy Bacon']
          }
        ],
        status: 'preparing',
        timestamp: Date.now() - 900000, // 15 mins ago
        total: INITIAL_DISHES[2].price + 2.50,
        notes: 'Medium rare cook temperature.'
      }
    ];
    setOrders(baseOrders);
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(baseOrders));
  };

  // Helper helper persistence save
  const saveDishesToStorage = (updatedDishes: Dish[]) => {
    setDishes(updatedDishes);
    localStorage.setItem(DISH_STORAGE_KEY, JSON.stringify(updatedDishes));
  };

  const saveOrdersToStorage = (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(updatedOrders));
  };

  // Custom Toast Notifier
  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Dish Management Handler delegates
  const handleAddDish = (dish: Dish) => {
    const updated = [...dishes, dish];
    saveDishesToStorage(updated);
    showNotification(`New dish "${dish.name.en}" deployed to digital menus!`);
  };

  const handleUpdateDishPrice = (id: string, price: number) => {
    const updated = dishes.map(d => d.id === id ? { ...d, price: Math.max(0, price) } : d);
    saveDishesToStorage(updated);
  };

  const handleToggleDishAvailability = (id: string) => {
    const target = dishes.find(d => d.id === id);
    if (!target) return;
    const updated = dishes.map(d => d.id === id ? { ...d, isAvailable: !d.isAvailable } : d);
    saveDishesToStorage(updated);
    showNotification(`"${target.name.en}" is now marked ${!target.isAvailable ? 'In Stock' : 'Sold Out'}!`);
  };

  const handleDeleteDish = (id: string) => {
    const target = dishes.find(d => d.id === id);
    if (!target) return;
    const updated = dishes.filter(d => d.id !== id);
    saveDishesToStorage(updated);
    showNotification(`Archived "${target.name.en}" from active databases.`);
  };

  // Order Flow operations
  const handlePlaceOrder = (cartItems: CartItem[], userNotes: string) => {
    const compiledItems = cartItems.map(item => {
      const optionsTotal = item.selectedOptions.reduce((s, o) => s + o.price, 0);
      return {
        dishId: item.dish.id,
        dishName: item.dish.name[language],
        quantity: item.quantity,
        price: item.dish.price + optionsTotal,
        selectedSpice: item.selectedSpice,
        selectedOptions: item.selectedOptions.map(o => o.name[language]),
        notes: item.notes
      };
    });

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      tableId: currentTableId,
      items: compiledItems,
      status: 'pending',
      timestamp: Date.now(),
      total: cartItems.reduce((acc, item) => {
        const itemOptionsTotal = item.selectedOptions.reduce((s, o) => s + o.price, 0);
        return acc + (item.dish.price + itemOptionsTotal) * item.quantity;
      }, 0),
      notes: userNotes || undefined
    };

    const updated = [...orders, newOrder];
    saveOrdersToStorage(updated);
    
    // Play sound simulation and banner
    setTriggerSoundAlert(true);
    setTimeout(() => setTriggerSoundAlert(false), 2000);
    
    const tableNum = AVAILABLE_TABLES.find(t => t.id === currentTableId)?.name.split(' - ')[0] || `Table ${currentTableId}`;
    showNotification(`🔔 Kitchen Chime: New order transmitted from ${tableNum}!`);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    const target = orders.find(o => o.id === orderId);
    if (!target) return;
    
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    saveOrdersToStorage(updated);

    const tableNum = AVAILABLE_TABLES.find(t => t.id === target.tableId)?.name.split(' - ')[0] || `Table ${target.tableId}`;
    showNotification(`Kitchen update: Service status of ${tableNum} set to "${status.toUpperCase()}"`);
  };

  const handleResetSimulator = () => {
    localStorage.removeItem(DISH_STORAGE_KEY);
    localStorage.removeItem(ORDER_STORAGE_KEY);
    setDishes(INITIAL_DISHES);
    seedInitialOrders();
    showNotification("Simulator databases wiped and seeded cleanly.");
  };

  const handleTableChange = (tableId: string) => {
    setCurrentTableId(tableId);
    // Dynamically push the URL state without forcing complete page reloads
    const newUrl = `${window.location.pathname}?table=${tableId}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text flex flex-col font-sans relative overflow-x-hidden selection:bg-natural-primary selection:text-white">
      
      {/* Decorative earthy subtle blurs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-natural-accent/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-natural-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Banner and System controls */}
      <header className="bg-white border-b border-natural-border px-6 py-4 sticky top-0 z-40 shadow-xs backdrop-blur-md bg-opacity-95" id="app-header-strip">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative bg-natural-primary p-2.5 rounded-2xl text-white shadow-xs">
              <QrCode className="w-6 h-6 stroke-2" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest font-black text-natural-primary/80 uppercase">RestoSync Digital Workspace</span>
              <h1 className="text-xl font-bold text-natural-primary font-serif tracking-tight flex items-center gap-1.5 leading-none mt-1">
                RestoSync QR Simulator
                <span className="bg-natural-accent text-[#5A5A40] text-[9px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-widest border border-natural-border">Admin</span>
              </h1>
            </div>
          </div>

          {/* Quick Stats Helper */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {scannedViaUrl && (
              <div className="bg-white border border-natural-primary text-natural-primary px-3 py-1 rounded-full font-serif font-semibold italic flex items-center gap-1.5 animate-bounce shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-natural-primary" />
                Table scan detected in real time!
              </div>
            )}
            <button
              onClick={handleResetSimulator}
              className="bg-white hover:bg-natural-bg text-natural-primary font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs border border-natural-border active:scale-95"
              id="wipe-sim-btn"
            >
              <RefreshCw className="w-3.5 h-3.5 text-natural-primary" />
              Wipe & Reset Demo Seed
            </button>
            <div className="bg-white px-3.5 py-2 rounded-xl border border-natural-border text-natural-muted font-mono tracking-wide">
              {AVAILABLE_TABLES.length} Live Tables Syncing
            </div>
          </div>
        </div>
      </header>

      {/* Primary Workspace Panel Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative pb-16">
        
        {/* LEFT COLUMN: Customer Phone View Mockup (5 Cols) */}
        <section className="lg:col-span-5 h-[760px] flex flex-col items-center">
          <div className="w-full text-center mb-2">
            <h3 className="text-sm font-bold text-[#5A5A40] uppercase tracking-widest font-serif italic flex items-center justify-center gap-1.5">
              <Smartphone className="w-4 h-4 text-natural-primary" />
              Customer Smartphone view
            </h3>
            <p className="text-xs text-natural-muted font-sans mt-0.5">Mockup representing tableside diner experience</p>
          </div>

          {/* Premium Physical Phone Frame with anthracite Natural Tone border */}
          <div className="w-full max-w-[370px] h-full rounded-[45px] bg-[#2D2D2A] p-3 shadow-2xl relative border-4 border-[#2D2D2A] ring-2 ring-natural-border/40 overflow-hidden flex flex-col">
            
            {/* Phone Top Notch speaker and camera element */}
            <div className="absolute top-0 inset-x-0 h-6 bg-[#2D2D2A] z-40 flex justify-center items-center">
              <div className="w-24 h-4 bg-black rounded-b-2xl flex items-center justify-between px-3">
                <div className="w-1 h-1 bg-neutral-850 rounded-full" />
                <div className="w-8 h-1 bg-[#2D2D2A] rounded-full" />
                <div className="w-1 h-1 bg-neutral-900 rounded-full" />
              </div>
            </div>

            {/* Mobile Status Bar helper inside the app screen */}
            <div className="bg-natural-primary text-white text-[10px] px-5 pt-4 pb-1.5 flex justify-between items-center font-semibold font-mono z-20 shrink-0 select-none">
              <span>9:41 AM</span>
              <div className="flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                <span className="text-[9px]">5G</span>
                <Battery className="w-3.5 h-3.5 text-white/90 fill-white/95" />
              </div>
            </div>

            {/* Actual smartphone panel workspace */}
            <div className="flex-1 overflow-hidden rounded-b-[28px] relative bg-natural-light">
              <CustomerPanel
                dishes={dishes}
                currentTableId={currentTableId}
                onTableChange={handleTableChange}
                orders={orders}
                onPlaceOrder={handlePlaceOrder}
                language={language}
                onLanguageChange={setLanguage}
              />
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Kitchen Workspace Desk (7 Cols) */}
        <section className="lg:col-span-7 h-[760px] flex flex-col">
          <div className="mb-2 pl-2">
            <h3 className="text-sm font-bold text-[#5A5A40] uppercase tracking-widest font-serif italic flex items-center gap-1.5 justify-start">
              <Laptop className="w-4 h-4 text-natural-primary" />
              Management Operations Console
            </h3>
            <p className="text-xs text-natural-muted font-sans mt-0.5 font-normal">Real-time control hub for orders, dishes, and QR generation</p>
          </div>

          <div className="flex-1 bg-white rounded-[30px] overflow-hidden shadow-sm border border-natural-border">
            <AdminPanel
              dishes={dishes}
              onAddDish={handleAddDish}
              onUpdateDishPrice={handleUpdateDishPrice}
              onToggleDishAvailability={handleToggleDishAvailability}
              onDeleteDish={handleDeleteDish}
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              currentTableId={currentTableId}
              onTableSelect={handleTableChange}
            />
          </div>
        </section>

      </main>

      {/* Floating System-wide chimes & Toast alerts bar */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm bg-white border border-natural-border text-natural-text rounded-2xl px-4 py-3.5 flex gap-3 shadow-2xl items-center"
            id="toast-dialog"
          >
            <div className="bg-natural-primary p-2 rounded-xl text-white shrink-0 animate-bounce">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <span className="font-bold block text-natural-primary uppercase tracking-wider text-[10px] font-mono mb-0.5">System Transmission</span>
              <p className="font-sans leading-normal font-semibold text-natural-text">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global simulated thermal order pager audio bell indicator (Visual chime flash) */}
      <AnimatePresence>
        {triggerSoundAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center bg-natural-primary/10 border-8 border-natural-primary/40 animate-pulse"
          >
            <div className="bg-white/95 text-natural-primary font-black font-serif italic text-xs px-6 py-3 rounded-full border-2 border-natural-primary flex items-center gap-2 shadow-2xl">
              <Sparkles className="w-4 h-4 text-natural-primary animate-spin" />
              KITCHEN CHIME ACTIVATED - ORDER RECEIVED
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
