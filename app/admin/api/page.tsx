"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  MessageSquare,
  ShieldCheck,
  Activity,
  BellRing,
  ChevronRight,
  RefreshCw,
  Save,
  Wallet,
  Send,
  CheckCircle2,
  AlertCircle,
  Code2,
  Plug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";

export default function AdminApiIntegrationsPage() {
  const [activeModal, setActiveModal] = useState<
    "courier" | "sms" | "fraud" | "meta" | "notifications" | null
  >(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Unified Form State for all APIs
  const [formData, setFormData] = useState({
    // Courier (Steadfast)
    STEADFAST_API_KEY: "",
    STEADFAST_SECRET_KEY: "",
    SHIPPING_INSIDE_DHAKA: "70",
    SHIPPING_OUTSIDE_DHAKA: "130",

    // SMS API
    smsBaseUrl: "https://api.sms-provider.com/v1",
    smsApiKey: "",
    smsSenderId: "HAQPLUS",
    smsEnabled: true,

    // Fraud Checker
    fraudApiKey: "",
    fraudThreshold: "3",
    fraudAutoBlock: true,

    // Meta Pixel & Conversions API (CAPI)
    metaPixelId: "",
    metaAccessToken: "",
    metaTestEventCode: "",
    ga4Id: "",
    gtmId: "",
    googleVerification: "",

    // SMS Templates
    smsOrderPlacedTemplate: "প্রিয় {name}, haqplus এ আপনার অর্ডার #{order_id} সফল হয়েছে। মোট: ৳{total}।",
    smsOrderShippedTemplate: "প্রিয় {name}, আপনার অর্ডার #{order_id} কুরিয়ারে পাঠানো হয়েছে। ট্র্যাকিং ID: {tracking_id}।",
  });

  // Action states
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [balanceResult, setBalanceResult] = useState<any>(null);
  const [isTestingCapi, setIsTestingCapi] = useState(false);
  const [capiTestResult, setCapiTestResult] = useState<any>(null);

  // Fetch initial API settings
  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({
          ...prev,
          STEADFAST_API_KEY: data.STEADFAST_API_KEY || prev.STEADFAST_API_KEY,
          STEADFAST_SECRET_KEY: data.STEADFAST_SECRET_KEY || prev.STEADFAST_SECRET_KEY,
          SHIPPING_INSIDE_DHAKA: data.SHIPPING_INSIDE_DHAKA || prev.SHIPPING_INSIDE_DHAKA,
          SHIPPING_OUTSIDE_DHAKA: data.SHIPPING_OUTSIDE_DHAKA || prev.SHIPPING_OUTSIDE_DHAKA,
          metaPixelId: data.metaPixelId || prev.metaPixelId,
          metaAccessToken: data.metaAccessToken || prev.metaAccessToken,
          metaTestEventCode: data.metaTestEventCode || prev.metaTestEventCode,
          ga4Id: data.ga4Id || prev.ga4Id,
          gtmId: data.gtmId || prev.gtmId,
          googleVerification: data.googleVerification || prev.googleVerification,
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load API settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Save Settings handler
  const handleSaveSettings = async (apiTitle: string) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        toast.error(`Failed to save ${apiTitle} settings`);
        return;
      }

      toast.success(`${apiTitle} settings saved successfully!`);
      setActiveModal(null);
    } catch (err) {
      console.error(err);
      toast.error("Network error while saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Check Steadfast Balance
  const handleCheckBalance = async () => {
    setIsCheckingBalance(true);
    try {
      const res = await fetch("/api/courier/steadfast/balance");
      const data = await res.json();
      setBalanceResult(data);
      if (res.ok) {
        toast.success(`Steadfast Merchant Balance: ৳${data.current_balance ?? 0}`);
      } else {
        toast.error(data.error || "Failed to query Steadfast balance");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error querying Steadfast");
    } finally {
      setIsCheckingBalance(false);
    }
  };

  // Test Meta CAPI Event
  const handleTestCapi = async () => {
    if (!formData.metaPixelId || !formData.metaAccessToken) {
      toast.error("Provide Pixel ID & Access Token first to test CAPI");
      return;
    }

    setIsTestingCapi(true);
    setCapiTestResult(null);

    try {
      const res = await fetch("/api/tracking/conversion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "ViewContent",
          eventId: `test_${Date.now()}`,
          userData: {
            email: "anwarul.test@haqplus.com",
            phone: "+8801700000000",
            firstName: "Anwarul",
            city: "Dhaka",
          },
          customData: {
            content_name: "haqplus Tea CAPI Test",
            value: 250,
            currency: "BDT",
          },
          testEventCode: formData.metaTestEventCode.trim() || undefined,
        }),
      });

      const data = await res.json();
      setCapiTestResult(data);

      if (data.success) {
        toast.success("Meta CAPI Server Event verified successfully!");
      } else {
        toast.error(data.error || "Meta CAPI verification failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error testing Meta CAPI");
    } finally {
      setIsTestingCapi(false);
    }
  };

  // Integration items matching screenshot
  const API_ITEMS = [
    {
      id: "courier" as const,
      name: "Courier API (Steadfast)",
      description: "Configure API Key, Secret Key & Webhook Token",
      icon: Truck,
      active: Boolean(formData.STEADFAST_API_KEY),
      highlight: true,
    },
    {
      id: "sms" as const,
      name: "SMS API",
      description: "SMS service with custom Base URL & endpoints",
      icon: MessageSquare,
      active: formData.smsEnabled,
      highlight: false,
    },
    {
      id: "fraud" as const,
      name: "Fraud Checker",
      description: "Fake order & fraud detection",
      icon: ShieldCheck,
      active: Boolean(formData.fraudAutoBlock),
      highlight: false,
    },
    {
      id: "meta" as const,
      name: "Meta Pixel & Conversions API",
      description: "Facebook Pixel & server-side tracking",
      icon: Activity,
      active: Boolean(formData.metaPixelId && formData.metaAccessToken),
      highlight: false,
    },
    {
      id: "notifications" as const,
      name: "SMS Notification Settings",
      description: "Order confirmation & status SMS templates",
      icon: BellRing,
      active: true,
      highlight: false,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Title & Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#CBB8DB]/20 text-[#7C5A9C] dark:text-[#CBB8DB] border border-[#CBB8DB]/40 px-3 py-0.5 text-xs font-bold mb-1">
          <Plug className="size-3.5" />
          <span>API & Gateways Manager</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          API Integration Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure external APIs for Courier Logistics, Meta CAPI Tracking, SMS Gateways, and Security Fraud Protection.
        </p>
      </div>

      {/* Stacked Cards List matching screenshot */}
      <div className="space-y-3">
        {API_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => setActiveModal(item.id)}
              className={`rounded-2xl border p-4 sm:p-5 flex items-center justify-between transition-all duration-200 cursor-pointer group shadow-2xs ${
                item.highlight
                  ? "bg-[#CBB8DB]/20 border-[#CBB8DB]/50 text-foreground hover:bg-[#CBB8DB]/30 hover:border-[#CBB8DB] hover:shadow-md hover:shadow-[#CBB8DB]/20"
                  : "bg-card border-border/80 hover:bg-[#CBB8DB]/20 hover:border-[#CBB8DB]/60 hover:shadow-md hover:shadow-[#CBB8DB]/15"
              }`}
            >
              {/* Left Info */}
              <div className="flex items-center gap-4">
                <div
                  className={`size-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-105 ${
                    item.highlight
                      ? "bg-[#CBB8DB]/30 text-[#7C5A9C] dark:text-[#CBB8DB] border border-[#CBB8DB]/50 group-hover:bg-[#CBB8DB] group-hover:text-slate-950"
                      : "bg-muted/80 text-muted-foreground border border-border/60 group-hover:bg-[#CBB8DB]/30 group-hover:text-[#7C5A9C] dark:group-hover:text-[#CBB8DB] group-hover:border-[#CBB8DB]/60"
                  }`}
                >
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-[#7C5A9C] dark:group-hover:text-[#CBB8DB] transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Right Status Badge & Arrow */}
              <div className="flex items-center gap-3">
                {item.active && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#CBB8DB]/25 text-[#7C5A9C] dark:text-[#CBB8DB] border border-[#CBB8DB]/40">
                    Active
                  </span>
                )}
                <ChevronRight className="size-5 text-muted-foreground group-hover:text-[#7C5A9C] dark:group-hover:text-[#CBB8DB] transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Courier API (Steadfast) */}
      <Dialog open={activeModal === "courier"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center">
                <Truck className="size-5" />
              </div>
              <div>
                <DialogTitle>Courier API (Steadfast)</DialogTitle>
                <DialogDescription className="text-xs">
                  Configure API credentials & nationwide delivery charges.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {balanceResult && (
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between text-xs">
                <div>
                  <span className="text-muted-foreground">Steadfast Account Balance:</span>
                  <p className="text-base font-extrabold font-mono text-foreground">
                    ৳{balanceResult.current_balance ?? 0}
                  </p>
                </div>
                <CheckCircle2 className="size-5 text-purple-400" />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="STEADFAST_API_KEY" className="text-xs font-semibold">
                Steadfast API Key *
              </Label>
              <Input
                id="STEADFAST_API_KEY"
                name="STEADFAST_API_KEY"
                placeholder="stf_live_api_key_..."
                value={formData.STEADFAST_API_KEY}
                onChange={handleChange}
                className="rounded-xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="STEADFAST_SECRET_KEY" className="text-xs font-semibold">
                Steadfast Secret Key *
              </Label>
              <Input
                id="STEADFAST_SECRET_KEY"
                name="STEADFAST_SECRET_KEY"
                type="password"
                placeholder="stf_live_secret_key_..."
                value={formData.STEADFAST_SECRET_KEY}
                onChange={handleChange}
                className="rounded-xl font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="SHIPPING_INSIDE_DHAKA" className="text-xs font-semibold">
                  Inside Dhaka Delivery (৳)
                </Label>
                <Input
                  id="SHIPPING_INSIDE_DHAKA"
                  name="SHIPPING_INSIDE_DHAKA"
                  type="number"
                  value={formData.SHIPPING_INSIDE_DHAKA}
                  onChange={handleChange}
                  className="rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="SHIPPING_OUTSIDE_DHAKA" className="text-xs font-semibold">
                  Outside Dhaka Delivery (৳)
                </Label>
                <Input
                  id="SHIPPING_OUTSIDE_DHAKA"
                  name="SHIPPING_OUTSIDE_DHAKA"
                  type="number"
                  value={formData.SHIPPING_OUTSIDE_DHAKA}
                  onChange={handleChange}
                  className="rounded-xl font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 justify-between items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCheckBalance}
              disabled={isCheckingBalance}
              className="rounded-xl text-xs gap-1.5"
            >
              {isCheckingBalance ? <RefreshCw className="size-3.5 animate-spin" /> : <Wallet className="size-3.5" />}
              <span>Check Balance</span>
            </Button>

            <Button
              onClick={() => handleSaveSettings("Courier API")}
              disabled={isSaving}
              className="rounded-xl shadow-xs bg-[#CBB8DB] hover:bg-[#b59ece] text-slate-950 font-bold gap-1.5"
            >
              {isSaving ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
              <span>Save Configuration</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: SMS API */}
      <Dialog open={activeModal === "sms"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <MessageSquare className="size-5" />
              </div>
              <div>
                <DialogTitle>SMS API Gateway</DialogTitle>
                <DialogDescription className="text-xs">
                  Custom SMS Service base URL, masking ID, and API keys.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="smsBaseUrl" className="text-xs font-semibold">
                SMS Provider Base URL *
              </Label>
              <Input
                id="smsBaseUrl"
                name="smsBaseUrl"
                placeholder="https://api.sms-provider.com/v1"
                value={formData.smsBaseUrl}
                onChange={handleChange}
                className="rounded-xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="smsApiKey" className="text-xs font-semibold">
                API Key / Bearer Token *
              </Label>
              <Input
                id="smsApiKey"
                name="smsApiKey"
                type="password"
                placeholder="sms_key_..."
                value={formData.smsApiKey}
                onChange={handleChange}
                className="rounded-xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="smsSenderId" className="text-xs font-semibold">
                Sender / Masking ID
              </Label>
              <Input
                id="smsSenderId"
                name="smsSenderId"
                placeholder="HAQPLUS"
                value={formData.smsSenderId}
                onChange={handleChange}
                className="rounded-xl font-mono text-xs max-w-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="smsEnabled"
                name="smsEnabled"
                checked={formData.smsEnabled}
                onChange={handleChange}
                className="size-4 rounded border-gray-400 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
              <Label htmlFor="smsEnabled" className="text-xs font-semibold cursor-pointer">
                Enable Automated SMS Gateway Status
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => handleSaveSettings("SMS API")}
              disabled={isSaving}
              className="rounded-xl shadow-xs bg-[#CBB8DB] hover:bg-[#b59ece] text-slate-950 font-bold gap-1.5"
            >
              {isSaving ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
              <span>Save Settings</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: Fraud Checker */}
      <Dialog open={activeModal === "fraud"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <DialogTitle>Fraud Checker & Fake Order Detection</DialogTitle>
                <DialogDescription className="text-xs">
                  Automated risk scoring to block fake phone numbers and high return rates.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="fraudApiKey" className="text-xs font-semibold">
                FraudCheck API Key
              </Label>
              <Input
                id="fraudApiKey"
                name="fraudApiKey"
                placeholder="fc_live_key_..."
                value={formData.fraudApiKey}
                onChange={handleChange}
                className="rounded-xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fraudThreshold" className="text-xs font-semibold">
                Max Allowed Canceled Orders Threshold
              </Label>
              <Input
                id="fraudThreshold"
                name="fraudThreshold"
                type="number"
                value={formData.fraudThreshold}
                onChange={handleChange}
                className="rounded-xl font-mono text-xs max-w-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Customers exceeding this return count will trigger a fraud warning popup in admin.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="fraudAutoBlock"
                name="fraudAutoBlock"
                checked={formData.fraudAutoBlock}
                onChange={handleChange}
                className="size-4 rounded border-gray-400 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
              <Label htmlFor="fraudAutoBlock" className="text-xs font-semibold cursor-pointer">
                Automatically Flag High Risk Phone Numbers & IPs
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => handleSaveSettings("Fraud Checker")}
              disabled={isSaving}
              className="rounded-xl shadow-xs bg-[#CBB8DB] hover:bg-[#b59ece] text-slate-950 font-bold gap-1.5"
            >
              {isSaving ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
              <span>Save Protection Settings</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: Meta Pixel & Conversions API */}
      <Dialog open={activeModal === "meta"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Activity className="size-5" />
              </div>
              <div>
                <DialogTitle>Meta Pixel & Conversions API (CAPI)</DialogTitle>
                <DialogDescription className="text-xs">
                  Meta Graph API v19.0 server-side tracking, GA4, and Tag Manager.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {capiTestResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                  capiTestResult.success
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {capiTestResult.success ? (
                    <CheckCircle2 className="size-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="size-4" />
                  )}
                  <span>
                    {capiTestResult.success
                      ? "Meta CAPI Server Event Connected!"
                      : "Meta CAPI Error"}
                  </span>
                </div>
                {capiTestResult.fbtraceId && (
                  <p className="font-mono text-[10px]">Trace ID: {capiTestResult.fbtraceId}</p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="metaPixelId" className="text-xs font-semibold">
                Meta Pixel ID *
              </Label>
              <Input
                id="metaPixelId"
                name="metaPixelId"
                placeholder="123456789012345"
                value={formData.metaPixelId}
                onChange={handleChange}
                className="rounded-xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="metaAccessToken" className="text-xs font-semibold">
                Meta CAPI Access Token *
              </Label>
              <Input
                id="metaAccessToken"
                name="metaAccessToken"
                type="password"
                placeholder="EAAG..."
                value={formData.metaAccessToken}
                onChange={handleChange}
                className="rounded-xl font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ga4Id" className="text-xs font-semibold">
                  GA4 Measurement ID
                </Label>
                <Input
                  id="ga4Id"
                  name="ga4Id"
                  placeholder="G-XXXXXXXXXX"
                  value={formData.ga4Id}
                  onChange={handleChange}
                  className="rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gtmId" className="text-xs font-semibold">
                  GTM ID
                </Label>
                <Input
                  id="gtmId"
                  name="gtmId"
                  placeholder="GTM-XXXXXXX"
                  value={formData.gtmId}
                  onChange={handleChange}
                  className="rounded-xl font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 justify-between items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestCapi}
              disabled={isTestingCapi}
              className="rounded-xl text-xs gap-1.5"
            >
              {isTestingCapi ? <RefreshCw className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
              <span>Test CAPI Event</span>
            </Button>

            <Button
              onClick={() => handleSaveSettings("Meta Pixel & CAPI")}
              disabled={isSaving}
              className="rounded-xl shadow-xs bg-[#CBB8DB] hover:bg-[#b59ece] text-slate-950 font-bold gap-1.5"
            >
              {isSaving ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
              <span>Save Meta Settings</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 5: SMS Notifications */}
      <Dialog open={activeModal === "notifications"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <BellRing className="size-5" />
              </div>
              <div>
                <DialogTitle>SMS Notification Templates</DialogTitle>
                <DialogDescription className="text-xs">
                  Customize automated SMS messages sent to customers upon order updates.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="smsOrderPlacedTemplate" className="text-xs font-semibold">
                Order Confirmation Template
              </Label>
              <textarea
                id="smsOrderPlacedTemplate"
                name="smsOrderPlacedTemplate"
                rows={3}
                value={formData.smsOrderPlacedTemplate}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              <p className="text-[11px] text-muted-foreground">
                Available variables: {"{name}"}, {"{order_id}"}, {"{total}"}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="smsOrderShippedTemplate" className="text-xs font-semibold">
                Order Shipped Template
              </Label>
              <textarea
                id="smsOrderShippedTemplate"
                name="smsOrderShippedTemplate"
                rows={3}
                value={formData.smsOrderShippedTemplate}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              <p className="text-[11px] text-muted-foreground">
                Available variables: {"{name}"}, {"{order_id}"}, {"{tracking_id}"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => handleSaveSettings("SMS Notification Templates")}
              disabled={isSaving}
              className="rounded-xl shadow-xs bg-[#CBB8DB] hover:bg-[#b59ece] text-slate-950 font-bold gap-1.5"
            >
              {isSaving ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
              <span>Save Templates</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
