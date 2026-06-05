/** Post-process report HTML: em/en dashes, +3px fonts, dark text → pure black. */
const DARK_TEXT_HEX = ["#111827", "#374151", "#6B7280", "#9CA3AF"] as const;

export function normalizeReportHtml(html: string): string {
  let out = html.replace(/\u2014/g, "-").replace(/\u2013/g, "-");

  out = out.replace(/font-size:(\d+(?:\.\d+)?)px/g, (_, n) => `font-size:${parseFloat(n) + 3}px`);
  out = out.replace(/font-size="(\d+(?:\.\d+)?)"/g, (_, n) => `font-size="${parseFloat(n) + 3}"`);

  for (const hex of DARK_TEXT_HEX) {
    out = out.split(`color:${hex}`).join("color:#000000");
    out = out.split(`fill="${hex}"`).join('fill="#000000"');
  }

  return out;
}
