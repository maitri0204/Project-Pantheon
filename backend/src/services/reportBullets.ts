/**
 * Flex-aligned bullets for HTML reports captured to PDF.
 * Uses explicit marker + text spans so inline HTML (e.g. <strong>) does not break layout.
 */
export const REPORT_BULLET_CSS = `
  .report-bullets {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .report-bullets > li {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 5px;
    padding: 0;
    font-size: inherit;
    line-height: inherit;
    color: inherit;
  }
  .report-bullets__marker {
    flex-shrink: 0;
    width: 12px;
    text-align: center;
    color: var(--report-bullet-color, currentColor);
    font-size: inherit;
    line-height: inherit;
  }
  .report-bullets__text {
    flex: 1;
    min-width: 0;
  }
  .report-bullets--compact > li {
    margin-bottom: 3px;
  }
  .report-bullets--checklist .report-bullets__marker {
    font-size: 10px;
  }
`;

export type ReportBulletOptions = {
  color?: string;
  bulletColor?: string;
  className?: string;
  compact?: boolean;
  checklist?: boolean;
  fontSize?: string;
  lineHeight?: string | number;
};

export function renderReportBullets(items: string[], options: ReportBulletOptions = {}): string {
  const classes = [
    "report-bullets",
    options.compact ? "report-bullets--compact" : "",
    options.checklist ? "report-bullets--checklist" : "",
    options.className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const styleParts: string[] = [];
  if (options.color) styleParts.push(`color:${options.color}`);
  if (options.bulletColor) styleParts.push(`--report-bullet-color:${options.bulletColor}`);
  if (options.fontSize) styleParts.push(`font-size:${options.fontSize}`);
  if (options.lineHeight !== undefined) styleParts.push(`line-height:${options.lineHeight}`);

  const styleAttr = styleParts.length ? ` style="${styleParts.join(";")}"` : "";
  const marker = options.checklist ? "&#9744;" : "&#8226;";

  return `<ul class="${classes}"${styleAttr}>${items
    .map(
      (item) =>
        `<li><span class="report-bullets__marker">${marker}</span><span class="report-bullets__text">${item}</span></li>`,
    )
    .join("")}</ul>`;
}
