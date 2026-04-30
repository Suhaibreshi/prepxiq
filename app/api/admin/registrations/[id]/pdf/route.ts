import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { data: registration, error } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !registration) {
      return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
    }

    const pdfsDir = path.join(process.cwd(), 'public', 'uploads', 'pdfs');
    if (!fs.existsSync(pdfsDir)) {
      fs.mkdirSync(pdfsDir, { recursive: true });
    }

    const pdfFileName = `registration-${registration.registration_number}.pdf`;
    const pdfPath = path.join(pdfsDir, pdfFileName);

    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    doc.fontSize(20).font('Helvetica-Bold').text('Registration Form', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(`Name: ${registration.name}`);
    doc.text(`Registration #: ${registration.registration_number}`);
    doc.text(`Email: ${registration.email_address || 'N/A'}`);
    doc.text(`Mobile: ${registration.mobile_number || 'N/A'}`);
    doc.text(`Course: ${registration.course_program || 'N/A'}`);
    doc.text(`Batch Timing: ${registration.batch_class_timing || 'N/A'}`);
    doc.text(`Status: ${registration.status || 'N/A'}`);
    doc.moveDown();
    doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });

    doc.end();

    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    return NextResponse.json({
      success: true,
      pdfPath: `/uploads/pdfs/${pdfFileName}`,
      pdfFileName,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
