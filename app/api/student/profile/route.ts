import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/lib/auth';

export const GET = auth(async function GET(req) {
  if (!req.auth || (req.auth.user as any)?.role !== 'student') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const userId = (req.auth.user as any).id;

  // Find user and their associated registration_id
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('registration_id')
    .eq('id', userId)
    .single();

  if (userError || !user || !user.registration_id) {
    return NextResponse.json({ success: false, message: 'User registration not found' }, { status: 404 });
  }

  // Fetch registration details
  const { data: registration, error: regError } = await supabaseAdmin
    .from('registrations')
    .select('*')
    .eq('id', user.registration_id)
    .single();

  if (regError || !registration) {
    return NextResponse.json({ success: false, message: 'Registration details not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: registration });
});
