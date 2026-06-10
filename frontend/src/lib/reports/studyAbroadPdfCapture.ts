import type { jsPDF } from "jspdf";

/** A4 at 96 CSS dpi — stable pixel size for html2canvas (avoids mm/svg scaling bugs). */
export const STUDY_ABROAD_A4 = {
  widthPx: 794,
  heightPx: 1123,
  widthMm: 210,
  heightMm: 297,
} as const;

/** 1.5 keeps text sharp on A4 while cutting capture time and PDF size vs scale 2. */
const CAPTURE_SCALE = 1.5;
const JPEG_QUALITY = 0.85;

/** Wait for fonts, images, and layout before PDF capture (replaces fixed timeouts). */
export async function waitForReportRender(root: HTMLElement, timeoutMs = 5000): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  if (document.fonts?.ready) {
    await Promise.race([
      document.fonts.ready.catch(() => undefined),
      new Promise((resolve) => window.setTimeout(resolve, Math.min(1500, timeoutMs))),
    ]);
  }

  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        }),
    ),
  );

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  const remaining = deadline - Date.now();
  if (remaining > 0) {
    await new Promise((resolve) => window.setTimeout(resolve, Math.min(300, remaining)));
  }
}

/** Replace SVGs with PNG snapshots so html2canvas preserves radar labels and proportions. */
export async function rasterizeSvgsInElement(root: HTMLElement): Promise<void> {
  const svgs = Array.from(root.querySelectorAll("svg"));
  await Promise.all(
    svgs.map((svg) => rasterizeSvgElement(svg).catch(() => undefined)),
  );
}

function rasterizeSvgElement(svg: SVGSVGElement): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const bounds = svg.getBoundingClientRect();
    const width = Math.max(Math.round(bounds.width) || 420, 1);
    const height = Math.max(Math.round(bounds.height) || 420, 1);

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(width));
    clone.setAttribute("height", String(height));
    if (!clone.getAttribute("viewBox") && svg.viewBox?.baseVal) {
      const vb = svg.viewBox.baseVal;
      clone.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.width} ${vb.height}`);
    }

    const serialized = new XMLSerializer().serializeToString(clone);
    const url = URL.createObjectURL(
      new Blob([serialized], { type: "image/svg+xml;charset=utf-8" }),
    );

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * CAPTURE_SCALE;
      canvas.height = height * CAPTURE_SCALE;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      URL.revokeObjectURL(url);

      const replacement = document.createElement("img");
      replacement.src = canvas.toDataURL("image/png");
      replacement.alt = "";
      replacement.width = width;
      replacement.height = height;
      replacement.style.width = `${width}px`;
      replacement.style.height = `${height}px`;
      replacement.style.display = "block";
      replacement.style.margin = svg.style.margin || "0 auto";
      replacement.style.maxWidth = svg.style.maxWidth || "none";
      svg.replaceWith(replacement);
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to rasterize SVG for Study Abroad report"));
    };
    img.src = url;
  });
}

/** Capture one report page at fixed A4 dimensions (matches standalone print layout). */
export async function captureElementToCanvas(page: HTMLElement): Promise<HTMLCanvasElement> {
  page.style.width = `${STUDY_ABROAD_A4.widthPx}px`;
  page.style.height = `${STUDY_ABROAD_A4.heightPx}px`;
  page.style.minHeight = `${STUDY_ABROAD_A4.heightPx}px`;
  page.style.maxHeight = `${STUDY_ABROAD_A4.heightPx}px`;
  page.style.overflow = "hidden";

  await rasterizeSvgsInElement(page);

  const { default: html2canvas } = await import("html2canvas");

  const canvas = await html2canvas(page, {
    scale: CAPTURE_SCALE,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: "#ffffff",
    width: STUDY_ABROAD_A4.widthPx,
    height: STUDY_ABROAD_A4.heightPx,
    onclone: (_doc, clonedPage) => {
      clonedPage.style.width = `${STUDY_ABROAD_A4.widthPx}px`;
      clonedPage.style.height = `${STUDY_ABROAD_A4.heightPx}px`;
      clonedPage.style.minHeight = `${STUDY_ABROAD_A4.heightPx}px`;
      clonedPage.style.maxHeight = `${STUDY_ABROAD_A4.heightPx}px`;
      clonedPage.style.boxSizing = "border-box";
      clonedPage.style.overflow = "hidden";
    },
  });

  return canvas;
}

/** One HTML report page → one PDF page (no automatic splitting). */
export function addCanvasToPdfPage(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  pageIndex: number,
): void {
  if (pageIndex > 0) {
    pdf.addPage();
  }

  const imgData = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  pdf.addImage(
    imgData,
    "JPEG",
    0,
    0,
    STUDY_ABROAD_A4.widthMm,
    STUDY_ABROAD_A4.heightMm,
    undefined,
    "FAST",
  );
}
