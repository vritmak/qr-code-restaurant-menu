/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'es' | 'ja' | 'fr';

export type Category = 'starters' | 'mains' | 'desserts' | 'drinks';

export interface Dish {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  price: number;
  category: Category;
  imageUrl: string;
  isAvailable: boolean;
  allergens: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    spicy: boolean;
    nuts: boolean;
  };
  customization?: {
    hasSpiceLevel?: boolean;
    options?: {
      id: string;
      name: Record<Language, string>;
      price: number;
    }[];
  };
}

export interface CartItem {
  id: string; // Unique Cart Entry ID (composite of dish ID and options)
  dish: Dish;
  quantity: number;
  selectedSpice?: 'mild' | 'medium' | 'hot' | 'extra-hot';
  selectedOptions: {
    id: string;
    name: Record<Language, string>;
    price: number;
  }[];
  notes?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'served' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  tableId: string;
  items: {
    dishId: string;
    dishName: string;
    quantity: number;
    price: number;
    selectedSpice?: string;
    selectedOptions: string[];
    notes?: string;
  }[];
  status: OrderStatus;
  timestamp: number;
  total: number;
  notes?: string;
}

export interface TranslationDict {
  appName: string;
  scanPrompt: string;
  scanInstructions: string;
  table: string;
  tableSelect: string;
  categories: Record<Category, string>;
  addToCart: string;
  cart: string;
  emptyCart: string;
  total: string;
  placeOrder: string;
  orderSent: string;
  orderSentDesc: string;
  soldOut: string;
  unavailable: string;
  spiceLevel: string;
  spiceLevels: Record<string, string>;
  options: string;
  specialInstructions: string;
  instructionsPlaceholder: string;
  backToMenu: string;
  orderHistory: string;
  orderStatus: string;
  orderStatuses: Record<OrderStatus, string>;
  vegetarian: string;
  vegan: string;
  glutenFree: string;
  spicy: string;
  nuts: string;
  filters: string;
  all: string;
  popularDishes: string;
  currencySymbol: string;
  confirmTableTitle: string;
  confirmTableDesc: string;
  confirmTableButton: string;
  enterTablePlaceholder: string;
  adminPanel: string;
  customerPanel: string;
}
