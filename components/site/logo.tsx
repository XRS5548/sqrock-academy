import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="Sqrock Academy home"
      className={cn("inline-flex shrink-0 items-center", className)}
    >
      <Image
        src="/logo-dark.png"
        alt="Sqrock Academy"
        width={161}
        height={48}
        className="h-8 w-auto sm:h-9"
        priority
      />
    </Link>
  );
}
