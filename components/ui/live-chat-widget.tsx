"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Phone, MessageSquare, Loader2, User, Phone as PhoneIcon, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"menu" | "form" | "chat">("menu");
  const [sessionId, setSessionId] = useState("");
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // User Details State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [visitCount, setVisitCount] = useState(1);
  const [firstVisit, setFirstVisit] = useState("");

  // Initialize sessionId and user details
  useEffect(() => {
    let sid = localStorage.getItem("chat_session_id");
    if (!sid) {
      sid = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("chat_session_id", sid);
    }
    setSessionId(sid);
    
    setName(localStorage.getItem("chat_user_name") || "");
    setPhone(localStorage.getItem("chat_user_phone") || "");
    setEmail(localStorage.getItem("chat_user_email") || "");

    // Track Visits
    let count = parseInt(localStorage.getItem("site_visit_count") || "0", 10);
    let fVisit = localStorage.getItem("site_first_visit");
    
    if (!fVisit) {
      fVisit = new Date().toISOString();
      localStorage.setItem("site_first_visit", fVisit);
    }

    if (!sessionStorage.getItem("has_visited_this_session")) {
      count += 1;
      localStorage.setItem("site_visit_count", count.toString());
      sessionStorage.setItem("has_visited_this_session", "true");
    }

    setVisitCount(count);
    setFirstVisit(fVisit);
  }, []);

  // Poll messages if chat is open
  const { data, mutate } = useSWR(
    view === "chat" && sessionId ? `/api/chat?sessionId=${sessionId}` : null,
    fetcher,
    { refreshInterval: 2000 } // Poll every 2 seconds for real-time feel
  );

  const messages = data?.messages || [];

  useEffect(() => {
    // Scroll to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, view]);

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    
    localStorage.setItem("chat_user_name", name);
    localStorage.setItem("chat_user_phone", phone);
    if (email) localStorage.setItem("chat_user_email", email);
    
    setView("chat");
  };

  const openInternalChat = () => {
    if (name && phone) {
      setView("chat");
    } else {
      setView("form");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !sessionId) return;
    
    setIsSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sessionId, 
          text, 
          sender: "CUSTOMER",
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          visitCount,
          firstVisit
        }),
      });
      
      if (res.status === 403) {
        alert("You have been blocked from sending messages.");
        setText("");
        return;
      }
      
      setText("");
      mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const whatsappNumber = "+8801700000000"; // Can be dynamic from settings later
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hello! I need some help.`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window / Menu */}
      {isOpen && (
        <div className="mb-4 w-[320px] sm:w-[360px] overflow-hidden rounded-3xl border border-white/20 bg-background/60 backdrop-blur-2xl shadow-2xl shadow-primary/10 transition-all duration-300 animate-in slide-in-from-bottom-5 zoom-in-95">
          {view === "menu" ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Hello there! 👋</h3>
                  <p className="text-xs text-muted-foreground mt-1">How would you like to connect with us?</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full size-8 hover:bg-muted/50">
                  <X className="size-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <Button asChild variant="outline" className="w-full h-14 rounded-2xl justify-start px-4 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all group">
                  <Link href={whatsappUrl} target="_blank">
                    <div className="size-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <Phone className="size-4" />
                    </div>
                    <div className="text-left">
                      <span className="block font-bold">Chat on WhatsApp</span>
                      <span className="block text-[10px] text-muted-foreground">Fastest response</span>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" onClick={openInternalChat} className="w-full h-14 rounded-2xl justify-start px-4 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all group">
                  <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                    <MessageSquare className="size-4" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold">Live Support Chat</span>
                    <span className="block text-[10px] text-muted-foreground">Chat directly on website</span>
                  </div>
                </Button>
              </div>
            </div>
          ) : view === "form" ? (
            <div className="flex flex-col h-[450px]">
              <div className="p-4 border-b border-border/50 flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setView("menu")} className="size-8 rounded-full">
                    <X className="size-4" />
                  </Button>
                  <div>
                    <h3 className="font-bold text-sm">Start Live Chat</h3>
                    <p className="text-[10px] text-muted-foreground">Please provide your details to continue</p>
                  </div>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                <form onSubmit={handleStartChat} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Name <span className="text-destructive">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" className="pl-9 h-11 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Phone <span className="text-destructive">*</span></label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Your Phone Number" className="pl-9 h-11 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Email <span className="text-muted-foreground font-normal">(Optional)</span></label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your Email Address" className="pl-9 h-11 rounded-xl" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl font-bold mt-2">
                    Start Chatting
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-[450px]">
              {/* Header */}
              <div className="p-4 border-b border-border/50 flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setView("menu")} className="size-8 rounded-full">
                    <X className="size-4" />
                  </Button>
                  <div>
                    <h3 className="font-bold text-sm">Live Support</h3>
                    <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      We usually reply in a few minutes
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                {messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center space-y-3 opacity-50">
                    <MessageCircle className="size-12 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Send a message to start chatting with our support team.</p>
                  </div>
                ) : (
                  messages.map((msg: any) => (
                    <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.sender === "CUSTOMER" ? "ml-auto items-end" : "mr-auto items-start"}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                        msg.sender === "CUSTOMER" 
                          ? "bg-primary text-primary-foreground rounded-br-sm" 
                          : "bg-muted/80 backdrop-blur-md text-foreground rounded-bl-sm border border-border/50"
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-muted-foreground mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-border/50 bg-background/50">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your message..."
                    className="rounded-full bg-muted/50 border-transparent focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary/50"
                  />
                  <Button type="submit" size="icon" disabled={!text.trim() || isSending} className="rounded-full shrink-0">
                    {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="size-14 rounded-full shadow-2xl shadow-primary/30 hover:scale-105 hover:shadow-primary/50 transition-all duration-300"
      >
        {isOpen ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </Button>
    </div>
  );
}
