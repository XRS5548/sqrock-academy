import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Create a free Sqrock Academy account and start learning industry skills.",
};

export default function SignupPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Start learning today
      </h1>
      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
        Create a free account to enrol in courses, track progress and unlock
        certificates.
      </p>
      <div className="mt-7">
        <Suspense fallback={null}>
          <AuthForm mode="signup" />
        </Suspense>
      </div>
    </div>
  );
}
