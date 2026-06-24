/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Bell, 
  Search, 
  Settings, 
  ChevronDown, 
  Sun, 
  Moon, 
  Globe, 
  Menu,
  X,
  Sparkles,
  PackageCheck
} from "lucide-react";
import { AppNotification } from "../types";

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  currentLang: "en" | "ar";
  setLang: (lang: "en" | "ar") => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  activePortal: "customer" | "admin";
  setActivePortal: (portal: "customer" | "admin") => void;
  openCart: () => void;
  openWishlist: () => void;
  onSearch: (query: string) => void;
  onNavigate: (view: string) => void;
}

export default function Header({
  cartCount,
  wishlistCount,
  currentLang,
  setLang,
  isDarkMode,
  toggleDarkMode,
  activePortal,
  setActivePortal,
  openCart,
  openWishlist,
  onSearch,
  onNavigate
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch server notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 8 seconds to show live updates when admin acts
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    onNavigate("shop");
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await fetch("/api/notifications/read", { method: "POST" });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const isAr = currentLang === "ar";

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 transition-colors shadow-sm">
      {/* Top micro bar for Algerian provinces & support info */}
      <div className="bg-amber-500 dark:bg-amber-600 text-white py-1.5 px-4 text-xs font-medium tracking-wide">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold animate-pulse">COD</span>
            <span className={isAr ? "font-sans text-right" : "font-sans text-left"}>
              {isAr 
                ? "🇩🇿 التوصيل متوفر لكافة الولايات الـ 58! الدفع عند الاستلام متوفر دائماً" 
                : "🇩🇿 Nationwide shipping to all 58 Wilayas! Cash on Delivery available"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setLang(isAr ? "en" : "ar"); }}
              className="flex items-center gap-1 hover:text-neutral-100 transition"
              id="header-lang-btn"
            >
              <Globe size={13} />
              <span>{isAr ? "English" : "العربية"}</span>
            </button>
            <span className="opacity-60">|</span>
            <span>{isAr ? "الدعم: 0555-Minga" : "Support: 0555-Minga"}</span>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("home")} id="brand-logo-container">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center">
            <ShoppingBag size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white font-sans">
              Minga<span className="text-indigo-600">.com</span>
            </span>
            <div className="text-[9px] text-neutral-400 dark:text-neutral-500 font-mono tracking-widest uppercase -mt-1 font-bold">
              {isAr ? "متجر جزائري متكامل" : "Algeria's Store"}
            </div>
          </div>
        </div>

        {/* Dynamic Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg relative" id="header-search-form">
          <input
            type="text"
            placeholder={isAr ? "ابحث عن منتجات، عطور، أجهزة إلكترونية..." : "Search for perfume, electronics, traditional date..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-11 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-neutral-800 dark:text-neutral-200"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            id="search-btn-submit"
          >
            <Search size={18} />
          </button>
        </form>

        {/* Utility Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Portal Switch (Customer vs Admin) */}
          <div className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold shadow-inner">
            <button
              onClick={() => setActivePortal("customer")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activePortal === "customer"
                  ? "bg-white dark:bg-neutral-700 text-indigo-600 dark:text-white shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
              }`}
              id="switch-customer-portal"
            >
              {isAr ? "المتجر" : "Store"}
            </button>
            <button
              onClick={() => setActivePortal("admin")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                activePortal === "admin"
                  ? "bg-white dark:bg-neutral-700 text-indigo-600 dark:text-white shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
              }`}
              id="switch-admin-portal"
            >
              <Settings size={13} />
              <span>{isAr ? "لوحة التحكم" : "Admin"}</span>
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
            id="theme-toggle-btn"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Wishlist */}
          <button
            onClick={openWishlist}
            className="p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition relative"
            id="wishlist-btn-view"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) handleMarkNotificationsRead();
              }}
              className="p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition relative"
              id="notifications-toggle-btn"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                <div className="p-3 border-b border-neutral-100 dark:border-neutral-700 flex justify-between items-center bg-neutral-50 dark:bg-neutral-800/50">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    {isAr ? "الإشعارات الترويجية والطلبات" : "Store Notifications"}
                  </span>
                  <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                    {notifications.length} {isAr ? "إجمالي" : "total"}
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-neutral-50 dark:divide-neutral-700/60">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-400">
                      {isAr ? "لا توجد إشعارات حالياً" : "No notifications yet"}
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`p-3.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700/40 transition-colors ${
                          !notif.read ? "bg-indigo-50/20 dark:bg-indigo-950/10" : ""
                        }`}
                      >
                        <div className="flex gap-2 items-start">
                          <div className={`p-1.5 rounded-lg mt-0.5 ${
                            notif.type === "order" 
                              ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600" 
                              : notif.type === "promotion"
                              ? "bg-amber-50 dark:bg-amber-950 text-amber-500"
                              : "bg-indigo-50 dark:bg-indigo-950 text-indigo-600"
                          }`}>
                            <PackageCheck size={14} />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-neutral-900 dark:text-white">
                              {isAr ? notif.titleAr : notif.title}
                            </p>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                              {isAr ? notif.messageAr : notif.message}
                            </p>
                            <span className="text-[9px] text-neutral-400 mt-1.5 block font-mono">
                              {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Shopping Cart Trigger */}
          <button
            onClick={openCart}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3.5 rounded-xl shadow-md shadow-indigo-600/10 transition font-medium"
            id="cart-trigger-btn"
          >
            <ShoppingBag size={18} />
            <span className="text-xs hidden sm:inline font-bold">{isAr ? "السلة" : "Cart"}</span>
            <span className="bg-white/20 text-[11px] font-bold px-1.5 py-0.5 rounded-md min-w-4 text-center">
              {cartCount}
            </span>
          </button>

        </div>
      </div>
    </header>
  );
}
