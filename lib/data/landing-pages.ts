export interface LandingPageData {
  id: string;
  slug: string;
  title: string;
  bengaliTitle: string;
  subtitle: string;
  description: string;
  bannerImage: string;
  productImages: string[];
  featuredProductId: string;
  productName: string;
  originalPrice: number;
  offerPrice: number;
  deliveryChargeDhaka: number;
  deliveryChargeOutside: number;
  badge: string;
  isActive: boolean;
  features: string[];
  reviews: Array<{
    id: string;
    name: string;
    location: string;
    rating: number;
    comment: string;
    avatar?: string;
  }>;
}

export const LANDING_PAGES: LandingPageData[] = [
  {
    id: "landing-black-tea",
    slug: "black-tea-deal",
    title: "Sreemangal Premium CTC Black Tea Special Deal",
    bengaliTitle: "শ্রীমঙ্গল কড়া লিকার ব্ল্যাক টি — স্পেশাল ধামাকা অফার",
    subtitle: "২ কেজি চা পাতা অর্ডার করলেই পাচ্ছেন ৫০০ গ্রাম ফার্স্ট ক্যাটালগ চা ফ্রি!",
    description: "শ্রীমঙ্গলের সতেজ দুটি পাতা একটি কুঁড়ির কড়া লিকার ও মনমাতানো সুবাসের ব্ল্যাক টি। কোনো ক্ষতিকর কেমিক্যাল বা ভেজাল ছাড়াই সরাসরি বাগান থেকে প্যাকেটজাত।",
    bannerImage: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=1200&auto=format&fit=crop&q=80",
    productImages: [
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80",
    ],
    featuredProductId: "tea-1",
    productName: "HaqPlus শ্রীমঙ্গল প্রিমিয়াম সিটিসি ব্ল্যাক টি (১ কেজি স্পেশাল প্যাক)",
    originalPrice: 750,
    offerPrice: 550,
    deliveryChargeDhaka: 60,
    deliveryChargeOutside: 120,
    badge: "🔥 হট অফার — ৩৫% ছাড়",
    isActive: true,
    features: [
      "১০০% খাঁটি ও তাজা বাগান থেকে সরাসরি সংগৃহীত",
      "অসাধারণ কড়া লিকার ও চমৎকার প্রাকৃতিক সুবাস",
      "কোনো কৃত্রিম রঙ বা ক্ষতিকর ফ্লেভার মেশানো নেই",
      "ক্যাশ অন ডেলিভারি (পণ্য দেখে মূল্য পরিশোধ করুন)",
    ],
    reviews: [
      {
        id: "rev-1",
        name: "তানভীর আহমেদ",
        location: "মিরপুর, ঢাকা",
        rating: 5,
        comment: "চা পাতা এত সুন্দর কড়া লিকার হবে ভাবিনি! সকালেই এক কাপ খেলে সারাদিনের ক্লান্তি দূর হয়ে যায়।",
      },
      {
        id: "rev-2",
        name: "শরিফুল ইসলাম",
        location: "সিলেট",
        rating: 5,
        comment: "ডেলিভারি খুব দ্রুত পেয়েছি। খাঁটি শ্রীমঙ্গলের চায়ের আসল স্বাদ পেলাম। ধন্যবাদ হকপ্লাস!",
      },
    ],
  },
  {
    id: "landing-green-tea",
    slug: "green-tea-special",
    title: "Organic First Flush Green Tea Health Package",
    bengaliTitle: "হকপ্লাস অর্গানিক ফার্স্ট ফ্লাশ গ্রিন টি — হেলথ প্যাকেজ",
    subtitle: "ওজন নিয়ন্ত্রণ, স্কিন গ্লো ও রোগ প্রতিরোধে ১০০% খাঁটি অর্গানিক গ্রিন টি",
    description: "প্রাকৃতিক অ্যান্টিঅক্সিডেন্ট ও কচি চা পাতার সতেজতায় ভরপুর ফার্স্ট ফ্লাশ গ্রিন টি। শরীর চাঙ্গা রাখতে ও তারুণ্য ধরে রাখতে প্রতিদিন সকালে এক কাপ অতুলনীয়।",
    bannerImage: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=1200&auto=format&fit=crop&q=80",
    productImages: [
      "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&auto=format&fit=crop&q=80",
    ],
    featuredProductId: "tea-2",
    productName: "HaqPlus অর্গানিক ফার্স্ট ফ্লাশ গ্রিন টি (৫০০ গ্রাম ওয়েলনেস প্যাক)",
    originalPrice: 900,
    offerPrice: 690,
    deliveryChargeDhaka: 60,
    deliveryChargeOutside: 120,
    badge: "🌿 ১০০% প্রাকৃতিক ও ক্যাফেইন ফ্রি",
    isActive: true,
    features: [
      "মেটাবলিজম বাড়াতে ও অতিরিক্ত চর্বি কমাতে অত্যন্ত কার্যকরী",
      "ত্বকের উজ্জ্বলতা বাড়াতে ও বিষাক্ত টক্সিন দূর করতে সাহায্য করে",
      "ফার্স্ট ফ্লাশ কচি পাতার ফ্রেস ও ন্যাচারাল সুবাস",
      "সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা",
    ],
    reviews: [
      {
        id: "rev-3",
        name: "নুসরাত জাহান",
        location: "ধানমন্ডি, ঢাকা",
        rating: 5,
        comment: "নিয়মিত এই গ্রিন টি খাচ্ছি। টেস্ট খুব লাইট এবং স্কিনে খুব ভালো চেঞ্জ ফিল করছি।",
      },
    ],
  },
  {
    id: "landing-masala-chai",
    slug: "royal-masala-chai",
    title: "Handcrafted Royal Masala Chai Combo",
    bengaliTitle: "হকপ্লাস স্পেশাল রয়েল মসলা চা — রাজকীয় কম্বো",
    subtitle: "খাঁটি এলাচ, দারুচিনি, আদা ও তেজপাতার নিখুঁত সংমিশ্রণে তৈরি রয়েল চা!",
    description: "খাঁটি দেশীয় মসলার ঘ্রাণে বিকেলের আড্ডা জমজমাট করতে নিয়ে এলাম রাজকীয় মসলা চা কম্বো। প্রতিটি কাপেই পাবেন আসল রাজকীয় স্বাদ।",
    bannerImage: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=1200&auto=format&fit=crop&q=80",
    productImages: [
      "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800&auto=format&fit=crop&q=80",
    ],
    featuredProductId: "tea-3",
    productName: "HaqPlus স্পেশাল রয়েল মসলা চা (৫০০ গ্রাম মেগা প্যাক)",
    originalPrice: 850,
    offerPrice: 620,
    deliveryChargeDhaka: 60,
    deliveryChargeOutside: 120,
    badge: "☕ রাজকীয় মসলা স্বাদের গ্যারান্টি",
    isActive: true,
    features: [
      "খাঁটি এলাচ, লবঙ্গ, দারুচিনি ও গোলমরিচ সমৃদ্ধ",
      "ঠাণ্ডা কাশির উপশম ও গলা সতেজ রাখতে দারুণ উপযোগী",
      "বৃষ্টির দিনে বা অতিথিদের আপ্যায়নে প্রথম পছন্দ",
      "হাতে পেয়ে চেক করে টাকা দেওয়ার সুবিধা",
    ],
    reviews: [
      {
        id: "rev-4",
        name: "মো: রফিকুল ইসলাম",
        location: "চট্টগ্রাম",
        rating: 5,
        comment: "মসলার ঘ্রাণ এক কথায় অসাধারণ! পরিবারে সবাই পছন্দ করেছে।",
      },
    ],
  },
];

export function getLandingPageBySlug(slug: string): LandingPageData | undefined {
  return LANDING_PAGES.find((p) => p.slug === slug || p.id === slug);
}
