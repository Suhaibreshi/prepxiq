import { supabaseAdmin } from './supabase';

export async function getRegistrations({
  status,
  search,
  page = 1,
  limit = 20,
}: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('registrations')
    .select('*', { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,registration_number.ilike.%${search}%,mobile_number.ilike.%${search}%,email_address.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    data,
    pagination: {
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    },
  };
}

export async function getRegistration(id: string) {
  const { data, error } = await supabaseAdmin
    .from('registrations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) throw new Error('Registration not found');
  return data;
}

export async function updateRegistrationStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted'
) {
  const { data, error } = await supabaseAdmin
    .from('registrations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRegistrationStats() {
  const [{ count: total }, { count: pending }, { count: approved }, { count: rejected }, { count: waitlisted }] =
    await Promise.all([
      supabaseAdmin.from('registrations').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabaseAdmin.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabaseAdmin.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'waitlisted'),
    ]);

  return { total: total || 0, pending: pending || 0, approved: approved || 0, rejected: rejected || 0, waitlisted: waitlisted || 0 };
}

export async function getCourses() {
  const { data, error } = await supabaseAdmin.from('courses').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}