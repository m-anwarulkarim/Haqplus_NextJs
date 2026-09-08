import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign In — ApexStore",
  description: "Sign in to your ApexStore account.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md h-96 rounded-3xl bg-muted/30 animate-pulse" />
      }
    >
      <LoginForm />
    </Suspense>
  );
}
