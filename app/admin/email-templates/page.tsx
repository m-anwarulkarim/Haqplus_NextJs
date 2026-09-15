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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { DEFAULT_EMAIL_TEMPLATES } from "@/lib/email/email-templates-default";

export default function EmailTemplatesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"confirmation" | "shipped" | "delivered" | "cancelled">("confirmation");

  // Credentials & Settings State
  const [gmailUser, setGmailUser] = useState("");
  const [gmailAppPassword, setGmailAppPassword] = useState("");
  const [adminNotificationEmail, setAdminNotificationEmail] = useState("");

  // Template State
  const [confirmationSubject, setConfirmationSubject] = useState("");
  const [confirmationBody, setConfirmationBody] = useState("");

  const [shippedSubject, setShippedSubject] = useState("");
  const [shippedBody, setShippedBody] = useState("");

  const [deliveredSubject, setDeliveredSubject] = useState("");
  const [deliveredBody, setDeliveredBody] = useState("");

  const [cancelledSubject, setCancelledSubject] = useState("");
  const [cancelledBody, setCancelledBody] = useState("");

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

        setConfirmationSubject(d.EMAIL_ORDER_CONFIRMATION_SUBJECT);
        setConfirmationBody(d.EMAIL_ORDER_CONFIRMATION_BODY);

        setShippedSubject(d.EMAIL_ORDER_SHIPPED_SUBJECT);
        setShippedBody(d.EMAIL_ORDER_SHIPPED_BODY);

        setDeliveredSubject(d.EMAIL_ORDER_DELIVERED_SUBJECT);
        setDeliveredBody(d.EMAIL_ORDER_DELIVERED_BODY);

        setCancelledSubject(d.EMAIL_ORDER_CANCELLED_SUBJECT);
        setCancelledBody(d.EMAIL_ORDER_CANCELLED_BODY);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load email templates");
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

        EMAIL_ORDER_CONFIRMATION_SUBJECT: confirmationSubject,
        EMAIL_ORDER_CONFIRMATION_BODY: confirmationBody,

        EMAIL_ORDER_SHIPPED_SUBJECT: shippedSubject,
        EMAIL_ORDER_SHIPPED_BODY: shippedBody,

        EMAIL_ORDER_DELIVERED_SUBJECT: deliveredSubject,
        EMAIL_ORDER_DELIVERED_BODY: deliveredBody,

        EMAIL_ORDER_CANCELLED_SUBJECT: cancelledSubject,
        EMAIL_ORDER_CANCELLED_BODY: cancelledBody,
      };

      const res = await fetch("/api/admin/email/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Gmail credentials & email templates saved successfully!");
      } else {
        toast.error(json.error || "Failed to save settings");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving templates");
    } finally {
      setIsSaving(false);
    }
  };

  // Test Email Handler
  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      toast.error("Please enter a valid email address for testing");
      return;
    }

    setIsTesting(true);
    try {
      const res = await fetch("/api/admin/email/send-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: [{ email: testEmail, name: "Test User" }],
          subject: "🧪 Test Email Notification (haqplus)",
          bodyHtml: `<div style="font-family: Arial; padding: 20px;"><h2 style="color: #059669;">Gmail System Working!</h2><p>This is a test notification email from your <strong>haqplus</strong> e-commerce platform.</p></div>`,
        }),
      });

      const json = await res.json();
      if (json.success && json.sentCount > 0) {
        toast.success(`Test email sent successfully to ${testEmail}! Check your inbox.`);
      } else {
        toast.error(json.error || json.errors?.[0] || "Failed to send test email. Check Gmail credentials.");
      }
    } catch (err: any) {
      toast.error("Test email connection error");
    } finally {
      setIsTesting(false);
    }
  };

  // Reset Active Template to Default
  const handleResetDefault = () => {
    if (activeTab === "confirmation") {
      setConfirmationSubject(DEFAULT_EMAIL_TEMPLATES.ORDER_CONFIRMATION_SUBJECT);
      setConfirmationBody(DEFAULT_EMAIL_TEMPLATES.ORDER_CONFIRMATION_BODY);
    } else if (activeTab === "shipped") {
      setShippedSubject(DEFAULT_EMAIL_TEMPLATES.ORDER_SHIPPED_SUBJECT);
      setShippedBody(DEFAULT_EMAIL_TEMPLATES.ORDER_SHIPPED_BODY);
    } else if (activeTab === "delivered") {
      setDeliveredSubject(DEFAULT_EMAIL_TEMPLATES.ORDER_DELIVERED_SUBJECT);
      setDeliveredBody(DEFAULT_EMAIL_TEMPLATES.ORDER_DELIVERED_BODY);
    } else if (activeTab === "cancelled") {
      setCancelledSubject(DEFAULT_EMAIL_TEMPLATES.ORDER_CANCELLED_SUBJECT);
      setCancelledBody(DEFAULT_EMAIL_TEMPLATES.ORDER_CANCELLED_BODY);
    }
    toast.success("Template reset to default values");
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-3 py-0.5 text-xs font-bold mb-1">
            <Mail className="size-3.5" />
            <span>Email Management System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Gmail SMTP & Custom Email Templates
          </h1>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-sm"
        >
          {isSaving ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
          <span>Save All Settings & Templates</span>
        </Button>
      </div>

      {/* 1. Gmail Credentials Setup Card */}
      <Card className="rounded-2xl border-border/80 shadow-2xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Settings className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Gmail Sender Credentials & Admin Alert</CardTitle>
                <CardDescription className="text-xs">Configure Gmail App Password for reliable automated delivery</CardDescription>
              </div>
            </div>

            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono text-[11px]">
              Gmail SMTP (Port 465/587)
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Gmail Address (Sender) *</label>
              <Input
                placeholder="yourbrand@gmail.com"
                value={gmailUser}
                onChange={(e) => setGmailUser(e.target.value)}
                className="rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Gmail App Password *</label>
              <Input
                type="password"
                placeholder="xxxx xxxx xxxx xxxx"
                value={gmailAppPassword}
                onChange={(e) => setGmailAppPassword(e.target.value)}
                className="rounded-xl text-xs font-mono"
              />
              <span className="text-[10px] text-muted-foreground block">Google Account &gt; Security &gt; App Passwords</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Admin Alert Receiver Email</label>
              <Input
                placeholder="admin@yourbrand.com"
                value={adminNotificationEmail}
                onChange={(e) => setAdminNotificationEmail(e.target.value)}
                className="rounded-xl text-xs font-mono"
              />
              <span className="text-[10px] text-muted-foreground block">Receives instant notifications for new orders</span>
            </div>
          </div>

          {/* Test Email Section */}
          <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                placeholder="Enter email to test (e.g. test@gmail.com)"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="rounded-xl text-xs font-mono max-w-xs h-9"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleSendTestEmail}
                disabled={isTesting}
                className="rounded-xl text-xs font-bold gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 h-9"
              >
                {isTesting ? <RefreshCw className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                <span>Send Test Email</span>
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground">
              💡 Need help generating a Gmail App Password? Go to Google Account Security.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Custom Email Template Editor Card */}
      <Card className="rounded-2xl border-border/80 shadow-2xs space-y-4">
        <div className="p-4 border-b border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Custom Email Template Editor</h3>
              <p className="text-xs text-muted-foreground">Customize subjects and HTML message body for customer triggers</p>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetDefault}
            className="rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset Active Template to Default</span>
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4">
          <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
            <button
              onClick={() => setActiveTab("confirmation")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "confirmation"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground"
              }`}
            >
              <PackageCheck className="size-4" />
              <span>1. Order Confirmation (অর্ডার কনফার্মেশন)</span>
            </button>

            <button
              onClick={() => setActiveTab("shipped")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "shipped"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground"
              }`}
            >
              <Truck className="size-4" />
              <span>2. Order Shipped (শিপিং ও ট্র্যাকিং)</span>
            </button>

            <button
              onClick={() => setActiveTab("delivered")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "delivered"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground"
              }`}
            >
              <CheckCircle2 className="size-4" />
              <span>3. Order Delivered (ডেলিভারড)</span>
            </button>

            <button
              onClick={() => setActiveTab("cancelled")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "cancelled"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground"
              }`}
            >
              <XCircle className="size-4" />
              <span>4. Order Cancelled (ক্যানসেলড)</span>
            </button>
          </div>
        </div>

        {/* Active Template Editor */}
        <div className="p-4 pt-0 space-y-4">
          {/* Dynamic Placeholders Helper Box */}
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-300">
              <HelpCircle className="size-4" />
              <span>Available Dynamic Variables (কাস্টমাইজেশনের জন্য এই প্লেসহোল্ডারগুলো ব্যবহার করুন):</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
              <span className="bg-purple-500/20 px-2 py-0.5 rounded text-purple-700 dark:text-purple-200">{`{customer_name}`}</span>
              <span className="bg-purple-500/20 px-2 py-0.5 rounded text-purple-700 dark:text-purple-200">{`{order_number}`}</span>
              <span className="bg-purple-500/20 px-2 py-0.5 rounded text-purple-700 dark:text-purple-200">{`{total_amount}`}</span>
              <span className="bg-purple-500/20 px-2 py-0.5 rounded text-purple-700 dark:text-purple-200">{`{payment_method}`}</span>
              <span className="bg-purple-500/20 px-2 py-0.5 rounded text-purple-700 dark:text-purple-200">{`{address}`}</span>
              <span className="bg-purple-500/20 px-2 py-0.5 rounded text-purple-700 dark:text-purple-200">{`{district}`}</span>
              <span className="bg-purple-500/20 px-2 py-0.5 rounded text-purple-700 dark:text-purple-200">{`{courier_name}`}</span>
              <span className="bg-purple-500/20 px-2 py-0.5 rounded text-purple-700 dark:text-purple-200">{`{tracking_code}`}</span>
              <span className="bg-purple-500/20 px-2 py-0.5 rounded text-purple-700 dark:text-purple-200">{`{items_table}`}</span>
            </div>
          </div>

          {/* Form Controls */}
          {activeTab === "confirmation" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">Email Subject Line *</label>
                <Input
                  value={confirmationSubject}
                  onChange={(e) => setConfirmationSubject(e.target.value)}
                  className="rounded-xl text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">Email HTML Body Content *</label>
                <Textarea
                  value={confirmationBody}
                  onChange={(e) => setConfirmationBody(e.target.value)}
                  rows={14}
                  className="rounded-xl text-xs font-mono leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === "shipped" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">Email Subject Line *</label>
                <Input
                  value={shippedSubject}
                  onChange={(e) => setShippedSubject(e.target.value)}
                  className="rounded-xl text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">Email HTML Body Content *</label>
                <Textarea
                  value={shippedBody}
                  onChange={(e) => setShippedBody(e.target.value)}
                  rows={14}
                  className="rounded-xl text-xs font-mono leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === "delivered" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">Email Subject Line *</label>
                <Input
                  value={deliveredSubject}
                  onChange={(e) => setDeliveredSubject(e.target.value)}
                  className="rounded-xl text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">Email HTML Body Content *</label>
                <Textarea
                  value={deliveredBody}
                  onChange={(e) => setDeliveredBody(e.target.value)}
                  rows={12}
                  className="rounded-xl text-xs font-mono leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === "cancelled" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">Email Subject Line *</label>
                <Input
                  value={cancelledSubject}
                  onChange={(e) => setCancelledSubject(e.target.value)}
                  className="rounded-xl text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">Email HTML Body Content *</label>
                <Textarea
                  value={cancelledBody}
                  onChange={(e) => setCancelledBody(e.target.value)}
                  rows={12}
                  className="rounded-xl text-xs font-mono leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
