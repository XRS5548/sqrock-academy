const allowedTags = new Set([
  "p",
  "br",
  "hr",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "code",
  "pre",
]);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeHref(value: string) {
  const href = value.trim();
  if (/^(https?:\/\/|mailto:|\/)/i.test(href)) return href;
  return "#";
}

/**
 * Accepts editor HTML (or plain text) and returns a small, safe subset of
 * HTML for storing in the database and rendering with dangerouslySetInnerHTML.
 */
export function toRichText(input: string) {
  const raw = input.trim();
  if (!raw) return "";

  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(raw);
  const html = looksLikeHtml
    ? raw
    : `<p>${escapeHtml(raw)
        .replace(/\r?\n\r?\n/g, "</p><p>")
        .replace(/\r?\n/g, "<br/>")}</p>`;

  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(
      /<\s*(script|style|iframe|object|embed|form|input|textarea|select|button|svg|math)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
      "",
    )
    .replace(
      /<\s*(script|style|iframe|object|embed|form|input|textarea|select|button|svg|math)[^>]*\/?>/gi,
      "",
    )
    .replace(
      /<\s*(\/?)\s*([a-z0-9]+)([^>]*)>/gi,
      (_match, closing: string, rawTag: string, attrs: string) => {
        const tag = rawTag.toLowerCase();
        if (!allowedTags.has(tag)) return "";
        if (closing) return `</${tag}>`;
        if (tag === "a") {
          const href =
            /href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs) ?? [];
          const value = href[1] ?? href[2] ?? href[3] ?? "";
          return `<a href="${safeHref(value)}" rel="noreferrer" target="_blank">`;
        }
        if (tag === "br" || tag === "hr") return `<${tag}>`;
        return `<${tag}>`;
      },
    );
}
