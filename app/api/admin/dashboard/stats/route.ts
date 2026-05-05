import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/lib/auth';

export const GET = auth(async function GET(req) {
  if (!req.auth) {
    // Check if this is a browser request (has Accept header) vs API call
    const accept = req.headers.get('accept');
    if (accept?.includes('text/html')) {
      // Browser request - redirect to login
      return NextResponse.redirect(new URL('/login/admin', req.url));
    }
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('registrations')
    .select('status, created_at');

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  const counts = { total: data.length, pending: 0, approved: 0, rejected: 0, waitlisted: 0 };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data.forEach((r: any) => {
    if (counts[r.status as keyof typeof counts] !== undefined) {
      counts[r.status as keyof typeof counts]++;
    }
  });

  return NextResponse.json({ success: true, data: counts });
});