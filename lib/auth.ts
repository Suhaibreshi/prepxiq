import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { supabaseAdmin } from './supabase';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'prepxiq-admin-secret';

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
          .from('admins')
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
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: ADMIN_JWT_SECRET,
});