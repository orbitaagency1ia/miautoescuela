import jsPDF from 'jspdf';

interface CertificateData {
  studentName: string;
  courseName: string;
  completionDate: string;
  certificateNumber: string;
  schoolName: string;
  schoolLogo?: string;
  primaryColor: string;
  secondaryColor: string;
}

/**
 * Generate a PDF certificate
 */
export async function generateCertificate(data: CertificateData): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative border
  pdf.setDrawColor(
    parseInt(data.primaryColor.slice(1, 3), 16),
    parseInt(data.primaryColor.slice(3, 5), 16),
    parseInt(data.primaryColor.slice(5, 7), 16)
  );
  pdf.setLineWidth(3);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');

  // Inner border
  pdf.setLineWidth(1);
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(15, 15, pageWidth - 30, pageHeight - 30, 'S');

  // Header
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(
    parseInt(data.primaryColor.slice(1, 3), 16),
    parseInt(data.primaryColor.slice(3, 5), 16),
    parseInt(data.primaryColor.slice(5, 7), 16)
  );
  pdf.text('CERTIFICADO DE FINALIZACIÓN', pageWidth / 2, 40, { align: 'center' });

  // School name
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(data.schoolName, pageWidth / 2, 55, { align: 'center' });

  // "This certifies that" text
  pdf.setFontSize(14);
  pdf.setTextColor(60, 60, 60);
  pdf.text('Se otorga el presente certificado a:', pageWidth / 2, 75, { align: 'center' });

  // Student name (large)
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bolditalic');
  pdf.setTextColor(
    parseInt(data.secondaryColor.slice(1, 3), 16),
    parseInt(data.secondaryColor.slice(3, 5), 16),
    parseInt(data.secondaryColor.slice(5, 7), 16)
  );
  pdf.text(data.studentName, pageWidth / 2, 95, { align: 'center' });

  // "For successfully completing" text
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  pdf.text('Por haber completado satisfactoriamente el módulo:', pageWidth / 2, 115, { align: 'center' });

  // Course name
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(
    parseInt(data.primaryColor.slice(1, 3), 16),
    parseInt(data.primaryColor.slice(3, 5), 16),
    parseInt(data.primaryColor.slice(5, 7), 16)
  );
  pdf.text(data.courseName, pageWidth / 2, 130, { align: 'center' });

  // Completion date
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Fecha de finalización: ${data.completionDate}`, pageWidth / 2, 150, { align: 'center' });

  // Certificate number (small)
  pdf.setFontSize(10);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Certificado Nº: ${data.certificateNumber}`, pageWidth / 2, 160, { align: 'center' });

  // Verification URL
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/certificados/verificar/${data.certificateNumber}`;
  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 120);
  pdf.text(`Verificar en: ${verifyUrl}`, pageWidth / 2, 170, { align: 'center' });

  // Footer with decorative elements
  pdf.setDrawColor(
    parseInt(data.secondaryColor.slice(1, 3), 16),
    parseInt(data.secondaryColor.slice(3, 5), 16),
    parseInt(data.secondaryColor.slice(5, 7), 16)
  );
  pdf.setLineWidth(1);
  pdf.line(30, 180, pageWidth - 30, 180, 'S');

  // Signature area
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('_________________________', pageWidth / 2 - 40, 195, { align: 'center' });
  pdf.text('Director de la Escuela', pageWidth / 2 - 40, 202, { align: 'center' });

  // Date issued
  pdf.text('_________________________', pageWidth / 2 + 40, 195, { align: 'center' });
  pdf.text('Fecha de Emisión', pageWidth / 2 + 40, 202, { align: 'center' });

  return pdf.output('blob');
}

/**
 * Generate a unique certificate filename
 */
export function getCertificateFileName(studentName: string, courseName: string): string {
  const sanitizedStudent = studentName.replace(/[^a-zA-Z0-9]/g, '_');
  const sanitizedCourse = courseName.replace(/[^a-zA-Z0-9]/g, '_');
  return `certificado_${sanitizedStudent}_${sanitizedCourse}.pdf`;
}
