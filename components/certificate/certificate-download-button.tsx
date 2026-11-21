"use client";

import { useState } from "react";
import { DownloadSimpleIcon, SpinnerIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CertificateDownloadButton({
  templateUrl,
  values,
  fileName,
  label = "Download certificate PDF",
  className,
}: {
  templateUrl: string;
  values: Record<string, string>;
  fileName: string;
  label?: string;
  className?: string;
}) {
  const [generating, setGenerating] = useState(false);

  async function download() {
    setGenerating(true);
    try {
      const response = await fetch(templateUrl);
      if (!response.ok) {
        throw new Error("Could not download the certificate template.");
      }
      const buffer = await response.arrayBuffer();
      const { generateFilledPdf } = await import("@/lib/ppt");
      await generateFilledPdf(buffer, values, fileName);
      toast.success("Certificate PDF downloaded.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not generate the certificate PDF.",
      );
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Button
      size="lg"
      className={cn("h-8 rounded-lg text-[11px]", className)}
      onClick={download}
      disabled={generating}
    >
      {generating ? (
        <SpinnerIcon className="animate-spin" />
      ) : (
        <DownloadSimpleIcon />
      )}
      {generating ? "Generating PDF…" : label}
    </Button>
  );
}
