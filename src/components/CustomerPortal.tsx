/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Heart, 
  Star, 
  ChevronRight, 
  ChevronLeft,
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  CheckCircle,
  MapPin,
  CreditCard,
  Search,
  MessageSquare,
  AlertCircle,
  X
} from "lucide-react";
import { Product, Review, OrderItem } from "../types";
import { ALGERIAN_WILAYAS } from "../data/products";

interface CustomerPortalProps {
  products: Product[];
  currentLang: "en" | "ar";
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  cart: { product: Product; quantity: number }[];
  setCart: React.Dispatch<React.SetStateAction<{ product: Product; quantity: number }[]>>;
  wishlist: Product[];
  setWishlist: React.Dispatch<React.SetStateAction<Product[]>>;
  showCartDrawer: boolean;
  setShowCartDrawer: (show: boolean) => void;
  showWishlistDrawer: boolean;
  setShowWishlistDrawer: (show: boolean) => void;
  onNavigateToTracking: (trackingNum: string) => void;
  trackedNumber: string;
  setTrackedNumber: (num: string) => void;
}

export default function CustomerPortal({
  products,
  currentLang,
  searchQuery,
  setSearchQuery,
  cart,
  setCart,
  wishlist,
  setWishlist,
  showCartDrawer,
  setShowCartDrawer,
  showWishlistDrawer,
  setShowWishlistDrawer,
  onNavigateToTracking,
  trackedNumber,
  setTrackedNumber
}: CustomerPortalProps) {
  
  // State
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState<number>(50000);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "shop" | "tracking">("home");
  
  // Checkout & order placement state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Edahabia" | "CCP" | "Bank">("COD");
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // Tracking query state
  const [trackQuery, setTrackQuery] = useState("");
  const [trackingResult, setTrackingResult] = useState<any | null>(null);
  const [trackError, setTrackError] = useState("");

  // Product reviews in modal
  const [modalReviews, setModalReviews] = useState<Review[]>([]);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");

  // Hero banner index
  const [heroIndex, setHeroIndex] = useState(0);

  const isAr = currentLang === "ar";

  const categories = [
    { id: "All", en: "All Products", ar: "جميع المنتجات" },
    { id: "Electronics", en: "Electronics", ar: "الإلكترونيات" },
    { id: "Beauty & Perfumes", en: "Beauty & Perfumes", ar: "الجمال والعطور" },
    { id: "Traditional Food", en: "Traditional Food", ar: "الأغذية التقليدية" },
    { id: "Home & Kitchen", en: "Home & Kitchen", ar: "المنزل والمطبخ" },
    { id: "Fashion & Clothes", en: "Fashion & Clothes", ar: "الأزياء والملابس" }
  ];

  const heroBanners = [
    {
      title: "Premium Oud Fragrances",
      titleAr: "عطور العود الجزائرية الفاخرة",
      desc: "Experience long-lasting authentic scents with secure cash on delivery.",
      descAr: "عطور شرقية ملكية تدوم طويلاً، مع خدمة الشحن والدفع عند الاستلام.",
      btnText: "Shop Perfumes",
      btnTextAr: "تسوق العطور الآن",
      img: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
      category: "Beauty & Perfumes"
    },
    {
      title: "Premium Dates from Tolga",
      titleAr: "تمور دقلة نور الممتازة من طولقة",
      desc: "Directly from Biskra's golden farms. Translucent, honey-sweet, 100% natural.",
      descAr: "مباشرة من مزارع طولقة الذهبية ببسكرة، تمور عسلية وطازجة 100%.",
      btnText: "Explore Dates",
      btnTextAr: "اكتشف التمور",
      img: "https://images.unsplash.com/photo-1566393028639-d108a42c46a7?w=800&q=80",
      category: "Traditional Food"
    },
    {
      title: "Nationwide Shipping to 58 Wilayas",
      titleAr: "التوصيل متوفر لكافة الولايات الـ 58",
      desc: "Rapid delivery, double quality check, and professional customer support.",
      descAr: "شحن سريع وآمن حتى باب منزلك مع فحص جودة المنتجات قبل الإرسال.",
      btnText: "Browse All",
      btnTextAr: "تصفح المنتجات",
      img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      category: "All"
    }
  ];

  // Auto scroll banners
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch reviews for specific product when opened
  useEffect(() => {
    if (selectedProduct) {
      fetch(`/api/reviews?productId=${selectedProduct.id}`)
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter((r: any) => r.productId === selectedProduct.id && r.approved);
          setModalReviews(filtered);
        })
        .catch(err => console.error("Error fetching reviews:", err));
    }
  }, [selectedProduct]);

  // Synchronize tracked number if navigated externally (e.g., from Header or notifications)
  useEffect(() => {
    if (trackedNumber) {
      setActiveTab("tracking");
      setTrackQuery(trackedNumber);
      handleTrackOrder(trackedNumber);
      setTrackedNumber(""); // reset
    }
  }, [trackedNumber]);

  // Filter products based on active filters
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesPrice = product.price <= priceRange;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nameAr.includes(searchQuery) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.descriptionAr.includes(searchQuery);
    return matchesCategory && matchesPrice && matchesSearch;
  });

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock === 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setShowCartDrawer(true);
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return { 
          ...item, 
          quantity: Math.max(1, Math.min(newQty, item.product.stock)) 
        };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Wishlist operations
  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  // Calculate order metrics
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const matchedWilaya = ALGERIAN_WILAYAS.find(w => w.name === selectedWilaya || w.nameAr === selectedWilaya);
  const shippingCost = matchedWilaya ? matchedWilaya.cost : 0;
  const cartTotal = cartSubtotal + shippingCost;

  // Handle placing the order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName || !checkoutPhone || !selectedWilaya || !checkoutAddress) return;

    const payload = {
      customerName: checkoutName,
      customerPhone: checkoutPhone,
      customerEmail: checkoutEmail,
      wilaya: selectedWilaya,
      address: checkoutAddress,
      paymentMethod,
      items: cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const order = await res.json();
      
      if (order.error) {
        alert(order.error);
        return;
      }

      setOrderSuccess(order);
      setCart([]); // Empty client cart
      setIsCheckingOut(false);
    } catch (err) {
      console.error(err);
      alert("Error placing order. Please try again.");
    }
  };

  // Submit product review in detail modal
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !newReviewName.trim() || !newReviewComment.trim()) return;

    const payload = {
      productId: selectedProduct.id,
      userName: newReviewName,
      rating: newReviewRating,
      comment: newReviewComment
    };

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      // Update local modal reviews list
      setModalReviews(prev => [...prev, data]);
      setNewReviewName("");
      setNewReviewComment("");
    } catch (err) {
      console.error(err);
    }
  };

  // Track order tracking stepper
  const handleTrackOrder = async (trackingNum: string) => {
    if (!trackingNum.trim()) return;
    setTrackError("");
    setTrackingResult(null);

    try {
      const res = await fetch("/api/orders");
      const orders = await res.json();
      const match = orders.find((o: any) => 
        o.trackingNumber.toUpperCase() === trackingNum.trim().toUpperCase() || 
        o.id.toUpperCase() === trackingNum.trim().toUpperCase()
      );

      if (match) {
        setTrackingResult(match);
      } else {
        setTrackError(isAr 
          ? "لم يتم العثور على أي طلب يطابق رقم التتبع المدخل. يرجى التأكد من الرقم والمحاولة مجدداً." 
          : "No matching order found. Please verify the tracking number and try again."
        );
      }
    } catch (err) {
      setTrackError("Error contacting database.");
    }
  };

  return (
    <div className={`min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 font-sans pb-16 transition-colors duration-350 ${isAr ? "rtl" : "ltr"}`} dir={isAr ? "rtl" : "ltr"}>
      
      {/* Dynamic Navigation Tab sub-bar */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 transition shadow-sm py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 text-sm font-bold">
          <button
            onClick={() => { setActiveTab("home"); setSelectedCategory("All"); setSearchQuery(""); }}
            className={`py-2 border-b-2 transition ${
              activeTab === "home" ? "border-indigo-600 text-indigo-600 dark:text-white" : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
            }`}
            id="tab-btn-home"
          >
            {isAr ? "الرئيسية" : "Home"}
          </button>
          <button
            onClick={() => { setActiveTab("shop"); }}
            className={`py-2 border-b-2 transition ${
              activeTab === "shop" ? "border-indigo-600 text-indigo-600 dark:text-white" : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
            }`}
            id="tab-btn-shop"
          >
            {isAr ? "المتجر والمنتجات" : "Shop Store"}
          </button>
          <button
            onClick={() => setActiveTab("tracking")}
            className={`py-2 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "tracking" ? "border-indigo-600 text-indigo-600 dark:text-white" : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
            }`}
            id="tab-btn-tracking"
          >
            <Truck size={14} />
            <span>{isAr ? "تتبع طلبي" : "Track Order"}</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SUCCESS SCREEN */}
      {/* ==================================================================== */}
      {orderSuccess && (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-8 shadow-xl">
            <div className="mx-auto bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={36} className="animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">
              {isAr ? "🎉 تم تسجيل طلبك بنجاح!" : "🎉 Order Placed Successfully!"}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6 leading-relaxed">
              {isAr 
                ? `شكراً لتسوقك من Minga.com. لقد تم إرسال الطلب للمراجعة والتحضير. رقم التتبع الخاص بك هو:` 
                : `Thank you for shopping at Minga.com. Your order is registered. Your tracking number is:`}
            </p>
            <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl py-4 px-6 border border-neutral-200 dark:border-neutral-700 max-w-sm mx-auto mb-6">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-widest block">
                {orderSuccess.trackingNumber}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-1 font-mono uppercase">
                {isAr ? "يرجى الاحتفاظ بهذا الرقم للتتبع" : "Save this number for package tracking"}
              </span>
            </div>
            <div className="text-sm text-left border-t border-neutral-100 dark:border-neutral-800 pt-6 space-y-2 max-w-md mx-auto mb-8">
              <div className="flex justify-between">
                <span className="text-neutral-400">{isAr ? "العميل:" : "Customer:"}</span>
                <span className="font-bold">{orderSuccess.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">{isAr ? "ولاية التوصيل:" : "Delivery Wilaya:"}</span>
                <span className="font-bold">{isAr ? matchedWilaya?.nameAr : orderSuccess.wilaya}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">{isAr ? "المبلغ الإجمالي:" : "Total Amount:"}</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400">{orderSuccess.total} DZD</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setTrackedNumber(orderSuccess.trackingNumber);
                  setOrderSuccess(null);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Truck size={16} />
                <span>{isAr ? "تتبع حالة الطرد الآن" : "Track Shipment Now"}</span>
              </button>
              <button
                onClick={() => {
                  setOrderSuccess(null);
                  setActiveTab("home");
                }}
                className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold py-3 px-6 rounded-xl transition text-sm cursor-pointer"
              >
                {isAr ? "العودة للرئيسية" : "Back to Homepage"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* HOME TAB VIEW */}
      {/* ==================================================================== */}
      {!orderSuccess && activeTab === "home" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-10" id="home-view-container">
          
          {/* Custom Hero Banner Slider */}
          <div className="relative h-[280px] sm:h-[380px] rounded-[32px] overflow-hidden bg-neutral-900 text-white shadow-xl">
            <img 
              src={heroBanners[heroIndex].img} 
              alt={heroBanners[heroIndex].title} 
              className="absolute inset-0 w-full h-full object-cover opacity-50 transition-all duration-700 transform scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/60 to-transparent flex flex-col justify-center p-8 sm:p-12">
              <span className="bg-amber-500 text-neutral-950 text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full w-max mb-3 animate-pulse">
                {isAr ? "عرض حصري لمينغا" : "Minga Exclusive"}
              </span>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight max-w-xl">
                {isAr ? heroBanners[heroIndex].titleAr : heroBanners[heroIndex].title}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-200 mt-2 max-w-md leading-relaxed">
                {isAr ? heroBanners[heroIndex].descAr : heroBanners[heroIndex].desc}
              </p>
              <button
                onClick={() => {
                  if (heroBanners[heroIndex].category !== "All") {
                    setSelectedCategory(heroBanners[heroIndex].category);
                  }
                  setActiveTab("shop");
                }}
                className="mt-6 bg-white hover:bg-indigo-600 hover:text-white text-neutral-900 font-bold py-3 px-6 rounded-2xl shadow-lg transition-all text-xs w-max flex items-center gap-2 cursor-pointer"
              >
                <span>{isAr ? heroBanners[heroIndex].btnTextAr : heroBanners[heroIndex].btnText}</span>
                <ArrowRight size={14} className={isAr ? "rotate-180" : ""} />
              </button>
            </div>
            
            {/* Banner Dot Indicator buttons */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {heroBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroIndex(idx)}
                  className={`h-2 rounded-full transition-all ${heroIndex === idx ? "w-6 bg-white" : "w-2 bg-white/40"}`}
                  id={`hero-dot-${idx}`}
                />
              ))}
            </div>
          </div>

          {/* Quick Features Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 rounded-2xl flex gap-4 items-center shadow-sm">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">
                <Truck size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold">{isAr ? "التوصيل لكافة الولايات" : "Nationwide Delivery"}</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">{isAr ? "شحن آمن ومضمون لـ 58 ولاية جزائرية" : "Secure delivery straight to your doorstep"}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 rounded-2xl flex gap-4 items-center shadow-sm">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold">{isAr ? "ضمان الجودة الفائقة" : "100% Quality Guranteed"}</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">{isAr ? "جميع منتجاتنا خاضعة لرقابة صارمة وفحص مسبق" : "Our own catalog, strictly reviewed and double checked"}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 rounded-2xl flex gap-4 items-center shadow-sm">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">
                <RotateCcw size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold">{isAr ? "سهولة الإرجاع والتبديل" : "Simple 3-Day Returns"}</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">{isAr ? "إمكانية إرجاع مجانية في حال وجود خلل تصنيعي" : "Free exchange if manufacturing issues are spotted"}</p>
              </div>
            </div>
          </div>

          {/* Quick Categories list */}
          <div>
            <h3 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2">
              <span>{isAr ? "تصفح حسب الفئات" : "Shop by Category"}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {categories.slice(1).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setActiveTab("shop");
                  }}
                  className="bg-white dark:bg-neutral-900 hover:border-indigo-600 dark:hover:border-indigo-400 border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl text-center shadow-sm transition-all cursor-pointer group"
                  id={`cat-card-${cat.id}`}
                >
                  <span className="text-xs font-bold block text-neutral-700 dark:text-neutral-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {isAr ? cat.ar : cat.en}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* New Arrivals Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>{isAr ? "وصل حديثاً" : "New Arrivals"}</span>
                <span className="bg-rose-500 text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded">NEW</span>
              </h3>
              <button onClick={() => { setSelectedCategory("All"); setActiveTab("shop"); }} className="text-xs font-bold text-indigo-600 hover:underline">
                {isAr ? "عرض الكل" : "View All"}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.filter(p => p.isNewArrival).slice(0, 4).map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isAr={isAr} 
                  onOpenDetail={setSelectedProduct} 
                  onAddToCart={addToCart} 
                  onToggleWishlist={toggleWishlist}
                  isInWishlist={wishlist.some(p => p.id === product.id)}
                />
              ))}
            </div>
          </div>

          {/* Best Sellers Banner & Grid */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>{isAr ? "الأكثر مبيعاً في الجزائر" : "Algerian Best Sellers"}</span>
                <span className="bg-amber-500 text-neutral-900 text-[9px] uppercase font-bold px-2 py-0.5 rounded">HOT</span>
              </h3>
              <button onClick={() => { setSelectedCategory("All"); setActiveTab("shop"); }} className="text-xs font-bold text-indigo-600 hover:underline">
                {isAr ? "عرض الكل" : "View All"}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.filter(p => p.isBestSeller).slice(0, 4).map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isAr={isAr} 
                  onOpenDetail={setSelectedProduct} 
                  onAddToCart={addToCart} 
                  onToggleWishlist={toggleWishlist}
                  isInWishlist={wishlist.some(p => p.id === product.id)}
                />
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* SHOP & PRODUCTS TAB VIEW */}
      {/* ==================================================================== */}
      {!orderSuccess && activeTab === "shop" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar Filter Panel */}
            <div className="w-full lg:w-64 flex-shrink-0 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm h-max">
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                {isAr ? "تصفية المنتجات" : "Filters"}
              </h3>
              
              {/* Category selector */}
              <div className="space-y-2 mb-6">
                <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">
                  {isAr ? "الفئة" : "Category"}
                </span>
                <div className="flex flex-col gap-1.5 pt-1">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`text-xs text-left px-3 py-2 rounded-xl transition ${
                        selectedCategory === cat.id 
                          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold" 
                          : "hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      }`}
                      id={`sidebar-cat-btn-${cat.id}`}
                    >
                      {isAr ? cat.ar : cat.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range selector */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px] uppercase font-bold tracking-wider text-neutral-400">
                  <span>{isAr ? "السعر الأقصى" : "Max Price"}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold font-mono">{priceRange} DZD</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[9px] text-neutral-400 font-mono">
                  <span>500 دج</span>
                  <span>50,000 دج</span>
                </div>
              </div>
            </div>

            {/* Shop Product Grid Area */}
            <div className="flex-1 space-y-6">
              
              {/* Top search & statistics row */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
                <div className="text-xs text-neutral-500">
                  {isAr 
                    ? `تم العثور على ${filteredProducts.length} منتج يطابق الخيارات` 
                    : `Showing ${filteredProducts.length} products matching filters`}
                </div>
                {searchQuery && (
                  <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full text-xs font-bold">
                    <span>{isAr ? `البحث عن: "${searchQuery}"` : `Query: "${searchQuery}"`}</span>
                    <button onClick={() => setSearchQuery("")} className="hover:text-red-500 font-mono font-bold">×</button>
                  </div>
                )}
              </div>

              {/* Grid or Empty State */}
              {filteredProducts.length === 0 ? (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl py-16 px-4 text-center">
                  <div className="mx-auto text-neutral-300 dark:text-neutral-700 w-12 h-12 mb-4">
                    <AlertCircle size={48} />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                    {isAr ? "لم نجد أي منتجات تطابق البحث" : "No products found"}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    {isAr ? "يرجى تجربة تقليل خيارات التصفية أو البحث عن كلمة أخرى" : "Try clearing filters or search for another query."}
                  </p>
                  <button 
                    onClick={() => { setSelectedCategory("All"); setPriceRange(50000); setSearchQuery(""); }}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-md transition"
                  >
                    {isAr ? "إعادة تعيين خيارات التصفية" : "Reset Filters"}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      isAr={isAr} 
                      onOpenDetail={setSelectedProduct} 
                      onAddToCart={addToCart} 
                      onToggleWishlist={toggleWishlist}
                      isInWishlist={wishlist.some(p => p.id === product.id)}
                    />
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ORDER TRACKING TAB VIEW */}
      {/* ==================================================================== */}
      {!orderSuccess && activeTab === "tracking" && (
        <div className="max-w-2xl mx-auto px-4 pt-10" id="tracking-view-container">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h3 className="text-lg font-black tracking-tight mb-2 text-center">
              {isAr ? "🔍 نظام تتبع الطرود الوطني" : "🔍 Nationwide Order Tracking"}
            </h3>
            <p className="text-xs text-neutral-400 text-center mb-6">
              {isAr 
                ? "أدخل رقم تتبع الشحنة الخاص بـ Minga.com (مثال: MNG-83921) لمعرفة حالة توصيل طردك مباشرة" 
                : "Enter your Minga.com tracking number (e.g. MNG-83921) to check real-time courier status"}
            </p>

            {/* Track input search block */}
            <div className="flex gap-2 max-w-md mx-auto mb-8">
              <input
                type="text"
                placeholder={isAr ? "رقم التتبع (مثال: MNG-83921)" : "Tracking Number (e.g. MNG-83921)"}
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                className="flex-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-neutral-800 dark:text-neutral-200"
              />
              <button
                onClick={() => handleTrackOrder(trackQuery)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition"
                id="track-btn-submit"
              >
                <Search size={14} />
                <span>{isAr ? "تتبع" : "Track"}</span>
              </button>
            </div>

            {/* Error messaging */}
            {trackError && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/60 p-4 rounded-2xl flex gap-3 text-xs text-rose-600 dark:text-rose-400 max-w-md mx-auto mb-6">
                <AlertCircle size={16} className="flex-shrink-0" />
                <p>{trackError}</p>
              </div>
            )}

            {/* Tracking detail display */}
            {trackingResult && (
              <div className="space-y-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                
                {/* Meta details */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl text-xs border border-neutral-100 dark:border-neutral-700/60">
                  <div>
                    <span className="text-neutral-400 block">{isAr ? "رقم الطلب:" : "Order ID:"}</span>
                    <span className="font-bold text-neutral-800 dark:text-white">#{trackingResult.id}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">{isAr ? "رمز التتبع:" : "Tracking Number:"}</span>
                    <span className="font-bold text-neutral-800 dark:text-white font-mono">{trackingResult.trackingNumber}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">{isAr ? "ولاية التوصيل:" : "Destination:"}</span>
                    <span className="font-bold text-neutral-800 dark:text-white">
                      {isAr ? ALGERIAN_WILAYAS.find(w => w.name === trackingResult.wilaya)?.nameAr || trackingResult.wilaya : trackingResult.wilaya}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">{isAr ? "الحالة:" : "Status:"}</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase inline-block ${
                      trackingResult.status === "Pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" :
                      trackingResult.status === "Processing" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" :
                      trackingResult.status === "Shipped" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400" :
                      trackingResult.status === "Delivered" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" :
                      "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                    }`}>
                      {isAr ? (
                        trackingResult.status === "Pending" ? "معلق" :
                        trackingResult.status === "Processing" ? "قيد التجهيز" :
                        trackingResult.status === "Shipped" ? "تم الشحن" :
                        trackingResult.status === "Delivered" ? "تم التسليم" : "ملغى"
                      ) : trackingResult.status}
                    </span>
                  </div>
                </div>

                {/* Real-time stepper */}
                <div className="space-y-6 max-w-sm mx-auto py-4">
                  <TrackingStep 
                    title={isAr ? "تم تسجيل الطلب في المتجر" : "Order Placed & Confirmed"}
                    desc={isAr ? "تم تسجيل طلبك بنجاح بنظام Minga.com" : "Your purchase is successfully registered in our secure database"}
                    isActive={["Pending", "Processing", "Shipped", "Delivered"].includes(trackingResult.status)}
                    isDone={["Processing", "Shipped", "Delivered"].includes(trackingResult.status)}
                    isAr={isAr}
                  />
                  <TrackingStep 
                    title={isAr ? "قيد التجهيز وفحص الجودة" : "Processing & Quality Audits"}
                    desc={isAr ? "يقوم موظفونا بتجهيز الطرد وفحص المنتج بدقة" : "Minga staff are packing, inspecting, and securing your package"}
                    isActive={["Processing", "Shipped", "Delivered"].includes(trackingResult.status)}
                    isDone={["Shipped", "Delivered"].includes(trackingResult.status)}
                    isAr={isAr}
                  />
                  <TrackingStep 
                    title={isAr ? "تم تسليم الطرد لشركة الشحن" : "Shipped / In Transit"}
                    desc={isAr ? "الشحنة في طريقها لولايتك مع شركة التوصيل" : "Your shipment has been handed to our local delivery partner"}
                    isActive={["Shipped", "Delivered"].includes(trackingResult.status)}
                    isDone={["Delivered"].includes(trackingResult.status)}
                    isAr={isAr}
                  />
                  <TrackingStep 
                    title={isAr ? "تم التسليم للعميل" : "Delivered"}
                    desc={isAr ? "تم تسليم الطرد للعميل واستلام المبلغ بنجاح" : "Package delivered. Cash on Delivery completed successfully"}
                    isActive={["Delivered"].includes(trackingResult.status)}
                    isDone={trackingResult.status === "Delivered"}
                    isLast={true}
                    isAr={isAr}
                  />
                </div>

                {/* Product summaries in tracking */}
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
                  <h4 className="text-xs font-bold text-neutral-400 mb-3 uppercase">
                    {isAr ? "محتويات الطرد" : "Package Contents"}
                  </h4>
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {trackingResult.items.map((item: any, i: number) => (
                      <div key={i} className="py-2.5 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <img src={item.image} className="w-8 h-8 rounded-lg object-cover" />
                          <span className="font-bold">{isAr ? item.productNameAr : item.productName}</span>
                        </div>
                        <span className="text-neutral-400">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between border-t border-neutral-100 dark:border-neutral-800 pt-3 text-xs font-bold">
                    <span>{isAr ? "إجمالي الدفع (عند الاستلام):" : "Total to Pay on Delivery:"}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-black">{trackingResult.total} DZD</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PRODUCT DETAIL VIEW MODAL */}
      {/* ==================================================================== */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" id="product-detail-modal">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
            
            {/* Close button */}
            <button
              onClick={() => { setSelectedProduct(null); setModalReviews([]); }}
              className="absolute top-4 right-4 bg-white/80 dark:bg-neutral-800/80 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-white z-10 transition cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Left section: Product Images */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between bg-neutral-50 dark:bg-neutral-800/20">
              <div className="aspect-square bg-white dark:bg-neutral-800 rounded-3xl overflow-hidden shadow-inner border border-neutral-100 dark:border-neutral-700">
                <img 
                  src={selectedProduct.images[0]} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-3 mt-4 overflow-x-auto">
                {selectedProduct.images.map((img, i) => (
                  <div key={i} className="w-16 h-16 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden cursor-pointer hover:border-indigo-600 flex-shrink-0 bg-white">
                    <img src={img} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right section: Product details */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between max-h-[90vh] overflow-y-auto space-y-6">
              
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                    {isAr ? selectedProduct.categoryAr : selectedProduct.category}
                  </span>
                  
                  {/* Stock status indicator */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedProduct.stock > 0 
                      ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600" 
                      : "bg-rose-50 dark:bg-rose-950 text-rose-500"
                  }`}>
                    {selectedProduct.stock > 0 
                      ? (isAr ? `متوفر - باقي ${selectedProduct.stock} قطع` : `In Stock - ${selectedProduct.stock} left`)
                      : (isAr ? "نفذ من المخزون" : "Out of Stock")}
                  </span>
                </div>

                <h2 className="text-xl font-black text-neutral-900 dark:text-white leading-tight">
                  {isAr ? selectedProduct.nameAr : selectedProduct.name}
                </h2>

                {/* Rating average display */}
                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <div className="flex items-center text-amber-400">
                    <Star size={14} className="fill-current" />
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 ml-1">{selectedProduct.rating}</span>
                  </div>
                  <span>•</span>
                  <span>({selectedProduct.reviewsCount} {isAr ? "تقييمات" : "reviews"})</span>
                </div>

                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {selectedProduct.price} DZD
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed pt-2">
                  {isAr ? selectedProduct.descriptionAr : selectedProduct.description}
                </p>
              </div>

              {/* Action buttons (Add to cart / Wishlist) */}
              <div className="flex gap-3 border-t border-neutral-100 dark:border-neutral-800 pt-4">
                <button
                  onClick={() => addToCart(selectedProduct)}
                  disabled={selectedProduct.stock === 0}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <ShoppingBag size={18} />
                  <span>{isAr ? "إضافة لسلة المشتريات" : "Add to Shopping Cart"}</span>
                </button>
                <button
                  onClick={() => toggleWishlist(selectedProduct)}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-center cursor-pointer ${
                    wishlist.some(p => p.id === selectedProduct.id)
                      ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 text-rose-500"
                      : "border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-neutral-600"
                  }`}
                >
                  <Heart size={20} className={wishlist.some(p => p.id === selectedProduct.id) ? "fill-current" : ""} />
                </button>
              </div>

              {/* Star Review Form & History Tab inside modal */}
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-4">
                <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider">
                  {isAr ? "آراء وتقييمات العملاء" : "Customer Reviews"}
                </h3>

                {/* Review submission form */}
                <form onSubmit={handleSubmitReview} className="bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700/60 space-y-3">
                  <span className="text-[11px] font-bold block text-neutral-500">{isAr ? "أضف تقييمك للمنتج:" : "Write a product review:"}</span>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder={isAr ? "اسمك الكامل" : "Your Name"}
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                      required
                    />
                    <select
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(Number(e.target.value))}
                      className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-2 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                      <option value="4">⭐⭐⭐⭐ (4)</option>
                      <option value="3">⭐⭐⭐ (3)</option>
                      <option value="2">⭐⭐ (2)</option>
                      <option value="1">⭐ (1)</option>
                    </select>
                  </div>
                  <textarea
                    placeholder={isAr ? "اكتب تعليقك هنا..." : "Your review details..."}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none h-16"
                    required
                  />
                  <button type="submit" className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white dark:text-neutral-900 text-white font-bold text-[11px] py-1.5 px-4 rounded-xl transition">
                    {isAr ? "إرسال التقييم" : "Submit Review"}
                  </button>
                </form>

                {/* Reviews History list */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {modalReviews.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-neutral-400">
                      {isAr ? "لا توجد تقييمات معتمدة لهذا المنتج بعد" : "No approved reviews yet"}
                    </div>
                  ) : (
                    modalReviews.map(rev => (
                      <div key={rev.id} className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold">{rev.userName}</span>
                          <span className="text-[10px] text-neutral-400">{rev.date}</span>
                        </div>
                        <div className="flex text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} size={10} className="fill-current" />
                          ))}
                        </div>
                        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SHOPPING CART SLIDING DRAWER */}
      {/* ==================================================================== */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end" id="cart-drawer-overlay">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 h-full flex flex-col justify-between shadow-2xl relative animate-slide-in">
            
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50 dark:bg-neutral-900/50">
              <h3 className="text-sm font-black flex items-center gap-2">
                <ShoppingBag size={18} className="text-indigo-600" />
                <span>{isAr ? "سلة التسوق الخاصة بك" : "Your Shopping Cart"}</span>
              </h3>
              <button onClick={() => setShowCartDrawer(false)} className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg">
                <X size={18} />
              </button>
            </div>

            {/* Cart body items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="mx-auto text-neutral-300 dark:text-neutral-700 w-16 h-16 bg-neutral-50 dark:bg-neutral-800/50 rounded-full flex items-center justify-center">
                    <ShoppingBag size={24} />
                  </div>
                  <p className="text-xs text-neutral-400">
                    {isAr ? "السلة فارغة تماماً حالياً!" : "Your shopping cart is empty!"}
                  </p>
                  <button
                    onClick={() => { setShowCartDrawer(false); setActiveTab("shop"); }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-5 rounded-xl transition"
                  >
                    {isAr ? "تصفح المنتجات الآن" : "Shop Products Now"}
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="flex gap-4 p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-neutral-100 dark:border-neutral-700/60 items-center justify-between">
                    <img src={item.product.images[0]} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 text-xs">
                      <h4 className="font-bold text-neutral-800 dark:text-white line-clamp-1">
                        {isAr ? item.product.nameAr : item.product.name}
                      </h4>
                      <p className="text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">{item.product.price} DZD</p>
                    </div>
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateCartQuantity(item.product.id, -1)} className="p-1 rounded-md bg-white dark:bg-neutral-700 hover:bg-neutral-100">
                        <Minus size={10} />
                      </button>
                      <span className="text-xs font-bold font-mono">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.product.id, 1)} className="p-1 rounded-md bg-white dark:bg-neutral-700 hover:bg-neutral-100">
                        <Plus size={10} />
                      </button>
                    </div>
                    {/* Remove button */}
                    <button onClick={() => removeFromCart(item.product.id)} className="text-neutral-400 hover:text-red-500 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Cart footer totals */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">{isAr ? "مجموع المشتريات:" : "Subtotal:"}</span>
                  <span className="font-bold font-mono text-neutral-800 dark:text-white">{cartSubtotal} DZD</span>
                </div>
                
                {isCheckingOut ? (
                  /* Expanded Checkout Form inside Drawer */
                  <form onSubmit={handlePlaceOrder} className="space-y-3.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <h4 className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                      {isAr ? "معلومات الشحن والتوصيل" : "Algerian Shipping Details"}
                    </h4>
                    
                    <input
                      type="text"
                      placeholder={isAr ? "الاسم الكامل" : "Full Name"}
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      required
                    />
                    
                    <input
                      type="tel"
                      placeholder={isAr ? "رقم الهاتف (مثال: 0555123456)" : "Algerian Phone (e.g. 0555123456)"}
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      required
                    />
                    
                    <input
                      type="email"
                      placeholder={isAr ? "البريد الإلكتروني (اختياري)" : "Email Address (Optional)"}
                      value={checkoutEmail}
                      onChange={(e) => setCheckoutEmail(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />

                    {/* Searchable/Scrollable Algerian Wilaya Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400">{isAr ? "ولاية التوصيل (58 ولاية):" : "Destination Wilaya (58 Wilayas):"}</label>
                      <select
                        value={selectedWilaya}
                        onChange={(e) => setSelectedWilaya(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-xl px-2 py-2 text-xs focus:outline-none"
                        required
                      >
                        <option value="">{isAr ? "-- اختر ولاية التوصيل --" : "-- Select Delivery Province --"}</option>
                        {ALGERIAN_WILAYAS.map(w => (
                          <option key={w.id} value={w.name}>
                            {w.id} - {isAr ? w.nameAr : w.name} ({w.cost} DZD)
                          </option>
                        ))}
                      </select>
                    </div>

                    <input
                      type="text"
                      placeholder={isAr ? "العنوان بالتفصيل والبلدية" : "Detailed Street Address & Commune"}
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      required
                    />

                    {/* Payment methods */}
                    <div className="space-y-1.5 pt-1.5">
                      <span className="text-[10px] font-bold text-neutral-400 block">{isAr ? "طريقة الدفع المقترحة:" : "Payment Method:"}</span>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("COD")}
                          className={`p-2 rounded-xl border font-bold text-center transition ${
                            paymentMethod === "COD" 
                              ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600" 
                              : "border-neutral-200 dark:border-neutral-700 text-neutral-500"
                          }`}
                        >
                          💸 {isAr ? "عند الاستلام (COD)" : "Cash on Delivery"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("Edahabia")}
                          className={`p-2 rounded-xl border font-bold text-center transition ${
                            paymentMethod === "Edahabia" 
                              ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600" 
                              : "border-neutral-200 dark:border-neutral-700 text-neutral-500"
                          }`}
                        >
                          💳 {isAr ? "بطاقة الذهبية" : "Edahabia Card"}
                        </button>
                      </div>
                    </div>

                    {/* Delivery pricing summary */}
                    {selectedWilaya && (
                      <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-2xl text-[11px] space-y-1">
                        <div className="flex justify-between">
                          <span>{isAr ? "تكلفة الشحن:" : "Shipping Cost:"}</span>
                          <span className="font-bold">{shippingCost} DZD</span>
                        </div>
                        <div className="flex justify-between font-bold border-t border-neutral-200 dark:border-neutral-700 pt-1.5 text-xs">
                          <span>{isAr ? "المبلغ الإجمالي:" : "Grand Total:"}</span>
                          <span className="text-indigo-600 dark:text-indigo-400">{cartTotal} DZD</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsCheckingOut(false)}
                        className="flex-1 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 text-neutral-800 dark:text-white text-xs font-bold py-2.5 rounded-xl transition"
                      >
                        {isAr ? "تعديل السلة" : "Back"}
                      </button>
                      <button
                        type="submit"
                        disabled={!selectedWilaya}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-md cursor-pointer"
                      >
                        {isAr ? "تأكيد وإرسال الطلب" : "Place Order"}
                      </button>
                    </div>

                  </form>
                ) : (
                  <button
                    onClick={() => setIsCheckingOut(true)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                    id="cart-checkout-proceed"
                  >
                    <span>{isAr ? "الانتقال لإتمام الطلب" : "Proceed to Checkout"}</span>
                    <ArrowRight size={16} className={isAr ? "rotate-180" : ""} />
                  </button>
                )}

              </div>
            )}

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* WISHLIST SLIDING DRAWER */}
      {/* ==================================================================== */}
      {showWishlistDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end" id="wishlist-drawer-overlay">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 h-full flex flex-col justify-between shadow-2xl relative">
            
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50 dark:bg-neutral-900/50">
              <h3 className="text-sm font-black flex items-center gap-2">
                <Heart size={18} className="text-rose-500 fill-current" />
                <span>{isAr ? "قائمة المنتجات المفضلة" : "Your Wishlist"}</span>
              </h3>
              <button onClick={() => setShowWishlistDrawer(false)} className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {wishlist.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="mx-auto text-neutral-300 dark:text-neutral-700 w-16 h-16 bg-neutral-50 dark:bg-neutral-800/50 rounded-full flex items-center justify-center">
                    <Heart size={24} />
                  </div>
                  <p className="text-xs text-neutral-400">
                    {isAr ? "لم تقم بحفظ أي منتجات في المفضلة بعد." : "No favorites saved yet."}
                  </p>
                </div>
              ) : (
                wishlist.map(product => (
                  <div key={product.id} className="flex gap-4 p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-neutral-100 dark:border-neutral-700/60 items-center justify-between">
                    <img src={product.images[0]} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 text-xs">
                      <h4 className="font-bold text-neutral-800 dark:text-white line-clamp-1">
                        {isAr ? product.nameAr : product.name}
                      </h4>
                      <p className="text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">{product.price} DZD</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          addToCart(product);
                          setShowWishlistDrawer(false);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg text-[10px] font-bold"
                      >
                        {isAr ? "شراء" : "Add"}
                      </button>
                      <button 
                        onClick={() => toggleWishlist(product)}
                        className="text-neutral-400 hover:text-red-500 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// INTERNAL REUSABLE MINI-COMPONENTS
// ==========================================

interface ProductCardProps {
  key?: string;
  product: Product;
  isAr: boolean;
  onOpenDetail: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  isInWishlist: boolean;
}

function ProductCard({
  product,
  isAr,
  onOpenDetail,
  onAddToCart,
  onToggleWishlist,
  isInWishlist
}: ProductCardProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between group h-full">
      
      {/* Card Header image block */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100 cursor-pointer" onClick={() => onOpenDetail(product)}>
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Absolute badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10" dir="ltr">
          {product.isNewArrival && (
            <span className="bg-rose-500 text-white text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded">NEW</span>
          )}
          {product.isBestSeller && (
            <span className="bg-amber-500 text-neutral-950 text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded">HOT</span>
          )}
        </div>

        {/* Favorite heart absolute toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md shadow-md transition z-10 ${
            isInWishlist 
              ? "bg-rose-500 text-white" 
              : "bg-white/80 dark:bg-neutral-800/85 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
          }`}
        >
          <Heart size={14} className={isInWishlist ? "fill-current" : ""} />
        </button>
      </div>

      {/* Card Body descriptions */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1" onClick={() => onOpenDetail(product)}>
          <span className="text-[9px] uppercase font-bold text-neutral-400 block">
            {isAr ? product.categoryAr : product.category}
          </span>
          <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 line-clamp-2 hover:text-indigo-600 cursor-pointer leading-tight h-8">
            {isAr ? product.nameAr : product.name}
          </h4>
          
          <div className="flex items-center gap-1 text-[10px] text-amber-400">
            <Star size={11} className="fill-current" />
            <span className="font-bold text-neutral-700 dark:text-neutral-300">{product.rating}</span>
            <span className="text-neutral-400">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Price & Add to cart row */}
        <div className="flex justify-between items-center pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {product.price} DZD
          </span>
          
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className="bg-neutral-100 hover:bg-indigo-600 dark:bg-neutral-800 dark:hover:bg-indigo-600 text-neutral-800 hover:text-white dark:text-neutral-200 p-2 rounded-xl transition cursor-pointer"
          >
            <Plus size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}

interface TrackingStepProps {
  title: string;
  desc: string;
  isActive: boolean;
  isDone: boolean;
  isLast?: boolean;
  isAr: boolean;
}

function TrackingStep({ title, desc, isActive, isDone, isLast = false, isAr }: TrackingStepProps) {
  return (
    <div className="flex gap-4 relative items-start">
      
      {/* Bullet line */}
      {!isLast && (
        <div className={`absolute bottom-0 w-0.5 h-12 left-2.5 top-5 -translate-x-1/2 ${
          isDone ? "bg-emerald-500" : "bg-neutral-200 dark:bg-neutral-700"
        }`} />
      )}

      {/* Ball index */}
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 flex-shrink-0 ${
        isDone 
          ? "border-emerald-500 bg-emerald-500 text-white" 
          : isActive 
          ? "border-indigo-600 bg-white dark:bg-neutral-900" 
          : "border-neutral-300 bg-white dark:bg-neutral-900"
      }`}>
        {isDone && <CheckCircle size={10} className="stroke-[3]" />}
        {isActive && !isDone && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse"></span>}
      </div>

      {/* Description text */}
      <div className="text-left flex-1 -mt-0.5" dir={isAr ? "rtl" : "ltr"}>
        <h5 className={`text-xs font-bold ${isActive ? "text-neutral-900 dark:text-white" : "text-neutral-400"}`}>
          {title}
        </h5>
        <p className="text-[10px] text-neutral-400 mt-0.5 leading-relaxed">
          {desc}
        </p>
      </div>

    </div>
  );
}
