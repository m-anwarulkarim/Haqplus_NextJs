"use client";

import { useState } from "react";
import { Star, MessageSquare, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/toast";
import Link from "next/link";
import type { Review } from "@/types";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to post review");
        return;
      }

      const newRev = await res.json();
      setReviews([newRev, ...reviews]);
      setComment("");
      setShowForm(false);
      toast.success("Thank you! Your review has been published.");
    } catch (err) {
      console.error(err);
      toast.error("Network error while submitting review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Overview Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-3xl border border-border/80 bg-muted/20 p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 font-extrabold text-3xl font-mono">
            {rating.toFixed(1)}
          </div>
          <div>
            <div className="flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`size-4 ${
                    s <= Math.round(rating)
                      ? "fill-amber-500 text-amber-500"
                      : "text-muted-foreground/40"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {reviewCount} verified customer {reviewCount === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>

        {session?.user ? (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl shadow-xs"
          >
            <MessageSquare className="size-4 mr-2" />
            <span>Write a Review</span>
          </Button>
        ) : (
          <Button variant="outline" asChild className="rounded-xl text-xs">
            <Link href="/login">Sign In to Leave a Review</Link>
          </Button>
        )}
      </div>

      {/* Review Submission Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-3xl border border-primary/30 bg-card p-6 shadow-md animate-in fade-in-0 duration-200"
        >
          <h4 className="text-base font-bold text-foreground">Share Your Experience</h4>

          {/* Star Selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormRating(s)}
                  className="p-1 text-amber-500 transition-transform hover:scale-110"
                >
                  <Star
                    className={`size-5 ${
                      s <= formRating
                        ? "fill-amber-500 text-amber-500"
                        : "text-muted-foreground/40"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you liked or disliked about this product..."
            rows={3}
            required
            className="rounded-xl text-sm"
          />

          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="rounded-xl px-5">
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-border/80">
            <MessageSquare className="size-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">No reviews yet</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Be the first to review this product and share your feedback!
            </p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 space-y-2 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                    {(rev.userName || "C")[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-foreground">
                        {rev.userName || "Verified Customer"}
                      </p>
                      <CheckCircle className="size-3.5 text-emerald-500 fill-emerald-500/20" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(rev.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-amber-500">
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

              <p className="text-sm text-foreground/90 leading-relaxed pt-1">
                {rev.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
