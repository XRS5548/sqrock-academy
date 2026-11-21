import Link from "next/link";
import {
  ArrowLeftIcon,
  CertificateIcon,
  CheckCircleIcon,
  ClockIcon,
  DevicesIcon,
  StarIcon,
} from "@phosphor-icons/react/ssr";
import { Logo } from "@/components/site/logo";

const benefits = [
  "Industry-focused courses taught by practitioners",
  "Exam-verified certificates you can share",
  "Jobs and internships added every day",
  "Lifetime access on web and mobile",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden border-r border-border bg-muted/40 p-10 text-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-grid opacity-[0.07]" />
        <div className="absolute -right-24 top-10 size-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 size-80 rounded-full bg-background/60 blur-3xl" />

        <div className="relative">
          <Link href="/" aria-label="Sqrock Academy home">
            <img
              src="/logo-dark.png"
              alt="Sqrock Academy"
              className="h-9 w-auto"
            />
          </Link>
        </div>

        <div className="relative max-w-md">
          <div className="flex items-center gap-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} size={13} weight="fill" />
            ))}
          </div>
          <blockquote className="mt-4 font-heading text-2xl font-medium leading-snug tracking-tight">
            “The exam made me revisit the weak topics. That is exactly what a
            certification should do — it felt earned.”
          </blockquote>
          <div className="mt-5 flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-background text-[10px] font-semibold">
              MR
            </span>
            <div>
              <p className="text-xs font-semibold">Mohit R.</p>
              <p className="text-[10px] text-muted-foreground">Data Analyst</p>
            </div>
          </div>

          <div className="mt-10 space-y-2.5 border-t border-border pt-6">
            {benefits.map((item) => (
              <p
                key={item}
                className="flex items-start gap-2 text-[11px] leading-5 text-muted-foreground"
              >
                <CheckCircleIcon
                  size={14}
                  weight="fill"
                  className="mt-0.5 shrink-0 text-primary"
                />
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="relative flex flex-wrap gap-4 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CertificateIcon size={13} /> Certificates
          </span>
          <span className="inline-flex items-center gap-1.5">
            <DevicesIcon size={13} /> Web + mobile
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon size={13} /> Learn at your pace
          </span>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon size={12} /> Back to site
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-8 lg:px-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}
