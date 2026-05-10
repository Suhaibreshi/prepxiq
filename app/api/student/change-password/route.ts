import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const POST = auth(async function POST(req) {
  if (!req.auth || (req.auth.user as any)?.role !== 'student') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
  }

  const userId = (req.auth.user as any).id;

  // Fetch current user
  const { data: user, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (fetchError || !user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) {
    return NextResponse.json({ success: false, message: 'Incorrect current password' }, { status: 400 });
  }

  // Hash new password
  const newHash = await bcrypt.hash(newPassword, 12);

  // Update password
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ password_hash: newHash, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (updateError) {
    return NextResponse.json({ success: false, message: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Password updated successfully' });
});
