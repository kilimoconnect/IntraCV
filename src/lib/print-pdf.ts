/**
 * Client-side CV PDF download via browser print API.
 *
 * Uses window.print() with @media print CSS to generate a real PDF
 * with selectable text and proper fonts. Works on desktop and mobile.
 * Fixes mobile viewport issues by setting zoom: 1 and overflow: visible
 * in print mode so browsers don't scale down the 794px A4 content.
 */

export function printCvAsPdf(element: HTMLElement, filename: string): void {
  const PRINT_CLASS = "__cv-print-wrapper__";
  const originalTitle = document.title;
  document.title = filename;

  // Clone the CV element to avoid mutating the live preview
  const clone = element.cloneNode(true) as HTMLElement;
  clone.classList.add(PRINT_CLASS);

  // Create a clean print wrapper
  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: white;
    z-index: 999999;
    overflow: visible;
  `;
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Inject print-only styles
  const styleEl = document.createElement("style");
  styleEl.setAttribute("data-cv-print", "");
  styleEl.textContent = `
    @media print {
      @page { size: 210mm 297mm; margin: 0; }
      html, body {
        width: 100vw !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        overflow: visible !important;
        zoom: 1 !important;
      }
      body > *:not(.${PRINT_CLASS}) { display: none !important; }
      .${PRINT_CLASS} {
        display: block !important;
        position: static !important;
        transform: none !important;
        transform-origin: unset !important;
        width: 100% !important;
        height: auto !important;
        overflow: visible !important;
        margin: 0 !important;
        padding: 0 !important;
        zoom: 1 !important;
      }
      /* Force browser to print background colors and images */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      .cv-page-sheet {
        width: 794px !important;
        height: 1123px !important;
        overflow: hidden !important;
        page-break-after: always !important;
        break-after: page !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        margin: 0 auto !important;
        position: relative !important;
        transform: none !important;
        zoom: 1 !important;
      }
      .cv-page-sheet:last-child {
        page-break-after: auto !important;
        break-after: auto !important;
      }
    }
    @media screen {
      .${PRINT_CLASS} {
        max-width: 100vw;
        margin: 0 auto;
        overflow-x: auto;
      }
    }
  `;
  document.head.appendChild(styleEl);

  // Trigger print dialog
  setTimeout(() => {
    window.print();

    // Clean up after print dialog closes
    setTimeout(() => {
      if (wrapper.parentNode) {
        document.body.removeChild(wrapper);
      }
      if (styleEl.parentNode) {
        document.head.removeChild(styleEl);
      }
      document.title = originalTitle;
    }, 1000);
  }, 150);
}
