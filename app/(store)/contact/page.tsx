"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import Link from "next/link";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      toast.success("আপনার বার্তা সফলভাবে পাঠানো হয়েছে! শীঘ্রই যোগাযোগ করা হবে।");
    }, 600);
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-900/15 via-background to-background border border-emerald-600/20 p-8 sm:p-12 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600">
            <MessageCircle className="size-3.5" />
            <span>সরাসরি সহায়তা ও অনুসন্ধান</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            আমাদের সাথে যোগাযোগ করুন
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            চা পাতার অর্ডার, যেকোনো প্রশ্ন বা ব্যবসায়িক অনুসন্ধানের জন্য আমাদের সাথে যেকোনো সময় কথা বলুন।
          </p>
        </div>
      </section>

      {/* Main Grid: Info Cards + Contact Form */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Contact Info & Support Channels */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4 shadow-xs">
              <h2 className="text-base font-bold text-foreground">যোগাযোগের ঠিকানা ও মাধ্যম</h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                    <MapPin className="size-4" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block text-sm">প্রধান কার্যালয় ও বাগান হাব</span>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed">
                      হকপ্লাস টি হাব, শ্রীমঙ্গল রোড, মৌলভীবাজার ও বনানী, ঢাকা-১২১৩, বাংলাদেশ।
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block text-sm">হটলাইন ও কাস্টমার কেয়ার</span>
                    <p className="font-mono text-muted-foreground mt-0.5">+880 1602-867954</p>
                    <p className="font-mono text-muted-foreground">+880 1700-000000</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block text-sm">ইমেইল সাপোর্ট</span>
                    <p className="text-muted-foreground mt-0.5">support@haqplus.com</p>
                    <p className="text-muted-foreground">info@haqplus.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                    <Clock className="size-4" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block text-sm">সেবা দেওয়ার সময়</span>
                    <p className="text-muted-foreground mt-0.5">শনিবার — বৃহস্পতিবার: সকাল ৯টা থেকে রাত ৯টা</p>
                    <p className="text-muted-foreground">শুক্রবার: দুপুর ৩টা থেকে রাত ৯টা</p>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Quick Chat */}
            <div className="rounded-2xl border border-emerald-600/30 bg-emerald-500/5 p-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <MessageCircle className="size-5" />
                <span>সরাসরি হোয়াটসঅ্যাপে কথা বলুন</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                তাৎক্ষণিক যেকোনো অর্ডারের তথ্য বা চা পাতা নির্বাচন করতে আমাদের প্রতিনিধির সাথে হোয়াটসঅ্যাপে চ্যাট করুন।
              </p>
              <Button asChild className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 cursor-pointer">
                <a href="https://wa.me/8801602867954" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" />
                  <span>WhatsApp Chat শুরু করুন</span>
                </a>
              </Button>
            </div>

            {/* Quick FAQ Link */}
            <div className="rounded-2xl border border-border/80 bg-muted/30 p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="size-4 text-emerald-600" />
                <span className="text-xs font-semibold text-foreground">সচরাচর প্রশ্নগুলোর উত্তর খুঁজছেন?</span>
              </div>
              <Button variant="outline" size="sm" asChild className="rounded-xl text-xs">
                <Link href="/faq">FAQ দেখুন</Link>
              </Button>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">আমাদের একটি বার্তা পাঠান</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  নিচের ফর্মটি পূরণ করে সাবমিট করুন। আমাদের প্রতিনিধি আপনার সাথে দ্রুত যোগাযোগ করবে।
                </p>
              </div>

              {isSent ? (
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-8 text-center space-y-3">
                  <CheckCircle2 className="size-12 text-emerald-600 mx-auto" />
                  <h3 className="text-base font-bold text-foreground">বার্তাটি পৌঁছে গেছে!</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    ধন্যবাদ আপনার বার্তার জন্য। আমাদের কাস্টমার সাপোর্ট টিম পর্যালোচনা করে খুব দ্রুত আপনার ফোন বা ইমেইলে যোগাযোগ করবে।
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSent(false)}
                    className="rounded-xl text-xs"
                  >
                    আরেকটি বার্তা পাঠান
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="c-name" className="text-xs font-semibold">
                        আপনার পূর্ণ নাম <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="c-name"
                        placeholder="যেমন: আনওয়ারুল করিম"
                        required
                        className="rounded-xl text-xs h-10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="c-phone" className="text-xs font-semibold">
                        মোবাইল নম্বর <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="c-phone"
                        type="tel"
                        placeholder="যেমন: 01712345678"
                        required
                        className="rounded-xl text-xs h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="c-email" className="text-xs font-semibold">
                      ইমেইল বা জিমেইল (ঐচ্ছিক)
                    </Label>
                    <Input
                      id="c-email"
                      type="email"
                      placeholder="name@gmail.com"
                      className="rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="c-subject" className="text-xs font-semibold">
                      বিষয়
                    </Label>
                    <Input
                      id="c-subject"
                      placeholder="যেমন: পাইকারি অর্ডারের তথ্য / চায়ের বিবরণ"
                      className="rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="c-msg" className="text-xs font-semibold">
                      আপনার বিস্তারিত বার্তা <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="c-msg"
                      rows={5}
                      placeholder="আপনার প্রশ্ন বা মতামত বিস্তারিত লিখুন..."
                      required
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-6 gap-2 cursor-pointer shadow-md"
                  >
                    <Send className="size-4" />
                    <span>{isSubmitting ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}</span>
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
