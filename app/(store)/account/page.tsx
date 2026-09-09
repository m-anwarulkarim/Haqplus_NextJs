"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { 
  User, 
  Package, 
  Heart, 
  ShieldCheck, 
  LogOut, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [isSaved, setIsSaved] = useState(false);

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-muted-foreground text-sm font-medium">Loading your profile...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[65vh]">
        <div className="bg-primary/10 p-4 rounded-full mb-4 text-primary">
          <User className="size-10" />
        </div>
        <h1 className="text-2xl font-bold mb-2">অ্যাকাউন্টে প্রবেশ করুন</h1>
        <p className="text-muted-foreground text-center max-w-md mb-6 text-sm">
          আপনার প্রোফাইল, অর্ডারের আপডেট এবং সংরক্ষিত পণ্য দেখতে দয়া করে লগইন করুন।
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/login">লগইন করুন</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">রেজিস্টার করুন</Link>
          </Button>
        </div>
      </div>
    );
  }

  const user = session.user;
  const isAdmin = user.role === "ADMIN";
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 sm:p-8 mb-8 overflow-hidden shadow-xl border border-emerald-800/30">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 size-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <Avatar className="size-20 sm:size-24 border-4 border-white/20 shadow-xl">
            {user.image && <AvatarImage src={user.image} alt={user.name || "User"} />}
            <AvatarFallback className="bg-emerald-600 text-white text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {user.name || "গ্রাহক"}
              </h1>
              {isAdmin ? (
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 gap-1 py-1">
                  <ShieldCheck className="size-3.5" /> Admin
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 gap-1 py-1">
                  <Sparkles className="size-3.5" /> Premium Member
                </Badge>
              )}
            </div>
            <p className="text-emerald-100/80 text-sm flex items-center justify-center sm:justify-start gap-2">
              <Mail className="size-4 text-emerald-400" /> {user.email}
            </p>
          </div>

          <div className="flex gap-2">
            {isAdmin && (
              <Button asChild variant="secondary" className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-semibold gap-2">
                <Link href="/admin">Admin Control Panel</Link>
              </Button>
            )}
            <Button 
              variant="destructive" 
              className="bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 gap-2"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="size-4" /> সাইন আউট
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Quick Nav Card 1: Orders */}
        <Link href="/account/orders" className="group">
          <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-emerald-500/40 border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold group-hover:text-emerald-600 transition-colors">
                আমার অর্ডারসমূহ
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Package className="size-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                আপনার সাম্প্রতিক কেনাকাটার তালিকা ও স্টিডফাস্ট কুরিয়ারের লাইভ ডেলিভারি স্ট্যাটাস দেখুন।
              </p>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                অর্ডারসমূহ দেখুন <ArrowRight className="size-3.5" />
              </span>
            </CardContent>
          </Card>
        </Link>

        {/* Quick Nav Card 2: Wishlist */}
        <Link href="/account/wishlist" className="group">
          <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-rose-500/40 border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold group-hover:text-rose-600 transition-colors">
                উইশলিস্ট / পছন্দের তালিকা
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-all">
                <Heart className="size-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                আপনার পছন্দের সব অর্গানিক চা পাতার তালিকা সংরক্ষণ করুন ও পরবর্তীতে সহজে অর্ডার করুন।
              </p>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                উইশলিস্ট দেখুন <ArrowRight className="size-3.5" />
              </span>
            </CardContent>
          </Card>
        </Link>

        {/* Quick Nav Card 3: Track Live */}
        <Link href="/orders/track" className="group">
          <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-blue-500/40 border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold group-hover:text-blue-600 transition-colors">
                লাইভ কুরিয়ার ট্র্যাকিং
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Clock className="size-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                অর্ডার নম্বর বা কুরিয়ার ট্র্যাকিং কোড দিয়ে আপনার পার্সেলের রিয়েল-টাইম অবস্থান জানুন।
              </p>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                অর্ডার ট্রাক করুন <ArrowRight className="size-3.5" />
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Account Info Detail */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="size-5 text-emerald-600" /> ব্যক্তিগত তথ্য ও প্রোফাইল
          </CardTitle>
          <CardDescription>
            আপনার নাম, যোগাযোগের ইমেইল এবং ঠিকানা আপডেট রাখুন।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                নাম (Full Name)
              </label>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/60 text-foreground font-medium">
                <User className="size-4 text-muted-foreground" />
                <span>{user.name || "N/A"}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                ইমেইল (Email Address)
              </label>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/60 text-foreground font-medium">
                <Mail className="size-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <Button 
              variant="outline"
              onClick={() => {
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 3000);
              }}
              className="gap-2"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="size-4 text-emerald-600" /> তথ্য সংরক্ষিত হয়েছে
                </>
              ) : (
                "তথ্য আপডেট করুন"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
