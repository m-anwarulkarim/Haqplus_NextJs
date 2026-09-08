import Link from "next/link";
import { Truck, ShieldCheck, Clock, RotateCcw, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ডেলিভারি ও শিপিং পলিসি — haqplus Delivery Policy",
  description: "সারা বাংলাদেশে দ্রুত ও নিরাপদ ক্যাশ অন ডেলিভারি সুবিধা। ডেলিভারি সময়, চার্জ ও নিয়মাবলী জানুন।",
};

export default function ShippingPolicyPage() {
  const deliveryFeatures = [
    {
      icon: Clock,
      title: "ডেলিভারি সময়সীমা",
      desc: "ঢাকা সিটির ভেতরে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে সমগ্র বাংলাদেশে ৪৮ থেকে ৭২ ঘণ্টার মধ্যে ডেলিভারি সম্পন্ন করা হয়।",
    },
    {
      icon: Truck,
      title: "স্টেডফাস্ট কুরিয়ার পার্টনারশিপ",
      desc: "দেশের বিশ্বস্ত লজিস্টিক পার্টনার Steadfast Courier-এর মাধ্যমে প্রত্যন্ত অঞ্চলেও ডোর-টু-ডোর হোম ডেলিভারি নিশ্চিত করা হয়।",
    },
    {
      icon: ShieldCheck,
      title: "শতভাগ ক্যাশ অন ডেলিভারি",
      desc: "অর্ডারের জন্য কোনো অগ্রিম টাকা প্রদান করতে হবে না। পণ্য হাতে পেয়ে দেখে টাকা পরিশোধ করার সম্পূর্ণ স্বাধীনতা রয়েছে।",
    },
    {
      icon: RotateCcw,
      title: "৭ দিনের সহজ রিটার্ন পলিসি",
      desc: "প্যাকেজিং ছেঁড়া বা ভুল পণ্য পৌঁছালে ডেলিভারি ম্যানের উপস্থিতিতেই পরিবর্তন অথবা ৭ দিনের মধ্যে সম্পূর্ণ মূল্য ফেরত পাওয়ার নিশ্চয়তা।",
    },
  ];

  return (
    <div className="space-y-12 pb-20 max-w-4xl mx-auto">
      {/* Top Banner */}
      <section className="rounded-3xl bg-gradient-to-b from-emerald-900/15 via-background to-background border border-emerald-600/20 p-8 sm:p-12 text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600">
          <Truck className="size-3.5" />
          <span>নিরাপদ ও দ্রুততম শিপিং</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          ডেলিভারি ও শিপিং নীতিমালা
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          শ্রীমঙ্গলের তাজা ও প্রিমিয়াম চা পাতা আপনার ঠিকানায় নিখুঁতভাবে পৌঁছে দেওয়ার নিয়মাবলী।
        </p>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {deliveryFeatures.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="rounded-2xl border border-border/80 bg-card p-6 space-y-3 shadow-xs hover:border-emerald-600/40 transition-colors"
            >
              <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <Icon className="size-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </section>

      {/* Delivery Cost Table */}
      <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-5 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">ডেলিভারি চার্জ ও শর্তাবলী</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border text-muted-foreground uppercase text-[11px]">
              <tr>
                <th className="pb-3 font-semibold">অঞ্চল / এলাকা</th>
                <th className="pb-3 font-semibold">প্রত্যাশিত সময়</th>
                <th className="pb-3 font-semibold">ডেলিভারি ফি</th>
                <th className="pb-3 font-semibold">ফ্রি ডেলিভারি অফার</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr className="py-3">
                <td className="py-3.5 font-bold text-foreground">ঢাকা সিটির অভ্যন্তরে</td>
                <td className="py-3.5 text-muted-foreground">২৪ – ৪৮ ঘণ্টা</td>
                <td className="py-3.5 font-mono font-bold text-foreground">৳৬০</td>
                <td className="py-3.5 text-emerald-600 font-semibold">৳৭৯৯+ অর্ডারে ফ্রি</td>
              </tr>
              <tr className="py-3">
                <td className="py-3.5 font-bold text-foreground">ঢাকা সিটির পার্শ্ববর্তী (সাভার/গাজীপুর)</td>
                <td className="py-3.5 text-muted-foreground">২৪ – ৪৮ ঘণ্টা</td>
                <td className="py-3.5 font-mono font-bold text-foreground">৳৮০</td>
                <td className="py-3.5 text-emerald-600 font-semibold">৳৯৯৯+ অর্ডারে ফ্রি</td>
              </tr>
              <tr className="py-3">
                <td className="py-3.5 font-bold text-foreground">সমগ্র বাংলাদেশ (সকল জেলা ও থানা)</td>
                <td className="py-3.5 text-muted-foreground">৪৮ – ৭২ ঘণ্টা</td>
                <td className="py-3.5 font-mono font-bold text-foreground">৳১০০</td>
                <td className="py-3.5 text-emerald-600 font-semibold">৳৯৯৯+ অর্ডারে ফ্রি</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Package Receiving Guidelines */}
      <section className="rounded-3xl border border-border/80 bg-muted/20 p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-foreground">পার্সেল গ্রহণের সময় করণীয়:</h2>
        <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>ডেলিভারি প্রতিনিধির সামনে পার্সেলের সিল অক্ষত আছে কি না তা লক্ষ্য করুন।</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>ইনভয়েস অনুযায়ী চায়ের সঠিক প্যাকেট রয়েছে কি না যাচাই করে নগদ মূল্য পরিশোধ করুন।</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>যেকোনো সমস্যায় ডেলিভারি ম্যান থাকাকালীন আমাদের হটলাইন <strong>+880 1602-867954</strong> এ কল দিন।</span>
          </div>
        </div>

        <div className="pt-2">
          <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
            <Link href="/shop">
              <span>চা অর্ডার করতে শপে যান</span>
              <ArrowRight className="size-3.5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
