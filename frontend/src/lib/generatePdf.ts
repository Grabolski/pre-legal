"use client";

import { jsPDF } from "jspdf";
import { replaceVariables } from "./interpolate";

export function generatePdf(
  templateId: string,
  formValues: Record<string, string>,
  rawContent: string
): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const marginLeft = 20;
  const marginTop = 25;
  const marginBottom = 25;
  const maxWidth = 170;
  const pageHeight = 297;
  let y = marginTop;

  const text = replaceVariables(rawContent, formValues);
  const lines = text.split("\n");

  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim();
    const isTitle = index === 0 && trimmed === trimmed.toUpperCase() && trimmed.length > 0;
    const isSectionHeading = /^\d+\.\s+[A-Z][A-Z\s]+$/.test(trimmed);

    if (isTitle) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
    } else if (isSectionHeading) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
    }

    if (trimmed === "") {
      y += 3;
      continue;
    }

    const wrapped = doc.splitTextToSize(line, maxWidth);
    for (const wl of wrapped) {
      if (y + 6 > pageHeight - marginBottom) {
        doc.addPage();
        y = marginTop;
      }
      if (isTitle) {
        const textWidth = doc.getTextWidth(wl);
        doc.text(wl, (210 - textWidth) / 2, y);
      } else {
        doc.text(wl, marginLeft, y);
      }
      y += 5.5;
    }

    if (isSectionHeading) y += 1;
  }

  doc.save(`${templateId}.pdf`);
}
