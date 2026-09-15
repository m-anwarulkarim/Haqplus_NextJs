"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  ShieldCheck,
  UserCheck,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/toast";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "CUSTOMER" | "ADMIN";
  image?: string | null;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  isBlocked: boolean;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Bulk Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendResult, setSendResult] = useState<{ total: number; sent: number; failed: number } | null>(null);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch customer directory");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBlockStatus = async (customerId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/customers/${customerId}/block`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: !currentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      toast.success(currentStatus ? "Customer unblocked successfully" : "Customer blocked successfully");
      fetchCustomers();
    } catch (err) {
      toast.error("Failed to update block status");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  // Checkbox Selection Logic
  const handleSelectAll = () => {
    if (selectedIds.length === filteredCustomers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCustomers.map((c) => c.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bulk Email Submit Handler
  const handleSendBulkEmail = async () => {
    const targetCustomers = customers.filter((c) => selectedIds.includes(c.id));
    const validRecipients = targetCustomers.filter((c) => c.email && c.email.includes("@"));

    if (validRecipients.length === 0) {
      toast.error("No selected customers have valid email addresses");
      return;
    }

    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error("Please enter email subject and message content");
      return;
    }

    setIsSendingEmail(true);
    setSendResult(null);

    try {
      const res = await fetch("/api/admin/email/send-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: validRecipients.map((c) => ({ email: c.email, name: c.name })),
          subject: emailSubject,
          bodyHtml: emailBody,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSendResult({
          total: validRecipients.length,
          sent: json.sentCount || 0,
          failed: json.failedCount || 0,
        });
        toast.success(`Bulk emails dispatched: ${json.sentCount} sent successfully!`);
      } else {
        toast.error(json.error || "Failed to send bulk emails");
      }
    } catch (err: any) {
      toast.error(err.message || "Error processing bulk email request");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Customer Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View registered shoppers, loyalty spend, and send bulk promotional emails.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <Button
              onClick={() => {
                setSendResult(null);
                setShowEmailModal(true);
              }}
              className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2 shadow-sm animate-in fade-in duration-150"
            >
              <Mail className="size-4" />
              <span>Send Bulk Email ({selectedIds.length} Selected)</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={fetchCustomers}
            disabled={isLoading}
            className="rounded-xl gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Search & Bulk Action Tool Header */}
      <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
          <span>{selectedIds.length} of {filteredCustomers.length} selected</span>
          {selectedIds.length > 0 && (
            <button
              onClick={() => setSelectedIds([])}
              className="text-purple-600 hover:underline font-bold"
            >
              Clear selection
            </button>
          )}
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b border-border/60">
                <TableHead className="w-[40px] text-center">
                  <input
                    type="checkbox"
                    checked={filteredCustomers.length > 0 && selectedIds.length === filteredCustomers.length}
                    onChange={handleSelectAll}
                    className="size-4 rounded border-border text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                </TableHead>
                <TableHead className="w-[45px] text-center font-bold">#</TableHead>
                <TableHead className="w-[60px]">Image</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Phone / Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Orders Placed</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Date Registered</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="size-6 animate-spin text-blue-500" />
                      <span className="text-sm font-medium">Loading customers...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="size-8 text-muted-foreground/50" />
                      <p className="text-sm font-semibold text-foreground">No customers found</p>
                      <p className="text-xs text-muted-foreground">
                        Customer accounts will appear as users register and shop.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer, index) => {
                  const isSelected = selectedIds.includes(customer.id);
                  const joinDate = new Date(customer.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <TableRow
                      key={customer.id}
                      className={`hover:bg-muted/40 transition-colors border-b border-border/40 ${
                        isSelected ? "bg-purple-500/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(customer.id)}
                          className="size-4 rounded border-border text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </TableCell>

                      {/* Serial Index */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground font-mono text-xs">
                          <span>{index + 1}</span>
                        </div>
                      </TableCell>

                      {/* Avatar Image */}
                      <TableCell>
                        <div className="relative size-10 rounded-xl overflow-hidden bg-muted/60 border border-border/60 shrink-0 flex items-center justify-center">
                          {customer.image ? (
                            <img
                              src={customer.image}
                              alt={customer.name}
                              className="size-full object-cover"
                            />
                          ) : (
                            <span className="font-bold text-xs text-purple-600">
                              {customer.name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Customer Name */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="font-semibold text-sm text-foreground flex items-center gap-2">
                            {customer.name}
                            {customer.isBlocked && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                                BLOCKED
                              </span>
                            )}
                          </p>
                          <span className="text-xs text-muted-foreground block font-mono">
                            {customer.email}
                          </span>
                        </div>
                      </TableCell>

                      {/* Contact */}
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground font-medium">
                          {customer.phone || "N/A"}
                        </span>
                      </TableCell>

                      {/* Role Pill Badge */}
                      <TableCell>
                        {customer.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            <ShieldCheck className="size-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            <UserCheck className="size-3" />
                            Customer
                          </span>
                        )}
                      </TableCell>

                      {/* Orders Count Badge */}
                      <TableCell>
                        <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-extrabold bg-blue-600 text-white shadow-xs">
                          {customer.orderCount} orders
                        </span>
                      </TableCell>

                      {/* Total Spent */}
                      <TableCell>
                        <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          ৳{customer.totalSpent}
                        </span>
                      </TableCell>

                      {/* Registered Date */}
                      <TableCell>
                        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                          {joinDate}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant={customer.isBlocked ? "outline" : "destructive"}
                            size="sm"
                            className={`h-7 px-2.5 text-xs font-semibold ${customer.isBlocked ? "border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10" : ""}`}
                            onClick={() => toggleBlockStatus(customer.id, customer.isBlocked)}
                          >
                            {customer.isBlocked ? "Unblock" : "Block"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
          <span>
            Total Customers: <strong className="text-foreground">{filteredCustomers.length}</strong>
          </span>
          <span>haqplus Customer Directory</span>
        </div>
      </div>

      {/* BULK EMAIL MODAL DRAWER */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border/80 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Mail className="size-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">Send Bulk Email Campaign</h3>
                  <p className="text-xs text-muted-foreground">Targeting <strong>{selectedIds.length} selected customers</strong></p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="size-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            {sendResult ? (
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-2 font-mono">
                <strong className="text-sm font-bold text-purple-700 dark:text-purple-300 block">
                  🎉 Bulk Email Campaign Completed!
                </strong>
                <p>Total Recipients: <strong>{sendResult.total}</strong></p>
                <p className="text-emerald-600 font-bold">Successfully Sent: {sendResult.sent}</p>
                {sendResult.failed > 0 && <p className="text-rose-500 font-bold">Failed: {sendResult.failed}</p>}

                <Button
                  onClick={() => {
                    setShowEmailModal(false);
                    setSelectedIds([]);
                  }}
                  className="mt-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
                >
                  Close & Clear Selection
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Campaign Subject Line *</label>
                  <Input
                    placeholder="e.g. 🔥 বিশেষ ছাড়! আসল শ্রীমঙ্গলের চা পাতায় বিশেষ অফার"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Email Message Content (HTML Supported) *</label>
                  <textarea
                    rows={8}
                    placeholder="Enter email content. Dynamic variables available: {customer_name}, {email}"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full rounded-xl text-xs font-mono p-3 bg-background border border-border focus:outline-none focus:border-purple-500 leading-relaxed"
                  />
                  <span className="text-[11px] text-muted-foreground">Placeholders: <code>{`{customer_name}`}</code>, <code>{`{email}`}</code></span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                  <Button
                    variant="outline"
                    onClick={() => setShowEmailModal(false)}
                    className="rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendBulkEmail}
                    disabled={isSendingEmail}
                    className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2 text-xs"
                  >
                    {isSendingEmail ? <RefreshCw className="size-4 animate-spin" /> : <Mail className="size-4" />}
                    <span>{isSendingEmail ? "Dispatching Batch Emails..." : `Send to ${selectedIds.length} Customers`}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
