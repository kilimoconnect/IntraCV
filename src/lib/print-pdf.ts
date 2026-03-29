/**
 * Client-side CV PDF download via browser print API.
 * Opens a dedicated print window with the rendered CV HTML + all page
 * stylesheets (Tailwind, custom fonts, etc.) and auto-triggers print.
 * Works on all hosting plans — no server required.
 */
export function printCvAsPdf(element: HTMLElement, filename: string): void {
  // Resolve all stylesheet <link> tags to absolute URLs so they load in
  // the new window (which has no implicit base URL).
  const styleLinks = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
  )
    .map((el) => {
      const href = el.getAttribute("href") || "";
      const abs = href.startsWith("http")
        ? href
        : `${window.location.origin}${href}`;
      return `<link rel="stylesheet" href="${abs}" />`;
    })
    .join("\n");

  const win = window.open("", "_blank");
  if (!win) {
    alert("Please allow pop-ups for this site to download your CV as PDF.");
    return;
  }

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${filename}</title>
  ${styleLinks}
  <style>
    @page { size: 210mm 297mm; margin: 0; }
    html, body { margin: 0; padding: 0; background: white; }
    /* Ensure each CV page prints on its own sheet */
    .cv-page-sheet {
      width: 794px !important;
      height: 1123px !important;
      overflow: hidden !important;
      page-break-after: always !important;
      break-after: page !important;
    }
    .cv-page-sheet:last-child {
      page-break-after: auto !important;
      break-after: auto !important;
    }
  </style>
</head>
<body>
${element.innerHTML}
<script>
  window.onload = function () {
    // Small delay lets stylesheets and fonts finish loading
    setTimeout(function () {
      window.print();
    }, 600);
  };
</script>
</body>
</html>`);

  win.document.close();
}
