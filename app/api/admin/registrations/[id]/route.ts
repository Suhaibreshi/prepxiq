import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/lib/auth';

export const DELETE = auth(async function DELETE(req, { params }) {
  if (!req.auth || (req.auth.user as any)?.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const id = (params as any).id;

  if (!id) {
    return NextResponse.json({ success: false, message: 'Missing registration ID' }, { status: 400 });
  }

  // First, check if there's an associated user and delete them too
  const { error: userDeleteError } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('registration_id', id);

  if (userDeleteError) {
    console.error('[DeleteRegistration] Failed to delete associated user:', userDeleteError);
    // Continue anyway to try and delete the registration
  }

  const { error } = await supabaseAdmin
    .from('registrations')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Registration deleted successfully' });
});
