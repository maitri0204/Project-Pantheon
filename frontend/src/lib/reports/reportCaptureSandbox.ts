export const applyReportCaptureSandbox = (iframe: HTMLIFrameElement, options?: { allowScripts?: boolean }): void => {
  const sandboxTokens = ["allow-same-origin"];
  if (options?.allowScripts) {
    sandboxTokens.push("allow-scripts");
  }
  iframe.setAttribute("sandbox", sandboxTokens.join(" "));
};
