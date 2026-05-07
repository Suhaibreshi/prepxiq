import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const POST = async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const registrationNumber = formData.get('registrationNumber') as string;
    const name = formData.get('name') as string;
    const fatherGuardianName = formData.get('fatherGuardianName') as string;
    const gender = formData.get('gender') as string;
    const currentClass = formData.get('currentClass') as string;
    const mobileNumber = formData.get('mobileNumber') as string;
    const emailAddress = formData.get('emailAddress') as string;
    const courseProgram = formData.get('courseProgram') as string;
    const batchClassTiming = formData.get('batchClassTiming') as string;
    const registrationDate = formData.get('registrationDate') as string;
    const declaration = formData.get('declaration') === 'true';

    if (!name?.trim()) {
      return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });
    }
    if (!mobileNumber || mobileNumber.length !== 10) {
      return NextResponse.json({ success: false, message: 'Valid 10-digit mobile number is required' }, { status: 400 });
    }
    if (!emailAddress?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      return NextResponse.json({ success: false, message: 'Valid email is required' }, { status: 400 });
    }
    if (!courseProgram?.trim()) {
      return NextResponse.json({ success: false, message: 'Course is required' }, { status: 400 });
    }
    if (!declaration) {
      return NextResponse.json({ success: false, message: 'Declaration must be agreed' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .insert({
        registration_number: registrationNumber,
        name: name.trim(),
        father_guardian_name: fatherGuardianName?.trim() || null,
        gender: gender || null,
        current_class: currentClass || null,
        mobile_number: mobileNumber,
        email_address: emailAddress.trim().toLowerCase(),
        course_program: courseProgram.trim(),
        batch_class_timing: batchClassTiming || null,
        registration_date: registrationDate || null,
        declaration_agreed: declaration,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
};