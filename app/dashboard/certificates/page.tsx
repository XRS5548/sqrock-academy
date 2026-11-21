import Link from "next/link";
import {
  ArrowSquareOutIcon,
  CertificateIcon,
  CheckCircleIcon,
  SealCheckIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { getCertificates } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export default async function CertificatesPage() {
  const user = await requireUser("/dashboard/certificates");
  const certificates = await getCertificates(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Certificates
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Every certificate is issued only after passing the final exam. Open one
          to view, print or share it.
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-background px-6 py-16 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CertificateIcon size={22} />
          </span>
          <h2 className="mt-3 font-heading text-sm font-semibold">
            No certificates yet
          </h2>
          <p className="mt-1 max-w-sm text-[11px] leading-5 text-muted-foreground">
            Finish all lessons in a course, then pass the final exam with the
            minimum marks to unlock your certificate. If you do not pass, you can
            retry after 48 hours.
          </p>
          <Button
            size="lg"
            className="mt-4 h-9 rounded-lg px-4 text-xs"
            render={<Link href="/dashboard/courses" />}
          >
            Go to my courses
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certificates.map(({ certificate, course }) => (
            <div
              key={certificate.id}
              className="overflow-hidden rounded-xl border border-border bg-background"
            >
              <div className="border-b border-border bg-primary/[0.04] p-5">
                <div className="flex items-start justify-between">
                  <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-background text-primary">
                    <CertificateIcon size={20} weight="duotone" />
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/10 px-2 py-1 text-[9px] font-semibold text-emerald-700">
                    <CheckCircleIcon size={11} weight="fill" /> Verified
                  </span>
                </div>
                <p className="mt-4 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                  Certificate of completion
                </p>
                <h2 className="mt-1 font-heading text-base font-semibold leading-snug">
                  {course.title}
                </h2>
              </div>
              <div className="grid grid-cols-3 divide-x divide-border border-b border-border text-center">
                <div className="px-2 py-3">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Score
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-emerald-700">
                    {certificate.score}%
                  </p>
                </div>
                <div className="px-2 py-3">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Issued
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium">
                    {new Date(certificate.issuedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="px-2 py-3">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    ID
                  </p>
                  <p className="mt-0.5 truncate font-mono text-[9px]">
                    {certificate.certificateNo}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3">
                <Button
                  size="lg"
                  className="h-8 flex-1 rounded-lg text-[11px]"
                  render={
                    <Link href={`/certificates/${certificate.certificateNo}`} />
                  }
                >
                  <ArrowSquareOutIcon data-icon="inline-start" />
                  View certificate
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-8 rounded-lg px-2.5 text-[11px]"
                  render={
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                        `/certificates/${certificate.certificateNo}`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                >
                  <ShareNetworkIcon />
                  Share
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border bg-background p-5">
        <div className="flex items-start gap-3">
          <SealCheckIcon size={18} className="mt-0.5 shrink-0 text-primary" />
          <div>
            <p className="text-xs font-semibold">How certificates work</p>
            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
              Each certificate has a unique ID that anyone can verify at{" "}
              <Link
                href="/certificates"
                className="font-medium text-foreground underline underline-offset-2"
              >
                our certificate page
              </Link>
              . Certificates are only issued after passing the exam set by the
              course team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
