import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/lib/auth';

export const GET = auth(async function GET(req, { params }) {
  if (!req.auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const id = (params as any).id;
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
});

export const PUT = auth(async function PUT(req, { params }) {
  if (!req.auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const id = (params as any).id;
  const { category, program, batch_timing, is_active } = await req.json();

  const { data, error } = await supabaseAdmin
    .from('courses')
    .update({ category, program, batch_timing, is_active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
});

export const DELETE = auth(async function DELETE(req, { params }) {
  if (!req.auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const id = (params as any).id;
  const { error } = await supabaseAdmin
    .from('courses')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
});