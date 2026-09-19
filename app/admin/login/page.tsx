import { Suspense } from "react";
import { AdminLoginForm } from "@/components/auth/admin-login-form";

export const metadata = {
  title: "Admin Secure Login — haqplus",
  description: "Secure login portal for haqplus administrators.",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-muted/20">
      <Suspense
        fallback={
          <div className="w-full max-w-md h-96 rounded-3xl bg-muted/30 animate-pulse" />
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
