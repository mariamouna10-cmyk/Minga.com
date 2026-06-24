/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Bell,
  Star,
  Package,
  Sliders,
  Sparkles
} from "lucide-react";
import { Product, Order, Review, AppNotification, AnalyticsStats } from "../types";

interface AdminPortalProps {
  currentLang: "en" | "ar";
  products: Product[];
  onRefreshProducts: () => void;
}

export default function AdminPortal({
  currentLang,
  products,
  onRefreshProducts
}: AdminPortalProps) {
  
  // Navigation Tabs
  const [adminTab, setAdminTab] = useState<"overview" | "products" | "orders" | "reviews" | "campaigns">("overview");
  
  // Dynamic statistics state
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Campaign builder state
  const [promoTitle, setPromoTitle] = useState("");
  const [promoTitleAr, setPromoTitleAr] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [promoMessageAr, setPromoMessageAr] = useState("");
  const [campaignSuccess, setCampaignSuccess] = useState(false);

  // Edit/Add product modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Modal form states
  const [formName, setFormName] = useState("");
  const [formNameAr, setFormNameAr] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDescAr, setFormDescAr] = useState("");
  const [formPrice, setFormPrice] = useState(0);
  const [formStock, setFormStock] = useState(10);
  const [formCategory, setFormCategory] = useState("Electronics");
  const [formCategoryAr, setFormCategoryAr] = useState("الإلكترونيات");
  const [formImage, setFormImage] = useState("");

  const isAr = currentLang === "ar";

  // Load all dashboard stats, orders, reviews
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const statsRes = await fetch("/api/stats");
      const statsData = await statsRes.json();
      setStats(statsData);

      const ordersRes = await fetch("/api/orders");
      const ordersData = await ordersRes.json();
      setOrders(ordersData);

      const reviewsRes = await fetch("/api/reviews");
      const reviewsData = await reviewsRes.json();
      setReviews(reviewsData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [products]);

  // Handle open modal for product addition or editing
  const handleOpenProductModal = (prod: Product | null = null) => {
    if (prod) {
      setEditingProduct(prod);
      setFormName(prod.name);
      setFormNameAr(prod.nameAr);
      setFormDesc(prod.description || "");
      setFormDescAr(prod.descriptionAr || "");
      setFormPrice(prod.price);
      setFormStock(prod.stock);
      setFormCategory(prod.category);
      setFormCategoryAr(prod.categoryAr);
      setFormImage(prod.images[0]);
    } else {
      setEditingProduct(null);
      setFormName("");
      setFormNameAr("");
      setFormDesc("");
      setFormDescAr("");
      setFormPrice(2500);
      setFormStock(15);
      setFormCategory("Electronics");
      setFormCategoryAr("الإلكترونيات");
      setFormImage("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80");
    }
    setShowProductModal(true);
  };

  // Submit product creations & updates
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name: formName,
      nameAr: formNameAr,
      description: formDesc,
      descriptionAr: formDescAr,
      price: Number(formPrice),
      stock: Number(formStock),
      category: formCategory,
      categoryAr: formCategoryAr,
      images: [formImage]
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowProductModal(false);
        onRefreshProducts(); // Trigger refresh on App level
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete product action
  const handleDeleteProduct = async (id: string) => {
    if (!confirm(isAr ? "هل أنت متأكد من حذف هذا المنتج نهائياً؟" : "Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        onRefreshProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update order delivery tracking status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        loadAdminData(); // Refresh metrics
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Moderate submitted customer product review
  const handleReviewModeration = async (reviewId: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved })
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Broadcast push/promo notification
  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle || !promoTitleAr || !promoMessage || !promoMessageAr) return;

    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: promoTitle,
          titleAr: promoTitleAr,
          message: promoMessage,
          messageAr: promoMessageAr,
          type: "promotion"
        })
      });

      if (res.ok) {
        setCampaignSuccess(true);
        setPromoTitle("");
        setPromoTitleAr("");
        setPromoMessage("");
        setPromoMessageAr("");
        setTimeout(() => setCampaignSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`min-h-screen bg-neutral-100 dark:bg-neutral-950 pb-16 transition-colors duration-300 text-neutral-800 dark:text-neutral-100 p-4 sm:p-6 lg:p-8 ${isAr ? "rtl" : "ltr"}`} dir={isAr ? "rtl" : "ltr"}>
      
      {/* Overview Head */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2 font-sans">
            <Sliders size={24} className="text-indigo-600" />
            <span>{isAr ? "لوحة الإدارة الإقليمية لمينغا" : "Minga Regional Admin Control"}</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {isAr ? "تتبع المبيعات، الطلبات، إدارة مخزون المنتجات وإرسال الإشعارات للولايات الـ 58" : "Track performance, update product catalogs, moderate customer reviews, and coordinate nationwide deliveries"}
          </p>
        </div>
        
        <button
          onClick={loadAdminData}
          className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 py-2.5 px-4 rounded-xl text-xs font-bold shadow-sm hover:bg-neutral-50"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          <span>{isAr ? "تحديث البيانات" : "Refresh Metrics"}</span>
        </button>
      </div>

      {/* Admin tabs switcher */}
      <div className="max-w-7xl mx-auto mb-8 bg-white dark:bg-neutral-900 p-1.5 rounded-2xl flex flex-wrap gap-1 shadow-sm border border-neutral-100 dark:border-neutral-800">
        <button
          onClick={() => setAdminTab("overview")}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition ${
            adminTab === "overview" ? "bg-indigo-600 text-white shadow-md" : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          }`}
        >
          {isAr ? "الإحصائيات العامة" : "Business Overview"}
        </button>
        <button
          onClick={() => setAdminTab("products")}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition ${
            adminTab === "products" ? "bg-indigo-600 text-white shadow-md" : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          }`}
        >
          {isAr ? "إدارة المنتجات" : "Products Manager"}
        </button>
        <button
          onClick={() => setAdminTab("orders")}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition ${
            adminTab === "orders" ? "bg-indigo-600 text-white shadow-md" : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          }`}
        >
          {isAr ? "إدارة طلبات التوصيل" : "Order Logistics"}
        </button>
        <button
          onClick={() => setAdminTab("reviews")}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition ${
            adminTab === "reviews" ? "bg-indigo-600 text-white shadow-md" : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          }`}
        >
          {isAr ? "مراجعة آراء المشترين" : "Review Moderation"}
        </button>
        <button
          onClick={() => setAdminTab("campaigns")}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            adminTab === "campaigns" ? "bg-indigo-600 text-white shadow-md" : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          }`}
        >
          <Bell size={12} />
          <span>{isAr ? "الإعلانات والخصومات" : "Broadcast Panel"}</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ==================================================================== */}
        {/* TAB 1: BUSINESS OVERVIEW STATS & SVG CHARTS */}
        {/* ==================================================================== */}
        {adminTab === "overview" && stats && (
          <div className="space-y-6" id="admin-overview-tab">
            
            {/* Bento-grid counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 rounded-3xl shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-neutral-400">{isAr ? "إجمالي المبيعات" : "Gross Revenue"}</span>
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-lg">
                    <DollarSign size={16} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-neutral-900 dark:text-white mt-3 font-mono">
                  {stats.salesTotal.toLocaleString()} DZD
                </h3>
                <span className="text-[10px] text-emerald-500 font-bold block mt-1">
                  ▲ +14% {isAr ? "هذا الأسبوع" : "vs last week"}
                </span>
              </div>

              <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 rounded-3xl shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-neutral-400">{isAr ? "إجمالي الطلبات" : "Total Orders"}</span>
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-lg">
                    <ShoppingBag size={16} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-neutral-900 dark:text-white mt-3 font-mono">
                  {stats.ordersCount}
                </h3>
                <span className="text-[10px] text-emerald-500 font-bold block mt-1">
                  ▲ +24 {isAr ? "طلب جديد اليوم" : "new orders registered"}
                </span>
              </div>

              <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 rounded-3xl shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-neutral-400">{isAr ? "المنتجات النشطة" : "Active Products"}</span>
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-lg">
                    <Package size={16} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-neutral-900 dark:text-white mt-3 font-mono">
                  {stats.productsCount}
                </h3>
                <span className="text-[10px] text-neutral-400 block mt-1">
                  {isAr ? "مخزن ومملوك بالكامل" : "100% owned inventory"}
                </span>
              </div>

              <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 rounded-3xl shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-neutral-400">{isAr ? "قاعدة المشترين" : "Active Customers"}</span>
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-lg">
                    <Users size={16} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-neutral-900 dark:text-white mt-3 font-mono">
                  {stats.customersCount}
                </h3>
                <span className="text-[10px] text-neutral-400 block mt-1">
                  {isAr ? "مسجلين بالهاتف والبريد" : "Algerian phone & Google accounts"}
                </span>
              </div>

            </div>

            {/* Custom SVG Revenue trend & Wilaya Sales Distribution charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Chart 1: Revenue Monthly line chart */}
              <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[32px] p-6 shadow-sm">
                <h3 className="text-sm font-bold text-neutral-800 dark:text-white mb-4">
                  📈 {isAr ? "تطور حجم المبيعات الشهري (دج)" : "Monthly Revenue Performance (DZD)"}
                </h3>
                
                {/* Responsive SVG Line Graph */}
                <div className="relative h-60 w-full pt-4">
                  <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                    {/* Grids */}
                    <line x1="0" y1="20" x2="500" y2="20" stroke="#f0f0f0" className="dark:stroke-neutral-800" strokeWidth="1" />
                    <line x1="0" y1="80" x2="500" y2="80" stroke="#f0f0f0" className="dark:stroke-neutral-800" strokeWidth="1" />
                    <line x1="0" y1="140" x2="500" y2="140" stroke="#f0f0f0" className="dark:stroke-neutral-800" strokeWidth="1" />
                    <line x1="0" y1="180" x2="500" y2="180" stroke="#e5e5e5" className="dark:stroke-neutral-700" strokeWidth="1" />
                    
                    {/* Graph Line */}
                    <path
                      d="M 10,180 Q 100,160 180,150 T 260,110 T 340,90 T 420,50 T 490,30"
                      fill="none"
                      stroke="rgb(79, 70, 229)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Gradient Fill under line */}
                    <path
                      d="M 10,180 Q 100,160 180,150 T 260,110 T 340,90 T 420,50 T 490,30 L 490,180 L 10,180 Z"
                      fill="rgba(79, 70, 229, 0.08)"
                    />

                    {/* Nodes */}
                    <circle cx="180" cy="150" r="5" fill="rgb(79, 70, 229)" stroke="white" strokeWidth="2" />
                    <circle cx="340" cy="90" r="5" fill="rgb(79, 70, 229)" stroke="white" strokeWidth="2" />
                    <circle cx="490" cy="30" r="5" fill="rgb(79, 70, 229)" stroke="white" strokeWidth="2" />

                    {/* X Axis Labels */}
                    <text x="10" y="196" fill="#a3a3a3" className="text-[9px] font-sans">Jan</text>
                    <text x="180" y="196" fill="#a3a3a3" className="text-[9px] font-sans">Mar</text>
                    <text x="340" y="196" fill="#a3a3a3" className="text-[9px] font-sans">May</text>
                    <text x="490" y="196" fill="#a3a3a3" className="text-[9px] font-sans text-right">Jun</text>
                  </svg>
                </div>
              </div>

              {/* Chart 2: Regional Distribution Bar chart */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[32px] p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-800 dark:text-white mb-4">
                    📍 {isAr ? "أكثر الولايات شراءً" : "Top Purchasing Provinces"}
                  </h3>
                  
                  {/* Wilaya sale bars list */}
                  <div className="space-y-3.5 pt-2">
                    <WilayaBar name={isAr ? "الجزائر العاصمة" : "Alger (Algiers)"} sales="55%" val="128,500 دج" />
                    <WilayaBar name={isAr ? "وهران" : "Oran"} sales="35%" val="85,000 دج" />
                    <WilayaBar name={isAr ? "قسنطينة" : "Constantine"} sales="25%" val="54,000 دج" />
                    <WilayaBar name={isAr ? "تيزي وزو" : "Tizi Ouzou"} sales="18%" val="38,000 دج" />
                  </div>
                </div>
                
                <p className="text-[10px] text-neutral-400 mt-4 leading-relaxed border-t border-neutral-100 dark:border-neutral-800 pt-3">
                  {isAr ? "يتم التوصيل للولايات الشمالية عبر وكلاء الشحن المحليين في ظرف 48 ساعة." : "North Algeria deliveries are routed via express courier. Deep south handled on demand."}
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: PRODUCTS MANAGER (VIEW, CREATE, EDIT) */}
        {/* ==================================================================== */}
        {adminTab === "products" && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-6" id="admin-products-tab">
            
            <div className="flex justify-between items-center pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-800 dark:text-white">
                📦 {isAr ? "كتالوج وقائمة المنتجات" : "Products Inventory"} ({products.length})
              </h3>
              <button
                onClick={() => handleOpenProductModal(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition"
                id="add-new-product-btn"
              >
                <Plus size={14} />
                <span>{isAr ? "إضافة منتج جديد" : "Create Product"}</span>
              </button>
            </div>

            {/* List table */}
            <div className="overflow-x-auto rounded-2xl border border-neutral-100 dark:border-neutral-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-[10px] uppercase font-bold text-neutral-400">
                  <tr>
                    <th className="px-4 py-3.5">{isAr ? "المنتج" : "Product"}</th>
                    <th className="px-4 py-3.5">{isAr ? "الفئة" : "Category"}</th>
                    <th className="px-4 py-3.5">{isAr ? "السعر" : "Price"}</th>
                    <th className="px-4 py-3.5">{isAr ? "المخزون" : "Stock"}</th>
                    <th className="px-4 py-3.5">{isAr ? "التقييم" : "Rating"}</th>
                    <th className="px-4 py-3.5 text-center">{isAr ? "الإجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <img src={product.images[0]} className="w-10 h-10 rounded-lg object-cover bg-neutral-100 border" />
                        <div>
                          <span className="font-bold text-neutral-900 dark:text-white block line-clamp-1">
                            {isAr ? product.nameAr : product.name}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono block">ID: {product.id}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded text-[10px] font-bold">
                          {isAr ? product.categoryAr : product.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        {product.price} DZD
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-mono font-bold ${product.stock < 5 ? "text-rose-500" : "text-neutral-500"}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-amber-500 flex items-center gap-1 mt-3">
                        <Star size={12} className="fill-current" />
                        <span>{product.rating}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenProductModal(product)}
                            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-500 hover:text-indigo-600"
                            title={isAr ? "تعديل" : "Edit"}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-500 hover:text-red-500"
                            title={isAr ? "حذف" : "Delete"}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: ORDER LOGISTICS & SHIPPING */}
        {/* ==================================================================== */}
        {adminTab === "orders" && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-6" id="admin-orders-tab">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-white pb-4 border-b border-neutral-100 dark:border-neutral-800">
              🚚 {isAr ? "إدارة عمليات الشحن والتوصيل للمشترين" : "Order Logistics Desk"} ({orders.length})
            </h3>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-400">
                  {isAr ? "لا توجد طلبات مسجلة حالياً" : "No orders registered."}
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/50 space-y-4 text-xs">
                    
                    {/* Order metadata head */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-neutral-150 dark:border-neutral-800/80">
                      <div>
                        <span className="font-bold text-neutral-900 dark:text-white">#{order.id}</span>
                        <span className="text-neutral-400 block mt-0.5">{order.date.split("T")[0]} {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Status update selector dropdown */}
                        <span className="text-[10px] text-neutral-400 font-bold uppercase">{isAr ? "تعديل الحالة:" : "Change Status:"}</span>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-1.5 text-[11px] font-bold focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Customer and products list */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Customer column */}
                      <div className="space-y-1 bg-white dark:bg-neutral-800/40 p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-700/40">
                        <span className="text-[10px] font-bold text-neutral-400 block uppercase">{isAr ? "العميل والوجهة" : "Recipient & Location"}</span>
                        <p className="font-bold text-neutral-900 dark:text-white">{order.customerName}</p>
                        <p className="text-neutral-500 font-mono">{order.customerPhone}</p>
                        <p className="text-neutral-500 font-mono">{order.customerEmail || "No Email"}</p>
                        <p className="text-indigo-600 dark:text-indigo-400 font-bold mt-1">
                          📍 {order.wilaya}
                        </p>
                        <p className="text-neutral-400 text-[11px] mt-0.5 line-clamp-2">{order.address}</p>
                      </div>

                      {/* Items column */}
                      <div className="space-y-1.5 md:col-span-2">
                        <span className="text-[10px] font-bold text-neutral-400 block uppercase">{isAr ? "محتويات الطلب" : "Purchase Contents"}</span>
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-800/40 p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-700/40 max-h-36 overflow-y-auto">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="py-1.5 flex justify-between items-center">
                              <span className="font-medium">{isAr ? item.productNameAr : item.productName}</span>
                              <span className="text-neutral-500">
                                {item.quantity} × {item.price} DZD
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Footer price & totals */}
                    <div className="flex justify-between items-center pt-2.5 border-t border-neutral-150 dark:border-neutral-800/80">
                      <div>
                        <span className="text-neutral-400">{isAr ? "طريقة الدفع: " : "Payment: "}</span>
                        <span className="font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded text-[10px]">
                          {order.paymentMethod === "COD" ? (isAr ? "💸 الدفع عند الاستلام (COD)" : "Cash on Delivery") : `💳 ${order.paymentMethod}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-neutral-400">{isAr ? "المبلغ الكلي شامل الشحن: " : "Total to Collect: "}</span>
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">
                          {order.total} DZD
                        </span>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: REVIEW MODERATION DESK */}
        {/* ==================================================================== */}
        {adminTab === "reviews" && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-6" id="admin-reviews-tab">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-white pb-4 border-b border-neutral-100 dark:border-neutral-800">
              ⭐ {isAr ? "مراقبة وإدارة تعليقات المشتريين" : "Customer Review Moderation"}
            </h3>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {reviews.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-400">
                  {isAr ? "لا توجد مراجعات مضافة حالياً" : "No submitted reviews yet."}
                </div>
              ) : (
                reviews.map(rev => {
                  const prod = products.find(p => p.id === rev.productId);
                  return (
                    <div key={rev.id} className="py-4 flex flex-col sm:flex-row justify-between items-start gap-4 text-xs">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 dark:text-white">{rev.userName}</span>
                          <span className="text-neutral-400 font-mono text-[10px]">{rev.date}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            rev.approved 
                              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600" 
                              : "bg-rose-50 dark:bg-rose-950/20 text-rose-500"
                          }`}>
                            {rev.approved ? (isAr ? "معتمد ومرئي" : "Approved") : (isAr ? "مخفي ومرفوض" : "Hidden")}
                          </span>
                        </div>
                        {prod && (
                          <div className="text-[10px] text-neutral-400 font-bold">
                            {isAr ? "على المنتج:" : "On Product:"} {isAr ? prod.nameAr : prod.name}
                          </div>
                        )}
                        <div className="flex text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} size={11} className="fill-current" />
                          ))}
                        </div>
                        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed italic">
                          "{rev.comment}"
                        </p>
                      </div>

                      <div className="flex gap-2 self-end sm:self-center">
                        {rev.approved ? (
                          <button
                            onClick={() => handleReviewModeration(rev.id, false)}
                            className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 py-1.5 px-3 rounded-lg font-bold"
                          >
                            {isAr ? "حجب التعليق" : "Reject / Hide"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReviewModeration(rev.id, true)}
                            className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 py-1.5 px-3 rounded-lg font-bold"
                          >
                            {isAr ? "موافقة ونشر" : "Approve & Show"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: BROADCAST PANEL */}
        {/* ==================================================================== */}
        {adminTab === "campaigns" && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-6" id="admin-broadcast-tab">
            <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <h3 className="text-sm font-bold text-neutral-800 dark:text-white flex items-center gap-1.5">
                <Sparkles size={16} className="text-indigo-600 animate-pulse" />
                <span>{isAr ? "برودكاست وحملات إعلانية فورية" : "Store Broadcast Campaigns"}</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                {isAr ? "أرسل إعلان ترويجي أو خصومات فورية لتظهر في شريط الإشعارات للعملاء فوراً" : "Send custom discounts, coupons, or promo alerts to customer notification drawers in real time"}
              </p>
            </div>

            {campaignSuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl flex gap-3 text-xs font-bold items-center">
                <CheckCircle size={18} />
                <span>{isAr ? "🎉 تم بث الحملة الإعلانية بنجاح لجميع العملاء!" : "🎉 Promotional campaign successfully broadcasted!"}</span>
              </div>
            )}

            <form onSubmit={handleSendCampaign} className="space-y-4 max-w-2xl text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-500">{isAr ? "عنوان الحملة (English):" : "Campaign Title (English):"}</label>
                  <input
                    type="text"
                    placeholder="e.g. Summer discount 10%!"
                    value={promoTitle}
                    onChange={(e) => setPromoTitle(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-500">{isAr ? "عنوان الحملة (العربية):" : "Campaign Title (Arabic):"}</label>
                  <input
                    type="text"
                    placeholder="مثال: خصم الصيف 10% على العطور!"
                    value={promoTitleAr}
                    onChange={(e) => setPromoTitleAr(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-500">{isAr ? "التفاصيل (English):" : "Message details (English):"}</label>
                  <textarea
                    placeholder="Use code MIN10 for discount"
                    value={promoMessage}
                    onChange={(e) => setPromoMessage(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-500">{isAr ? "التفاصيل (العربية):" : "Message details (Arabic):"}</label>
                  <textarea
                    placeholder="استخدم الرمز MIN10 للحصول على الخصم عند الدفع"
                    value={promoMessageAr}
                    onChange={(e) => setPromoMessageAr(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition cursor-pointer"
              >
                {isAr ? "بث الإعلان الآن" : "Broadcast Promo Now"}
              </button>
            </form>

          </div>
        )}

      </div>

      {/* ==================================================================== */}
      {/* PRODUCT CREATION/EDITING MODAL */}
      {/* ==================================================================== */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            <button onClick={() => setShowProductModal(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800 dark:hover:text-white">
              <XCircle size={22} />
            </button>

            <h3 className="text-base font-black text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
              {editingProduct ? (isAr ? "تعديل المنتج" : "Modify Product Detail") : (isAr ? "إنشاء منتج جديد" : "Create New Inventory Entry")}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              
              {/* Name rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-400">{isAr ? "اسم المنتج (English):" : "Product Name (English):"}</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-400">{isAr ? "اسم المنتج (العربية):" : "Product Name (Arabic):"}</label>
                  <input
                    type="text"
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Price / Stock rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-400">{isAr ? "السعر (بالدينار DZD):" : "Price (in DZD):"}</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-400">{isAr ? "المخزون المتوفر:" : "Initial Stock Quantity:"}</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Category selector rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-400">{isAr ? "الفئة (English):" : "Category (English):"}</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-2 py-2 text-xs focus:outline-none"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Beauty & Perfumes">Beauty & Perfumes</option>
                    <option value="Traditional Food">Traditional Food</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Fashion & Clothes">Fashion & Clothes</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-400">{isAr ? "الفئة (العربية):" : "Category (Arabic):"}</label>
                  <select
                    value={formCategoryAr}
                    onChange={(e) => setFormCategoryAr(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-2 py-2 text-xs focus:outline-none"
                  >
                    <option value="الإلكترونيات">الإلكترونيات</option>
                    <option value="الجمال والعطور">الجمال والعطور</option>
                    <option value="الأغذية التقليدية">الأغذية التقليدية</option>
                    <option value="المنزل والمطبخ">المنزل والمطبخ</option>
                    <option value="الأزياء والملابس">الأزياء والملابس</option>
                  </select>
                </div>
              </div>

              {/* Image URL row */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-400">{isAr ? "رابط الصورة عالية الجودة (Unsplash):" : "Product Image URL (High quality Unsplash):"}</label>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  required
                />
              </div>

              {/* Detailed Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-400">{isAr ? "الوصف بالتفصيل (English):" : "Description Detail (English):"}</label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none h-20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-400">{isAr ? "الوصف بالتفصيل (العربية):" : "Description Detail (Arabic):"}</label>
                  <textarea
                    value={formDescAr}
                    onChange={(e) => setFormDescAr(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none h-20"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-250 py-2.5 rounded-xl font-bold transition text-neutral-600 dark:text-neutral-300"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-xl text-white font-bold transition shadow-md cursor-pointer"
                >
                  {isAr ? "حفظ ومزامنة" : "Save Product"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

interface WilayaBarProps {
  name: string;
  sales: string;
  val: string;
}

function WilayaBar({ name, sales, val }: WilayaBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-bold">
        <span>{name}</span>
        <span className="font-mono text-indigo-600 dark:text-indigo-400">{val}</span>
      </div>
      <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-600 rounded-full" style={{ width: sales }} />
      </div>
    </div>
  );
}
