"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon, ListIcon, XIcon } from "@phosphor-icons/react";
import { Logo } from "@/components/site/logo";
import { UserMenu } from "@/components/site/user-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/courses", label: "Courses" },
  { href: "/jobs", label: "Jobs" },
  { href: "/#why", label: "Why Sqrock" },
  { href: "/#faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({
  user,
}: {
  user: { name: string; email: string; role?: string | null } | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl print:hidden">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => {
              const active =
                link.href.startsWith("/#") || link.href === "/contact"
                  ? pathname === link.href.replace("/#why", "/")
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    active && "text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <UserMenu name={user.name} email={user.email} role={user.role} />
              {user.role === "admin" && (
                <Button
                  variant="outline"
                  size="lg"
                  render={<Link href="/dashboard" />}
                >
                  Go to Student Dashboard
                </Button>
              )}
              <Button
                size="lg"
                render={
                  <Link href={user.role === "admin" ? "/admin" : "/dashboard"} />
                }
              >
                {user.role === "admin" ? "Admin Dashboard" : "Go to Dashboard"}
                <ArrowRightIcon data-icon="inline-end" weight="bold" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="lg" render={<Link href="/login" />}>
                Log in
              </Button>
              <Button size="lg" render={<Link href="/signup" />}>
                Get started
                <ArrowRightIcon data-icon="inline-end" weight="bold" />
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-9 items-center justify-center rounded-md border border-border text-foreground lg:hidden"
        >
          {open ? <XIcon size={18} /> : <ListIcon size={18} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {user ? (
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">
                        {user.name}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setOpen(false)}
                      className="shrink-0 text-[11px] font-semibold text-primary"
                    >
                      Profile
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {user.role === "admin" && (
                      <Button
                        variant="outline"
                        size="lg"
                        render={
                          <Link
                            href="/dashboard"
                            onClick={() => setOpen(false)}
                          />
                        }
                      >
                        Student Dashboard
                      </Button>
                    )}
                    <Button
                      size="lg"
                      className={user.role === "admin" ? "" : "col-span-2"}
                      render={
                        <Link
                          href={user.role === "admin" ? "/admin" : "/dashboard"}
                          onClick={() => setOpen(false)}
                        />
                      }
                    >
                      {user.role === "admin"
                        ? "Admin Dashboard"
                        : "Go to Dashboard"}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    render={<Link href="/login" onClick={() => setOpen(false)} />}
                  >
                    Log in
                  </Button>
                  <Button
                    size="lg"
                    render={
                      <Link href="/signup" onClick={() => setOpen(false)} />
                    }
                  >
                    Get started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
