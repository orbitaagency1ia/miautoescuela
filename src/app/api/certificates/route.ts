import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateCertificate, getCertificateFileName } from '@/lib/certificates/generator';

// GET - List certificates for current user
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const verifyCode = searchParams.get('verify');

    if (verifyCode) {
      // Verify certificate
      const { data: certificate } = await (supabase
        .from('certificates')
        .select('*, schools (name, logo_url), modules (title)')
        .eq('certificate_number', verifyCode)
        .single()) as any;

      if (!certificate) {
        return NextResponse.json({ error: 'Certificado no encontrado' }, { status: 404 });
      }

      return NextResponse.json({
        valid: true,
        certificate: {
          studentName: certificate.student_name,
          courseName: certificate.course_name || certificate.modules?.title,
          completionDate: certificate.completion_date,
          issuedAt: certificate.issued_at,
          schoolName: certificate.schools?.name,
          certificateNumber: certificate.certificate_number,
        },
      });
    }

    // Get user's certificates
    const { data: certificates } = await (supabase
      .from('certificates')
      .select('*')
      .eq('user_id', user.id)
      .order('issued_at', { ascending: false })
      .single()) as any;

    return NextResponse.json({ certificates: certificates || [] });
  } catch (error: any) {
    console.error('Error in certificates API:', error);
    return NextResponse.json(
      { error: 'Error al obtener certificados' },
      { status: 500 }
    );
  }
}

// POST - Generate certificate PDF
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { certificateId } = await request.json();

    if (!certificateId) {
      return NextResponse.json({ error: 'ID de certificado requerido' }, { status: 400 });
    }

    // Get certificate data
    const { data: certificate } = await (supabase
      .from('certificates')
      .select(`
        *,
        schools (name, logo_url, primary_color, secondary_color),
        modules (title)
      `)
      .eq('id', certificateId)
      .eq('user_id', user.id)
      .single()) as any;

    if (!certificate) {
      return NextResponse.json({ error: 'Certificado no encontrado' }, { status: 404 });
    }

    // Generate PDF
    const pdfBlob = await generateCertificate({
      studentName: certificate.student_name,
      courseName: certificate.course_name || certificate.modules?.title || 'Curso',
      completionDate: new Date(certificate.completion_date).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      certificateNumber: certificate.certificate_number,
      schoolName: certificate.schools?.name || 'Escuela',
      schoolLogo: certificate.schools?.logo_url || undefined,
      primaryColor: certificate.schools?.primary_color || '#3B82F6',
      secondaryColor: certificate.schools?.secondary_color || '#1E40AF',
    });

    // Upload to Supabase Storage
    const fileName = `certificates/${certificate.id}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(fileName, pdfBlob, {
        upsert: true,
        contentType: 'application/pdf',
      });

    if (uploadError) {
      console.error('Error uploading certificate:', uploadError);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('certificates')
      .getPublicUrl(fileName);

    // Update certificate record with PDF URL
    await (supabase
      .from('certificates') as any)
      .update({ pdf_url: publicUrl })
      .eq('id', certificateId);

    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${getCertificateFileName(
          certificate.student_name,
          certificate.modules?.title || 'Curso'
        )}"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating certificate:', error);
    return NextResponse.json(
      { error: 'Error al generar certificado' },
      { status: 500 }
    );
  }
}
