/**
 * Client-side CV PDF download via browser print API.
 * Opens a dedicated print window with the rendered CV HTML + all page
 * stylesheets (Tailwind, custom fonts, etc.) and auto-triggers print.
 * Works on all hosting plans — no server required.
 */
export function printCvAsPdf(element: HTMLElement, filename: string): void {
  const origin = window.location.origin;

  // 1. Resolve all <link rel="stylesheet"> to absolute URLs.
  const styleLinks = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
  )
    .map((el) => {
      const href = el.getAttribute("href") || "";
      const abs = href.startsWith("http") ? href : `${origin}${href}`;
      return `<link rel="stylesheet" href="${abs}" />`;
    })
    .join("\n");

  // 2. Copy every <style> from <head> verbatim (Tailwind v4 injects CSS
  //    custom-property resets here; missing these strips all theme colors).
  const inlineStyles = Array.from(
    document.querySelectorAll<HTMLStyleElement>("head style")
  )
    .map((el) => el.outerHTML)
    .join("\n");

  const linkCount = document.querySelectorAll('link[rel="stylesheet"]').length;

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
  ${inlineStyles}
  <style>
    @page { size: 210mm 297mm; margin: 0; }
    html, body { margin: 0; padding: 0; background: white; }
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
${element.outerHTML}
<script>
  (function () {
    var total = ${linkCount};
    var loaded = 0;

    function doPrint() {
      // Extra 200ms after all sheets load for fonts/images to settle
      setTimeout(function () { window.print(); }, 200);
    }

    if (total === 0) {
      doPrint();
      return;
    }

    document.querySelectorAll('link[rel="stylesheet"]').forEach(function (el) {
      el.addEventListener('load',  function () { loaded++; if (loaded >= total) doPrint(); });
      el.addEventListener('error', function () { loaded++; if (loaded >= total) doPrint(); });
    });

    // Safety fallback: print after 3 s regardless
    setTimeout(doPrint, 3000);
  })();
</script>
</body>
</html>`);

  win.document.close();
}
