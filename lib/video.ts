export function normalizeVideoUrl(
  url: string,
  type: string,
): { kind: "youtube" | "file"; src: string } | null {
  if (!url) return null;
  if (type === "youtube" || /youtu\.?be/.test(url)) {
    const patterns = [
      /(?:youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/,
      /(?:youtube\.com\/watch\?v=)([A-Za-z0-9_-]{6,})/,
      /(?:youtu\.be\/)([A-Za-z0-9_-]{6,})/,
      /^([A-Za-z0-9_-]{11})$/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          kind: "youtube",
          src: `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0&modestbranding=1`,
        };
      }
    }
  }
  return { kind: "file", src: url };
}
