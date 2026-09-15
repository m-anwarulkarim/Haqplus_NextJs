import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { auth } from "@/lib/auth";

export interface HeroSlide {
  id: string;
  image: string;
  badge: string;
  title: string;
  highlightText?: string;
  description: string;
  primaryBtnText: string;
  primaryBtnLink: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
  tagline?: string;
  isActive?: boolean;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1600&auto=format&fit=crop&q=80",
    badge: "শ্রীমঙ্গলের ১০০% খাঁটি চা পাতা",
    title: "প্রতি চুমুতেই অনুভব করুন",
    highlightText: "খাঁটি চায়ের আসল আভিজাত্য",
    description: "শ্রীমঙ্গলের ঐতিহ্যবাহী চা বাগান থেকে বাছাইকৃত তাজা দুটি পাতা একটি কুঁড়ির প্রিমিয়াম চা। কড়া লিকার ও মনমাতানো সতেজ সুবাস।",
    primaryBtnText: "চা পাতা অর্ডার করুন",
    primaryBtnLink: "/shop",
    secondaryBtnText: "স্পেশাল অফার",
    secondaryBtnLink: "/deals",
    tagline: "২৪-৪৮ ঘণ্টার মধ্যে সারা দেশে হোম ডেলিভারি",
    isActive: true,
  },
  {
    id: "slide-2",
    image: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=1600&auto=format&fit=crop&q=80",
    badge: "১০০% প্রিমিয়াম অর্গানিক গ্রিন টি",
    title: "সতেজ মন ও সুস্বাস্থ্যের জন্য",
    highlightText: "খাঁটি অর্গানিক গ্রিন টি",
    description: "উচ্চমাত্রার অ্যান্টিঅক্সিডেন্ট ও মেটাবোলিজম বৃদ্ধিকারী উপাদান সমৃদ্ধ সিলেটের ফার্স্ট ফ্লাশ চা পাতা।",
    primaryBtnText: "গ্রিন টি দেখুন",
    primaryBtnLink: "/category/green-tea",
    secondaryBtnText: "অর্ডার করুন",
    secondaryBtnLink: "/shop",
    tagline: "রাসায়নিকমুক্ত ও শতভাগ ন্যাচারাল প্রসেসিং",
    isActive: true,
  },
  {
    id: "slide-3",
    image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=1600&auto=format&fit=crop&q=80",
    badge: "রাজকীয় স্পেশাল মসলা চা",
    title: "খাঁটি এলাচ ও দারুচিনির",
    highlightText: "স্পেশাল রয়েল মসলা চা",
    description: "আসল মসলার নিবিড় সুবাস ও কড়া লিকারের পারফেক্ট সংমিশ্রণ। বিকেলের আড্ডায় এনে দেবে নিখুঁত রাজকীয় স্বাদ।",
    primaryBtnText: "মসলা চা ট্রাই করুন",
    primaryBtnLink: "/category/masala-chai",
    secondaryBtnText: "সব কালেকশন",
    secondaryBtnLink: "/shop",
    tagline: "আসল এলাচ, দারুচিনি ও লবঙ্গের রাজকীয় ব্লেন্ড",
    isActive: true,
  },
  {
    id: "slide-4",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=1600&auto=format&fit=crop&q=80",
    badge: "ক্যাশ অন ডেলিভারি সুবিধা",
    title: "পণ্য হাতে পেয়ে পরখ করে",
    highlightText: "টাকা পরিশোধ করার সুযোগ",
    description: "কোনো অগ্রিম টাকা ছাড়াই অর্ডার করুন। ডেলিভারি ম্যানের কাছ থেকে প্যাকেট বুঝে নিয়ে সরাসরি ক্যাশ পেমেন্ট দিন।",
    primaryBtnText: "এখনই অর্ডার করুন",
    primaryBtnLink: "/shop",
    secondaryBtnText: "ট্র্যাকিং করুন",
    secondaryBtnLink: "/order/track",
    tagline: "শতভাগ সতেজ ও নিরাপদ প্যাকিং নিশ্চয়তা",
    isActive: true,
  },
];

const SLIDERS_FILE = path.join(process.cwd(), ".data", "hero_sliders.json");

function getSlidersFromFile(): HeroSlide[] {
  try {
    const dir = path.dirname(SLIDERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (fs.existsSync(SLIDERS_FILE)) {
      const fileData = fs.readFileSync(SLIDERS_FILE, "utf-8");
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error("Error reading hero_sliders.json:", err);
  }
  return DEFAULT_SLIDES;
}

export async function GET() {
  try {
    const slides = getSlidersFromFile();
    return NextResponse.json({ slides });
  } catch (error) {
    console.error("Hero sliders GET error:", error);
    return NextResponse.json({ slides: DEFAULT_SLIDES });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { slides } = await req.json();

    if (!Array.isArray(slides)) {
      return NextResponse.json({ error: "slides must be an array" }, { status: 400 });
    }

    const dir = path.dirname(SLIDERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(SLIDERS_FILE, JSON.stringify(slides, null, 2), "utf-8");

    return NextResponse.json({ message: "Hero sliders saved successfully", slides });
  } catch (error: any) {
    console.error("Hero sliders POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to save hero sliders" }, { status: 500 });
  }
}
