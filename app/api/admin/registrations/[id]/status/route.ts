import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const PUT = auth(async function PUT(req, { params }) {
  if (!req.auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

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

  // When approved, create a user account with phone as default password
  if (status === 'approved' && current.email_address && current.mobile_number) {
    const email = current.email_address.toLowerCase().trim();
    // Forcefully clean the mobile number: convert to string, remove all non-digits, trim
    const rawMobile = String(current.mobile_number);
    const defaultPassword = rawMobile.replace(/\D/g, '').trim();
    
    console.log(`[StatusUpdate] Creating user for ${email}`);
    console.log(`[StatusUpdate] Raw Mobile from DB: "${rawMobile}"`);
    console.log(`[StatusUpdate] Cleaned Password (to be hashed): "${defaultPassword}"`);
    
    if (defaultPassword.length < 10) {
      console.warn(`[StatusUpdate] Warning: Cleaned password for ${email} is short: ${defaultPassword.length} chars`);
    }
    
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email: email,
        password_hash: passwordHash,
        registration_id: current.id,
        name: current.name,
        is_approved: true,
      });

    if (userError) {
      console.error('[StatusUpdate] Failed to create user account:', userError);
    } else {
      console.log(`[StatusUpdate] User account created successfully for ${email}`);
    }
  }

  return NextResponse.json({ success: true, data });
});