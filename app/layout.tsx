import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RootProvider } from "@/components/providers/root-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "haqplus — শ্রীমঙ্গল ও সিলেটের প্রিমিয়াম চা পাতা | Pure Organic Tea",
  description:
    "haqplus থেকে কিনুন শ্রীমঙ্গল ও সিলেটের সেরা বাগানের তাজা ব্ল্যাক টি, অর্গানিক গ্রিন টি, রয়েল মসলা চা ও ভেষজ চা। ১০০% খাঁটি স্বাদ ও সারাদেশে ক্যাশ অন ডেলিভারি।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem('theme') || 'dark';
                  var isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) document.documentElement.classList.add('dark');
                  if (mode === 'bubble') document.documentElement.classList.add('theme-bubble');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/15 selection:text-primary">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
