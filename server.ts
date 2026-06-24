/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Seed data imports (we copy the seed structure locally to avoid bundler mismatches)
import { initialProducts, initialReviews, ALGERIAN_WILAYAS } from "./src/data/products.js";
import { Product, Review, Order, AppNotification } from "./src/types";

const app = express();
const PORT = 3000;

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Server-authoritative in-memory state (acts as a fully functional mock DB)
let dbProducts: Product[] = [...initialProducts];
let dbReviews: Review[] = [...initialReviews];
let dbOrders: Order[] = [
  {
    id: "ord-101",
    customerName: "Imad Eddine",
    customerPhone: "0555123456",
    customerEmail: "imad@gmail.com",
    wilaya: "Alger (Algiers)",
    address: "12 Rue Didouche Mourad, Alger",
    items: [
      {
        productId: "prod-1",
        productName: "Premium Oud Al-Jazaïr Perfume - 100ml",
        productNameAr: "عطر عود الجزائر الفاخر - 100 مل",
        image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80",
        price: 8500,
        quantity: 1
      },
      {
        productId: "prod-2",
        productName: "Genuine Algerian Deglet Nour Dates - 1kg Premium",
        productNameAr: "تمور دقلة نور الجزائرية الأصلية - 1 كغ ممتازة",
        image: "https://images.unsplash.com/photo-1566393028639-d108a42c46a7?w=600&q=80",
        price: 1200,
        quantity: 2
      }
    ],
    subtotal: 10900,
    shippingCost: 350,
    total: 11250,
    paymentMethod: "COD",
    status: "Processing",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    trackingNumber: "MNG-83921"
  },
  {
    id: "ord-102",
    customerName: "Lydia Bouaza",
    customerPhone: "0661987654",
    customerEmail: "lydia.b@hotmail.com",
    wilaya: "Oran",
    address: "Plaza d'Armes, Oran",
    items: [
      {
        productId: "prod-3",
        productName: "Smart Watch Minga Active Series 5",
        productNameAr: "ساعة ذكية مينغا أكتيف 5",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
        price: 14500,
        quantity: 1
      }
    ],
    subtotal: 14500,
    shippingCost: 500,
    total: 15000,
    paymentMethod: "Edahabia",
    status: "Shipped",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    trackingNumber: "MNG-47201"
  }
];

let dbNotifications: AppNotification[] = [
  {
    id: "notif-1",
    title: "Welcome to Minga.com!",
    titleAr: "مرحباً بكم في مينغا.كوم!",
    message: "Explore modern online shopping with fast delivery to all 58 Wilayas of Algeria.",
    messageAr: "اكتشف متعة التسوق الإلكتروني العصري مع خدمة توصيل سريعة لكافة الولايات الـ 58.",
    type: "system",
    date: new Date().toISOString(),
    read: false
  },
  {
    id: "notif-2",
    title: "10% Off Traditional Foods",
    titleAr: "خصم 10% على الأغذية التقليدية",
    message: "Use code BILADI during checkout to save on premium Deglet Nour and extra virgin olive oil.",
    messageAr: "استخدم الرمز BILADI عند إتمام الطلب لتوفير 10% على دقلة نور الممتازة وزيت الزيتون البكر.",
    type: "promotion",
    date: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    read: false
  }
];

// Lazy-loaded Gemini Client Guard
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in user secrets or environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// ==========================================
// API ENDPOINTS
// ==========================================

// 1. Get all products
app.get("/api/products", (req, res) => {
  res.json(dbProducts);
});

// 2. Add product (Admin)
app.post("/api/products", (req, res) => {
  const { name, nameAr, description, descriptionAr, price, category, categoryAr, subcategory, subcategoryAr, images, stock, isNewArrival, isBestSeller, isRecommended } = req.body;
  
  if (!name || !nameAr || !price || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    name,
    nameAr,
    description: description || "",
    descriptionAr: descriptionAr || "",
    price: Number(price),
    category,
    categoryAr: categoryAr || category,
    subcategory: subcategory || "",
    subcategoryAr: subcategoryAr || subcategory || "",
    images: Array.isArray(images) && images.length > 0 ? images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"],
    stock: stock !== undefined ? Number(stock) : 10,
    rating: 5.0,
    reviewsCount: 0,
    isNewArrival: !!isNewArrival,
    isBestSeller: !!isBestSeller,
    isRecommended: !!isRecommended
  };

  dbProducts.push(newProduct);
  res.status(201).json(newProduct);
});

// 3. Update product (Admin)
app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const index = dbProducts.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: "Product not found" });

  const updated = {
    ...dbProducts[index],
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : dbProducts[index].price,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : dbProducts[index].stock,
  };

  dbProducts[index] = updated;
  res.json(updated);
});

// 4. Delete product (Admin)
app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  dbProducts = dbProducts.filter(p => p.id !== id);
  res.json({ success: true, message: "Product deleted" });
});

// 5. Get reviews
app.get("/api/reviews", (req, res) => {
  res.json(dbReviews);
});

// 6. Add review
app.post("/api/reviews", (req, res) => {
  const { productId, userName, rating, comment } = req.body;
  if (!productId || !userName || !rating) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    productId,
    userName,
    rating: Number(rating),
    comment: comment || "",
    date: new Date().toISOString().split("T")[0],
    approved: true // Auto-approve or moderate via admin panel
  };

  dbReviews.push(newReview);

  // Recalculate product rating & review count
  const product = dbProducts.find(p => p.id === productId);
  if (product) {
    const productReviews = dbReviews.filter(r => r.productId === productId && r.approved);
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    product.rating = Number((sum / productReviews.length).toFixed(1));
    product.reviewsCount = productReviews.length;
  }

  res.status(201).json(newReview);
});

// 7. Update review approval (Admin)
app.patch("/api/reviews/:id", (req, res) => {
  const { id } = req.params;
  const { approved } = req.body;
  const review = dbReviews.find(r => r.id === id);
  if (!review) return res.status(404).json({ error: "Review not found" });

  review.approved = approved;
  res.json(review);
});

// 8. Delete review
app.delete("/api/reviews/:id", (req, res) => {
  const { id } = req.params;
  dbReviews = dbReviews.filter(r => r.id !== id);
  res.json({ success: true, message: "Review deleted" });
});

// 9. Get all orders
app.get("/api/orders", (req, res) => {
  res.json(dbOrders);
});

// 10. Place order
app.post("/api/orders", (req, res) => {
  const { customerName, customerPhone, customerEmail, wilaya, address, items, paymentMethod } = req.body;
  
  if (!customerName || !customerPhone || !wilaya || !address || !items || items.length === 0) {
    return res.status(400).json({ error: "Missing checkout parameters" });
  }

  // Calculate costs on the server for security
  let subtotal = 0;
  const orderItems = items.map((item: any) => {
    const matchedProduct = dbProducts.find(p => p.id === item.productId);
    if (!matchedProduct) {
      throw new Error(`Product ${item.productId} not found`);
    }
    
    // Decrement stock
    matchedProduct.stock = Math.max(0, matchedProduct.stock - item.quantity);
    
    const price = matchedProduct.price;
    subtotal += price * item.quantity;

    return {
      productId: matchedProduct.id,
      productName: matchedProduct.name,
      productNameAr: matchedProduct.nameAr,
      image: matchedProduct.images[0],
      price,
      quantity: item.quantity
    };
  });

  const wilayaInfo = ALGERIAN_WILAYAS.find(w => w.name === wilaya || w.nameAr === wilaya);
  const shippingCost = wilayaInfo ? wilayaInfo.cost : 500;
  const total = subtotal + shippingCost;
  const randomTracking = `MNG-${Math.floor(10000 + Math.random() * 90000)}`;

  const newOrder: Order = {
    id: `ord-${Date.now().toString().slice(-6)}`,
    customerName,
    customerPhone,
    customerEmail: customerEmail || "",
    wilaya,
    address,
    items: orderItems,
    subtotal,
    shippingCost,
    total,
    paymentMethod,
    status: "Pending",
    date: new Date().toISOString(),
    trackingNumber: randomTracking
  };

  dbOrders.push(newOrder);

  // Add notification
  dbNotifications.unshift({
    id: `notif-${Date.now()}`,
    title: "New Order Placed!",
    titleAr: "تم تسجيل طلب جديد!",
    message: `Order #${newOrder.id} totals ${total} DZD. It will be delivered to ${wilaya} soon.`,
    messageAr: `الطلب رقم #${newOrder.id} بمجموع ${total} دج. سيتم توصيله لولاية ${wilaya} قريباً.`,
    type: "order",
    date: new Date().toISOString(),
    read: false
  });

  res.status(201).json(newOrder);
});

// 11. Update order status (Admin)
app.patch("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = dbOrders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  order.status = status;

  // Notification for status update
  const statusLabelsEn: Record<string, string> = {
    "Processing": "is now processing",
    "Shipped": "has been shipped",
    "Delivered": "has been delivered",
    "Cancelled": "was cancelled"
  };
  const statusLabelsAr: Record<string, string> = {
    "Processing": "قيد التحضير والتجهيز",
    "Shipped": "تم شحنه مع شركة التوصيل",
    "Delivered": "تم تسليمه بنجاح",
    "Cancelled": "تم إلغاؤه"
  };

  dbNotifications.unshift({
    id: `notif-${Date.now()}`,
    title: `Order #${order.id} ${status}!`,
    titleAr: `تحديث للطلب #${order.id}!`,
    message: `Your order in ${order.wilaya} ${statusLabelsEn[status] || status}.`,
    messageAr: `طلبك الموجه لولاية ${order.wilaya} أصبح ${statusLabelsAr[status] || status}.`,
    type: "order",
    date: new Date().toISOString(),
    read: false
  });

  res.json(order);
});

// 12. Get system notifications
app.get("/api/notifications", (req, res) => {
  res.json(dbNotifications);
});

// 13. Create custom notifications (Admin / Promotion)
app.post("/api/notifications", (req, res) => {
  const { title, titleAr, message, messageAr, type } = req.body;
  if (!title || !titleAr || !message || !messageAr) {
    return res.status(400).json({ error: "Missing notification parameters" });
  }

  const newNotif: AppNotification = {
    id: `notif-${Date.now()}`,
    title,
    titleAr,
    message,
    messageAr,
    type: type || "promotion",
    date: new Date().toISOString(),
    read: false
  };

  dbNotifications.unshift(newNotif);
  res.status(201).json(newNotif);
});

// 14. Mark notification read
app.post("/api/notifications/read", (req, res) => {
  dbNotifications.forEach(n => n.read = true);
  res.json({ success: true });
});

// 15. Get analytics & reporting (Admin Dashboard)
app.get("/api/stats", (req, res) => {
  const salesTotal = dbOrders.filter(o => o.status !== "Cancelled").reduce((acc, o) => acc + o.total, 0);
  const ordersCount = dbOrders.length;
  const productsCount = dbProducts.length;
  
  // Count unique clients
  const uniqueClients = new Set(dbOrders.map(o => o.customerPhone));
  const customersCount = uniqueClients.size || 12;

  // Monthly breakdown
  const monthlyData: Record<string, number> = {};
  dbOrders.forEach(order => {
    if (order.status === "Cancelled") return;
    const date = new Date(order.date);
    const monthName = date.toLocaleString("en-US", { month: "short" });
    monthlyData[monthName] = (monthlyData[monthName] || 0) + order.total;
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueByMonth = months.map(m => ({
    month: m,
    amount: monthlyData[m] || (m === "Jun" ? salesTotal : 0) // fallback to total for demo context if needed
  }));

  // Wilaya distribution
  const wilayaMap: Record<string, number> = {};
  dbOrders.forEach(o => {
    if (o.status !== "Cancelled") {
      wilayaMap[o.wilaya] = (wilayaMap[o.wilaya] || 0) + o.total;
    }
  });
  const wilayaSales = Object.entries(wilayaMap).map(([wilaya, sales]) => ({ wilaya, sales })).sort((a,b) => b.sales - a.sales);

  // Category distribution
  const categoryMap: Record<string, number> = {};
  dbOrders.forEach(order => {
    if (order.status === "Cancelled") return;
    order.items.forEach(item => {
      const prod = dbProducts.find(p => p.id === item.productId);
      const cat = prod ? prod.category : "Others";
      categoryMap[cat] = (categoryMap[cat] || 0) + item.quantity;
    });
  });
  const categorySales = Object.entries(categoryMap).map(([category, count]) => ({ category, count }));

  res.json({
    salesTotal,
    ordersCount,
    productsCount,
    customersCount,
    revenueByMonth,
    wilayaSales,
    categorySales,
    recentOrders: dbOrders.slice(-5)
  });
});

// 16. Support Chatbot (Gemini-powered)
app.post("/api/support", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  try {
    const ai = getGeminiClient();

    // Context preparation: list active catalog
    const catalogString = dbProducts.map(p => 
      `- [ID: ${p.id}] ${p.name} (${p.nameAr}): ${p.price} DZD (Category: ${p.category}, Stock left: ${p.stock})`
    ).join("\n");

    const systemPrompt = `You are the official customer service assistant of Minga.com (مينغا.كوم), Algeria's premier single-vendor e-commerce store. 
Minga.com offers secure, high-quality, authentic products directly from the owner, with delivery to all 58 Wilayas of Algeria.

Store Operations Rules:
1. Shipping is available to ALL 58 Wilayas.
   - Shipping is calculated dynamically by Wilaya: Algiers is 350 DZD, Northern Wilayas (Oran, Constantine, Setif, Tizi Ouzou, etc.) are 450-600 DZD, Deep South (Tamanrasset, Adrar, Djanet, In Salah, Tindouf) is 1000-1300 DZD.
   - Delivery time: 1-3 days for northern cities, 3-7 days for the south.
2. Payment methods supported:
   - Cash on Delivery (COD / الدفع عند الاستلام) - Highly popular! Customers pay the delivery driver upon receiving the package.
   - Algerian Edahabia Card (بطاقة الذهبية بريد الجزائر).
   - CCP Postal Transfer (الدفع عبر الحساب البريدي الجاري CCP).
   - Direct Bank Transfer (التحويل البنكي).
3. Refund Policy: Free return within 3 days if the product has a manufacturing defect or does not match the description.
4. Support Arabic (Algerian Darja or Modern Standard Arabic), French, and English. Keep answers friendly, professional, clear, and reassuring.

Active Product Catalog at Minga.com:
${catalogString}

Formulate a concise response (keep it under 150 words if possible) to the user's message, maintaining consistency with our available inventory, shipping policies, and payment terms. Address them as a valued guest of Minga.com.`;

    // Map conversation for Gemini content blocks
    const contentHistory = messages.map(m => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    // Generate output with gemini-3.5-flash
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...contentHistory
      ]
    });

    const botReply = response.text || "Sorry, I am having trouble connecting to my brain. Please try again or call our direct phone support.";
    res.json({ reply: botReply });
  } catch (err: any) {
    console.error("Gemini support chatbot error:", err);
    res.json({ 
      reply: "مرحباً! يبدو أنني أواجه صعوبة مؤقتة في الاتصال بنظام الذكاء الاصطناعي الخاص بنا. تفضل بطلبك، ويمكننا الرد عليك بخصوص الشحن والدفع في كافة الولايات الـ 58! الدفع عند الاستلام متوفر دائماً."
    });
  }
});

// ==========================================
// VITE DEV SERVER OR STATIC ASSETS
// ==========================================

async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start Server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Minga.com full-stack server running on http://localhost:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error("Failed to start Minga full-stack server:", err);
});
