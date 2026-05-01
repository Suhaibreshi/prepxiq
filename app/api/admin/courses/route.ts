import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/lib/auth';

export const GET = auth(async function GET(req) {
  if (!req.auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*')
    .order('category', { ascending: true })
    .order('program', { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
});

export const POST = auth(async function POST(req) {
  if (!req.auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { category, program, batch_timing, is_active = true } = await req.json();

  if (!category || !program) {
    return NextResponse.json({ success: false, message: 'category and program are required' }, { status: 400 });
  }

  const { data: existing } = await supabaseAdmin
    .from('courses')
    .select('id')
    .eq('category', category)
    .eq('program', program)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: false, message: 'Course already exists' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('courses')
    .insert([{ category, program, batch_timing, is_active }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
});