"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, CheckCircle2, Globe2, Heart, Smile } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LiveComments } from "./live-comments";

export function FbPost() {
  const [likesCount, setLikesCount] = useState(4230); // Starts at 4.2K
  const [commentsCount, setCommentsCount] = useState(842);
  const [isLiked, setIsLiked] = useState(false);

  // Live Engagement Simulation
  useEffect(() => {
    const likeInterval = setInterval(() => {
      // Add 1-3 likes randomly every 3-8 seconds
      if (Math.random() > 0.3) {
        setLikesCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
      }
    }, 4000);

    const commentInterval = setInterval(() => {
      // Add 1 comment occasionally
      if (Math.random() > 0.6) {
        setCommentsCount((prev) => prev + 1);
      }
    }, 12000);

    return () => {
      clearInterval(likeInterval);
      clearInterval(commentInterval);
    };
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="w-full max-w-[600px] mx-auto bg-white sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden font-sans">
      {/* Post Header */}
      <div className="flex items-start justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary/10 shrink-0">
            {/* Logo Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center font-bold text-primary text-xl">
              H
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h3 className="font-bold text-gray-900 text-[15px] leading-tight">HaqPlus</h3>
              <CheckCircle2 className="w-3.5 h-3.5 fill-blue-500 text-white" />
            </div>
            <div className="flex items-center gap-1 text-[13px] text-gray-500 leading-tight mt-0.5">
              <span>Sponsored</span>
              <span>·</span>
              <Globe2 className="w-3 h-3" />
            </div>
          </div>
        </div>
        <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post Caption */}
      <div className="px-4 pb-3 text-[15px] text-gray-900 leading-snug">
        <p>
          🔥 <strong className="font-semibold">PREMIUM QUALITY AT YOUR DOORSTEP!</strong> 🔥
        </p>
        <p className="mt-2">
          আমাদের সেরা প্রডাক্টটি এখন স্টক এ অ্যাভেইলেবল! হাজারো মানুষের ভরসা এবং চমৎকার ফিডব্যাক।
        </p>
        <p className="mt-2">
          ✅ অরিজিনাল কোয়ালিটি<br />
          ✅ ফাস্ট হোম ডেলিভারি<br />
          ✅ 100% মানি ব্যাক গ্যারান্টি
        </p>
        <p className="mt-3 text-blue-600 hover:underline cursor-pointer">
          #HaqPlus #PremiumQuality #BestDeal
        </p>
      </div>

      {/* Media & CTA Section */}
      <div className="relative w-full aspect-square sm:aspect-[4/3] bg-gray-100 cursor-pointer group block">
        <Link href="/">
          {/* We'll use a premium placeholder image */}
          <img 
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"
            alt="Product Image"
            className="w-full h-full object-cover"
          />
        </Link>
        
        {/* Facebook Bottom Call to Action Bar */}
        <Link href="/" className="flex items-center justify-between bg-[#f0f2f5] hover:bg-gray-200 transition-colors px-4 py-2.5 border-y border-gray-200">
          <div className="flex flex-col">
            <span className="text-[12px] text-gray-500 uppercase tracking-wide">haqplus.com</span>
            <span className="font-semibold text-[15px] text-gray-900">Order Now - Special Discount!</span>
          </div>
          <button className="bg-gray-200 hover:bg-gray-300 font-semibold text-[14px] text-gray-900 px-4 py-1.5 rounded-md transition-colors">
            Shop now
          </button>
        </Link>
      </div>

      {/* Engagement Stats */}
      <div className="px-4 py-2.5 flex items-center justify-between text-gray-500 text-[13px] border-b border-gray-200 mx-2">
        <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
          <div className="flex items-center -space-x-1">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center z-20 border border-white">
              <ThumbsUp className="w-3 h-3 text-white fill-white" />
            </div>
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center z-10 border border-white">
              <Heart className="w-3 h-3 text-white fill-white" />
            </div>
          </div>
          <span>{formatNumber(likesCount)}</span>
        </div>
        <div className="flex items-center gap-3 cursor-pointer">
          <span className="hover:underline">{formatNumber(commentsCount)} comments</span>
          <span className="hover:underline">2.1K shares</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-1 flex items-center justify-between mx-2 border-b border-gray-200">
        <button 
          onClick={() => setIsLiked(!isLiked)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-md transition-colors font-semibold text-[15px] ${isLiked ? 'text-blue-600' : 'text-gray-600'}`}
        >
          <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-blue-600' : ''}`} />
          Like
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-md transition-colors font-semibold text-[15px] text-gray-600">
          <MessageCircle className="w-5 h-5" />
          Comment
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-md transition-colors font-semibold text-[15px] text-gray-600">
          <Share2 className="w-5 h-5" />
          Share
        </button>
      </div>

      {/* Live Comments Engine */}
      <div className="bg-white">
        <LiveComments onCommentAdded={() => setCommentsCount(c => c + 1)} />
      </div>
    </div>
  );
}
