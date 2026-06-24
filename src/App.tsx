/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import CustomerPortal from "./components/CustomerPortal";
import AdminPortal from "./components/AdminPortal";
import SupportChat from "./components/SupportChat";
import DeviceFrame from "./components/DeviceFrame";
import { Product } from "./types";

export default function App() {
  // Global States
  const [currentLang, setLang] = useState<"en" | "ar">("ar"); // Arabic is primary language!
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [activePortal, setActivePortal] = useState<"customer" | "admin">("customer");
  
  // Persistent products list
  const [products, setProducts] = useState<Product[]>([]);

  // Cart & Wishlist states with automatic localStorage synchronization
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(() => {
    const saved = localStorage.getItem("minga_cart");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem("minga_wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  // UI draw state
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showWishlistDrawer, setShowWishlistDrawer] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Stepper order tracking state
  const [trackedNumber, setTrackedNumber] = useState("");

  // Sync cart & wishlist to localStorage
  useEffect(() => {
    localStorage.setItem("minga_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("minga_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Handle dark mode theme classes
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Fetch products from server-side database
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Deep search query execution
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Navigations tracker
  const handleNavigate = (view: string) => {
    if (view === "home") {
      setSearchQuery("");
    }
  };

  const handleNavigateToTracking = (trackingNum: string) => {
    setTrackedNumber(trackingNum);
  };

  return (
    <DeviceFrame currentLang={currentLang}>
      <div className="flex flex-col flex-1 h-full min-h-screen bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 transition-colors duration-300">
        
        {/* Navigation Navbar */}
        <Header
          cartCount={totalCartItems}
          wishlistCount={wishlist.length}
          currentLang={currentLang}
          setLang={setLang}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          activePortal={activePortal}
          setActivePortal={setActivePortal}
          openCart={() => setShowCartDrawer(true)}
          openWishlist={() => setShowWishlistDrawer(true)}
          onSearch={handleSearch}
          onNavigate={handleNavigate}
        />

        {/* Portals view routers */}
        <main className="flex-1 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
          {activePortal === "customer" ? (
            <CustomerPortal
              products={products}
              currentLang={currentLang}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              cart={cart}
              setCart={setCart}
              wishlist={wishlist}
              setWishlist={setWishlist}
              showCartDrawer={showCartDrawer}
              setShowCartDrawer={setShowCartDrawer}
              showWishlistDrawer={showWishlistDrawer}
              setShowWishlistDrawer={setShowWishlistDrawer}
              onNavigateToTracking={handleNavigateToTracking}
              trackedNumber={trackedNumber}
              setTrackedNumber={setTrackedNumber}
            />
          ) : (
            <AdminPortal
              currentLang={currentLang}
              products={products}
              onRefreshProducts={fetchProducts}
            />
          )}
        </main>

        {/* AI Support Chatbot */}
        <SupportChat currentLang={currentLang} />

      </div>
    </DeviceFrame>
  );
}
