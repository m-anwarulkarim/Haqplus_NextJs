"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Leaf,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="border-t border-border/80 bg-card text-foreground">
      {/* Top Value Strip */}
      <div className="border-b border-border/60 bg-muted/30">
        <div className="container mx-auto py-8 px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shrink-0">
                <Truck className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">সরাসরি বাগান থেকে সরবরাহ</h4>
                <p className="text-xs text-muted-foreground">শ্রীমঙ্গল ও সিলেটের তাজা চা পাতা</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shrink-0">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">১০০% খাঁটি ও অর্গানিক</h4>
                <p className="text-xs text-muted-foreground">কোনো কৃত্রিম ফ্লেভার বা কেমিক্যাল ছাড়া</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shrink-0">
                <RotateCcw className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">ক্যাশ অন ডেলিভারি</h4>
                <p className="text-xs text-muted-foreground">পণ্য হাতে পেয়ে টাকা পরিশোধের সুবিধা</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shrink-0">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">কড়া লিকার ও মনমাতানো সুবাস</h4>
                <p className="text-xs text-muted-foreground">প্রতি কাপেই অনন্য তৃপ্তির নিশ্চয়তা</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto py-12 lg:py-16 px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Column 1: Brand & Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <Leaf className="size-4" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-foreground">
                haq<span className="text-emerald-600 font-black">plus</span>
              </span>
            </Link>

            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              শ্রীমঙ্গল ও সিলেটের ঐতিহ্যবাহী চা বাগান থেকে বাছাইকৃত তাজা দুটি পাতা একটি কুঁড়ির প্রিমিয়াম চা। প্রতিটি চুমুকে খাঁটি চায়ের আভিজাত্য ও সতেজতা।
            </p>

            <div className="space-y-2 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <MapPin className="size-3.5 text-emerald-600" />
                <span>শ্রীমঙ্গল, মৌলভীবাজার ও ঢাকা, বাংলাদেশ</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="size-3.5 text-emerald-600" />
                <span>+880 1700-000000</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="size-3.5 text-emerald-600" />
                <span>support@haqplus.com</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">
              চায়ের সংগ্রহ (Collections)
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/shop" className="hover:text-emerald-600 transition-colors">
                  সকল চা (All Teas)
                </Link>
              </li>
              <li>
                <Link href="/category/black-tea" className="hover:text-emerald-600 transition-colors">
                  শ্রীমঙ্গল ব্ল্যাক টি (Black Tea)
                </Link>
              </li>
              <li>
                <Link href="/category/green-tea" className="hover:text-emerald-600 transition-colors">
                  অর্গানিক গ্রিন টি (Green Tea)
                </Link>
              </li>
              <li>
                <Link href="/category/masala-chai" className="hover:text-emerald-600 transition-colors">
                  রয়েল মসলা চা (Masala Chai)
                </Link>
              </li>
              <li>
                <Link href="/category/herbal-tea" className="hover:text-emerald-600 transition-colors">
                  ভেষজ ও হারবাল টি (Herbal Tea)
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">
                  স্পেশাল অফার ও ছাড়
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">
              গ্রাহক সেবা (Support)
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/checkout" className="hover:text-emerald-600 transition-colors">
                  দ্রুত অর্ডার করুন
                </Link>
              </li>
              <li>
                <Link href="/orders/track" className="hover:text-emerald-600 transition-colors">
                  অর্ডার ট্র্যাক করুন
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-emerald-600 transition-colors">
                  ডেলিভারি পলিসি
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-emerald-600 transition-colors">
                  সচরাচর জিজ্ঞাসা (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-600 transition-colors">
                  যোগাযোগ ও হেল্পলাইন
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter Subscription */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
              অফার ও আপডেট পান
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              আপনার ইমেইল দিয়ে সাবস্ক্রাইব করুন এবং নতুন চায়ের ফ্লাশ ও স্পেশাল ডিসকাউন্ট উপভোগ করুন।
            </p>

            {isSubscribed ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>ধন্যবাদ! আপনি সফলভাবে যুক্ত হয়েছেন।</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative flex items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="আপনার জিমেইল/ইমেইল লিখুন"
                    required
                    className="h-10 w-full rounded-xl border border-border/80 bg-background px-3 pr-10 text-xs text-foreground placeholder:text-muted-foreground focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 flex size-7 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                    aria-label="Submit newsletter subscription"
                  >
                    <Send className="size-3" />
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  কোনো স্প্যাম নয়, শুধুমাত্র খাঁটি চায়ের আপডেট।
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Legal & Payment Badges */}
      <div className="border-t border-border/60 bg-muted/40 py-6">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} haqplus. সর্বস্বত্ব সংরক্ষিত।</p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              প্রাইভেসি পলিসি
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              শর্তাবলী
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              সহায়তা
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground">
              পেমেন্ট মাধ্যম:
            </span>
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-muted-foreground">
              <span className="rounded border border-border bg-background px-1.5 py-0.5 text-emerald-600">ক্যাশ অন ডেলিভারি</span>
              <span className="rounded border border-border bg-background px-1.5 py-0.5 text-pink-600">বিকাশ</span>
              <span className="rounded border border-border bg-background px-1.5 py-0.5">VISA</span>
              <span className="rounded border border-border bg-background px-1.5 py-0.5">MC</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
