import Image from "next/image";
import { SealCheckIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

export function CertificateCard({
  studentName,
  courseTitle,
  certificateNo,
  score,
  issuedAt,
  instructorName = "Sqrock Academy Team",
}: {
  studentName: string;
  courseTitle: string;
  certificateNo: string;
  score: number;
  issuedAt: Date | string;
  instructorName?: string;
}) {
  const date = new Date(issuedAt);
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border-2 border-foreground/10 bg-white p-6 text-foreground shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] sm:p-10",
      )}
    >
      <div className="pointer-events-none absolute inset-3 rounded-lg border border-border" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="pointer-events-none absolute -right-16 -top-16 size-52 rounded-full bg-primary/[0.06] blur-2xl" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <Image
            src="/logo-dark.png"
            alt="Sqrock Academy"
            width={161}
            height={48}
            className="h-7 w-auto sm:h-8"
          />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/20 bg-emerald-600/[0.07] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-emerald-700">
            <SealCheckIcon size={12} weight="fill" />
            Verified certificate
          </span>
        </div>

        <div className="mt-10 text-center sm:mt-12">
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Certificate of completion
          </p>
          <p className="mt-5 text-[10px] text-muted-foreground">
            This is to certify that
          </p>
          <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {studentName}
          </h2>
          <p className="mt-4 text-[10px] text-muted-foreground">
            has successfully completed the course
          </p>
          <h3 className="mx-auto mt-1 max-w-md font-heading text-lg font-semibold leading-snug sm:text-xl">
            {courseTitle}
          </h3>

          <p className="mx-auto mt-5 max-w-md text-[10px] leading-5 text-muted-foreground">
            Awarded after completing all lessons and passing the final
            examination set by the Sqrock Academy course team.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-5 text-center sm:mt-10">
          <div>
            <p className="text-[8px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Final score
            </p>
            <p className="mt-1 font-heading text-base font-semibold text-emerald-700">
              {score}%
            </p>
          </div>
          <div>
            <p className="text-[8px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Issued on
            </p>
            <p className="mt-1 text-[10px] font-medium">
              {date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-[8px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Certificate ID
            </p>
            <p className="mt-1 truncate font-mono text-[9px] font-medium">
              {certificateNo}
            </p>
          </div>
        </div>

        <div className="mt-7 flex items-end justify-between gap-4">
          <div>
            <p className="font-heading text-xs font-semibold">{instructorName}</p>
            <p className="text-[8px] text-muted-foreground">
              Course team · Sqrock Academy
            </p>
          </div>
          <div className="text-right text-[8px] text-muted-foreground">
            <p>Verify at sqrock.cloud/certificates</p>
            <p className="mt-0.5">academy@sqrock.cloud</p>
          </div>
        </div>
      </div>
    </div>
  );
}
