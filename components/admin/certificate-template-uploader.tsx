"use client";

import { useRef, useState } from "react";
import {
  CheckCircleIcon,
  CopyIcon,
  EyeIcon,
  FilePptIcon,
  SpinnerIcon,
  TrashIcon,
  UploadSimpleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CertificatePptPreview } from "@/components/certificate/certificate-ppt-preview";
import {
  CERTIFICATE_OPTIONAL_PLACEHOLDERS,
  CERTIFICATE_REQUIRED_PLACEHOLDERS,
  placeholderToken,
} from "@/lib/course-validation";
import { cn } from "@/lib/utils";

export type CertificateTemplateValue = {
  name: string | null;
  url: string | null;
  key: string | null;
  placeholders: string[];
};

function hasPlaceholder(placeholders: string[], key: string) {
  const found = new Set(placeholders.map(placeholderToken));
  return found.has(placeholderToken(key));
}

export function CertificateTemplateUploader({
  value,
  error,
  enabled = true,
  previewValues,
  onChange,
}: {
  value: CertificateTemplateValue;
  error?: string;
  enabled?: boolean;
  previewValues?: Record<string, string>;
  onChange: (value: CertificateTemplateValue) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  async function handleFile(file: File) {
    if (!/\.pptx$/i.test(file.name)) {
      toast.error("Certificate template must be a .pptx file.");
      return;
    }

    setUploading(true);
    try {
      const { detectPptxPlaceholders } = await import("@/lib/ppt");
      const buffer = await file.arrayBuffer();
      const placeholders = await detectPptxPlaceholders(buffer).catch(
        () => null,
      );
      if (placeholders === null) {
        toast.error("Could not read this presentation. Use a valid .pptx file.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        error?: string;
        url?: string;
        key?: string;
      };
      if (!response.ok || !data.url) {
        toast.error(data.error ?? "Could not upload the certificate template.");
        return;
      }

      onChange({
        name: file.name,
        url: data.url,
        key: data.key ?? null,
        placeholders,
      });

      const missing = CERTIFICATE_REQUIRED_PLACEHOLDERS.filter(
        (key) => !placeholders.some((item) => placeholderToken(item) === placeholderToken(key)),
      );
      if (missing.length > 0) {
        toast.warning(
          `Template uploaded, but it is missing: ${missing
            .map((key) => `[${key}]`)
            .join(", ")}`,
        );
      } else {
        toast.success("Certificate template uploaded with all required placeholders.");
      }
    } catch {
      toast.error("Could not upload the certificate template.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section
      className={cn(
        "rounded-xl border bg-background p-5",
        error ? "border-destructive/40" : "border-border",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-sm font-semibold">
            Certificate template{" "}
            {enabled && <span className="text-destructive">*</span>}
          </h2>
          <p className="mt-0.5 max-w-2xl text-[10px] leading-5 text-muted-foreground">
            Upload the certificate as a .pptx file. The student&apos;s
            certificate PDF is generated from this template after they pass the
            final exam. Place the placeholders below inside the slides.
          </p>
        </div>
        {value.url && (
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="lg"
              className="h-8 rounded-lg px-2.5 text-[11px]"
              disabled={uploading}
              onClick={() => setPreviewOpen(true)}
            >
              <EyeIcon /> Preview
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-8 rounded-lg px-2.5 text-[11px]"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <SpinnerIcon className="animate-spin" />
              ) : (
                <UploadSimpleIcon />
              )}
              Replace
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="h-8 rounded-lg px-2.5 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={uploading}
              onClick={() =>
                onChange({ name: null, url: null, key: null, placeholders: [] })
              }
            >
              <TrashIcon /> Remove
            </Button>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {value.url ? (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FilePptIcon size={18} weight="duotone" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold">
              {value.name ?? "Certificate template"}
            </p>
            <p className="text-[9px] text-muted-foreground">
              {value.placeholders.length} placeholder
              {value.placeholders.length === 1 ? "" : "s"} detected
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {value.placeholders.length > 0 ? (
                value.placeholders.map((placeholder) => (
                  <Badge
                    key={placeholder}
                    variant="outline"
                    className="h-5 rounded-full px-2 font-mono text-[9px]"
                  >
                    [{placeholder}]
                  </Badge>
                ))
              ) : (
                <span className="text-[9px] text-amber-700">
                  No placeholders found in this template.
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="mt-4 flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-border px-4 py-8 text-center transition-colors hover:bg-muted/30 disabled:opacity-60"
        >
          {uploading ? (
            <SpinnerIcon size={22} className="animate-spin text-primary" />
          ) : (
            <UploadSimpleIcon size={22} className="text-primary" />
          )}
          <p className="mt-2 text-[11px] font-medium">
            {uploading ? "Uploading certificate template…" : "Upload certificate .pptx"}
          </p>
          <p className="mt-1 text-[9px] text-muted-foreground">
            The PDF is generated in the student&apos;s browser after they finish the course.
          </p>
        </button>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-3">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground">
            <WarningCircleIcon size={12} className="text-destructive" />
            Mandatory when issuing certificates
          </p>
          <div className="mt-2 space-y-1.5">
            {CERTIFICATE_REQUIRED_PLACEHOLDERS.map((key) => {
              const present = hasPlaceholder(value.placeholders, key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(`[${key}]`);
                    toast.success(`Copied [${key}]`);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-muted/20 px-2 py-1.5 text-left"
                >
                  <span className="font-mono text-[10px]">[{key}]</span>
                  {present ? (
                    <CheckCircleIcon
                      size={13}
                      weight="fill"
                      className="text-emerald-600"
                    />
                  ) : enabled ? (
                    <span className="inline-flex items-center gap-1 text-[8px] font-medium text-destructive">
                      <WarningCircleIcon size={10} /> Missing
                    </span>
                  ) : (
                    <span className="text-[8px] text-muted-foreground">
                      Optional now
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-border p-3">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground">
            <CopyIcon size={12} className="text-muted-foreground" />
            Optional placeholders
          </p>
          <div className="mt-2 space-y-1.5">
            {CERTIFICATE_OPTIONAL_PLACEHOLDERS.map((key) => {
              const present = hasPlaceholder(value.placeholders, key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(`[${key}]`);
                    toast.success(`Copied [${key}]`);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-muted/20 px-2 py-1.5 text-left"
                >
                  <span className="font-mono text-[10px]">[{key}]</span>
                  {present ? (
                    <CheckCircleIcon
                      size={13}
                      weight="fill"
                      className="text-emerald-600"
                    />
                  ) : (
                    <span className="text-[8px] text-muted-foreground">
                      Optional
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-3 text-[9px] leading-4 text-muted-foreground">
        Click any placeholder to copy it. Use the exact names above in the PPTX.
        <strong className="ml-1 text-foreground">
          [Certificate ID] is generated automatically and is mandatory when
          certificates are enabled.
        </strong>
      </p>

      {error && (
        <p className="mt-2 flex items-start gap-1 text-[10px] font-medium text-destructive">
          <WarningCircleIcon size={12} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Certificate preview</DialogTitle>
            <DialogDescription>
              {value.name ?? "Certificate template"} rendered with sample
              student details. The downloaded PDF uses the same template and
              placeholders.
            </DialogDescription>
          </DialogHeader>
          {value.url && (
            <CertificatePptPreview
              templateUrl={
                value.key ? `/api/files/${value.key}` : value.url
              }
              values={{
                Name: "Student Name",
                Course: "Course title",
                "Certificate ID": "SQ-2026-XXXXX",
                Date: new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }),
                Score: "92%",
                Instructor: "Sqrock Academy Team",
                Email: "student@example.com",
                ...previewValues,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
