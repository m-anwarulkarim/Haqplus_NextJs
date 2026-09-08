"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Link as LinkIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

export function ImageUploader({
  value = [],
  onChange,
  maxFiles = 6,
}: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    if (value.length >= maxFiles) return;
    onChange([...value, urlInput.trim()]);
    setUrlInput("");
    setShowUrlInput(false);
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // In development / local testing, convert uploaded files to data URLs or use uploaded URLs
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        if (value.length + newUrls.length >= maxFiles) break;
        const file = files[i];
        const reader = new FileReader();
        const url = await new Promise<string>((resolve) => {
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.readAsDataURL(file);
        });
        newUrls.push(url);
      }
      onChange([...value, ...newUrls]);
    } catch (err) {
      console.error("Image upload error:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Uploaded Thumbnails Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {value.map((url, index) => (
          <div
            key={index}
            className="group relative aspect-square rounded-2xl border border-border/80 bg-muted/30 overflow-hidden shadow-2xs"
          >
            <Image
              src={url}
              alt={`Product preview ${index + 1}`}
              fill
              className="object-cover"
              sizes="150px"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-destructive transition-colors shadow-xs"
              aria-label="Remove image"
            >
              <X className="size-3.5" />
            </button>
            {index === 0 && (
              <span className="absolute bottom-2 left-2 rounded-md bg-primary/90 px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow-xs">
                Cover Image
              </span>
            )}
          </div>
        ))}

        {/* Add Image Slot */}
        {value.length < maxFiles && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="aspect-square flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/50 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            >
              {isUploading ? (
                <Loader2 className="size-6 animate-spin text-primary" />
              ) : (
                <>
                  <Upload className="size-6 mb-1 text-primary/70" />
                  <span className="text-xs font-semibold">Upload Photo</span>
                  <span className="text-[10px] text-muted-foreground">PNG, JPG, WEBP</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Alternative URL Adder */}
      <div className="flex items-center gap-2 pt-1">
        {showUrlInput ? (
          <div className="flex w-full items-center gap-2">
            <Input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste image URL (https://...)"
              className="h-9 text-xs"
            />
            <Button size="sm" type="button" onClick={handleAddUrl} className="h-9 px-3">
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={() => setShowUrlInput(false)}
              className="h-9 px-2 text-xs"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <LinkIcon className="size-3.5" />
            <span>Or add image by URL</span>
          </button>
        )}
      </div>
    </div>
  );
}
