export interface TeaCategory {
  id: string;
  name: string;
  bengaliName: string;
  slug: string;
  description: string;
  image: string;
  itemCount: string;
  color: string;
}

export interface TeaProduct {
  id: string;
  name: string;
  bengaliName: string;
  slug: string;
  description: string;
  basePrice: number;
  discountPrice: number;
  price: number;
  originalPrice: number;
  images: string[];
  category: string;
  categoryName: string;
  categorySlug: string;
  sku: string;
  stock: number;
  weight: string;
  origin: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isFeatured: boolean;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  variants?: Array<{
    id: string;
    size?: string;
    weight?: string;
    price: number;
    stock: number;
    sku: string;
  }>;
}

export const TEA_CATEGORIES: TeaCategory[] = [
  {
    id: "cat-black-tea",
    name: "Black Tea",
    bengaliName: "ব্ল্যাক টি",
    slug: "black-tea",
    description: "শ্রীমঙ্গল ও সিলেটের সেরা বাগান থেকে কড়া লিকার ও মনমাতানো সুবাসের ব্ল্যাক টি",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
    itemCount: "১২+ পণ্য",
    color: "from-amber-700/15 to-amber-900/15",
  },
  {
    id: "cat-green-tea",
    name: "Green Tea",
    bengaliName: "গ্রিন টি",
    slug: "green-tea",
    description: "১০০% অর্গানিক ফার্স্ট ফ্লাশ ও অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ ফ্রেশ গ্রিন টি",
    image: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800&auto=format&fit=crop&q=80",
    itemCount: "৮+ পণ্য",
    color: "from-emerald-500/15 to-teal-500/15",
  },
  {
    id: "cat-masala-chai",
    name: "Masala Chai",
    bengaliName: "রয়েল মসলা চা",
    slug: "masala-chai",
    description: "এলাচ, দারুচিনি, লবঙ্গ, গোলমরিচ ও আদার সাথে সুগন্ধি কড়া মসলা চা",
    image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800&auto=format&fit=crop&q=80",
    itemCount: "৬+ পণ্য",
    color: "from-orange-500/15 to-amber-600/15",
  },
  {
    id: "cat-herbal-tea",
    name: "Herbal & Wellness",
    bengaliName: "ভেষজ ও হারবাল টি",
    slug: "herbal-tea",
    description: "তুলসি, আদা ও জেসমিন ফুলের ভেষজ ও প্রাকৃতিক উপশমকারী হারবাল চা",
    image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&auto=format&fit=crop&q=80",
    itemCount: "১০+ পণ্য",
    color: "from-lime-500/15 to-emerald-600/15",
  },
  {
    id: "cat-orthodox-tea",
    name: "Orthodox Tea",
    bengaliName: "অর্থোডক্স চা",
    slug: "orthodox-tea",
    description: "হাতে বাছাই করা সোনালী কুঁড়ি সমৃদ্ধ প্রিমিয়াম গোল্ডেন অর্থোডক্স চা",
    image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=800&auto=format&fit=crop&q=80",
    itemCount: "৫+ পণ্য",
    color: "from-yellow-600/15 to-amber-700/15",
  },
];

export const TEA_PRODUCTS: TeaProduct[] = [
  {
    id: "tea-1",
    name: "HaqPlus Sreemangal Premium CTC Black Tea (400g)",
    bengaliName: "হকপ্লাস শ্রীমঙ্গল প্রিমিয়াম সিটিসি ব্ল্যাক টি (৪০০ গ্রাম)",
    slug: "haqplus-sreemangal-ctc-black-tea-400g",
    description:
      "শ্রীমঙ্গলের ঐতিহ্যবাহী চা বাগান থেকে বাছাইকৃত তাজা দুটি পাতা একটি কুঁড়ি দিয়ে আধুনিক সিটিসি পদ্ধতিতে তৈরি। এতে রয়েছে কড়া লালচে লিকার, চমৎকার ঝাঁজ এবং সতেজ প্রাকৃতিক সুবাস। প্রতিদিনের সকাল বা বিকেলের দুধ চা অথবা রঙ চা উভয়ের জন্যই অতুলনীয়।",
    basePrice: 320,
    discountPrice: 280,
    price: 280,
    originalPrice: 320,
    weight: "400g",
    origin: "Sreemangal, Sylhet",
    images: [
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80",
    ],
    category: "black-tea",
    categoryName: "Black Tea (ব্ল্যাক টি)",
    categorySlug: "black-tea",
    sku: "HAQ-CTC-400",
    stock: 95,
    rating: 4.9,
    reviewCount: 342,
    inStock: true,
    isFeatured: true,
    isActive: true,
    metaTitle: "HaqPlus শ্রীমঙ্গল প্রিমিয়াম সিটিসি ব্ল্যাক টি — Buy Online",
    metaDescription: "শ্রীমঙ্গলের সেরা বাগানের কড়া লিকারের প্রিমিয়াম ব্ল্যাক টি কিনুন হকপ্লাস থেকে।",
  },
  {
    id: "tea-2",
    name: "HaqPlus Organic First Flush Green Tea (200g)",
    bengaliName: "হকপ্লাস অর্গানিক ফার্স্ট ফ্লাশ গ্রিন টি (২০০ গ্রাম)",
    slug: "haqplus-organic-first-flush-green-tea-200g",
    description:
      "১০০% প্রাকৃতিক ও রাসায়নিকমুক্ত কচি চা পাতার ফার্স্ট ফ্লাশ গ্রিন টি। উচ্চমাত্রার অ্যান্টিঅক্সিডেন্ট ও পলিফেনলে সমৃদ্ধ, যা ওজন নিয়ন্ত্রণ, তারুণ্য ধরে রাখা এবং মেটাবলিজম বাড়াতে বিশেষ কার্যকর। হালকা মিষ্টি সুবাস ও সতেজ স্বাদ。",
    basePrice: 450,
    discountPrice: 390,
    price: 390,
    originalPrice: 450,
    weight: "200g",
    origin: "Sylhet Organic Garden",
    images: [
      "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&auto=format&fit=crop&q=80",
    ],
    category: "green-tea",
    categoryName: "Green Tea (গ্রিন টি)",
    categorySlug: "green-tea",
    sku: "HAQ-GRN-200",
    stock: 75,
    rating: 4.8,
    reviewCount: 189,
    inStock: true,
    isFeatured: true,
    isActive: true,
    metaTitle: "HaqPlus অর্গানিক ফার্স্ট ফ্লাশ গ্রিন টি — 100% Pure Green Tea",
    metaDescription: "প্রাকৃতিক অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ অর্গানিক গ্রিন টি কিনুন হকপ্লাস থেকে।",
  },
  {
    id: "tea-3",
    name: "HaqPlus Royal Masala Chai Blend (250g)",
    bengaliName: "হকপ্লাস স্পেশাল রয়েল মসলা চা (২৫০ গ্রাম)",
    slug: "haqplus-royal-masala-chai-blend-250g",
    description:
      "খাঁটি এলাচ, দারুচিনি, লবঙ্গ, শুকনো আদা, তেজপাতা ও কালো গোলমরিচের সাথে বিশেষ সিটিসি চায়ের নিখুঁত সংমিশ্রণ। বৃষ্টির দিনে বা আড্ডার টেবিলে খাঁটি মশলা চায়ের আসল রাজকীয় স্বাদ।",
    basePrice: 390,
    discountPrice: 340,
    price: 340,
    originalPrice: 390,
    weight: "250g",
    origin: "Handcrafted Artisan Blend",
    images: [
      "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=800&auto=format&fit=crop&q=80",
    ],
    category: "masala-chai",
    categoryName: "Masala Chai (মসলা চা)",
    categorySlug: "masala-chai",
    sku: "HAQ-MSL-250",
    stock: 64,
    rating: 4.9,
    reviewCount: 278,
    inStock: true,
    isFeatured: true,
    isActive: true,
    metaTitle: "HaqPlus রয়েল মসলা চা — খাঁটি মশলার রাজকীয় স্বাদ",
    metaDescription: "আসল এলাচ, দারুচিনি ও আদা মিশ্রিত স্পেশাল মসলা চা কিনুন হকপ্লাস থেকে।",
  },
  {
    id: "tea-4",
    name: "HaqPlus Sylhet Orthodox Golden Tip Tea (150g)",
    bengaliName: "হকপ্লাস সিলেট অর্থোডক্স গোল্ডেন টিপ টি (১৫০ গ্রাম)",
    slug: "haqplus-sylhet-orthodox-golden-tip-tea-150g",
    description:
      "হাতে বাছাই করা সোনালী কুঁড়ি (Golden Tips) সমৃদ্ধ ক্লাসিক অর্থোডক্স চা। বিশ্বখ্যাত চা রসিকদের প্রথম পছন্দ। লিকারে সোনালী আভা ও চমৎকার স্মুথ ফ্লোরাল ফ্লেভারের পূর্ণ তৃপ্তি।",
    basePrice: 580,
    discountPrice: 520,
    price: 520,
    originalPrice: 580,
    weight: "150g",
    origin: "Sylhet Highland Estate",
    images: [
      "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
    ],
    category: "orthodox-tea",
    categoryName: "Orthodox Tea (অর্থোডক্স চা)",
    categorySlug: "orthodox-tea",
    sku: "HAQ-GLD-150",
    stock: 40,
    rating: 5.0,
    reviewCount: 96,
    inStock: true,
    isFeatured: true,
    isActive: true,
    metaTitle: "HaqPlus সিলেট অর্থোডক্স গোল্ডেন টি — Premium Orthodox Tea",
    metaDescription: "সোনালী কুঁড়ির খাঁটি অর্থোডক্স ব্ল্যাক টি। ঘরে বসেই উপভোগ করুন রাজকীয় চা।",
  },
  {
    id: "tea-5",
    name: "HaqPlus Tulsi Ginger Herbal Wellness Tea (100g)",
    bengaliName: "হকপ্লাস তুলসি আদা ভেষজ ওয়েলনেস টি (১০০ গ্রাম)",
    slug: "haqplus-tulsi-ginger-herbal-tea-100g",
    description:
      "প্রাকৃতিক তুলসি পাতা ও আদার উপকারি গুণে ঠাণ্ডা, সর্দি ও ক্লান্তি দূর করতে অনন্য ভেষজ চা। ক্যাফেইনমুক্ত বা লো-ক্যাফেইন ভেষজ ব্লেন্ড যা রোগ প্রতিরোধ ক্ষমতা বাড়াতে সাহায্য করে।",
    basePrice: 300,
    discountPrice: 260,
    price: 260,
    originalPrice: 300,
    weight: "100g",
    origin: "Organic Herbal Estate",
    images: [
      "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&auto=format&fit=crop&q=80",
    ],
    category: "herbal-tea",
    categoryName: "Herbal Tea (ভেষজ চা)",
    categorySlug: "herbal-tea",
    sku: "HAQ-TLS-100",
    stock: 50,
    rating: 4.8,
    reviewCount: 112,
    inStock: true,
    isFeatured: true,
    isActive: true,
    metaTitle: "HaqPlus তুলসি আদা ভেষজ চা — Natural Herbal Tea",
    metaDescription: "ঠাণ্ডা-কাশি উপশমে ও রোগ প্রতিরোধে তুলসি-আদা ভেষজ চা কিনুন হকপ্লাস থেকে।",
  },
  {
    id: "tea-6",
    name: "HaqPlus Jasmine Blossom Green Tea (150g)",
    bengaliName: "হকপ্লাস জেসমিন ব্লসম গ্রিন টি (১৫০ গ্রাম)",
    slug: "haqplus-jasmine-blossom-green-tea-150g",
    description:
      "তাজা জুঁই ফুলের প্রাকৃতিক পাপড়ির নির্যাস মাখানো ফার্স্ট গ্রেড গ্রিন টি। মিষ্টি মন মাতানো সুবাস সারাদিনের ক্লান্তি দূর করে মনকে শান্ত ও প্রফুল্ল রাখে।",
    basePrice: 500,
    discountPrice: 450,
    price: 450,
    originalPrice: 500,
    weight: "150g",
    origin: "Highland Flower Garden",
    images: [
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800&auto=format&fit=crop&q=80",
    ],
    category: "green-tea",
    categoryName: "Green Tea (গ্রিন টি)",
    categorySlug: "green-tea",
    sku: "HAQ-JSM-150",
    stock: 35,
    rating: 4.9,
    reviewCount: 84,
    inStock: true,
    isFeatured: true,
    isActive: true,
    metaTitle: "HaqPlus জেসমিন গ্রিন টি — Jasmine Blossom Green Tea",
    metaDescription: "জুঁই ফুলের মিষ্টি সুবাসে তৈরি ফ্রেশ জেসমিন গ্রিন টি কিনুন হকপ্লাস থেকে।",
  },
];
