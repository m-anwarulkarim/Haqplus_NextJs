"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Leaf, Sparkles, Award, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}

const HERO_SLIDES: HeroSlide[] = [
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
  },
];

export function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? HERO_SLIDES.length - 1 : prevIndex - 1
    );
  }, []);

  // Auto-play interval
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl bg-slate-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] lg:aspect-[24/9] min-h-[420px] sm:min-h-[480px] w-full">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Background Slider Image */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={idx === 0}
                className="object-cover object-center scale-105 transition-transform duration-10000 ease-out"
                sizes="100vw"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

              {/* Slide Content Overlay */}
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-6 sm:px-12 lg:px-16">
                  <div className="max-w-2xl space-y-4 sm:space-y-6 text-left">
                    {/* Badge Pill */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1 backdrop-blur-md">
                      <Leaf className="size-3.5 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-300">
                        {slide.badge}
                      </span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                      {slide.title}{" "}
                      {slide.highlightText && (
                        <span className="block text-emerald-400 bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent mt-1">
                          {slide.highlightText}
                        </span>
                      )}
                    </h1>

                    {/* Subtitle / Description */}
                    <p className="text-xs sm:text-base text-slate-200 leading-relaxed max-w-xl font-normal line-clamp-2 sm:line-clamp-none">
                      {slide.description}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Button
                        size="lg"
                        asChild
                        className="h-11 sm:h-12 px-6 sm:px-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-900/50 group border border-emerald-500/50"
                      >
                        <Link href={slide.primaryBtnLink}>
                          <span>{slide.primaryBtnText}</span>
                          <ArrowRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>

                      {slide.secondaryBtnText && (
                        <Button
                          size="lg"
                          variant="outline"
                          asChild
                          className="h-11 sm:h-12 px-6 sm:px-8 rounded-xl border-white/30 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md"
                        >
                          <Link href={slide.secondaryBtnLink || "/shop"}>
                            {slide.secondaryBtnText}
                          </Link>
                        </Button>
                      )}
                    </div>

                    {/* Sub Tagline */}
                    {slide.tagline && (
                      <p className="text-[11px] sm:text-xs text-slate-300/90 font-medium flex items-center gap-1.5 pt-1">
                        <ShieldCheck className="size-3.5 text-emerald-400 shrink-0" />
                        <span>{slide.tagline}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Left/Right Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 size-10 sm:size-12 rounded-full bg-black/40 hover:bg-emerald-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <ChevronLeft className="size-5 sm:size-6" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 size-10 sm:size-12 rounded-full bg-black/40 hover:bg-emerald-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <ChevronRight className="size-5 sm:size-6" />
      </button>

      {/* Bottom Slider Indicator Dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? "w-8 bg-emerald-400 shadow-md shadow-emerald-500/50"
                : "w-2.5 bg-white/40 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
