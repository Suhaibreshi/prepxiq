# Student Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a student dashboard at `/student` that shows the course catalog after login.

**Architecture:** A single new page component at `app/student/page.tsx` using Next.js App Router, `useSession` for auth, and the existing `Courses.tsx` component for the catalog. No new API routes needed.

**Tech Stack:** Next.js App Router, Tailwind CSS, next-auth/react, lucide-react

---

## File Structure

- **Create:** `app/student/page.tsx` — student dashboard page
- **No modifications to existing files** — reusing existing components

---

## Task 1: Create student dashboard page

**Files:**
- Create: `app/student/page.tsx`

- [ ] **Step 1: Write the student dashboard component**

```tsx
'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, LogOut } from 'lucide-react';
import Courses from '@/components/Courses';

export default function StudentDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login/student');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const studentName = session?.user?.name || 'Student';
  const studentEmail = session?.user?.email || '';

  const maskEmail = (email: string) => {
    if (!email.includes('@')) return email;
    const [local, domain] = email.split('@');
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    return `${local[0]}${'*'.repeat(3)}@${domain}`;
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login/student' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="font-bold text-xl">PREP X IQ</a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={24} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Welcome, {studentName}</h1>
              <p className="text-gray-500 text-sm">{maskEmail(studentEmail)}</p>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Courses</h2>
          <Courses />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the file was created correctly**

Run: `cat app/student/page.tsx`
Expected: File contents match the code above

- [ ] **Step 3: Test the page loads**

Run: `npm run dev` (in background), then visit `http://localhost:3000/student`
Expected: Page renders without errors

- [ ] **Step 4: Commit**

```bash
git add app/student/page.tsx
git commit -m "feat: add student dashboard with course catalog"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```