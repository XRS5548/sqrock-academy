"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
  LockKeyIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();

    if (mode === "signup") {
      if (name.length < 2) return setError("Please enter your full name.");
      if (password.length < 8)
        return setError("Password must be at least 8 characters.");
      if (password !== form.get("confirmPassword"))
        return setError("Passwords do not match.");
      if (!terms) return setError("Please accept the terms to continue.");
    }

    setPending(true);
    try {
      if (mode === "signup") {
        const { data, error: authError } = await authClient.signUp.email({
          name,
          email,
          password,
          callbackURL: "/dashboard",
        });
        if (authError) {
          setError(authError.message ?? "Could not create your account.");
          return;
        }
        if (data?.user) {
          toast.success("Welcome to Sqrock Academy!");
          router.push("/dashboard");
          router.refresh();
        }
      } else {
        const { data, error: authError } = await authClient.signIn.email({
          email,
          password,
          callbackURL: next,
        });
        if (authError) {
          setError(authError.message ?? "Invalid email or password.");
          return;
        }
        const role = (data?.user as { role?: string } | undefined)?.role;
        toast.success("Welcome back!");
        router.push(role === "admin" ? "/admin" : next);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === "signup" && (
        <div>
          <Label htmlFor="name" className="text-xs font-medium">
            Full name
          </Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            placeholder="Your full name"
            className="mt-1.5 h-10 rounded-lg bg-background text-sm"
          />
        </div>
      )}

      <div>
        <Label htmlFor="email" className="text-xs font-medium">
          Email address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="mt-1.5 h-10 rounded-lg bg-background text-sm"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-xs font-medium">
            Password
          </Label>
          {mode === "login" && (
            <span className="text-[10px] text-muted-foreground">
              Forgot password? Email us
            </span>
          )}
        </div>
        <div className="relative mt-1.5">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={8}
            placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
            className="h-10 rounded-lg bg-background pr-9 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeSlashIcon size={15} /> : <EyeIcon size={15} />}
          </button>
        </div>
      </div>

      {mode === "signup" && (
        <>
          <div>
            <Label htmlFor="confirmPassword" className="text-xs font-medium">
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Repeat your password"
              className="mt-1.5 h-10 rounded-lg bg-background text-sm"
            />
          </div>
          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border bg-muted/30 p-3">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-0.5 size-3.5 accent-[var(--primary)]"
            />
            <span className="text-[10px] leading-5 text-muted-foreground">
              I agree to the Sqrock Academy terms and privacy policy, and to
              receive course and account emails.
            </span>
          </label>
        </>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-[11px] leading-5 text-destructive">
          <WarningCircleIcon size={14} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="h-10 w-full rounded-lg text-sm"
        disabled={pending}
      >
        {pending
          ? mode === "signup"
            ? "Creating account…"
            : "Logging in…"
          : mode === "signup"
            ? "Create my free account"
            : "Log in"}
        {!pending && <ArrowRightIcon data-icon="inline-end" weight="bold" />}
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
        <LockKeyIcon size={12} />
        Secure sign-in powered by Better Auth
      </p>

      <p className="border-t border-border pt-4 text-center text-[11px] text-muted-foreground">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-foreground underline underline-offset-2"
            >
              Log in
            </Link>
          </>
        ) : (
          <>
            New to Sqrock Academy?{" "}
            <Link
              href="/signup"
              className="font-semibold text-foreground underline underline-offset-2"
            >
              Create a free account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
