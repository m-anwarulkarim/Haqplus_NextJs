"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Clock,
  AlertTriangle,
  PhoneOff,
  ThumbsUp,
  PhoneCall,
  PauseCircle,
  History,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Check,
  Truck,
  PackageCheck,
} from "lucide-react";

export interface StatusOption {
  value: string;
  label: string;
  icon: any;
  badgeStyle: string;
  textColor: string;
  bgHover: string;
}

export const STATUS_OPTIONS: StatusOption[] = [
  {
    value: "PENDING",
    label: "Pending",
    icon: Clock,
    badgeStyle: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 shadow-xs",
    textColor: "text-amber-600 dark:text-amber-400",
    bgHover: "hover:bg-amber-500/10 dark:hover:bg-amber-500/20",
  },
  {
    value: "INCOMPLETE",
    label: "Incomplete",
    icon: AlertTriangle,
    badgeStyle: "bg-amber-600/15 text-amber-800 dark:text-amber-200 border-amber-600/40 shadow-xs",
    textColor: "text-amber-700 dark:text-amber-300",
    bgHover: "hover:bg-amber-600/10 dark:hover:bg-amber-600/20",
  },
  {
    value: "NO_RESPONSE",
    label: "No Response",
    icon: PhoneOff,
    badgeStyle: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40 shadow-xs",
    textColor: "text-rose-600 dark:text-rose-400",
    bgHover: "hover:bg-rose-500/10 dark:hover:bg-rose-500/20",
  },
  {
    value: "GOOD_NO_RESPONSE",
    label: "Good No Response",
    icon: ThumbsUp,
    badgeStyle: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/40 shadow-xs",
    textColor: "text-blue-600 dark:text-blue-400",
    bgHover: "hover:bg-blue-500/10 dark:hover:bg-blue-500/20",
  },
  {
    value: "BUSY",
    label: "Busy",
    icon: PhoneCall,
    badgeStyle: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40 shadow-xs",
    textColor: "text-purple-600 dark:text-purple-400",
    bgHover: "hover:bg-purple-500/10 dark:hover:bg-purple-500/20",
  },
  {
    value: "HOLD",
    label: "Hold",
    icon: PauseCircle,
    badgeStyle: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/40 shadow-xs",
    textColor: "text-orange-600 dark:text-orange-400",
    bgHover: "hover:bg-orange-500/10 dark:hover:bg-orange-500/20",
  },
  {
    value: "PRE",
    label: "Pre Order",
    icon: History,
    badgeStyle: "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/40 shadow-xs",
    textColor: "text-teal-600 dark:text-teal-400",
    bgHover: "hover:bg-teal-500/10 dark:hover:bg-teal-500/20",
  },
  {
    value: "CANCELLED",
    label: "Cancel",
    icon: XCircle,
    badgeStyle: "bg-rose-600/20 text-rose-700 dark:text-rose-300 border-rose-600/50 shadow-xs",
    textColor: "text-rose-600 dark:text-rose-400",
    bgHover: "hover:bg-rose-600/10 dark:hover:bg-rose-600/20",
  },
  {
    value: "CONFIRMED",
    label: "Confirmed",
    icon: CheckCircle2,
    badgeStyle: "bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/50 shadow-xs",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgHover: "hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20",
  },
];

interface StatusDropdownProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isUpdating?: boolean;
  className?: string;
  options?: StatusOption[];
}

export function StatusDropdown({
  value,
  onChange,
  disabled = false,
  isUpdating = false,
  className = "",
  options = STATUS_OPTIONS,
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption =
    options.find((opt) => opt.value.toUpperCase() === (value || "PENDING").toUpperCase()) ||
    options[0];
  const CurrentIcon = currentOption.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled || isUpdating}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-purple-500/40 select-none ${
          currentOption.badgeStyle
        } ${disabled || isUpdating ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02] active:scale-98"} ${className}`}
      >
        <div className="flex items-center gap-1.5">
          {isUpdating ? (
            <RefreshCw className="size-3.5 animate-spin shrink-0" />
          ) : (
            <CurrentIcon className="size-3.5 shrink-0" />
          )}
          <span>{currentOption.label}</span>
        </div>
        <ChevronDown className={`size-3.5 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Floating Premium Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-52 rounded-2xl bg-popover/95 backdrop-blur-xl border border-border/80 shadow-2xl p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150 space-y-0.5">
          <div className="px-2.5 py-1 text-[10px] font-black uppercase font-mono text-muted-foreground tracking-wider border-b border-border/60 mb-1 flex items-center justify-between">
            <span>Change Status</span>
            <span className="text-purple-500 font-bold">Select</span>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-0.5 pr-0.5 scrollbar-thin">
            {options.map((option) => {
              const Icon = option.icon;
              const isSelected = option.value.toUpperCase() === (value || "").toUpperCase();

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                    option.bgHover
                  } ${isSelected ? "bg-purple-500/15 text-purple-600 dark:text-purple-300 font-extrabold" : "text-foreground"}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`size-6 rounded-lg flex items-center justify-center ${option.badgeStyle}`}>
                      <Icon className="size-3.5" />
                    </div>
                    <span>{option.label}</span>
                  </div>

                  {isSelected && <Check className="size-4 text-purple-600 dark:text-purple-400 font-black" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
