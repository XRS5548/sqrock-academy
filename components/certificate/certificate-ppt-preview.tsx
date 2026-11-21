"use client";

import { useEffect, useRef, useState } from "react";
import { SpinnerIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const RENDER_WIDTH = 1280;

type Previewer = {
  preview: (file: ArrayBuffer) => Promise<unknown>;
  destroy: () => void;
};

/**
 * Renders the course's uploaded .pptx certificate template right in the page,
 * with the student's details already filled in. It reuses the same placeholder
 * replacement as the PDF export, so the preview and the downloaded PDF match.
 */
export function CertificatePptPreview({
  templateUrl,
  values,
  className,
}: {
  templateUrl: string;
  values: Record<string, string>;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);
  const valuesKey = JSON.stringify(values);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let previewer: Previewer | null = null;

    setStatus("loading");
    setMessage("");
    setContentHeight(0);

    (async () => {
      try {
        const response = await fetch(templateUrl);
        if (!response.ok) {
          throw new Error("Could not load the certificate template.");
        }
        const buffer = await response.arrayBuffer();
        // Loaded lazily so the PPTX/JSZip code never runs on the server.
        const { fillPptx, waitForImages } = await import("@/lib/ppt");
        const filled = await fillPptx(
          buffer,
          JSON.parse(valuesKey) as Record<string, string>,
        );
        if (cancelled) return;

        const { init } = await import("pptx-preview");
        if (cancelled) return;

        host.innerHTML = "";
        previewer = init(host, { width: RENDER_WIDTH }) as unknown as Previewer;
        await previewer.preview(filled);
        await document.fonts?.ready;
        await waitForImages(host);
        if (cancelled) return;

        setStatus("ready");
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Could not render the certificate template.",
          );
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      try {
        previewer?.destroy();
      } catch {
        // Ignore cleanup errors from the third-party renderer.
      }
      host.innerHTML = "";
    };
  }, [templateUrl, valuesKey]);

  useEffect(() => {
    const container = containerRef.current;
    const host = hostRef.current;
    if (!container || !host) return;

    let lastWidth = 0;

    // Height is derived from the rendered slides. The width comparison guard
    // plus `scrollbar-gutter: stable` keeps the container height from feeding
    // back into the scale and looping forever.
    const measure = () => {
      const width = container.getBoundingClientRect().width;
      if (width <= 0) return;

      const widthKey = Math.round(width * 4) / 4;
      if (widthKey !== lastWidth) {
        lastWidth = widthKey;
        const nextScale =
          Math.round(Math.min(width / RENDER_WIDTH, 1) * 1000) / 1000;
        setScale((prev) =>
          Math.abs(prev - nextScale) < 0.002 ? prev : nextScale,
        );
      }

      const height = host.offsetHeight;
      if (height > 0) {
        setContentHeight((prev) => (prev === height ? prev : height));
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(host);
    return () => observer.disconnect();
  }, [status]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]",
        className,
      )}
    >
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden"
        style={
          contentHeight > 0
            ? { height: Math.ceil(contentHeight * scale) }
            : { minHeight: 280 }
        }
      >
        <div
          ref={hostRef}
          className="pptx-certificate origin-top-left"
          style={{
            width: RENDER_WIDTH,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />

        {status !== "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white px-6 text-center">
            {status === "loading" ? (
              <>
                <SpinnerIcon size={22} className="animate-spin text-primary" />
                <p className="text-[11px] font-medium">
                  Rendering your certificate…
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Loading the uploaded template.
                </p>
              </>
            ) : (
              <>
                <WarningCircleIcon
                  size={22}
                  className="text-amber-600"
                  weight="duotone"
                />
                <p className="text-[11px] font-medium">
                  Could not preview the certificate template
                </p>
                <p className="max-w-sm text-[10px] leading-5 text-muted-foreground">
                  {message} You can still download the PDF version.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
