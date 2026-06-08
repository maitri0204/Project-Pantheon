import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { jsPDF } from "jspdf";

import StudyAbroadPremiumPrintReport from "@/components/reports/StudyAbroadPremiumPrintReport";
import {
  addCanvasToPdfPage,
  captureElementToCanvas,
  STUDY_ABROAD_A4,
  waitForReportRender,
} from "@/lib/reports/studyAbroadPdfCapture";
import {
  fetchStudyAbroadPrintContext,
  type StudyAbroadPrintContext,
} from "@/lib/studyAbroad/printReportData";

function createCaptureIframe(): {
  mount: HTMLElement;
  root: Root;
  cleanup: () => void;
} {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("tabindex", "-1");
  Object.assign(iframe.style, {
    position: "fixed",
    left: "-12000px",
    top: "0",
    width: `${STUDY_ABROAD_A4.widthPx}px`,
    height: `${STUDY_ABROAD_A4.heightPx}px`,
    border: "none",
    visibility: "hidden",
    pointerEvents: "none",
  });
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    throw new Error("Study Abroad report capture iframe is unavailable");
  }

  iframeDoc.open();
  iframeDoc.write(
    '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;"></body></html>',
  );
  iframeDoc.close();

  const mount = iframeDoc.body;
  mount.style.margin = "0";
  mount.style.padding = "0";

  const root = createRoot(mount);

  return {
    mount,
    root,
    cleanup: () => {
      root.unmount();
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    },
  };
}

async function captureStudyAbroadReportPdf(context: StudyAbroadPrintContext): Promise<Blob> {
  const { mount, root, cleanup } = createCaptureIframe();

  try {
    await new Promise<void>((resolve) => {
      root.render(
        createElement(StudyAbroadPremiumPrintReport, {
          result: context.result,
          history: context.history,
          studentName: context.studentName,
          profile: context.profile,
          showToolbar: false,
        }),
      );
      void waitForReportRender(mount).then(resolve).catch(resolve);
    });

    const pages = Array.from(
      mount.querySelectorAll<HTMLElement>("[data-report-page]"),
    ).sort(
      (a, b) =>
        Number(a.getAttribute("data-report-page") ?? 0) -
        Number(b.getAttribute("data-report-page") ?? 0),
    );

    if (pages.length === 0) {
      throw new Error("Study Abroad report pages failed to render");
    }

    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
      compress: true,
    });

    for (let i = 0; i < pages.length; i += 1) {
      const canvas = await captureElementToCanvas(pages[i]);
      addCanvasToPdfPage(pdf, canvas, i);
    }

    return pdf.output("blob");
  } finally {
    cleanup();
  }
}

/** Builds the premium PDF (7+ pages when strengths/roadmap continue) in the background. Used for download and email. */
export async function generateStudyAbroadReportForEmail(
  token: string,
  attemptId: string,
  reportFetchPath?: string,
): Promise<{ blob: Blob; fileName: string }> {
  const context = await fetchStudyAbroadPrintContext(token, attemptId, reportFetchPath);
  const blob = await captureStudyAbroadReportPdf(context);
  const fileName = `Study-Abroad-Report-${context.studentName.replace(/\s+/g, "-")}.pdf`;
  return { blob, fileName };
}

export function studyAbroadPrintReportPath(
  slug: string,
  assessmentCode: string,
  attemptId: string,
): string {
  const params = new URLSearchParams({ attemptId });
  return `/whitelabel/${slug}/student/assessments/${assessmentCode}/report-print?${params.toString()}`;
}
