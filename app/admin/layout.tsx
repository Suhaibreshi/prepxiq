'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">PREPX IQ Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-gray-700 hover:text-primary">Dashboard</Link>
              <Link href="/admin/registrations" className="text-gray-700 hover:text-primary">Registrations</Link>
              <Link href="/admin/courses" className="text-gray-700 hover:text-primary">Courses</Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login/admin' })}
                className="text-gray-700 hover:text-red-600"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}