import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeftIcon, CheckCircleIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react/ssr";
import { CertificateCard } from "@/components/certificate/certificate-card";
import { PrintButton } from "@/components/certificate/print-button";
import { getCertificateByNo } from "@/lib/queries";
import { site } from "@/lib/demo-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ certificateNo: string }>;
}): Promise<Metadata> {
  const { certificateNo } = await params;
  return { title: `Certificate ${certificateNo}` };
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ certificateNo: string }>;
}) {
  const { certificateNo } = await params;
  const certificate = await getCertificateByNo(certificateNo);
  if (!certificate) notFound();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/certificates"
          className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground print:hidden"
        >
          <ArrowLeftIcon size={11} /> Back to certificates
        </Link>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-700">
            <CheckCircleIcon size={13} weight="fill" /> Verified
          </span>
          <PrintButton />
        </div>
      </div>

      <CertificateCard
        studentName={certificate.student.name}
        courseTitle={certificate.course.title}
        certificateNo={certificate.certificate.certificateNo}
        score={certificate.certificate.score}
        issuedAt={certificate.certificate.issuedAt}
        instructorName={certificate.course.instructorName}
      />

      <div className="mt-5 flex flex-col items-center justify-between gap-2 text-[10px] text-muted-foreground sm:flex-row">
        <p>
          Issued to {certificate.student.name} ·{" "}
          {new Date(certificate.certificate.issuedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <a
          href={`mailto:${site.email}`}
          className="inline-flex items-center gap-1 hover:text-foreground print:hidden"
        >
          <EnvelopeSimpleIcon size={12} /> Questions? {site.email}
        </a>
      </div>
    </div>
  );
}
