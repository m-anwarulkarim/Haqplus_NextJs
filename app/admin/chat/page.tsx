"use client";

import { useState } from "react";
import useSWR from "swr";
import { Search, MessageSquare, Send, User, Loader2, ArrowLeft, Phone, Mail, ShoppingBag, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "@/components/ui/toast";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminChatPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Poll conversations every 3 seconds
  const { data: convData, mutate: mutateConvs } = useSWR(
    "/api/chat/conversations",
    fetcher,
    { refreshInterval: 3000 }
  );

  // Poll active chat messages every 2 seconds
  const { data: chatData, mutate: mutateChat } = useSWR(
    activeSessionId ? `/api/chat?sessionId=${activeSessionId}` : null,
    fetcher,
    { refreshInterval: 2000 }
  );

  const conversations = convData?.conversations || [];
  const activeChat = chatData?.messages || [];

  const activeConv = conversations.find((c: any) => c.sessionId === activeSessionId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeSessionId) return;

    setIsSending(true);
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          text,
          sender: "ADMIN",
        }),
      });
      setText("");
      mutateChat();
      mutateConvs();
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleBlockUser = async () => {
    if (!activeConv?.customerPhone) {
      toast.error("Cannot block user: No phone number provided.");
      return;
    }
    if (!confirm(`Are you sure you want to BLOCK this user (${activeConv.customerPhone})? They will no longer be able to send messages.`)) return;
    
    try {
      const res = await fetch("/api/admin/chat/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: activeConv.customerPhone }),
      });
      if (res.ok) {
        toast.success("User blocked successfully");
        setActiveSessionId(null);
        mutateConvs();
      } else {
        toast.error("Failed to block user");
      }
    } catch (err) {
      toast.error("Failed to block user");
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-background border border-border/60 rounded-2xl shadow-sm overflow-hidden">
      {/* Sidebar - Conversation List */}
      <div className={`w-full sm:w-[320px] border-r border-border/60 flex flex-col ${activeSessionId ? "hidden sm:flex" : "flex"}`}>
        <div className="p-4 border-b border-border/60 bg-muted/20">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <MessageSquare className="size-5 text-primary" />
            Live Chat
          </h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search customers..." className="pl-9 h-9 rounded-xl bg-background" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-60">
              <MessageSquare className="size-8" />
              <p className="text-sm">No active chats</p>
            </div>
          ) : (
            conversations.map((conv: any) => (
              <button
                key={conv.id}
                onClick={() => setActiveSessionId(conv.sessionId)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                  activeSessionId === conv.sessionId
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-muted/50 text-foreground"
                }`}
              >
                <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
                  activeSessionId === conv.sessionId ? "bg-primary-foreground/20 text-white" : "bg-primary/10 text-primary"
                }`}>
                  <User className="size-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm line-clamp-1">{conv.customerName || "Guest"}</span>
                    <span className={`text-[10px] ${activeSessionId === conv.sessionId ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {new Date(conv.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 line-clamp-1 ${activeSessionId === conv.sessionId ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                    {conv.messages?.[0]?.text || "No messages yet"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-muted/10 ${!activeSessionId ? "hidden sm:flex" : "flex"}`}>
        {!activeSessionId ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
            <MessageSquare className="size-16 mb-4 text-primary/20" />
            <p className="text-lg font-medium">Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-border/60 bg-background flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setActiveSessionId(null)} className="sm:hidden rounded-full">
                  <ArrowLeft className="size-5" />
                </Button>
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <User className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">
                    {activeConv?.customerName || "Guest"}
                  </h3>
                  <p className="text-xs text-muted-foreground">Session: {activeSessionId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleBlockUser} className="text-orange-500 hover:text-orange-600 hover:bg-orange-500/10 rounded-full" title="Block User">
                  <ShieldOff className="size-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeChat.map((msg: any) => (
                <div key={msg.id} className={`flex flex-col max-w-[70%] ${msg.sender === "ADMIN" ? "ml-auto items-end" : "mr-auto items-start"}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    msg.sender === "ADMIN"
                      ? "bg-primary text-primary-foreground rounded-br-sm shadow-sm"
                      : "bg-background text-foreground rounded-bl-sm border border-border/60 shadow-sm"
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border/60 bg-background">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="rounded-full bg-muted/40 border-transparent focus-visible:ring-primary h-12"
                />
                <Button type="submit" size="icon" disabled={!text.trim() || isSending} className="rounded-full size-12 shrink-0">
                  {isSending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Third Pane - Customer Details & Orders */}
      {activeSessionId && (
        <div className="w-full sm:w-[320px] border-l border-border/60 flex flex-col bg-background/50 hidden lg:flex">
          <div className="p-4 border-b border-border/60 bg-muted/20">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <User className="size-5 text-primary" />
              Customer Details
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <CustomerProfilePane sessionId={activeSessionId} />
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerProfilePane({ sessionId }: { sessionId: string }) {
  const { data, error } = useSWR(`/api/admin/customer-profile?sessionId=${sessionId}`, fetcher);

  if (!data && !error) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-sm text-destructive">Failed to load customer details</p>;
  }

  const { details, orders } = data;

  return (
    <div className="space-y-6">
      {/* Contact Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="size-4 text-primary" />
          </div>
          <div className="font-medium">{details.name || "Unknown Name"}</div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="size-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Phone className="size-4 text-emerald-600" />
          </div>
          <div className="font-medium text-muted-foreground">
            {details.phone ? (
              <a href={`tel:${details.phone}`} className="hover:text-emerald-600 transition-colors">
                {details.phone}
              </a>
            ) : "No Phone"}
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="size-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
            <Mail className="size-4 text-blue-600" />
          </div>
          <div className="font-medium text-muted-foreground break-all">
            {details.email ? (
              <a href={`mailto:${details.email}`} className="hover:text-blue-600 transition-colors">
                {details.email}
              </a>
            ) : "No Email"}
          </div>
        </div>
      </div>

      {/* Activity & Visits Info */}
      <div className="space-y-3 pt-4 border-t border-border/60">
        <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Activity Tracking</h3>
        
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">Total Website Visits</div>
          <div className="font-bold text-primary">{details.visitCount || 1}</div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">First Visited</div>
          <div className="font-medium">
            {details.firstVisit 
              ? new Date(details.firstVisit).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
              : "Unknown"
            }
          </div>
        </div>
      </div>

      {/* Past Orders */}
      <div className="pt-2">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <ShoppingBag className="size-4 text-primary" />
          Past Orders ({orders?.length || 0})
        </h3>
        
        {orders?.length === 0 ? (
          <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/50 text-center">
            No past orders found for this customer.
          </p>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`}>
                <div className="block p-3 rounded-xl border border-border/60 hover:border-primary/40 bg-card hover:shadow-sm transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-primary group-hover:underline">
                      #{order.orderNumber}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded-md">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">৳{Number(order.total).toLocaleString()}</span>
                      {" • "}{order.items?.length || 0} items
                    </div>
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 capitalize ${
                      order.orderStatus === "DELIVERED" ? "border-emerald-500/30 text-emerald-600" :
                      order.orderStatus === "CANCELLED" ? "border-destructive/30 text-destructive" :
                      "border-blue-500/30 text-blue-600"
                    }`}>
                      {order.orderStatus.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
