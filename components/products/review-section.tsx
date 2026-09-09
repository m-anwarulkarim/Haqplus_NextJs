"use client";

import { useState } from "react";
import { 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  Loader2, 
  Camera, 
  Image as ImageIcon, 
  X, 
  Plus, 
  Sparkles,
  ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/toast";
import Link from "next/link";
import type { Review } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReviewSectionProps {
  productId: string;
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

export function ReviewSection({
  productId,
  reviews: initialReviews = [],
  rating,
  reviewCount,
}: ReviewSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [inputUrl, setInputUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const ratingLabels: Record<number, string> = {
    5: "অসাধারণ! (5/5)",
    4: "খুবই ভালো (4/5)",
    3: "মোটামুটি (3/5)",
    2: "অসন্তোষজনক (2/5)",
    1: "খুবই খারাপ (1/5)",
  };

  const handleAddPhotoUrl = () => {
    if (!inputUrl.trim()) return;
    try {
      new URL(inputUrl.trim());
      setPhotoUrls([...photoUrls, inputUrl.trim()]);
      setInputUrl("");
    } catch {
      toast.error("অনুগ্রহ করে একটি সঠিক ছবির ইউআরএল (URL) দিন");
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls(photoUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating: formRating,
          comment: comment.trim(),
          images: photoUrls,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "রিভিউ জমা দেওয়া সম্ভব হয়নি");
        return;
      }

      const newRev = await res.json();
      setReviews([newRev, ...reviews]);
      setComment("");
      setPhotoUrls([]);
      setShowForm(false);
      toast.success("ধন্যবাদ! আপনার মূল্যবান রিভিউটি সফলভাবে প্রকাশিত হয়েছে।");
    } catch (err) {
      console.error(err);
      toast.error("নেটওয়ার্ক সমস্যার কারণে রিভিউ জমা দেওয়া যায়নি");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Overview Rating Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-3xl border border-border/80 bg-emerald-950/5 dark:bg-emerald-950/20 p-6 sm:p-8">
        <div className="flex items-center gap-5">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-black text-3xl shadow-lg">
            {rating > 0 ? rating.toFixed(1) : "5.0"}
          </div>
          <div>
            <div className="flex items-center gap-1 text-amber-500 mb-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`size-5 ${
                    s <= Math.round(rating || 5)
                      ? "fill-amber-500 text-amber-500"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm font-semibold text-foreground">
              {reviewCount || reviews.length} জন ভেরিফায়েড কাস্টমারের রেটিং ও রিভিউ
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              ১০০% আসল ক্রেতাদের নির্ভরযোগ্য অভিজ্ঞতা ও রেটিং
            </p>
          </div>
        </div>

        {session?.user ? (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl shadow-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2"
          >
            <MessageSquare className="size-4" />
            <span>রিভিউ ও ছবি যুক্ত করুন</span>
          </Button>
        ) : (
          <Button variant="outline" asChild className="rounded-xl text-xs border-emerald-600/40 text-emerald-600 hover:bg-emerald-50 shadow-xs">
            <Link href="/login">রিভিউ দিতে লগইন করুন</Link>
          </Button>
        )}
      </div>

      {/* Review Submission Form with Photo Upload */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border-2 border-emerald-600/30 bg-card p-6 sm:p-8 shadow-xl animate-in fade-in-0 duration-200"
        >
          <div className="flex items-center justify-between border-b pb-3">
            <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Sparkles className="size-5 text-amber-500" /> চা পানের অনুভূতি ও রিভিউ লিখুন
            </h4>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
              {ratingLabels[formRating]}
            </span>
          </div>

          {/* Interactive Star Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              আপনার অভিজ্ঞতা রেটিং নির্বাচন করুন:
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormRating(s)}
                  className="p-1.5 text-amber-500 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`size-7 ${
                      s <= formRating
                        ? "fill-amber-500 text-amber-500"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              মতামত লিখুন:
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="চা পাতার সুবাস, লিকার ও স্বাদের অনুভূতি এখানে বিস্তারিত লিখুন..."
              rows={4}
              required
              className="rounded-xl text-sm"
            />
          </div>

          {/* Photo Attachment Section */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Camera className="size-4 text-emerald-600" /> চা তৈরির ছবি যুক্ত করুন (Photo Attachment)
            </label>
            
            <div className="flex gap-2">
              <Input
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="ছবির লিঙ্ক (URL) পেস্ট করুন (যেমন: https://.../tea.jpg)"
                className="text-xs rounded-xl flex-1"
              />
              <Button type="button" onClick={handleAddPhotoUrl} variant="secondary" className="text-xs gap-1 rounded-xl">
                <Plus className="size-3.5" /> ছবি যোগ করুন
              </Button>
            </div>

            {/* Uploaded Photos Preview Grid */}
            {photoUrls.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {photoUrls.map((url, index) => (
                  <div key={index} className="relative size-20 rounded-xl overflow-hidden border-2 border-emerald-600/40 group">
                    <img src={url} alt="Review attachment" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              বাতিল করুন
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 font-semibold">
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "রিভিউ প্রকাশ করুন"
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Customer Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="py-12 text-center rounded-3xl border border-dashed border-border/80 bg-card">
            <MessageSquare className="size-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-base font-bold text-foreground">এখনো কোনো কাস্টমার রিভিউ নেই</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              প্রথম ক্রেতা হিসেবে এই প্রোডাক্টটির রিভিউ ও অনুভূতি শেয়ার করুন!
            </p>
          </div>
        ) : (
          reviews.map((rev) => {
            const userName = rev.user?.name || rev.userName || "Verified Customer";
            const userImg = rev.user?.image || rev.userImage;
            const userInitials = userName[0]?.toUpperCase() || "C";
            const revImages = rev.images || [];

            return (
              <div
                key={rev.id}
                className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 space-y-4 shadow-xs hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border border-emerald-600/20 shadow-xs">
                      {userImg && <AvatarImage src={userImg} alt={userName} />}
                      <AvatarFallback className="bg-emerald-600 text-white font-bold text-sm">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">{userName}</p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="size-3" /> ভেরিফায়েড কাস্টমার
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(rev.createdAt).toLocaleDateString("bn-BD", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 mr-1">{rev.rating}.0</span>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`size-3.5 ${
                          s <= rev.rating
                            ? "fill-amber-500 text-amber-500"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-foreground/90 leading-relaxed font-normal">
                  {rev.comment}
                </p>

                {/* Customer Attached Photos Gallery */}
                {revImages.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-muted-foreground mb-2 flex items-center gap-1">
                      <ImageIcon className="size-3.5 text-emerald-600" /> কাস্টমারের সংযুক্ত ছবি:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {revImages.map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedImage(img)}
                          className="size-20 rounded-xl overflow-hidden border border-border cursor-pointer hover:opacity-90 hover:scale-105 transition-all shadow-xs"
                        >
                          <img src={img} alt="Customer photo" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 bg-slate-900/80 text-white rounded-full p-2 hover:bg-black transition-colors"
            >
              <X className="size-5" />
            </button>
            <img src={selectedImage} alt="Full view" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
