"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  DownloadSimpleIcon,
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPptTemplate, deletePptTemplate } from "@/lib/actions";
import { cn } from "@/lib/utils";

export type PptTemplateView = {
  id: string;
  name: string;
  url: string;
  key?: string;
  placeholders: string[];
  size?: number;
  createdAt: string;
};

const MAX_BYTES = 100 * 1024 * 1024;

function formatBytes(bytes?: number) {
  if (!bytes) return "Unknown size";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function PptTemplatePanel({
  initialTemplates,
}: {
  initialTemplates: PptTemplateView[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [templates, setTemplates] =
    useState<PptTemplateView[]>(initialTemplates);

  const [active, setActive] = useState<PptTemplateView | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState("");

  useEffect(() => {
    setTemplates(initialTemplates);
  }, [initialTemplates]);

  async function handleFile(file: File) {
    if (!/\.pptx$/i.test(file.name)) {
      toast.error("Only .pptx files are supported. Re-save .ppt files as .pptx.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("The file is larger than the 100 MB limit.");
      return;
    }

    setUploading(true);
    try {
      const { detectPptxPlaceholders } = await import("@/lib/ppt");
      const buffer = await file.arrayBuffer();

      let placeholders: string[] = [];
      try {
        placeholders = await detectPptxPlaceholders(buffer);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not read this presentation.",
        );
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
        toast.error(data.error ?? "Could not upload the presentation.");
        return;
      }

      const template: PptTemplateView = {
        id: crypto.randomUUID(),
        name: file.name,
        url: data.url,
        key: data.key,
        placeholders,
        size: file.size,
        createdAt: new Date().toISOString(),
      };

      const saved = await createPptTemplate({
        name: template.name,
        url: template.url,
        key: template.key,
        placeholders: template.placeholders,
        size: template.size,
      });
      if (!saved.ok) {
        toast.error(saved.error ?? "Could not save the template details.");
        return;
      }

      setTemplates((prev) => [
        { ...template, id: saved.id ?? template.id },
        ...prev,
      ]);
      router.refresh();
      toast.success(
        placeholders.length > 0
          ? `${placeholders.length} placeholder${placeholders.length === 1 ? "" : "s"} detected and template saved.`
          : "Template uploaded and saved. No [Placeholders] were found.",
      );
    } catch {
      toast.error("Upload failed. Check your R2 configuration.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function removeTemplate(template: PptTemplateView) {
    if (
      !window.confirm(
        `Delete "${template.name}"? This removes the database entry and the stored file.`,
      )
    ) {
      return;
    }
    const result = await deletePptTemplate(template.id);
    if (!result.ok) {
      toast.error(result.error ?? "Could not delete the template.");
      return;
    }
    setTemplates((prev) => prev.filter((item) => item.id !== template.id));
    router.refresh();
    toast.success("Template deleted.");
  }

  function openTemplate(template: PptTemplateView) {
    setActive(template);
    setValues(
      Object.fromEntries(template.placeholders.map((key) => [key, ""])),
    );
    setProgress("");
  }

  async function generatePdf() {
    if (!active) return;

    const missing = active.placeholders.filter(
      (key) => !values[key]?.trim(),
    );
    if (missing.length > 0) {
      toast.error(`Fill ${missing.length} placeholder${missing.length === 1 ? "" : "s"} first.`);
      return;
    }

    setGenerating(true);
    setProgress("Downloading template…");
    try {
      // Use the same-origin proxy when we have the storage key so the
      // browser never hits R2 directly (avoids CORS issues on public URLs).
      const templateUrl = active.key
        ? `/api/files/${active.key}`
        : active.url;
      const response = await fetch(templateUrl);
      if (!response.ok) {
        throw new Error("Could not download the template from storage.");
      }
      const buffer = await response.arrayBuffer();

      const { generateFilledPdf } = await import("@/lib/ppt");
      setProgress("Preparing slides…");
      await generateFilledPdf(buffer, values, active.name, (current, total) => {
        setProgress(`Rendering slide ${current} of ${total}…`);
      });
      toast.success("PDF downloaded.");
      setActive(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not generate the PDF.",
      );
    } finally {
      setGenerating(false);
      setProgress("");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          PPT to PDF
        </h1>
        <p className="mt-1 max-w-2xl text-[11px] leading-5 text-muted-foreground">
          Upload a PowerPoint template, add placeholders like{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
            [Name]
          </code>
          ,{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
            [Course]
          </code>{" "}
          or{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
            [Date]
          </code>{" "}
          in the slides, then download a filled PDF. PPT files are stored in R2
          and the PDF is generated entirely in your browser.
        </p>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file && !uploading) handleFile(file);
        }}
        className={cn(
          "rounded-xl border-2 border-dashed bg-background px-6 py-10 text-center transition-colors",
          dragging ? "border-primary bg-primary/[0.04]" : "border-border",
        )}
      >
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FilePptIcon size={22} weight="duotone" />
        </span>
        <p className="mt-3 text-xs font-semibold">
          Drop a .pptx file here, or choose one
        </p>
        <p className="mx-auto mt-1 max-w-md text-[10px] leading-5 text-muted-foreground">
          Old .ppt files are not supported. Placeholders are detected
          automatically from every slide and can be reused for every download.
        </p>
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
        <Button
          size="lg"
          className="mt-4 h-9 rounded-lg px-4 text-xs"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <>
              <SpinnerIcon className="animate-spin" /> Uploading…
            </>
          ) : (
            <>
              <UploadSimpleIcon /> Choose .pptx file
            </>
          )}
        </Button>
      </div>

      <section className="rounded-xl border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-heading text-sm font-semibold">
            Your templates
          </h2>
          <span className="text-[10px] text-muted-foreground">
            {templates.length} saved
          </span>
        </div>

        {templates.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <FilePptIcon
              size={24}
              className="mx-auto text-muted-foreground"
            />
            <p className="mt-2 text-[11px] font-medium">No templates yet</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Upload your first .pptx template above to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 p-4 md:grid-cols-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-start gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FilePptIcon size={18} weight="duotone" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold">
                      {template.name}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      {formatBytes(template.size)} ·{" "}
                      {formatDate(template.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTemplate(template)}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Remove ${template.name}`}
                  >
                    <TrashIcon size={13} />
                  </button>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1">
                  {template.placeholders.length > 0 ? (
                    template.placeholders.map((key) => (
                      <Badge
                        key={key}
                        variant="outline"
                        className="h-5 rounded-full px-2 text-[9px]"
                      >
                        [{key}]
                      </Badge>
                    ))
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] text-amber-700">
                      <WarningCircleIcon size={11} /> No placeholders found
                    </span>
                  )}
                </div>

                <Button
                  size="lg"
                  className="mt-3 h-8 w-full rounded-lg text-[11px]"
                  onClick={() => openTemplate(template)}
                >
                  <DownloadSimpleIcon /> Download PDF
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <p className="flex items-start gap-2 text-[10px] leading-5 text-muted-foreground">
          <CheckCircleIcon size={14} className="mt-0.5 shrink-0 text-emerald-600" />
          Files upload to R2 (or the local uploads folder in development) and
          template details are saved in your database. The PDF conversion runs
          fully client-side, so no extra server or conversion service is needed.
        </p>
      </div>

      <Dialog
        open={Boolean(active)}
        onOpenChange={(open) => {
          if (!open && !generating) setActive(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Fill placeholders</DialogTitle>
            <DialogDescription>
              {active?.name} — {active?.placeholders.length ?? 0} placeholder
              {active?.placeholders.length === 1 ? "" : "s"} found.
            </DialogDescription>
          </DialogHeader>

          {active && active.placeholders.length > 0 ? (
            <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
              {active.placeholders.map((key) => (
                <div key={key}>
                  <Label htmlFor={`ppt-${key}`} className="text-[11px]">
                    [{key}]
                  </Label>
                  <Input
                    id={`ppt-${key}`}
                    value={values[key] ?? ""}
                    disabled={generating}
                    onChange={(event) =>
                      setValues((prev) => ({
                        ...prev,
                        [key]: event.target.value,
                      }))
                    }
                    placeholder={`Enter ${key}`}
                    className="mt-1 h-9 rounded-lg bg-background text-xs"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-[11px] text-muted-foreground">
              This template has no placeholders. Download it to get a PDF copy
              as-is.
            </p>
          )}

          {generating && (
            <p className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <SpinnerIcon size={13} className="animate-spin" />
              {progress || "Generating PDF…"}
            </p>
          )}

          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" disabled={generating} />}
            >
              Cancel
            </DialogClose>
            <Button onClick={generatePdf} disabled={generating}>
              {generating ? "Generating…" : "Generate PDF"}
              {!generating && <DownloadSimpleIcon data-icon="inline-end" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
