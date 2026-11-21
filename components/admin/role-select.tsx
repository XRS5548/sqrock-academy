"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setUserRole } from "@/lib/actions";

export function RoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={role}
      disabled={pending || disabled}
      className="h-7 rounded-lg border border-input bg-background px-1.5 text-[10px] outline-none disabled:opacity-50"
      onChange={(event) => {
        const nextRole = event.target.value as "student" | "admin";
        startTransition(async () => {
          const result = await setUserRole(userId, nextRole);
          if (result.ok) {
            toast.success(result.message ?? "Role updated.");
            router.refresh();
          } else {
            toast.error(result.error ?? "Could not update role.");
          }
        });
      }}
    >
      <option value="student">Student</option>
      <option value="admin">Admin</option>
    </select>
  );
}
