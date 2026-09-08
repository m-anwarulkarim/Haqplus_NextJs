import Link from "next/link";
import { ShieldCheck, Lock, Eye, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "প্রাইভেসি পলিসি (Privacy Policy) — haqplus",
  description: "হকপ্লাস গ্রাহকের ব্যক্তিগত তথ্যের সর্বোচ্চ নিরাপত্তা বজায় রাখতে প্রতিশ্রুতিবদ্ধ। আমাদের গোপনীয়তা নীতি পড়ুন।",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-8 pb-20 max-w-3xl mx-auto">
      {/* Header */}
      <section className="space-y-2 pt-4 border-b border-border pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-bold text-emerald-600">
          <ShieldCheck className="size-3.5" />
          <span>ডেটা ও তথ্য নিরাপত্তা</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          গোপনীয়তা নীতিমালা (Privacy Policy)
        </h1>
        <p className="text-xs text-muted-foreground">
          সর্বশেষ আপডেট: সেপ্টেম্বর ২০২৬ | haqplus.com
        </p>
      </section>

      {/* Content Sections */}
      <div className="space-y-6 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-foreground">১. তথ্য সংগ্রহ ও ব্যবহার</h2>
          <p>
            হকপ্লাস (haqplus)-এ কেনাকাটা করার সময় আমরা শুধুমাত্র আপনার অর্ডার প্রক্রিয়া ও পার্সেল সঠিক গন্তব্যে পৌঁছে দেওয়ার জন্য প্রয়োজনীয় তথ্য যেমন— পূর্ণ নাম, মোবাইল নম্বর, পূর্ণ ঠিকানা এবং ঐচ্ছিক ইমেইল সংগ্রহ করি।
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-foreground">২. তথ্যের নিরাপত্তা ও সুরক্ষার অঙ্গীকার</h2>
          <p>
            আমরা আপনার ব্যক্তিগত তথ্যের গোপনীয়তাকে সর্বোচ্চ গুরুত্ব দিই। আপনার ফোন নম্বর বা ঠিকানার তথ্য কোনো তৃতীয় পক্ষ বা বিজ্ঞাপনী সংস্থার কাছে বিক্রি, ভাড়া বা বাণিজ্যিক উদ্দেশ্যে হস্তান্তর করা হয় না।
          </p>
          <div className="rounded-2xl bg-muted/40 p-4 border border-border/70 space-y-2">
            <div className="flex items-center gap-2 font-bold text-foreground text-xs">
              <Lock className="size-4 text-emerald-600" />
              <span>নিরাপদ ডেটাবেজ ও এনক্রিপশন</span>
            </div>
            <p className="text-xs">
              সকল ট্রানজেকশন এবং কাস্টমার রেকর্ড শক্তিশালী সিকিউরিটি প্রটোকল এবং এনক্রিপশন প্রযুক্তির মাধ্যমে সুরক্ষিত থাকে।
            </p>
          </div>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-foreground">৩. কুরিয়ার ডেলিভারি পার্টনারের সাথে তথ্য বিনিময়</h2>
          <p>
            আপনার অর্ডারকৃত চা পাতা আপনার বাড়িতে পৌঁছে দেওয়ার সুবিধার্থে শুধুমাত্র কুরিয়ার পার্টনার (Steadfast Courier)-এর সাথে আপনার নাম, ফোন নম্বর ও ডেলিভারি ঠিকানা শেয়ার করা হয়।
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-foreground">৪. কুকিজ ও ব্রাউজিং অ্যানালিটিক্স</h2>
          <p>
            ওয়েবসাইটের ইউজার এক্সপেরিয়েন্স উন্নত করতে এবং কার্ট তথ্য সাময়িকভাবে মনে রাখতে আমরা স্ট্যান্ডার্ড কুকিজ ও মেটা কনভার্শন পিক্সেল প্রযুক্তি ব্যবহার করি।
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-foreground">৫. যোগাযোগ ও সহায়তার অধিকার</h2>
          <p>
            আপনার তথ্য সংশোধন বা সিস্টেম থেকে মুছে ফেলতে চাইলে যেকোনো সময় আমাদের সাপোর্ট টিম <Link href="/contact" className="text-emerald-600 font-bold underline">support@haqplus.com</Link> অথবা হটলাইনে যোগাযোগ করতে পারেন।
          </p>
        </section>
      </div>
    </div>
  );
}
