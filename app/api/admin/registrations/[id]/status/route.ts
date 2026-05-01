import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/lib/auth';

export const PUT = auth(async function PUT(req, { params }) {
  if (!req.auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const id = (params as any).id;
  const { status } = await req.json();

  const validStatuses = ['pending', 'approved', 'rejected', 'waitlisted'];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({
      success: false,
      message: `Status must be one of: ${validStatuses.join(', ')}`
    }, { status: 400 });
  }

  const { data: current } = await supabaseAdmin
    .from('registrations')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!current) {
    return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from('registrations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
});