import Link from "next/link";
import Image from "next/image";
import { Leaf, Award, HeartHandshake, ShieldCheck, CheckCircle2, ArrowRight, Truck, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "আমাদের গল্প (About Us) — haqplus Organic Tea",
  description: "শ্রীমঙ্গল ও সিলেটের ঐতিহ্যবাহী চা বাগান থেকে তাজা ও অর্গানিক চা পাতার গল্প। জানুন হকপ্লাস এর অনন্য যাত্রা।",
};

export default function AboutPage() {
  const values = [
    {
      icon: Leaf,
      title: "১০০% অর্গানিক ও প্রাকৃতিক",
      desc: "আমাদের প্রতিটি চা পাতা কোনো কৃত্রিম রং, ক্ষতিকারক কীটনাশক বা কেমিক্যাল ছাড়াই শতভাগ প্রাকৃতিক পরিবেশে উৎপাদিত।",
    },
    {
      icon: Award,
      title: "শ্রীমঙ্গলের সেরা বাগান",
      desc: "চায়ের রাজধানী শ্রীমঙ্গল ও সিলেটের ঐতিহ্যবাহী চা বাগানগুলো থেকে বাছাইকৃত তাজা 'দুটি পাতা একটি কুঁড়ি' সংগ্রহ করা হয়।",
    },
    {
      icon: HeartHandshake,
      title: "সরাসরি বাগান থেকে সরবরাহ",
      desc: "মধ্যস্বত্বভোগী ছাড়া সরাসরি চা বাগান থেকে প্যাকেজিং করে দ্রুত আপনার ঘরে পৌঁছে দেওয়ার নিশ্চয়তা।",
    },
    {
      icon: ShieldCheck,
      title: "কড়া লিকার ও মনমাতানো সুবাস",
      desc: "স্বাদ, বর্ণ ও সুবাসে প্রতিটি কাপেই খাঁটি আভিজাত্যের তৃপ্তি — যা প্রথম চুমুকেই আপনার মনকে সতেজ করে তুলবে।",
    },
  ];

  const stats = [
    { number: "১০০%", label: "খাঁটি অর্গানিক পাতা" },
    { number: "৫০,০০০+", label: "সন্তুষ্ট চা প্রেমী" },
    { number: "৬৪", label: "জেলায় হোম ডেলিভারি" },
    { number: "৪.৯★", label: "গ্রাহক সন্তুষ্টি রেটিং" },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-900/20 via-background to-background border border-emerald-600/20 p-8 sm:p-14 text-center">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-600/10 px-4 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <Leaf className="size-3.5 text-emerald-600" />
            <span>শ্রীমঙ্গল ও সিলেটের শতাব্দী প্রাচীন ঐতিহ্য</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            প্রতি কাপ চায়ের গল্পে জড়িয়ে আছে <br />
            <span className="text-emerald-600">সবুজ বাগানের সতেজতা ও ভালোবাসা</span>
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed">
            চা শুধু একটি পানীয় নয়, এটি একটি আবেগ, সারাদিনের ক্লান্তি দূর করার মাধ্যম এবং প্রিয়জনের সাথে আড্ডার অপর নাম।
            <strong> haqplus</strong>-এ আমরা সেই আবেগের প্রতি শ্রদ্ধা রেখে সবচেয়ে সেরা মানের চা আপনার পেয়ালায় পৌঁছে দিতে প্রতিশ্রুতিবদ্ধ।
          </p>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border/80 bg-card p-6 text-center shadow-xs hover:border-emerald-600/40 transition-colors"
            >
              <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-600 mb-1">
                {s.number}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Mission & Origin Story */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
              <Coffee className="size-4" />
              <span>আমাদের সূচনা</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground leading-snug">
              খাঁটি চায়ের স্বাদ ফিরিয়ে আনার এক আন্তরিক প্রয়াস
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed">
              বাজারে ভেজাল এবং পুরনো চায়ের ভিড়ে আসল চা পাতার কড়া লিকার আর মনমাতানো গন্ধ হারিয়ে যেতে বসেছিল। সেই শূন্যতা পূরণ করতেই হকপ্লাস (haqplus)-এর যাত্রা শুরু।
            </p>

            <p className="text-sm text-muted-foreground leading-relaxed">
              আমরা চায়ের দেশ শ্রীমঙ্গল ও সিলেটের উর্বর পাহাড়ি ঢাল থেকে সেরা বাগানগুলো সরাসরি নির্বাচন করি। ভোরের কুয়াশাভেজা প্রথম আলোয় যে দুটি পাতা একটি কুঁড়ি তোলা হয়, সেগুলোকে ঐতিহ্যবাহী পদ্ধতিতে প্রসেসিং করে সিলপ্যাক অবস্থায় সংরক্ষণ করা হয়।
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>কোনো কৃত্রিম ফ্লেভার বা কেমিক্যাল ছাড়া ১০০% প্রাকৃতিক</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>কড়া লিকার, সোনালী আভা ও চমৎকার সতেজ সুবাস</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>সারা বাংলাদেশে নিরাপদ হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি</span>
              </div>
            </div>
          </div>

          <div className="relative aspect-4/3 rounded-3xl overflow-hidden border border-border/80 bg-muted shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1200&auto=format&fit=crop&q=80"
              alt="Tea Garden in Sreemangal"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="container mx-auto px-4 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            আমাদের মূল অঙ্গীকার ও গুণমান
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            প্রতিটি চা পাতায় নিশ্চিত করি বিশ্বমানের মাননিয়ন্ত্রণ ও সর্বোচ্চ বিশুদ্ধতা।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-border/80 bg-card p-6 space-y-3 shadow-xs hover:shadow-md hover:border-emerald-600/40 transition-all"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <Icon className="size-6" />
                </div>
                <h3 className="text-base font-bold text-foreground">{v.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Box */}
      <section className="rounded-3xl bg-emerald-700 text-white p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-xl space-y-5">
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          আজই উপভোগ করুন খাঁটি শ্রীমঙ্গল চায়ের অনন্য আভিজাত্য
        </h2>
        <p className="text-sm text-emerald-100 max-w-xl mx-auto">
          ক্যাশ অন ডেলিভারি সুবিধায় কোনো অগ্রিম পেমেন্ট ছাড়াই অর্ডার করুন আপনার পছন্দের প্রিমিয়াম চা পাতা।
        </p>
        <Button size="lg" asChild className="rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold shadow-md cursor-pointer">
          <Link href="/shop">
            <span>সকল চা ব্রাউজ করুন</span>
            <ArrowRight className="size-4 ml-2" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
