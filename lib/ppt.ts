"use client";

import JSZip from "jszip";

const PLACEHOLDER_PATTERN = /\[([^\[\]\n]{1,60})\]/g;
const PARAGRAPH_PATTERN = /<a:p\b[^>]*>[\s\S]*?<\/a:p>/g;
const TEXT_RUN_PATTERN = /<a:t(\s[^>]*)?>([\s\S]*?)<\/a:t>/g;

function decodeXml(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function slideFiles(zip: JSZip) {
  return Object.keys(zip.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path))
    .sort((a, b) => {
      const aNumber = Number(a.match(/(\d+)\.xml$/)?.[1] ?? 0);
      const bNumber = Number(b.match(/(\d+)\.xml$/)?.[1] ?? 0);
      return aNumber - bNumber;
    });
}

function paragraphTexts(xml: string) {
  const texts: string[] = [];
  for (const paragraph of xml.match(PARAGRAPH_PATTERN) ?? []) {
    const runs: string[] = [];
    let match: RegExpExecArray | null;
    const pattern = new RegExp(TEXT_RUN_PATTERN.source, "g");
    while ((match = pattern.exec(paragraph))) {
      runs.push(decodeXml(match[2]));
    }
    if (runs.length > 0) texts.push(runs.join(""));
  }
  return texts;
}

export function replacePlaceholders(xml: string, values: Record<string, string>) {
  return xml.replace(PARAGRAPH_PATTERN, (paragraph) => {
    const runs: { attrs: string; text: string }[] = [];
    let match: RegExpExecArray | null;
    const pattern = new RegExp(TEXT_RUN_PATTERN.source, "g");
    while ((match = pattern.exec(paragraph))) {
      runs.push({ attrs: match[1] ?? "", text: decodeXml(match[2]) });
    }
    if (runs.length === 0) return paragraph;

    const combined = runs.map((run) => run.text).join("");
    if (!combined.includes("[")) return paragraph;

    const owner: number[] = [];
    runs.forEach((run, runIndex) => {
      for (let i = 0; i < run.text.length; i++) owner.push(runIndex);
    });

    const characters = combined.split("");
    const deleted = new Array(characters.length).fill(false);
    const inserts: Record<number, string> = {};
    const lookup = new Map<string, string>();
    for (const [key, value] of Object.entries(values)) {
      lookup.set(normalizeKey(key), value);
      lookup.set(key.trim().toLowerCase(), value);
    }
    let changed = false;

    const placeholders = new RegExp(PLACEHOLDER_PATTERN.source, "g");
    let placeholder: RegExpExecArray | null;
    while ((placeholder = placeholders.exec(combined))) {
      const key = placeholder[1].trim();
      const value =
        values[key] ??
        lookup.get(normalizeKey(key)) ??
        lookup.get(key.toLowerCase());
      if (value === undefined) continue;
      const start = placeholder.index;
      const end = start + placeholder[0].length;
      for (let i = start; i < end; i++) deleted[i] = true;
      inserts[start] = value;
      changed = true;
    }

    if (!changed) return paragraph;

    const newTexts = runs.map(() => "");
    for (let i = 0; i < characters.length; i++) {
      if (inserts[i] !== undefined) newTexts[owner[i]] += inserts[i];
      if (!deleted[i]) newTexts[owner[i]] += characters[i];
    }

    let runIndex = 0;
    return paragraph.replace(
      new RegExp(TEXT_RUN_PATTERN.source, "g"),
      (_full, attrs: string | undefined) =>
        `<a:t${attrs ?? ""}>${escapeXml(newTexts[runIndex++])}</a:t>`,
    );
  });
}

export async function detectPptxPlaceholders(data: ArrayBuffer) {
  const zip = await JSZip.loadAsync(data);
  const slides = slideFiles(zip);
  if (slides.length === 0) {
    throw new Error("This file does not look like a valid .pptx presentation.");
  }

  const found = new Set<string>();
  for (const path of slides) {
    const xml = await zip.file(path)!.async("string");
    for (const text of paragraphTexts(xml)) {
      const pattern = new RegExp(PLACEHOLDER_PATTERN.source, "g");
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text))) {
        const key = match[1].trim();
        if (key) found.add(key);
      }
    }
  }
  return [...found];
}

/**
 * Replaces every known [Placeholder] inside the presentation and returns the
 * filled .pptx file. Shared by the PDF export and the on-page preview so both
 * always show exactly the same content.
 */
export async function fillPptx(
  data: ArrayBuffer,
  values: Record<string, string>,
) {
  const zip = await JSZip.loadAsync(data);
  const slides = slideFiles(zip);
  if (slides.length === 0) {
    throw new Error("No slides found in this presentation.");
  }

  for (const path of slides) {
    const file = zip.file(path);
    if (!file) continue;
    const xml = await file.async("string");
    zip.file(path, replacePlaceholders(xml, values));
  }

  return zip.generateAsync({
    type: "arraybuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

export async function waitForImages(root: HTMLElement) {
  await Promise.all(
    Array.from(root.querySelectorAll<HTMLImageElement>("img")).map((image) =>
      image.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            image.onload = () => resolve();
            image.onerror = () => resolve();
          }),
    ),
  );
}

export async function generateFilledPdf(
  data: ArrayBuffer,
  values: Record<string, string>,
  fileName: string,
  onProgress?: (current: number, total: number) => void,
) {
  const filled = await fillPptx(data, values);

  const [{ init }, { toCanvas }, { default: jsPDF }] = await Promise.all([
    import("pptx-preview"),
    import("html-to-image"),
    import("jspdf"),
  ]);

  const host = document.createElement("div");
  host.style.cssText =
    "position:fixed;left:-20000px;top:0;width:1280px;background:#fff;pointer-events:none;z-index:-1;";
  document.body.appendChild(host);

  const previewer = init(host, { width: 1280 });

  try {
    await previewer.preview(filled);
    await document.fonts.ready;

    const slideElements = Array.from(
      host.querySelectorAll<HTMLElement>(".pptx-preview-slide-wrapper"),
    );
    if (slideElements.length === 0) {
      throw new Error("Could not render the presentation slides.");
    }

    await waitForImages(host);

    const width = slideElements[0].offsetWidth || 1280;
    const height =
      slideElements[0].offsetHeight || Math.round((width * 9) / 16);
    const orientation = width >= height ? "landscape" : "portrait";
    const pdf = new jsPDF({
      orientation,
      unit: "px",
      format: [width, height],
      compress: true,
    });

    for (let index = 0; index < slideElements.length; index++) {
      onProgress?.(index + 1, slideElements.length);
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const canvas = await toCanvas(slideElements[index], {
        width,
        height,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      if (index > 0) {
        pdf.addPage([width, height], orientation);
      }
      pdf.addImage(
        canvas.toDataURL("image/jpeg", 0.92),
        "JPEG",
        0,
        0,
        width,
        height,
      );
    }

    const safeName =
      fileName.replace(/\.pptx?$/i, "").replace(/[^\w\- ]+/g, "").trim() ||
      "presentation";
    pdf.save(`${safeName}-filled.pdf`);
  } finally {
    previewer.destroy();
    host.remove();
  }
}
