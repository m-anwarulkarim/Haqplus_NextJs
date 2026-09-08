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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Customer Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View registered shoppers, loyalty spend, contact information, and role assignments.
          </p>
        </div>

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

      {/* Search Bar */}
      <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b border-border/60">
                <TableHead className="w-[50px] text-center font-bold">#</TableHead>
                <TableHead className="w-[70px]">Image</TableHead>
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
                  <TableCell colSpan={9} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="size-6 animate-spin text-blue-500" />
                      <span className="text-sm font-medium">Loading customers...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-48 text-center text-muted-foreground">
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
                  const joinDate = new Date(customer.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <TableRow
                      key={customer.id}
                      className="hover:bg-muted/40 transition-colors border-b border-border/40"
                    >
                      {/* Serial Index */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground font-mono text-xs">
                          <GripVertical className="size-3.5 opacity-60 cursor-grab" />
                          <span>{index + 1}</span>
                        </div>
                      </TableCell>

                      {/* Avatar Image */}
                      <TableCell>
                        <div className="relative size-12 rounded-xl overflow-hidden bg-muted/60 border border-border/60 shrink-0 flex items-center justify-center">
                          {customer.image ? (
                            <img
                              src={customer.image}
                              alt={customer.name}
                              className="size-full object-cover"
                            />
                          ) : (
                            <span className="font-bold text-sm text-blue-500">
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
                        <span className="font-mono text-sm font-bold text-blue-500">
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
                        <div className="flex items-center justify-end gap-3">
                          <span className="text-xs text-muted-foreground font-mono">
                            ID: {customer.id.slice(0, 6)}
                          </span>
                          <Button
                            variant={customer.isBlocked ? "outline" : "destructive"}
                            size="sm"
                            className={`h-7 px-2 text-xs font-semibold ${customer.isBlocked ? "border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10" : ""}`}
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
          <span>haqplus Customer Records</span>
        </div>
      </div>
    </div>
  );
}
