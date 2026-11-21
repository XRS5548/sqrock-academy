"use client";

import { useRef, useState } from "react";
import { CloudArrowUpIcon, SpinnerIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function FileUpload({
  label = "Upload file",
  accept,
  onUploaded,
  className,
}: {
  label?: string;
  accept?: string;
  onUploaded: (file: { name: string; url: string; key?: string; size?: number }) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        error?: string;
        url: string;
        key?: string;
      };
      if (!response.ok) {
        toast.error(data.error ?? "Upload failed.");
        return;
      }
      onUploaded({
        name: file.name,
        url: data.url,
        key: data.key,
        size: file.size,
      });
      toast.success("File uploaded.");
    } catch {
      toast.error("Upload failed. Check your R2 configuration.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
      >
        {uploading ? (
          <SpinnerIcon size={13} className="animate-spin" />
        ) : (
          <CloudArrowUpIcon size={14} />
        )}
        {uploading ? "Uploading…" : label}
      </button>
    </div>
  );
}
