import { AssessmentData } from "./types";
import { buildBackCoverPage, buildCoverPage } from "./coverPages";
import { reportStyles } from "./styles";
import { buildAllPages } from "./pages";

export function buildReportHtml(data: AssessmentData): string {
  const pages = `${buildCoverPage(data)}\n${buildAllPages(data)}\n${buildBackCoverPage()}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Learning Intelligence Report</title>
  <style>${reportStyles}</style>
</head>
<body>
  ${pages}
</body>
</html>`;
}
