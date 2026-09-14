import { FbPost } from "@/components/landing/fb-post";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Special Offer - HaqPlus",
  description: "Limited time special offer on premium products.",
};

export default function FacebookLandingPage() {
  return (
    <div className="min-h-screen bg-[#f0f2f5] py-8 px-4 font-sans selection:bg-blue-200">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Top Promotional Banner (Optional context outside the post) */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            🔥 MEGA DISCOUNT SALE 🔥
          </h1>
          <p className="text-gray-600 mt-2 font-medium">
            Join thousands of happy customers! Limited stock available.
          </p>
        </div>

        {/* The Facebook Post Component */}
        <FbPost />

        {/* Trust Badges */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8 text-center space-y-4">
          <h3 className="font-bold text-gray-800 text-lg">Why Choose HaqPlus?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl mb-1">🚚</span>
              <span className="font-semibold text-gray-800">Fast Delivery</span>
              <span className="text-xs">All over Bangladesh</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-emerald-50 rounded-lg">
              <span className="text-2xl mb-1">🛡️</span>
              <span className="font-semibold text-gray-800">100% Original</span>
              <span className="text-xs">Premium Quality</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-2xl mb-1">💸</span>
              <span className="font-semibold text-gray-800">Cash on Delivery</span>
              <span className="text-xs">Pay after receive</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
