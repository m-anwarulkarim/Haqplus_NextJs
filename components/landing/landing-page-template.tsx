"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  Truck,
  Star,
  Clock,
  ArrowRight,
  ShoppingBag,
  Award,
  Phone,
  MapPin,
  User,
  Sparkles,
  Plus,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { LandingPageData } from "@/lib/data/landing-pages";

export function LandingPageTemplate({ pageData }: { pageData: LandingPageData }) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [note, setNote] = useState("");
  const [showAltPhone, setShowAltPhone] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [district, setDistrict] = useState("Inside Dhaka");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  const deliveryCharge = district === "Inside Dhaka" ? pageData.deliveryChargeDhaka : pageData.deliveryChargeOutside;
  const grandTotal = pageData.offerPrice + deliveryCharge;

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error("অনুগ্রহ করে আপনার নাম লিখুন");
      return;
    }
    if (!phone.trim() || phone.trim().length < 11) {
      toast.error("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন");
      return;
    }
    if (!address.trim()) {
      toast.error("অনুগ্রহ করে আপনার ঠিকানা লিখুন");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        district: district === "Inside Dhaka" ? "Dhaka" : "Outside Dhaka",
        division: "Dhaka",
        area: district,
        paymentMethod: "COD",
        note: `Landing Page Order: ${pageData.bengaliTitle} (${pageData.slug})`,
        items: [
          {
            productId: pageData.featuredProductId,
            name: pageData.productName,
            price: pageData.offerPrice,
            quantity: 1,
            image: pageData.productImages[0] || pageData.bannerImage,
          },
        ],
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "অর্ডার প্রক্রিয়াকরণে ব্যর্থ হয়েছে");
        return;
      }

      setOrderSuccess(data.order);
      toast.success("আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে!");
    } catch (err) {
      console.error(err);
      toast.error("নেটওয়ার্ক সমস্যা! কিছুক্ষণ পর চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="size-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
            <CheckCircle2 className="size-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              অর্ডার কনফার্মড!
            </span>
            <h2 className="text-2xl font-extrabold text-white">ধন্যবাদ {orderSuccess.customerName}!</h2>
            <p className="text-xs text-slate-300">
              আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। দ্রুততম সময়ে আপনার ঠিকানায় পার্সেল পৌঁছে যাবে।
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left text-xs font-mono space-y-2">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Order Number:</span>
              <strong className="text-emerald-400 font-bold">{orderSuccess.orderNumber}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Total Amount:</span>
              <strong className="text-white">৳{orderSuccess.total} (COD)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Phone:</span>
              <span className="text-slate-200">{orderSuccess.phone}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button asChild className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">
              <Link href="/">হোম পেজে যান</Link>
            </Button>
            <Button variant="outline" asChild className="w-full h-11 border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl">
              <Link href={`/order/track/${orderSuccess.orderNumber}`}>অর্ডার ট্র্যাক করুন</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* Top Countdown Urgency Header Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white py-2 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-md">
        <Clock className="size-4 animate-pulse shrink-0" />
        <span>💥 লিমিটেড স্টক ধামাকা অফার — অর্ডার করলেই ফ্রি গিফট + ক্যাশ অন ডেলিভারি!</span>
      </div>

      {/* Hero Banner Section */}
      <div className="container mx-auto px-4 sm:px-6 pt-6 max-w-5xl space-y-6">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="size-3.5" /> {pageData.badge}
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            {pageData.bengaliTitle}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {pageData.subtitle}
          </p>
        </div>

        {/* Big Product Visual */}
        <div className="relative aspect-16/9 sm:aspect-21/9 w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          <Image
            src={pageData.bannerImage}
            alt={pageData.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-xs text-slate-400 line-through">পূর্বের মূল্য: ৳{pageData.originalPrice}</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">৳{pageData.offerPrice}</span>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                  ডিসকাউন্ট মূল্য
                </span>
              </div>
            </div>

            <a
              href="#order-form"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/50"
            >
              <ShoppingBag className="size-4" />
              <span>অর্ডার করতে নিচে যান</span>
            </a>
          </div>
        </div>

        {/* Grid: Feature Bullets & Quality Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Features Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Award className="size-5 text-emerald-400" />
              <span>কেন আমাদের চা পাতা বেছে নেবেন?</span>
            </h3>
            <ul className="space-y-3 text-xs text-slate-200">
              {pageData.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Delivery & Security Badges */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck className="size-5 text-emerald-400" />
              <span>আমাদের বিশেষ নিশ্চয়তা</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="size-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Truck className="size-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">২৪-৪৮ ঘণ্টার মধ্যে হোম ডেলিভারি</h4>
                  <p className="text-[11px] text-slate-400">Steadfast কুরিয়ারের মাধ্যমে সারা বাংলাদেশে ফাস্ট ডেলিভারি</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="size-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Award className="size-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">১০০% ক্যাশ অন ডেলিভারি</h4>
                  <p className="text-[11px] text-slate-400">আগে কোনো টাকা দিতে হবে না, হাতে পেয়ে দেখে টাকা দিন</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {pageData.reviews.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Star className="size-5 text-amber-400 fill-amber-400" />
              <span>সম্মানিত গ্রাহকদের রিভিউ</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pageData.reviews.map((rev) => (
                <div key={rev.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-white font-bold">{rev.name} ({rev.location})</strong>
                    <div className="flex text-amber-400">
                      {"★".repeat(rev.rating)}
                    </div>
                  </div>
                  <p className="text-slate-300 italic">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Express Order Form Section */}
        <div id="order-form" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-slate-800 scroll-mt-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-full bg-[#0f6848] text-white text-sm font-bold shadow-xs shrink-0">
                ১
              </span>
              <span>ডেলিভারি ঠিকানা দিন</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">* আবশ্যক</span>
          </div>

          <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs">
            {/* Customer Name */}
            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium text-slate-700 block">
                নাম
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 size-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="এখানে আপনার নাম লিখুন"
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#f8f9fa] border border-slate-200/90 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0f6848] focus:bg-white focus:ring-2 focus:ring-[#0f6848]/15 transition-all"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium text-slate-700 block">
                মোবাইল নম্বর <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 size-4 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#f8f9fa] border border-slate-200/90 text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0f6848] focus:bg-white focus:ring-2 focus:ring-[#0f6848]/15 transition-all"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium text-slate-700 block">
                বিস্তারিত ঠিকানা <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 size-4 text-slate-400 pointer-events-none" />
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="এখানে আপনার সম্পূর্ণ ঠিকানা লিখুন"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f8f9fa] border border-slate-200/90 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0f6848] focus:bg-white focus:ring-2 focus:ring-[#0f6848]/15 transition-all resize-none"
                />
              </div>
            </div>

            {/* Optional Chips / Action Buttons */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowAltPhone(!showAltPhone)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    showAltPhone
                      ? "bg-emerald-50 border-[#0f6848] text-[#0f6848]"
                      : "bg-[#f1f3f5] border-slate-200/80 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Plus className="size-3.5 text-slate-500" />
                  <span>বিকল্প নম্বর</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowNote(!showNote)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    showNote
                      ? "bg-emerald-50 border-[#0f6848] text-[#0f6848]"
                      : "bg-[#f1f3f5] border-slate-200/80 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Plus className="size-3.5 text-slate-500" />
                  <span>বিশেষ নির্দেশনা</span>
                </button>
              </div>

              {showAltPhone && (
                <div className="pt-1 animate-in fade-in-50 duration-200 space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">
                    বিকল্প মোবাইল নম্বর (ঐচ্ছিক)
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3.5 size-4 text-slate-400 pointer-events-none" />
                    <input
                      type="tel"
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                      placeholder="অন্য একটি মোবাইল নম্বর (যদি থাকে)"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#f8f9fa] border border-slate-200/90 text-sm font-mono text-slate-800"
                    />
                  </div>
                </div>
              )}

              {showNote && (
                <div className="pt-1 animate-in fade-in-50 duration-200 space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">
                    বিশেষ নির্দেশনা / নোট (ঐচ্ছিক)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3 size-4 text-slate-400 pointer-events-none" />
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="যেমন: শুক্রবারে ডেলিভারি দিন, অথবা পৌঁছানোর আগে ফোনে কথা বলে নিন..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f8f9fa] border border-slate-200/90 text-xs sm:text-sm text-slate-800 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* District Choice */}
            <div className="space-y-1.5 pt-2">
              <label className="text-slate-700 font-bold block">ডেলিভারি এলাকা সিলেক্ট করুন</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDistrict("Inside Dhaka")}
                  className={`p-3 rounded-xl border text-left font-semibold transition cursor-pointer ${
                    district === "Inside Dhaka"
                      ? "bg-emerald-50 border-[#0f6848] text-[#0f6848]"
                      : "bg-[#f8f9fa] border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <p className="text-xs font-bold">ঢাকার ভেতরে</p>
                  <p className="text-[11px] font-mono">৳{pageData.deliveryChargeDhaka} চার্জ</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDistrict("Outside Dhaka")}
                  className={`p-3 rounded-xl border text-left font-semibold transition cursor-pointer ${
                    district === "Outside Dhaka"
                      ? "bg-emerald-50 border-[#0f6848] text-[#0f6848]"
                      : "bg-[#f8f9fa] border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <p className="text-xs font-bold">ঢাকার বাইরে</p>
                  <p className="text-[11px] font-mono">৳{pageData.deliveryChargeOutside} চার্জ</p>
                </button>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-300">
                <span>পণ্য মূল্য:</span>
                <strong>৳{pageData.offerPrice}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>ডেলিভারি চার্জ ({district === "Inside Dhaka" ? "ঢাকা" : "ঢাকার বাইরে"}):</span>
                <strong>৳{deliveryCharge}</strong>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between text-emerald-400 text-base font-extrabold">
                <span>সর্বমোট দিতে হবে:</span>
                <span>৳{grandTotal}</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-900/50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>অর্ডার সাবমিট হচ্ছে...</span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>অর্ডার কনফার্ম করুন (৳{grandTotal})</span>
                  <ArrowRight className="size-5" />
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
