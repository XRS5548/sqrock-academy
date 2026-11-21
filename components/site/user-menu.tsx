"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GearIcon,
  SignOutIcon,
  SquaresFourIcon,
  StudentIcon,
} from "@phosphor-icons/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

export function UserMenu({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role?: string | null;
}) {
  const router = useRouter();
  const initials =
    name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  async function logout() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-2.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/30"
        aria-label="Open profile menu"
      >
        <Avatar size="sm">
          <AvatarFallback className="text-[10px] font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="max-w-24 truncate">Profile</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="truncate text-xs font-semibold text-foreground">
              {name}
            </span>
            <span className="truncate text-[10px]">{email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={<Link href="/dashboard/settings" />}
          className="cursor-pointer"
        >
          <GearIcon /> Profile settings
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href="/dashboard" />}
          className="cursor-pointer"
        >
          <StudentIcon /> Student dashboard
        </DropdownMenuItem>
        {role === "admin" && (
          <DropdownMenuItem
            render={<Link href="/admin" />}
            className="cursor-pointer"
          >
            <SquaresFourIcon /> Admin dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={logout}
          className="cursor-pointer"
        >
          <SignOutIcon /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
