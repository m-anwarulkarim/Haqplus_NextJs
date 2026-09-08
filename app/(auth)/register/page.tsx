import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Create Account — ApexStore",
  description: "Join ApexStore for faster checkout and order tracking.",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md h-96 rounded-3xl bg-muted/30 animate-pulse" />
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
