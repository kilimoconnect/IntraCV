/**
 * Client-side CV PDF download via browser print API.
 *
 * Strategy: clone the CV element directly onto document.body and print
 * the current page — all Tailwind CSS, CSS variables, and fonts are
 * already loaded so no async stylesheet fetching is needed and colors
 * are always preserved. The transform:scale from the canvas preview
 * is stripped from the clone so it prints at full A4 size.
 */
export function printCvAsPdf(element: HTMLElement, filename: string): void {
  const PRINT_CLASS = "__cv-print-only__";
  const originalTitle = document.title;
  document.title = filename;

  // Clone and reset preview transform
  const clone = element.cloneNode(true) as HTMLElement;
  clone.classList.add(PRINT_CLASS);
  clone.style.transform = "none";
  clone.style.transformOrigin = "unset";
  clone.style.position = "static";
  clone.style.margin = "0";
  clone.style.padding = "0";
  clone.style.width = "794px";
  document.body.appendChild(clone);

  // Inject print-only styles — hide the entire app, show only the clone
  const styleEl = document.createElement("style");
  styleEl.setAttribute("data-cv-print", "");
  styleEl.textContent = `
    @media print {
      @page { size: 210mm 297mm; margin: 0; }
      body > *:not(.${PRINT_CLASS}) { display: none !important; }
      body { margin: 0 !important; padding: 0 !important; background: white !important; }
      .${PRINT_CLASS} {
        display: block !important;
        position: static !important;
        transform: none !important;
        width: 794px !important;
        height: auto !important;
        overflow: visible !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .cv-page-sheet {
        width: 794px !important;
        height: 1123px !important;
        overflow: hidden !important;
        page-break-after: always !important;
        break-after: page !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        margin-top: 0 !important;
      }
      .cv-page-sheet:last-child {
        page-break-after: auto !important;
        break-after: auto !important;
      }
    }
  `;
  document.head.appendChild(styleEl);

  // Small delay lets the clone render before the print dialog opens
  setTimeout(() => {
    window.print();

    // Clean up after the dialog is dismissed
    setTimeout(() => {
      document.body.removeChild(clone);
      document.head.removeChild(styleEl);
      document.title = originalTitle;
    }, 500);
  }, 150);
}
