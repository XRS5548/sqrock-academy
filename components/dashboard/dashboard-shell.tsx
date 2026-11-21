"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowSquareOutIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CertificateIcon,
  ChartPieSliceIcon,
  GearIcon,
  ListIcon,
  SignOutIcon,
  SquaresFourIcon,
  StudentIcon,
  UsersIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Logo } from "@/components/site/logo";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const studentNav = [
  { href: "/dashboard", label: "Overview", icon: SquaresFourIcon },
  { href: "/dashboard/courses", label: "My courses", icon: BookOpenIcon },
  { href: "/dashboard/certificates", label: "Certificates", icon: CertificateIcon },
  { href: "/dashboard/jobs", label: "Jobs for you", icon: BriefcaseIcon },
  { href: "/dashboard/settings", label: "Settings", icon: GearIcon },
];

const adminNav = [
  { href: "/admin", label: "Overview", icon: ChartPieSliceIcon },
  { href: "/admin/courses", label: "Courses", icon: BookOpenIcon },
  { href: "/admin/jobs", label: "Job approvals", icon: BriefcaseIcon },
  { href: "/admin/students", label: "Students", icon: UsersIcon },
];

export function DashboardShell({
  user,
  variant,
  children,
}: {
  user: { name: string; email: string; role?: string | null };
  variant: "student" | "admin";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const nav = variant === "admin" ? adminNav : studentNav;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isActive = (href: string) =>
    href === "/dashboard" || href === "/admin"
      ? pathname === href
      : pathname.startsWith(href);

  async function logout() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Logo />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground lg:hidden"
          aria-label="Close menu"
        >
          <XIcon size={16} />
        </button>
      </div>

      <div className="mx-4 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {variant === "admin" ? "Admin workspace" : "Student workspace"}
        </p>
        <p className="mt-0.5 truncate text-[11px] font-medium">{user.name}</p>
      </div>

      <nav className="mt-5 flex-1 space-y-1 px-3">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors",
              isActive(href)
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon size={16} weight={isActive(href) ? "fill" : "regular"} />
            {label}
          </Link>
        ))}

        <div className="my-3 border-t border-border" />

        {variant === "admin" ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <StudentIcon size={16} />
            Student view
          </Link>
        ) : (
          <Link
            href="/courses"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowSquareOutIcon size={16} />
            Browse courses
          </Link>
        )}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeftIcon size={16} />
          Back to website
        </Link>
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold">{user.name}</p>
            <p className="truncate text-[9px] text-muted-foreground">
              {user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Log out"
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <SignOutIcon size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-border bg-background lg:block">
        {sidebar}
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex size-9 items-center justify-center rounded-md border border-border"
          aria-label="Open menu"
        >
          <ListIcon size={17} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-background shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
