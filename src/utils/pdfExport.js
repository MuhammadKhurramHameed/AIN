import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const exportExecutiveReportPDF = async (elementId, filename = 'MoITT_National_AI_Executive_Report.pdf') => {
  try {
    const input = document.getElementById(elementId);
    if (!input) {
      alert("Report container not found.");
      return;
    }

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20; // 10mm margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    // Add first page
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - 20);

    // Multi-page handling if content extends
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);
    }

    pdf.save(filename);
  } catch (err) {
    console.error('[PDF Export Error]', err);
    alert("PDF generation failed. Please try again.");
  }
};
