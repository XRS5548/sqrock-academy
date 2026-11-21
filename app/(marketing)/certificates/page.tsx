import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  SealCheckIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { CertificateCard } from "@/components/certificate/certificate-card";
import { PrintButton } from "@/components/certificate/print-button";
import { getCertificateByNo } from "@/lib/queries";
import { site } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Verify a certificate",
  description: "Verify a Sqrock Academy certificate by its ID.",
};

export default async function VerifyCertificatePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const certificate = id ? await getCertificateByNo(id.trim()) : null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full border border-border bg-muted/50 text-primary">
          <SealCheckIcon size={22} weight="duotone" />
        </span>
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight">
          Verify a certificate
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-xs leading-6 text-muted-foreground">
          Enter the certificate ID printed on a Sqrock Academy certificate to
          confirm that it was issued by us and that the exam was passed.
        </p>

        <form action="/certificates" className="mx-auto mt-6 flex max-w-md gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              name="id"
              defaultValue={id ?? ""}
              required
              placeholder="e.g. SQ-2026-01482"
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-xs uppercase outline-none placeholder:normal-case focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </div>
          <Button type="submit" size="lg" className="h-10 rounded-lg px-4 text-xs">
            Verify
          </Button>
        </form>
      </div>

      {id && !certificate && (
        <div className="mx-auto mt-8 flex max-w-xl items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
          <WarningCircleIcon size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="text-xs font-semibold">Certificate not found</p>
            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
              We could not find a certificate with the ID “{id}”. Check the ID and
              try again, or email {site.email} if you believe this is a mistake.
            </p>
          </div>
        </div>
      )}

      {certificate && (
        <div className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-700">
              <CheckCircleIcon size={15} weight="fill" />
              Valid certificate · issued by Sqrock Academy
            </div>
            <PrintButton />
          </div>
          <CertificateCard
            studentName={certificate.student.name}
            courseTitle={certificate.course.title}
            certificateNo={certificate.certificate.certificateNo}
            score={certificate.certificate.score}
            issuedAt={certificate.certificate.issuedAt}
            instructorName={certificate.course.instructorName}
          />
          <p className="mt-4 text-center text-[10px] text-muted-foreground">
            This certificate was issued after completing the course and passing
            the final exam with a score of {certificate.certificate.score}%.
          </p>
        </div>
      )}

      {!id && (
        <div className="mx-auto mt-10 max-w-xl rounded-xl border border-border bg-muted/30 p-5">
          <p className="text-xs font-semibold">Where do I find my certificate ID?</p>
          <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
            Log in and open{" "}
            <Link
              href="/dashboard/certificates"
              className="font-medium text-foreground underline underline-offset-2"
            >
              Dashboard → Certificates
            </Link>
            . Every certificate shows a unique ID and a shareable verification
            link. You can view yours there any time.
          </p>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary"
        >
          <ArrowLeftIcon size={11} /> Browse courses
        </Link>
      </div>
    </div>
  );
}
