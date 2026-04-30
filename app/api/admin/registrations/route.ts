import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/lib/auth';

export const GET = auth(async function GET(req) {
  if (!req.auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const course = searchParams.get('course');

  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('registrations')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== 'all') query = query.eq('status', status);
  if (course && course !== 'all') query = query.eq('course_program', course);
  if (search) {
    query = query.or(`name.ilike.%${search}%,registration_number.ilike.%${search}%,mobile_number.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data,
    pagination: { page, limit, total: count, totalPages: Math.ceil((count || 0) / limit) }
  });
});

export const POST = auth(async function POST(req) {
  if (!req.auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      email_address,
      mobile_number,
      course_program,
      batch_class_timing,
      status: regStatus,
    } = body;

    if (!name || !email_address || !mobile_number || !course_program) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: name, email_address, mobile_number, course_program' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .insert({
        name,
        email_address,
        mobile_number,
        course_program,
        batch_class_timing: batch_class_timing || null,
        status: regStatus || 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
});