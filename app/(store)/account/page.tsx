"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  Gift, 
  Lock, 
  LogOut, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle, 
  ExternalLink,
  ShoppingCart,
  ChevronRight,
  Edit3,
  Phone,
  Mail,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/store/cart-store";
import { TEA_PRODUCTS } from "@/lib/data/tea-products";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  paymentMethod: string;
  trackingCode?: string;
  createdAt: string;
  items: OrderItem[];
}

export default function RokomariStyleAccountPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "address" | "coupons" | "wishlist">("profile");
  
  // Profile edit state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Cart store
  const { addItem } = useCartStore();

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setPhone("+8801700000000");
      setAddress("ঢাকা, বাংলাদেশ");
    }
  }, [session]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setOrdersLoading(false);
      }
    }

    if (sessionStatus === "authenticated") {
      fetchOrders();
    }
  }, [sessionStatus]);

  if (sessionStatus === "loading") {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="size-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mb-4" />
        <p className="text-muted-foreground text-sm font-medium">অ্যাাকাউন্ট লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[65vh]">
        <div className="bg-emerald-500/10 p-4 rounded-full mb-4 text-emerald-600 dark:text-emerald-400">
          <User className="size-10" />
        </div>
        <h1 className="text-2xl font-bold mb-2">অ্যাকাউন্টে প্রবেশ করুন</h1>
        <p className="text-muted-foreground text-center max-w-md mb-6 text-sm">
          আপনার প্রোফাইল, অর্ডারের আপডেট এবং সংরক্ষিত পণ্য দেখতে দয়া করে লগইন করুন।
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
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

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "DELIVERED":
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1"><CheckCircle2 className="size-3" /> ডেলিভার্ড/সম্পন্ন</Badge>;
      case "SHIPPED":
        return <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1"><Truck className="size-3" /> কুরিয়ারে স্থানান্তরিত</Badge>;
      case "PROCESSING":
        return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1"><Clock className="size-3" /> প্রসেসিং চলছে</Badge>;
      case "CANCELLED":
        return <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 gap-1"><XCircle className="size-3" /> বাতিলকৃত</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Clock className="size-3" /> পেন্ডিং</Badge>;
    }
  };

  return (
    <div className="bg-muted/30 min-h-[85vh] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Rokomari Style Profile Header Banner */}
        <div className="bg-white dark:bg-card rounded-2xl p-6 mb-6 shadow-sm border border-border/80 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <Avatar className="size-20 border-2 border-emerald-600/30 shadow-md">
              {user.image && <AvatarImage src={user.image} alt={user.name || "User"} />}
              <AvatarFallback className="bg-emerald-600 text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-xl font-extrabold text-foreground">{user.name || "গ্রাহক"}</h1>
                {isAdmin ? (
                  <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 text-[11px]">
                    <ShieldCheck className="size-3" /> Admin
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[11px]">
                    <Sparkles className="size-3" /> Premium Member
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-3">
                <span className="flex items-center gap-1"><Mail className="size-3 text-emerald-600" /> {user.email}</span>
              </p>
            </div>
          </div>

          {/* Quick Stat Counter Cards (Rokomari Style) */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-muted/50 p-3 rounded-xl text-center border border-border/60">
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{orders.length}</span>
              <p className="text-[11px] font-semibold text-muted-foreground">মোট অর্ডার</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-xl text-center border border-border/60">
              <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                {orders.filter(o => o.status === "SHIPPED" || o.status === "PROCESSING").length}
              </span>
              <p className="text-[11px] font-semibold text-muted-foreground">চলমান ডেলিভারি</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-xl text-center border border-border/60">
              <span className="text-lg font-black text-rose-600 dark:text-rose-400">3</span>
              <p className="text-[11px] font-semibold text-muted-foreground">উইশলিস্ট</p>
            </div>
          </div>
        </div>

        {/* Rokomari Style Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar Menu */}
          <div className="lg:col-span-1 space-y-2">
            <Card className="p-2 border-border/80 shadow-xs sticky top-20">
              <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible space-x-1 lg:space-x-0 lg:space-y-1 p-1">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all w-full text-left shrink-0 ${
                    activeTab === "profile" 
                      ? "bg-emerald-600 text-white shadow-sm" 
                      : "hover:bg-muted text-foreground/80"
                  }`}
                >
                  <User className="size-4" /> আমার প্রোফাইল
                </button>

                <button
                  onClick={() => setActiveTab("orders")}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all w-full text-left shrink-0 ${
                    activeTab === "orders" 
                      ? "bg-emerald-600 text-white shadow-sm" 
                      : "hover:bg-muted text-foreground/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package className="size-4" /> আমার অর্ডারসমূহ
                  </div>
                  {orders.length > 0 && (
                    <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-100 text-[10px]">
                      {orders.length}
                    </Badge>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("wishlist")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all w-full text-left shrink-0 ${
                    activeTab === "wishlist" 
                      ? "bg-emerald-600 text-white shadow-sm" 
                      : "hover:bg-muted text-foreground/80"
                  }`}
                >
                  <Heart className="size-4" /> পছন্দের তালিকা
                </button>

                <button
                  onClick={() => setActiveTab("address")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all w-full text-left shrink-0 ${
                    activeTab === "address" 
                      ? "bg-emerald-600 text-white shadow-sm" 
                      : "hover:bg-muted text-foreground/80"
                  }`}
                >
                  <MapPin className="size-4" /> ডেলিভারি ঠিকানা
                </button>

                <button
                  onClick={() => setActiveTab("coupons")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all w-full text-left shrink-0 ${
                    activeTab === "coupons" 
                      ? "bg-emerald-600 text-white shadow-sm" 
                      : "hover:bg-muted text-foreground/80"
                  }`}
                >
                  <Gift className="size-4" /> কুপন ও ডিসকাউন্ট
                </button>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-all w-full"
                  >
                    <ShieldCheck className="size-4" /> Admin Panel
                  </Link>
                )}

                <div className="pt-2 border-t my-1">
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-500/10 transition-all w-full text-left"
                  >
                    <LogOut className="size-4" /> সাইন আউট
                  </button>
                </div>
              </nav>
            </Card>
          </div>

          {/* Right Main Content Area */}
          <div className="lg:col-span-3">
            
            {/* TAB 1: Profile Information */}
            {activeTab === "profile" && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="border-b pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <User className="size-5 text-emerald-600" /> ব্যক্তিগত প্রোফাইল তথ্য
                  </CardTitle>
                  <CardDescription>আপনার ব্যক্তিগত নাম ও তথ্য সম্পাদন করুন</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                        পূর্ণ নাম (Full Name)
                      </label>
                      <Input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="আপনার নাম লিখুন"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                        ইমেইল ঠিকানা (Email Address)
                      </label>
                      <Input value={user.email || ""} disabled className="bg-muted text-muted-foreground" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                        মোবাইল নম্বর (Phone Number)
                      </label>
                      <Input 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        placeholder="০১৭xxxxxxxx"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                        ঠিকানা (Default Shipping Address)
                      </label>
                      <Input 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        placeholder="আপনার সম্পূর্ণ ঠিকানা"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      * আপনার দেওয়া তথ্যাদি সম্পূর্ণ নিরাপদ ও সুরক্ষিত।
                    </p>
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                      onClick={() => {
                        setIsSaved(true);
                        setTimeout(() => setIsSaved(false), 3000);
                      }}
                    >
                      {isSaved ? (
                        <>
                          <CheckCircle2 className="size-4" /> সেভ হয়েছে!
                        </>
                      ) : (
                        "তথ্য সেভ করুন"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB 2: Orders */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Package className="size-5 text-emerald-600" /> সাম্প্রতিক আদেশ ও অর্ডারসমূহ
                  </h2>
                  <Badge variant="outline" className="text-xs">
                    মোট {orders.length}টি অর্ডার
                  </Badge>
                </div>

                {ordersLoading ? (
                  <div className="p-8 text-center bg-card rounded-2xl border">
                    <div className="size-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">অর্ডার লোড হচ্ছে...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <Card className="p-12 text-center border-dashed">
                    <Package className="size-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-base font-bold mb-1">এখনো কোনো অর্ডার করা হয়নি</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                      আমাদের সেরা অর্গানিক চা পাতার কালেকশন ঘুরে দেখুন এবং অর্ডার করুন!
                    </p>
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                      <Link href="/shop">চা পাতার কালেকশন দেখুন</Link>
                    </Button>
                  </Card>
                ) : (
                  orders.map((order) => (
                    <Card key={order.id} className="overflow-hidden border-border/80">
                      <CardHeader className="bg-muted/40 py-3 px-4 border-b flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-foreground">
                            অর্ডার #{order.orderNumber}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                          ৳{order.totalAmount}
                        </span>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        <div className="space-y-2">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs py-1 border-b last:border-0">
                              <div className="flex items-center gap-2">
                                <span className="text-base">🍵</span>
                                <div>
                                  <p className="font-semibold text-foreground">{item.name}</p>
                                  <span className="text-[11px] text-muted-foreground">পরিমাণ: {item.quantity}টি</span>
                                </div>
                              </div>
                              <span className="font-bold">৳{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {order.trackingCode && (
                          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs flex items-center justify-between text-blue-700 dark:text-blue-300">
                            <span className="font-medium flex items-center gap-1.5">
                              <Truck className="size-3.5" />
                              Steadfast Tracking: <strong className="font-mono">{order.trackingCode}</strong>
                            </span>
                            <Link href="/orders/track" className="underline font-bold hover:text-blue-500 flex items-center gap-1">
                              লাইভ ট্র্যাক <ExternalLink className="size-3" />
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: Wishlist */}
            {activeTab === "wishlist" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
                  <Heart className="size-5 text-rose-500 fill-rose-500" /> পছন্দের চা পাতার তালিকা (Wishlist)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {TEA_PRODUCTS.slice(0, 4).map((product) => (
                    <Card key={product.id} className="overflow-hidden border-border/80 group flex flex-col justify-between">
                      <div className="flex gap-3 p-3">
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="size-20 rounded-xl object-cover border"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm truncate group-hover:text-emerald-600 transition-colors">
                            {product.name}
                          </h4>
                          <span className="text-xs text-muted-foreground block mb-1">{product.weight}</span>
                          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                            ৳{product.price}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 pt-0">
                        <Button
                          size="sm"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs"
                          onClick={() =>
                            addItem({
                              productId: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.images[0],
                            })
                          }
                        >
                          <ShoppingCart className="size-3.5" /> কার্টে যোগ করুন
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Delivery Address */}
            {activeTab === "address" && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <MapPin className="size-5 text-emerald-600" /> সংরক্ষিত শিপিং ঠিকানা
                    </CardTitle>
                    <CardDescription>পণ্য দ্রুত পৌঁছানোর জন্য সঠিক ঠিকানা সেট করে রাখুন</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1 text-xs">
                    <Plus className="size-3.5" /> নতুন ঠিকানা
                  </Button>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="p-4 rounded-xl border border-emerald-600/30 bg-emerald-500/5 relative">
                    <Badge className="bg-emerald-600 text-white text-[10px] mb-2">ডিফল্ট ঠিকানা</Badge>
                    <h4 className="font-bold text-sm text-foreground">{user.name || "গ্রাহক"}</h4>
                    <p className="text-xs text-muted-foreground mt-1">মোবাইল: ০১৭xxxxxxxx</p>
                    <p className="text-xs text-muted-foreground">ঠিকানা: হাউজ #১২, রোড #০৫, ধানমন্ডি, ঢাকা-১২০৫</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB 5: Coupons */}
            {activeTab === "coupons" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
                  <Gift className="size-5 text-purple-600" /> আপনার জন্য বিশেষ কুপন ও ছাড়
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="border-dashed border-2 border-emerald-500/40 bg-emerald-500/5 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Badge className="bg-emerald-600 text-white text-[10px]">২০% ছাড়</Badge>
                        <h4 className="font-bold text-base mt-1">WELCOME20</h4>
                      </div>
                      <Gift className="size-6 text-emerald-600" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      প্রথম অর্ডারে পান ২০% বিশেষ মূল্যছাড়। যেকোনো পরিমাণ ক্রয়ে প্রযোজ্য।
                    </p>
                    <Button variant="outline" size="sm" className="w-full text-xs font-mono font-bold">
                      কুপন কোড কপির জন্য তৈরি
                    </Button>
                  </Card>

                  <Card className="border-dashed border-2 border-amber-500/40 bg-amber-500/5 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Badge className="bg-amber-600 text-white text-[10px]">১০% ছাড়</Badge>
                        <h4 className="font-bold text-base mt-1">TEA10</h4>
                      </div>
                      <Gift className="size-6 text-amber-600" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      অর্গানিক গ্রিন টি কালেকশনে পান ১০% ফ্ল্যাট ছাড়।
                    </p>
                    <Button variant="outline" size="sm" className="w-full text-xs font-mono font-bold">
                      কুপন কোড কপির জন্য তৈরি
                    </Button>
                  </Card>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
