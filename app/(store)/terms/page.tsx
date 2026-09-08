import Link from "next/link";
import { FileText, ShieldCheck, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ব্যবহারের শর্তাবলী (Terms & Conditions) — haqplus",
  description: "হকপ্লাস ই-কমার্স প্ল্যাটফর্ম ব্যবহারের সার্বিক নিয়ম ও শর্তাবলী। কেনাকাটার পূর্বে বিস্তারিত জেনে নিন।",
};

export default function TermsPage() {
  return (
    <div className="space-y-8 pb-20 max-w-3xl mx-auto">
      {/* Header */}
      <section className="space-y-2 pt-4 border-b border-border pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-bold text-emerald-600">
          <FileText className="size-3.5" />
          <span>আইন ও নীতিমালা</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          ব্যবহারের নিয়ম ও শর্তাবলী (Terms & Conditions)
        </h1>
        <p className="text-xs text-muted-foreground">
          সর্বশেষ সংস্করণ: সেপ্টেম্বর ২০২৬ | haqplus Organic Tea Store
        </p>
      </section>

      {/* Content Sections */}
      <div className="space-y-6 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-foreground">১. সাধারণ পরিচিতি</h2>
          <p>
            haqplus.com ভিজিট ও ব্যবহারের মাধ্যমে আপনি আমাদের সকল নিয়ম ও শর্তাবলি মেনে নিচ্ছেন। হকপ্লাস কর্তৃপক্ষ প্রয়োজন অনুযায়ী যেকোনো সময় শর্তাবলী পরিমার্জনের অধিকার সংরক্ষণ করে।
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-foreground">২. পণ্যের বিবরণ ও মূল্য</h2>
          <p>
            আমরা নিশ্চিত করি যে ওয়েবসাইটে প্রদর্শিত প্রতিটি চা পাতার ছবি, ওজন ও বিবরণ ১০০% আসল এবং সত্য। তবে কৃষিভিত্তিক প্রাকৃতিক পণ্য হওয়ায় মৌসুমভেদে চা পাতার বর্ণ ও ফ্লেভারে সামান্য সূক্ষ্ম প্রাকৃতিক পার্থক্য থাকতে পারে।
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-foreground">৩. অর্ডার ও ক্যাশ অন ডেলিভারি পেমেন্ট</h2>
          <p>
            অর্ডার সফলভাবে সাবমিট করার পর গ্রাহকের নম্বরে ভেরিফিকেশন কল বা এসএমএস প্রদান করা হতে পারে। পণ্য পৌঁছানোর সাথে সাথে কুরিয়ার প্রতিনিধির নিকট নির্ধারিত নগদ মূল্য পরিশোধ করে পার্সেল গ্রহণ করতে হবে।
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-foreground">৪. অর্ডার বাতিল ও রিটার্ন পলিসি</h2>
          <p>
            পার্সেল কুরিয়ারে হস্তান্তরের পূর্বে যেকোনো সময় অর্ডার বাতিল করা যাবে। এছাড়া পণ্য ক্ষতিগ্রস্ত অবস্থায় পৌঁছালে ডেলিভারি ম্যানের সামনেই রিপোর্ট করে ৭ দিনের মধ্যে বদল বা রিফান্ড গ্রহণ করা যাবে।
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-foreground">৫. অভিযোগ ও গ্রাহক সহায়তা</h2>
          <p>
            যেকোনো অভিযোগ বা পরামর্শের জন্য আমাদের হেল্পলাইন <strong>+880 1602-867954</strong> অথবা <Link href="/contact" className="text-emerald-600 font-bold underline">যোগাযোগ পেইজ</Link>-এ বার্তা পাঠানোর অনুরোধ করা হচ্ছে।
          </p>
        </section>
      </div>
    </div>
  );
}
