/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Review } from "../types";

export const initialProducts: Product[] = [
  {
    id: "prod-1",
    name: "Premium Oud Al-Jazaïr Perfume - 100ml",
    nameAr: "عطر عود الجزائر الفاخر - 100 مل",
    description: "An elegant, long-lasting oriental fragrance with notes of rare oud, rich amber, and subtle Algerian rose, perfect for special occasions.",
    descriptionAr: "عطر شرقي راقٍ يدوم طويلاً، مع نفحات من العود النادر والأنبر الغني والورد الجزائري الأصيل، مثالي للمناسبات الخاصة.",
    price: 8500,
    category: "Beauty & Perfumes",
    categoryAr: "الجمال والعطور",
    subcategory: "Fragrances",
    subcategoryAr: "العطور",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80",
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80"
    ],
    stock: 25,
    rating: 4.8,
    reviewsCount: 14,
    isBestSeller: true
  },
  {
    id: "prod-2",
    name: "Genuine Algerian Deglet Nour Dates - 1kg Premium",
    nameAr: "تمور دقلة نور الجزائرية الأصلية - 1 كغ ممتازة",
    description: "Freshly harvested from the golden palms of Tolga (Biskra). These dates are translucent, soft, honey-sweet, and highly nutritious.",
    descriptionAr: "تمور طازجة من مزارع طولقة (بسكرة)، دقلة نور ذهبية شفافة، طرية، غنية بالعسل ومغذية جداً.",
    price: 1200,
    category: "Traditional Food",
    categoryAr: "الأغذية التقليدية",
    subcategory: "Dates & Sweets",
    subcategoryAr: "التمور والحلويات",
    images: [
      "https://images.unsplash.com/photo-1566393028639-d108a42c46a7?w=600&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80"
    ],
    stock: 150,
    rating: 4.9,
    reviewsCount: 38,
    isBestSeller: true,
    isRecommended: true
  },
  {
    id: "prod-3",
    name: "Smart Watch Minga Active Series 5",
    nameAr: "ساعة ذكية مينغا أكتيف 5",
    description: "Premium fitness watch with GPS, AMOLED color screen, health indicators (heart rate, blood oxygen), and water resistance up to 50m.",
    descriptionAr: "ساعة رياضية ذكية مع ميزة تحديد المواقع GPS، شاشة AMOLED ملونة، حساسات لقياس معدل ضربات القلب والأكسجين، مقاومة للماء حتى 50 متر.",
    price: 14500,
    category: "Electronics",
    categoryAr: "الإلكترونيات",
    subcategory: "Smart Devices",
    subcategoryAr: "الأجهزة الذكية",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&q=80"
    ],
    stock: 45,
    rating: 4.6,
    reviewsCount: 22,
    isNewArrival: true,
    isRecommended: true
  },
  {
    id: "prod-4",
    name: "Espresso Maker Machine 15-Bar Pro",
    nameAr: "آلة صنع قهوة الإسبريسو 15 بار برو",
    description: "Get the coffeehouse experience at home. Features a powerful 15-bar pump, milk frother steam wand, and a dual-cup portafilter.",
    descriptionAr: "اصنع قهوة احترافية في منزلك. تتميز بمضخة ضغط 15 بار، أنبوب بخار لتكثيف الحليب، وحامل فلتر مزدوج للأكواب.",
    price: 26000,
    category: "Home & Kitchen",
    categoryAr: "المنزل والمطبخ",
    subcategory: "Home Appliances",
    subcategoryAr: "الأجهزة المنزلية",
    images: [
      "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=600&q=80",
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80"
    ],
    stock: 12,
    rating: 4.7,
    reviewsCount: 9,
    isRecommended: true
  },
  {
    id: "prod-5",
    name: "Handmade Kabyle Wool Rug - Traditional Pattern",
    nameAr: "سجاد قبائلي مصنوع يدوياً - زركشة تقليدية",
    description: "Woven by skilled female artisans in the mountains of Tizi Ouzou. Made with 100% pure organic sheep wool and natural vegetable dyes.",
    descriptionAr: "منسوج يدوياً بأنامل حرفيات قبائليات في جبال تيزي وزو. مصنوع من صوف الأغنام الطبيعي 100% ومصبوغ بألوان نباتية طبيعية.",
    price: 38000,
    category: "Home & Kitchen",
    categoryAr: "المنزل والمطبخ",
    subcategory: "Home Decor",
    subcategoryAr: "الديكور المنزلي",
    images: [
      "https://images.unsplash.com/photo-1576016770956-debb63d90029?w=600&q=80",
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&q=80"
    ],
    stock: 3,
    rating: 5.0,
    reviewsCount: 6,
    isRecommended: true
  },
  {
    id: "prod-6",
    name: "Wireless Active Noise Cancelling Headphones",
    nameAr: "سماعات لاسلكية عازلة للضوضاء",
    description: "Over-ear bluetooth headphones with elite active noise cancellation, deep bass drivers, and up to 40 hours of continuous battery life.",
    descriptionAr: "سماعات بلوتوث رأسية مع ميزة عزل الضوضاء، صوت نقي وجهير عميق، وبطارية متميزة تدوم حتى 40 ساعة متواصلة.",
    price: 11200,
    category: "Electronics",
    categoryAr: "الإلكترونيات",
    subcategory: "Audio Devices",
    subcategoryAr: "أجهزة الصوت",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80"
    ],
    stock: 30,
    rating: 4.5,
    reviewsCount: 15,
    isNewArrival: true
  },
  {
    id: "prod-7",
    name: "Pure Cold-Pressed Algerian Olive Oil - 5L",
    nameAr: "زيت زيتون جزائري بكر معصور على البارد - 5 لتر",
    description: "Extra virgin olive oil from the green valleys of Bejaia. Extremely healthy, rich in antioxidants, with a beautiful aromatic flavor.",
    descriptionAr: "زيت زيتون بكر ممتاز من وديان بجاية الخضراء. صحي للغاية وغني بمضادات الأكسدة مع نكهة عطرية متميزة.",
    price: 5500,
    category: "Traditional Food",
    categoryAr: "الأغذية التقليدية",
    subcategory: "Oil & Honey",
    subcategoryAr: "الزيوت والعسل",
    images: [
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80",
      "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=600&q=80"
    ],
    stock: 60,
    rating: 4.9,
    reviewsCount: 29,
    isNewArrival: true
  },
  {
    id: "prod-8",
    name: "Men's Italian Leather Formal Shoes",
    nameAr: "حذاء كلاسيكي للرجال من الجلد الإيطالي",
    description: "Handcrafted formal shoes made with breathable genuine leather and comfortable padded insoles, tailored for long office hours.",
    descriptionAr: "حذاء كلاسيكي للرجال مصنوع يدوياً من الجلد الطبيعي الممتاز مع نعل داخلي مريح ومبطن، مصمم لساعات العمل الطويلة.",
    price: 9800,
    category: "Fashion & Clothes",
    categoryAr: "العمل والموضة",
    subcategory: "Footwear",
    subcategoryAr: "الأحذية",
    images: [
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80",
      "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=600&q=80"
    ],
    stock: 20,
    rating: 4.4,
    reviewsCount: 11,
    isRecommended: true
  }
];

export const initialReviews: Review[] = [
  {
    id: "rev-1",
    productId: "prod-1",
    userName: "Mohamed Amine",
    rating: 5,
    comment: "العطر مذهل ويدوم لأكثر من يوم كامل! الرائحة فخمة جداً وتجلب الكثير من المديح. أنصح به بشدة.",
    date: "2026-06-15",
    approved: true
  },
  {
    id: "rev-2",
    productId: "prod-1",
    userName: "Yasmine Belkacem",
    rating: 4,
    comment: "Très bon parfum, l'odeur d'oud est subtile et agréable. Livraison rapide sur Alger.",
    date: "2026-06-20",
    approved: true
  },
  {
    id: "rev-3",
    productId: "prod-2",
    userName: "Riad Touati",
    rating: 5,
    comment: "أحسن دقلة نور ذقتها في حياتي، عسلية وحبات كبيرة ومغلفة بطريقة محترفة ونظيفة.",
    date: "2026-06-12",
    approved: true
  },
  {
    id: "rev-4",
    productId: "prod-3",
    userName: "Khadidja Alger",
    rating: 5,
    comment: "ساعة ممتازة بطاريتها تدوم لأكثر من أسبوع كامل. الشاشة واضحة تحت الشمس وتطبيق الموبايل سهل جداً.",
    date: "2026-06-22",
    approved: true
  }
];

export const ALGERIAN_WILAYAS = [
  { id: "01", name: "Adrar", nameAr: "أدرار", cost: 1000 },
  { id: "02", name: "Chlef", nameAr: "الشلف", cost: 500 },
  { id: "03", name: "Laghouat", nameAr: "الأغواط", cost: 600 },
  { id: "04", name: "Oum El Bouaghi", nameAr: "أم البواقي", cost: 600 },
  { id: "05", name: "Batna", nameAr: "باتنة", cost: 600 },
  { id: "06", name: "Béjaïa", nameAr: "بجاية", cost: 500 },
  { id: "07", name: "Biskra", nameAr: "بسكرة", cost: 600 },
  { id: "08", name: "Béchar", nameAr: "بشار", cost: 900 },
  { id: "09", name: "Blida", nameAr: "البليدة", cost: 400 },
  { id: "10", name: "Bouira", nameAr: "البويرة", cost: 400 },
  { id: "11", name: "Tamanrasset", nameAr: "تمنراست", cost: 1200 },
  { id: "12", name: "Tébessa", nameAr: "تبسة", cost: 600 },
  { id: "13", name: "Tlemcen", nameAr: "تلمسان", cost: 600 },
  { id: "14", name: "Tiaret", nameAr: "تيارت", cost: 550 },
  { id: "15", name: "Tizi Ouzou", nameAr: "تيزي وزو", cost: 450 },
  { id: "16", name: "Alger (Algiers)", nameAr: "الجزائر العاصمة", cost: 350 },
  { id: "17", name: "Djelfa", nameAr: "الجلفة", cost: 550 },
  { id: "18", name: "Jijel", nameAr: "جيجل", cost: 500 },
  { id: "19", name: "Sétif", nameAr: "سطيف", cost: 500 },
  { id: "20", name: "Saïda", nameAr: "سعيدة", cost: 600 },
  { id: "21", name: "Skikda", nameAr: "سكيكدة", cost: 550 },
  { id: "22", name: "Sidi Bel Abbès", nameAr: "سيدي بلعباس", cost: 600 },
  { id: "23", name: "Annaba", nameAr: "عنابة", cost: 550 },
  { id: "24", name: "Guelma", nameAr: "قالمة", cost: 600 },
  { id: "25", name: "Constantine", nameAr: "قسنطينة", cost: 500 },
  { id: "26", name: "Médéa", nameAr: "المدية", cost: 450 },
  { id: "27", name: "Mostaganem", nameAr: "مستغانم", cost: 550 },
  { id: "28", name: "M'Sila", nameAr: "المسيلة", cost: 500 },
  { id: "29", name: "Mascara", nameAr: "معسكر", cost: 550 },
  { id: "30", name: "Ouargla", nameAr: "ورقلة", cost: 800 },
  { id: "31", name: "Oran", nameAr: "وهران", cost: 500 },
  { id: "32", name: "El Bayadh", nameAr: "البيض", cost: 700 },
  { id: "33", name: "Illizi", nameAr: "إليزي", cost: 1200 },
  { id: "34", name: "Bordj Bou Arréridj", nameAr: "برج بوعريريج", cost: 500 },
  { id: "35", name: "Boumerdès", nameAr: "بومرداس", cost: 400 },
  { id: "36", name: "El Tarf", nameAr: "الطارف", cost: 600 },
  { id: "37", name: "Tindouf", nameAr: "تندوف", cost: 1200 },
  { id: "38", name: "Tissemsilt", nameAr: "تيسمسيلت", cost: 550 },
  { id: "39", name: "El Oued", nameAr: "الوادي", cost: 700 },
  { id: "40", name: "Khenchela", nameAr: "خنشلة", cost: 600 },
  { id: "41", name: "Souk Ahras", nameAr: "سوق أهراس", cost: 600 },
  { id: "42", name: "Tipaza", nameAr: "تيبازة", cost: 400 },
  { id: "43", name: "Mila", nameAr: "ميلة", cost: 550 },
  { id: "44", name: "Aïn Defla", nameAr: "عين الدفلى", cost: 450 },
  { id: "45", name: "Naâma", nameAr: "النعامة", cost: 700 },
  { id: "46", name: "Aïn Témouchent", nameAr: "عين تموشنت", cost: 600 },
  { id: "47", name: "Ghardaïa", nameAr: "غرداية", cost: 700 },
  { id: "48", name: "Relizane", nameAr: "غليزان", cost: 550 },
  // Newly formed Wilayas
  { id: "49", name: "El M'Ghair", nameAr: "المغير", cost: 750 },
  { id: "50", name: "El Meniaa", nameAr: "المنيعة", cost: 800 },
  { id: "51", name: "Ouled Djellal", nameAr: "أولاد جلال", cost: 650 },
  { id: "52", name: "Bordj Baji Mokhtar", nameAr: "برج باجي مختار", cost: 1300 },
  { id: "53", name: "Béni Abbès", nameAr: "بني عباس", cost: 950 },
  { id: "54", name: "Timimoun", nameAr: "تيميمون", cost: 900 },
  { id: "55", name: "Touggourt", nameAr: "تقرت", cost: 800 },
  { id: "56", name: "Djanet", nameAr: "جانت", cost: 1300 },
  { id: "57", name: "In Salah", nameAr: "عين صالح", cost: 1000 },
  { id: "58", name: "In Guezzam", nameAr: "عين قزام", cost: 1300 }
];
