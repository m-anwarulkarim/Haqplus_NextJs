"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  ChevronDown,
  Phone,
  MessageCircle,
  Leaf,
  Coffee,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FAQItem {
  question: string;
  answer: string;
  category: "product" | "order" | "delivery" | "payment";
}

const FAQS: FAQItem[] = [
  {
    category: "product",
    question: "হকপ্লাস (haqplus) চা পাতার বিশেষত্ব কী?",
    answer: "হকপ্লাস চা সরাসরি শ্রীমঙ্গল ও সিলেটের ঐতিহ্যবাহী চা বাগানগুলো থেকে সংগৃহীত তাজা দুটি পাতা একটি কুঁড়ির প্রিমিয়াম চা। এতে কোনো কৃত্রিম ফ্লেভার, কেমিক্যাল বা রং মেশানো হয় না। এটি কড়া লিকার, সোনালী আভা এবং মনমাতানো সতেজ সুবাসের শতভাগ নিশ্চয়তা দেয়।",
  },
  {
    category: "product",
    question: "কড়া লিকার ও সেরা সুবাস পাওয়ার সঠিক নিয়ম কী?",
    answer: "এক কাপ চায়ের জন্য পরিমাণমতো ফুটন্ত পানিতে আধা চা-চামচ হকপ্লাস চা পাতা দিয়ে ২ থেকে ৩ মিনিট ঢেকে রাখুন। পাতা ভালোভাবে নির্যাস ছাড়লে ছেঁকে নিন। আপনি পছন্দমতো দুধ ও চিনি দিয়ে অথবা লাল চা হিসেবে উপভোগ করতে পারেন।",
  },
  {
    category: "payment",
    question: "অর্ডারের জন্য কি কোনো অগ্রিম টাকা দিতে হবে?",
    answer: "না, একেবারেই না! হকপ্লাস-এ শতভাগ ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা রয়েছে। ডেলিভারি প্রতিনিধি আপনার ঠিকানায় পণ্য পৌঁছে দিলে আপনি প্যাকেট দেখে নগদ টাকা পরিশোধ করবেন।",
  },
  {
    category: "delivery",
    question: "ডেলিভারি পেতে কত সময় লাগে?",
    answer: "ঢাকা সিটির ভেতরে সাধারণত ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে সমগ্র বাংলাদেশের যেকোনো জেলা ও থানায় ৪৮ থেকে ৭২ ঘণ্টার মধ্যে ডেলিভারি সম্পন্ন করা হয়।",
  },
  {
    category: "delivery",
    question: "ডেলিভারি পার্টনার কে এবং কীভাবে অর্ডার ট্র্যাক করব?",
    answer: "আমরা দেশের অন্যতম দ্রুততম ও নির্ভরযোগ্য কুরিয়ার Steadfast Courier-এর মাধ্যমে ডেলিভারি করি। অর্ডার নিশ্চিত হলে একটি ট্র্যাকিং কোড প্রদান করা হয়, যা দিয়ে আমাদের 'অর্ডার ট্র্যাক' পেজে লাইভ স্ট্যাটাস দেখতে পারবেন।",
  },
  {
    category: "product",
    question: "চায়ের প্যাকেটের মেয়াদ (Shelf Life) কত দিন থাকে?",
    answer: "আমাদের চা পাতা অত্যন্ত উন্নতমানের এয়ারটাইট ফুড-গ্রেড অ্যালুমিনিয়াম ফয়েল পাউচে প্যাক করা হয়, ফলে প্যাকিংয়ের তারিখ থেকে ১২ মাস পর্যন্ত চায়ের সতেজতা ও সুবাস পুরোপুরি অক্ষত থাকে।",
  },
  {
    category: "order",
    question: "পণ্য হাতে পাওয়ার পর কোনো ত্রুটি দেখা দিলে কী করণীয়?",
    answer: "যদি প্যাকেটে কোনো ক্ষতি বা ত্রুটি থাকে, ডেলিভারি ম্যানের উপস্থিতিতেই তাকে জানিয়ে আমাদের হেল্পলাইনে (+880 1602-867954) কল দিন। আমরা সাথে সাথে বিনা খরচে নতুন প্রোডাক্ট পাঠিয়ে দেব অথবা আপনার টাকা রিফান্ড করব।",
  },
  {
    category: "order",
    question: "পাইকারি বা করপোরেট গিফট প্যাক অর্ডার করা যাবে কি?",
    answer: "হ্যাঁ, অফিস-আদালতের করপোরেট সাপ্লাই, রেস্তোরাঁ ও পাইকারি ক্রয়ের জন্য আমাদের আকর্ষণীয় বাল্ক রেট রয়েছে। বিস্তারিত জানতে সরাসরি আমাদের ফোন নম্বরে অথবা হোয়াটসঅ্যাপে যোগাযোগ করতে পারেন।",
  },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [search, setSearch] = useState("");

  const filtered = FAQS.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-20 max-w-3xl mx-auto">
      {/* Header */}
      <section className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600">
          <HelpCircle className="size-3.5" />
          <span>সহায়তা ও প্রশ্নোত্তর কেন্দ্র</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          সচরাচর জিজ্ঞাসা (FAQ)
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          হকপ্লাস প্রিমিয়াম চা, অর্ডার প্রক্রিয়া ও ডেলিভারি সংক্রান্ত প্রচলিত প্রশ্নগুলোর উত্তর এক নজরে জেনে নিন।
        </p>
      </section>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="প্রশ্ন বা বিষয় লিখে খুঁজুন (যেমন: ডেলিভারি, লিকার, পেমেন্ট)..."
          className="pl-10 h-11 rounded-2xl text-xs sm:text-sm"
        />
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filtered.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-sm text-foreground hover:bg-muted/30 transition-colors"
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`size-4 text-emerald-600 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still need help banner */}
      <section className="rounded-3xl border border-emerald-600/30 bg-emerald-500/5 p-6 sm:p-8 text-center space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-foreground">
          আপনার কাঙ্ক্ষিত উত্তরটি পাননি?
        </h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          আমাদের কাস্টমার কেয়ার প্রতিনিধি আপনার যেকোনো প্রশ্নের উত্তর দিতে সদা প্রস্তুত।
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2">
            <a href="https://wa.me/8801602867954" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" />
              <span>হোয়াটসঅ্যাপে চ্যাট করুন</span>
            </a>
          </Button>
          <Button variant="outline" asChild className="rounded-xl text-xs gap-2">
            <Link href="/contact">
              <Phone className="size-3.5" />
              <span>যোগাযোগ ফরম</span>
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
