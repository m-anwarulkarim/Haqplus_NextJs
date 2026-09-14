"use client";

import { useState, useEffect } from "react";
import { User, ThumbsUp } from "lucide-react";

interface Comment {
  id: number;
  name: string;
  text: string;
  time: string;
  likes: number;
  initial?: boolean;
}

const INITIAL_COMMENTS: Comment[] = [
  { id: 1, name: "Sabbir Hossain", text: "Ami niyechi, onek valo product. Delivery o fast chilo. Thanks HaqPlus! ❤️", time: "2h", likes: 14, initial: true },
  { id: 2, name: "Nusrat Jahan", text: "Price hishabe quality onk premium.", time: "3h", likes: 8, initial: true },
  { id: 3, name: "Rafiqul Islam", text: "Bhai delivery charge koto?", time: "5h", likes: 2, initial: true },
  { id: 4, name: "HaqPlus", text: "Rafiqul Islam Sir, inside Dhaka 60tk, outside Dhaka 120tk.", time: "4h", likes: 5, initial: true },
];

const NEW_COMMENTS_POOL = [
  { name: "Mehedi Hasan", text: "Wow, just ordered mine! 🎉" },
  { name: "Farzana Yasmin", text: "Khub sundor, recommend korchi shobaike." },
  { name: "Kamrul Hasan", text: "Aro kono color hobe naki?" },
  { name: "Tariqul Islam", text: "Original product peyechi. Packaging ta onk valo chilo." },
  { name: "Jannatul Ferdous", text: "Bhai ami ekta nite chai, kivabe order korbo?" },
  { name: "Arifur Rahman", text: "Quality 10/10 🔥" },
  { name: "Imran Hosen", text: "Ektu agei pelam, ek kothay oshadharon!" },
  { name: "Sumaiya Akter", text: "Cash on delivery available?" },
];

export function LiveComments({ onCommentAdded }: { onCommentAdded: () => void }) {
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [poolIndex, setPoolIndex] = useState(0);

  useEffect(() => {
    // Add a new comment every 8-15 seconds
    const interval = setInterval(() => {
      if (poolIndex < NEW_COMMENTS_POOL.length) {
        const newComment = NEW_COMMENTS_POOL[poolIndex];
        
        setComments(prev => [
          ...prev,
          {
            id: Date.now(),
            name: newComment.name,
            text: newComment.text,
            time: "Just now",
            likes: 0,
            initial: false,
          }
        ]);
        
        setPoolIndex(prev => prev + 1);
        onCommentAdded();
      }
    }, Math.floor(Math.random() * 7000) + 8000);

    return () => clearInterval(interval);
  }, [poolIndex, onCommentAdded]);

  return (
    <div className="px-4 py-3 space-y-3 max-h-[500px] overflow-y-auto">
      {/* "View previous comments" link */}
      <button className="font-semibold text-gray-500 text-[15px] hover:underline mb-2">
        View more comments
      </button>

      {comments.map((comment) => (
        <div key={comment.id} className={`flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500`}>
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0 flex items-center justify-center overflow-hidden">
            {comment.name === "HaqPlus" ? (
              <div className="bg-primary/10 w-full h-full flex items-center justify-center text-primary font-bold">H</div>
            ) : (
              <User className="w-5 h-5 text-gray-400" />
            )}
          </div>
          
          {/* Comment Bubble & Actions */}
          <div className="flex flex-col">
            <div className="bg-[#f0f2f5] px-3 pt-2 pb-2.5 rounded-2xl max-w-fit">
              <span className="font-semibold text-[13px] text-gray-900 mr-2">{comment.name}</span>
              {comment.name === "HaqPlus" && (
                <span className="bg-black text-white text-[10px] px-1.5 py-0.5 rounded mr-2 uppercase">Author</span>
              )}
              <div className="text-[15px] text-gray-900 leading-snug">{comment.text}</div>
            </div>
            
            {/* Comment Actions (Like, Reply, Time) */}
            <div className="flex items-center gap-3 px-3 pt-1 text-[12px] font-bold text-gray-500">
              <button className="hover:underline">Like</button>
              <button className="hover:underline">Reply</button>
              <span className="font-normal text-gray-400">{comment.time}</span>
              
              {/* Comment Likes Indicator */}
              {comment.likes > 0 && (
                <div className="flex items-center gap-1 ml-4 bg-white shadow-sm border border-gray-100 rounded-full px-1.5 py-0.5 -mt-6 z-10 relative">
                  <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center">
                    <ThumbsUp className="w-2 h-2 text-white fill-white" />
                  </div>
                  <span className="font-normal text-[11px] text-gray-500">{comment.likes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {/* Fake Write Comment Input */}
      <div className="flex gap-2 pt-3 items-center sticky bottom-0 bg-white">
        <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 flex items-center justify-center">
          <User className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1 bg-[#f0f2f5] rounded-full px-4 py-2 text-[15px] text-gray-500 cursor-text hover:bg-gray-200 transition-colors">
          Write a comment...
        </div>
      </div>
    </div>
  );
}
