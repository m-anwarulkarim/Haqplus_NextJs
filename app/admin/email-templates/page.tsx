"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Save,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Settings,
  PackageCheck,
  Truck,
  XCircle,
  Clock,
  Check,
  Package,
  Undo2,
  Eye,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { DEFAULT_EMAIL_TEMPLATES } from "@/lib/email/email-templates-default";

type StatusKey =
  | "pending"
  | "confirmation"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

interface StatusConfig {
  key: StatusKey;
  label: string;
  badge: string;
  badgeColor: string;
  icon: any;
  subjectKey: string;
  bodyKey: string;
  defaultSubject: string;
  defaultBody: string;
}

const STATUS_CONFIGS: StatusConfig[] = [
  {
    key: "pending",
    label: "পেন্ডিং অর্ডার (Pending Order)",
    badge: "⏳ PENDING",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-200",
    icon: Clock,
    subjectKey: "pendingSubject",
    bodyKey: "pendingBody",
    defaultSubject: DEFAULT_EMAIL_TEMPLATES.ORDER_PENDING_SUBJECT,
    defaultBody: DEFAULT_EMAIL_TEMPLATES.ORDER_PENDING_BODY,
  },
  {
    key: "confirmation",
    label: "কনফার্মড অর্ডার (Confirmed Order)",
    badge: "✅ CONFIRMED",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    icon: CheckCircle2,
    subjectKey: "confirmationSubject",
    bodyKey: "confirmationBody",
    defaultSubject: DEFAULT_EMAIL_TEMPLATES.ORDER_CONFIRMATION_SUBJECT,
    defaultBody: DEFAULT_EMAIL_TEMPLATES.ORDER_CONFIRMATION_BODY,
  },
  {
    key: "processing",
    label: "প্রসেসিং অর্ডার (Processing Order)",
    badge: "📦 PROCESSING",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-200",
    icon: Package,
    subjectKey: "processingSubject",
    bodyKey: "processingBody",
    defaultSubject: DEFAULT_EMAIL_TEMPLATES.ORDER_PROCESSING_SUBJECT,
    defaultBody: DEFAULT_EMAIL_TEMPLATES.ORDER_PROCESSING_BODY,
  },
  {
    key: "shipped",
    label: "শিপড নোটিফিকেশন (Shipped & Tracking)",
    badge: "🚚 SHIPPED",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-200",
    icon: Truck,
    subjectKey: "shippedSubject",
    bodyKey: "shippedBody",
    defaultSubject: DEFAULT_EMAIL_TEMPLATES.ORDER_SHIPPED_SUBJECT,
    defaultBody: DEFAULT_EMAIL_TEMPLATES.ORDER_SHIPPED_BODY,
  },
  {
    key: "delivered",
    label: "ডেলিভারি সম্পন্ন (Delivered Order)",
    badge: "🎉 DELIVERED",
    badgeColor: "bg-green-500/10 text-green-600 border-green-200",
    icon: PackageCheck,
    subjectKey: "deliveredSubject",
    bodyKey: "deliveredBody",
    defaultSubject: DEFAULT_EMAIL_TEMPLATES.ORDER_DELIVERED_SUBJECT,
    defaultBody: DEFAULT_EMAIL_TEMPLATES.ORDER_DELIVERED_BODY,
  },
  {
    key: "cancelled",
    label: "বাতিল অর্ডার (Cancelled Order)",
    badge: "❌ CANCELLED",
    badgeColor: "bg-rose-500/10 text-rose-600 border-rose-200",
    icon: XCircle,
    subjectKey: "cancelledSubject",
    bodyKey: "cancelledBody",
    defaultSubject: DEFAULT_EMAIL_TEMPLATES.ORDER_CANCELLED_SUBJECT,
    defaultBody: DEFAULT_EMAIL_TEMPLATES.ORDER_CANCELLED_BODY,
  },
  {
    key: "returned",
    label: "রিটার্নড অর্ডার (Returned Order)",
    badge: "🔄 RETURNED",
    badgeColor: "bg-slate-500/10 text-slate-600 border-slate-200",
    icon: Undo2,
    subjectKey: "returnedSubject",
    bodyKey: "returnedBody",
    defaultSubject: DEFAULT_EMAIL_TEMPLATES.ORDER_RETURNED_SUBJECT,
    defaultBody: DEFAULT_EMAIL_TEMPLATES.ORDER_RETURNED_BODY,
  },
];

const PLACEHOLDERS = [
  { tag: "{customer_name}", desc: "গ্রাহকের নাম" },
  { tag: "{order_number}", desc: "অর্ডার আইডি" },
  { tag: "{total_amount}", desc: "সর্বমোট টাকা" },
  { tag: "{address}", desc: "কাস্টমার ঠিকানা" },
  { tag: "{district}", desc: "জেলা" },
  { tag: "{courier_name}", desc: "কুরিয়ার নাম" },
  { tag: "{tracking_code}", desc: "ট্র্যাকিং আইডি" },
  { tag: "{tracking_link}", desc: "ট্র্যাকিং লিঙ্ক" },
];

export default function EmailTemplatesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [activeTab, setActiveTab] = useState<StatusKey>("confirmation");
  const [previewHtmlModal, setPreviewHtmlModal] = useState<string | null>(null);

  // SMTP Settings
  const [gmailUser, setGmailUser] = useState("");
  const [gmailAppPassword, setGmailAppPassword] = useState("");
  const [adminNotificationEmail, setAdminNotificationEmail] = useState("");

  // Status Templates State (Simple Plain Text Only)
  const [templates, setTemplates] = useState<{ [key: string]: string }>({
    pendingSubject: DEFAULT_EMAIL_TEMPLATES.ORDER_PENDING_SUBJECT,
    pendingBody: DEFAULT_EMAIL_TEMPLATES.ORDER_PENDING_BODY,

    confirmationSubject: DEFAULT_EMAIL_TEMPLATES.ORDER_CONFIRMATION_SUBJECT,
    confirmationBody: DEFAULT_EMAIL_TEMPLATES.ORDER_CONFIRMATION_BODY,

    processingSubject: DEFAULT_EMAIL_TEMPLATES.ORDER_PROCESSING_SUBJECT,
    processingBody: DEFAULT_EMAIL_TEMPLATES.ORDER_PROCESSING_BODY,

    shippedSubject: DEFAULT_EMAIL_TEMPLATES.ORDER_SHIPPED_SUBJECT,
    shippedBody: DEFAULT_EMAIL_TEMPLATES.ORDER_SHIPPED_BODY,

    deliveredSubject: DEFAULT_EMAIL_TEMPLATES.ORDER_DELIVERED_SUBJECT,
    deliveredBody: DEFAULT_EMAIL_TEMPLATES.ORDER_DELIVERED_BODY,

    cancelledSubject: DEFAULT_EMAIL_TEMPLATES.ORDER_CANCELLED_SUBJECT,
    cancelledBody: DEFAULT_EMAIL_TEMPLATES.ORDER_CANCELLED_BODY,

    returnedSubject: DEFAULT_EMAIL_TEMPLATES.ORDER_RETURNED_SUBJECT,
    returnedBody: DEFAULT_EMAIL_TEMPLATES.ORDER_RETURNED_BODY,
  });

  // Fetch Settings on Mount
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/email/templates");
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setGmailUser(d.GMAIL_USER || "");
        setGmailAppPassword(d.GMAIL_APP_PASSWORD || "");
        setAdminNotificationEmail(d.ADMIN_NOTIFICATION_EMAIL || "");

        setTemplates({
          pendingSubject: d.EMAIL_ORDER_PENDING_SUBJECT || DEFAULT_EMAIL_TEMPLATES.ORDER_PENDING_SUBJECT,
          pendingBody: d.EMAIL_ORDER_PENDING_BODY || DEFAULT_EMAIL_TEMPLATES.ORDER_PENDING_BODY,

          confirmationSubject: d.EMAIL_ORDER_CONFIRMATION_SUBJECT || DEFAULT_EMAIL_TEMPLATES.ORDER_CONFIRMATION_SUBJECT,
          confirmationBody: d.EMAIL_ORDER_CONFIRMATION_BODY || DEFAULT_EMAIL_TEMPLATES.ORDER_CONFIRMATION_BODY,

          processingSubject: d.EMAIL_ORDER_PROCESSING_SUBJECT || DEFAULT_EMAIL_TEMPLATES.ORDER_PROCESSING_SUBJECT,
          processingBody: d.EMAIL_ORDER_PROCESSING_BODY || DEFAULT_EMAIL_TEMPLATES.ORDER_PROCESSING_BODY,

          shippedSubject: d.EMAIL_ORDER_SHIPPED_SUBJECT || DEFAULT_EMAIL_TEMPLATES.ORDER_SHIPPED_SUBJECT,
          shippedBody: d.EMAIL_ORDER_SHIPPED_BODY || DEFAULT_EMAIL_TEMPLATES.ORDER_SHIPPED_BODY,

          deliveredSubject: d.EMAIL_ORDER_DELIVERED_SUBJECT || DEFAULT_EMAIL_TEMPLATES.ORDER_DELIVERED_SUBJECT,
          deliveredBody: d.EMAIL_ORDER_DELIVERED_BODY || DEFAULT_EMAIL_TEMPLATES.ORDER_DELIVERED_BODY,

          cancelledSubject: d.EMAIL_ORDER_CANCELLED_SUBJECT || DEFAULT_EMAIL_TEMPLATES.ORDER_CANCELLED_SUBJECT,
          cancelledBody: d.EMAIL_ORDER_CANCELLED_BODY || DEFAULT_EMAIL_TEMPLATES.ORDER_CANCELLED_BODY,

          returnedSubject: d.EMAIL_ORDER_RETURNED_SUBJECT || DEFAULT_EMAIL_TEMPLATES.ORDER_RETURNED_SUBJECT,
          returnedBody: d.EMAIL_ORDER_RETURNED_BODY || DEFAULT_EMAIL_TEMPLATES.ORDER_RETURNED_BODY,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("ইমেইল টেমপ্লেট লোড করতে সমস্যা হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Save Settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        GMAIL_USER: gmailUser,
        GMAIL_APP_PASSWORD: gmailAppPassword,
        ADMIN_NOTIFICATION_EMAIL: adminNotificationEmail,

        EMAIL_ORDER_PENDING_SUBJECT: templates.pendingSubject,
        EMAIL_ORDER_PENDING_BODY: templates.pendingBody,

        EMAIL_ORDER_CONFIRMATION_SUBJECT: templates.confirmationSubject,
        EMAIL_ORDER_CONFIRMATION_BODY: templates.confirmationBody,

        EMAIL_ORDER_PROCESSING_SUBJECT: templates.processingSubject,
        EMAIL_ORDER_PROCESSING_BODY: templates.processingBody,

        EMAIL_ORDER_SHIPPED_SUBJECT: templates.shippedSubject,
        EMAIL_ORDER_SHIPPED_BODY: templates.shippedBody,

        EMAIL_ORDER_DELIVERED_SUBJECT: templates.deliveredSubject,
        EMAIL_ORDER_DELIVERED_BODY: templates.deliveredBody,

        EMAIL_ORDER_CANCELLED_SUBJECT: templates.cancelledSubject,
        EMAIL_ORDER_CANCELLED_BODY: templates.cancelledBody,

        EMAIL_ORDER_RETURNED_SUBJECT: templates.returnedSubject,
        EMAIL_ORDER_RETURNED_BODY: templates.returnedBody,
      };

      const res = await fetch("/api/admin/email/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("সবগুলো স্ট্যাটাসের ইমেইল বার্তা সফলভাবে সেভ করা হয়েছে!");
      } else {
        toast.error(json.error || "সেভ করতে সমস্যা হয়েছে");
      }
    } catch (err: any) {
      toast.error(err.message || "ত্রুটি ঘটেছে");
    } finally {
      setIsSaving(false);
    }
  };

  // Insert placeholder into active field
  const handleInsertPlaceholder = (tag: string, fieldKey: string) => {
    setTemplates((prev) => ({
      ...prev,
      [fieldKey]: (prev[fieldKey] || "") + ` ${tag}`,
    }));
    toast.success(`ট্যাগ '${tag}' যুক্ত করা হয়েছে`);
  };

  // Reset current tab to default
  const handleResetCurrent = () => {
    const config = STATUS_CONFIGS.find((c) => c.key === activeTab);
    if (config) {
      setTemplates((prev) => ({
        ...prev,
        [config.subjectKey]: config.defaultSubject,
        [config.bodyKey]: config.defaultBody,
      }));
      toast.success(`${config.label} এর ডিফল্ট বার্তা রিস্টোর করা হয়েছে`);
    }
  };

  // Test Email Sender
  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      toast.error("পরীক্ষা করার জন্য একটি সঠিক ইমেইল দিন");
      return;
    }

    setIsTesting(true);
    try {
      const res = await fetch("/api/admin/email/send-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: [{ email: testEmail, name: "Test Admin" }],
          subject: "🧪 Test Email Notification (haqplus)",
          bodyHtml: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #10b981; border-radius: 8px;">
            <h2 style="color: #059669;">Gmail Gateway Working Perfectly! 🎉</h2>
            <p>আপনার haqplus স্টোরের জিমেইল অটোমেশন সিস্টেম সফলভাবে কাজ করছে।</p>
          </div>`,
        }),
      });

      const json = await res.json();
      if (json.success && json.sentCount > 0) {
        toast.success(`টেস্ট ইমেইলটি সফলভাবে ${testEmail} ঠিকানায় পাঠানো হয়েছে!`);
      } else {
        toast.error(json.error || "টেস্ট ইমেইল পাঠানো ব্যর্থ হয়েছে। জিমেইল অ্যাপ পাসওয়ার্ড চেক করুন।");
      }
    } catch (err: any) {
      toast.error(err.message || "টেস্ট ইমেইল পাঠাতে সমস্যা হয়েছে");
    } finally {
      setIsTesting(false);
    }
  };

  const activeConfig = STATUS_CONFIGS.find((c) => c.key === activeTab) || STATUS_CONFIGS[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/80 rounded-3xl p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Mail className="size-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                জিমেইল মেসেজ ও স্ট্যাটাস টেমপ্লেট
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                প্রতিটি স্ট্যাটাসের জন্য কাস্টম বার্তা ও টেক্সট নিজের মতো সেট করুন। কোনো কোডের প্রয়োজন নেই!
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={fetchTemplates}
            disabled={isLoading}
            className="rounded-2xl h-11 px-4 gap-2 text-xs font-semibold"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>রিফ্রেশ</span>
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-2xl h-11 px-6 gap-2 bg-[#0f6848] hover:bg-[#0b4e36] text-white text-xs font-bold shadow-md shadow-emerald-900/10"
          >
            {isSaving ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>পরিবর্তন সেভ করুন</span>
          </Button>
        </div>
      </div>

      {/* Gmail Credentials Configuration Card */}
      <Card className="rounded-3xl border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Settings className="size-5 text-emerald-600" />
              <CardTitle className="text-base font-bold text-foreground">
                জিমেইল SMTP অ্যান্ড সার্ভিস সেটিংস
              </CardTitle>
            </div>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
              Active Transporter
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            আপনার জিমেইল এড্রেস এবং ১৬ অক্ষরের App Password সেট করে টেস্ট ইমেইল পাঠিয়ে যাচাই করুন।
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">জিমেইল এড্রেস (Sender Gmail)</Label>
              <Input
                placeholder="yourshop@gmail.com"
                value={gmailUser}
                onChange={(e) => setGmailUser(e.target.value)}
                className="h-11 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Google App Password (16-digit)</Label>
              <Input
                type="password"
                placeholder="xxxx xxxx xxxx xxxx"
                value={gmailAppPassword}
                onChange={(e) => setGmailAppPassword(e.target.value)}
                className="h-11 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">এডমিন অ্যালার্ট রিসিভার ইমেইল</Label>
              <Input
                placeholder="admin@gmail.com"
                value={adminNotificationEmail}
                onChange={(e) => setAdminNotificationEmail(e.target.value)}
                className="h-11 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          {/* Test Email Row */}
          <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Input
                placeholder="টেস্ট পাঠাতে নিজের ইমেইল লিখুন"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="h-10 rounded-xl text-xs pl-3 pr-10"
              />
            </div>
            <Button
              onClick={handleSendTestEmail}
              disabled={isTesting}
              size="sm"
              variant="outline"
              className="rounded-xl h-10 px-4 gap-2 text-xs font-semibold w-full sm:w-auto"
            >
              {isTesting ? <RefreshCw className="size-3.5 animate-spin" /> : <Send className="size-3.5 text-emerald-600" />}
              <span>টেস্ট ইমেইল পাঠান</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Status Selector Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Sliders className="size-4 text-emerald-600" />
            <span>অর্ডার স্ট্যাটাস অনুযায়ী ইমেইল বার্তা পরিবর্তন করুন ({STATUS_CONFIGS.length}টি)</span>
          </h3>
        </div>

        {/* Status Tab Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {STATUS_CONFIGS.map((config) => {
            const Icon = config.icon;
            const isActive = activeTab === config.key;
            return (
              <button
                key={config.key}
                onClick={() => setActiveTab(config.key)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                  isActive
                    ? "bg-[#0f6848] text-white border-[#0f6848] shadow-md shadow-emerald-900/10"
                    : "bg-card text-slate-700 border-border/80 hover:bg-muted"
                }`}
              >
                <Icon className="size-4" />
                <span>{config.label.split(" (")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Active Status Template Editor */}
        <Card className="rounded-3xl border-border/80 shadow-xs overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/60 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-card border border-border shadow-xs text-emerald-600">
                  <activeConfig.icon className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-extrabold text-foreground">
                    {activeConfig.label}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    অর্ডারের স্ট্যাটাস পরিবর্তন হয়ে &quot;{activeConfig.badge}&quot; হলে এই ইমেইল বার্তাটি কাস্টমারের কাছে যাবে।
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetCurrent}
                  className="rounded-xl h-9 px-3 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-3.5" />
                  <span>ডিফল্ট রিস্টোর</span>
                </Button>

                <Badge variant="outline" className={`px-3 py-1 font-mono text-xs font-bold ${activeConfig.badgeColor}`}>
                  {activeConfig.badge}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Subject Field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 block">
                ইমেইল সাবজেক্ট (Subject Line)
              </Label>
              <Input
                value={templates[activeConfig.subjectKey] || ""}
                onChange={(e) =>
                  setTemplates((prev) => ({
                    ...prev,
                    [activeConfig.subjectKey]: e.target.value,
                  }))
                }
                placeholder="ইমেইলের সাবজেক্ট লিখুন..."
                className="h-12 rounded-xl text-sm font-semibold"
              />
            </div>

            {/* Plain Text Message Body Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-700 block">
                  ইমেইল বার্তা / কাস্টম মেসেজ (Plain Text Message)
                </Label>
                <span className="text-xs text-emerald-600 font-medium">
                  ✓ এইচটিএমএল কোডের কোনো দরকার নেই! সাধারণ টেক্সট লিখুন।
                </span>
              </div>

              <Textarea
                rows={8}
                value={templates[activeConfig.bodyKey] || ""}
                onChange={(e) =>
                  setTemplates((prev) => ({
                    ...prev,
                    [activeConfig.bodyKey]: e.target.value,
                  }))
                }
                placeholder="এখানে আপনার কাঙ্ক্ষিত বার্তাটি লিখুন..."
                className="rounded-2xl p-4 text-sm font-sans leading-relaxed resize-y border border-slate-200/90 focus-visible:ring-[#0f6848]/20"
              />
            </div>

            {/* Interactive Placeholder Badges Helper */}
            <div className="pt-3 border-t border-border/60 space-y-2">
              <span className="text-xs font-bold text-slate-600 block">
                ডাইনামিক তথ্য বসাতে নিচের ট্যাগে ক্লিক করুন:
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                {PLACEHOLDERS.map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => handleInsertPlaceholder(item.tag, activeConfig.bodyKey)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-xs font-mono font-semibold text-slate-700 transition-all cursor-pointer"
                  >
                    <span>{item.tag}</span>
                    <span className="text-[10px] text-slate-400 font-sans">({item.desc})</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Floating Bar */}
      <div className="pt-4 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-2xl h-12 px-8 gap-2 bg-[#0f6848] hover:bg-[#0b4e36] text-white text-sm font-bold shadow-lg shadow-emerald-950/15"
        >
          {isSaving ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
          <span>সমস্ত ইমেইল বার্তা সেভ করুন</span>
        </Button>
      </div>
    </div>
  );
}
