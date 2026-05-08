import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
if (!ADMIN_JWT_SECRET) {
  throw new Error('ADMIN_JWT_SECRET environment variable is required');
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Admin Login',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const { data: admin } = await supabaseAdmin
          .from('admin_users')
          .select('*')
          .eq('username', credentials.username as string)
          .single();

        if (!admin) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          admin.password_hash
        );

        if (!isValid) return null;

        return {
          id: admin.id,
          username: admin.username,
          role: 'admin' as const,
        };
      },
    }),
    Credentials({
      name: 'Student Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials');
          return null;
        }

        const email = (credentials.email as string).toLowerCase().trim();
        console.log(`[Auth] Attempting student login for: ${email}`);

        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (error) {
          console.error('[Auth] Database error:', error);
          return null;
        }

        if (!user) {
          console.log(`[Auth] User not found: ${email}`);
          return null;
        }

        console.log(`[Auth] User found, approved status: ${user.is_approved}`);

        if (!user.is_approved) {
          console.log(`[Auth] User not approved: ${email}`);
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (!isValid) {
          console.log(`[Auth] Password mismatch for: ${email}`);
          // For debugging only: console.log(`[Auth] Input password: ${credentials.password}`);
          return null;
        }

        console.log(`[Auth] Login successful for: ${email}`);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: 'student' as const,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = user as any;
        token.role = u.role;
        if (u.role === 'admin') {
          token.username = u.username;
        } else if (u.role === 'student') {
          token.name = u.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (token.role === 'admin') (session.user as any).username = token.username;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (token.role === 'student') (session.user as any).name = token.name;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login/admin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: ADMIN_JWT_SECRET,
});