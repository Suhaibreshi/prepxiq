# Student Dashboard Design — 2026-05-06

## Overview

Create a student dashboard at `/student/page.tsx` that displays the course catalog. Students log in via the existing `/login/student` flow and are redirected to `/student` after successful authentication.

## Routes

- **Student dashboard:** `app/student/page.tsx` (new file)
- **Student login:** `app/login/student/page.tsx` (existing, redirects to `/student` after login)

## Auth

- Uses `useSession` from `next-auth/react` (consistent with admin flow)
- Unauthenticated users are redirected to `/login/student`
- Session user object contains: `id`, `email`, `name`, `role: 'student'`

## Layout Structure

```
┌─────────────────────────────────────────────┐
│  HEADER (dark blue gradient)                 │
│  [PREP X IQ]                    [Logout]    │
├─────────────────────────────────────────────┤
│  WELCOME CARD (white, rounded)              │
│  Avatar + "Welcome, [Name]" + email        │
├─────────────────────────────────────────────┤
│  COURSES SECTION                            │
│  "Your Courses" heading                     │
│  ┌─────┐ ┌─────┐ ┌─────┐                   │
│  │ C1  │ │ C2  │ │ C3  │  (responsive grid) │
│  └─────┘ └─────┘ └─────┘                   │
│  ... (11 total courses)                     │
└─────────────────────────────────────────────┘
```

## Components

### Header
- Dark blue gradient background (`from-blue-900 via-blue-800 to-blue-900`)
- "PREP X IQ" branding on left (links to `/`)
- Logout button on right (white/10 bg, hover white/20)
- Uses `signOut` from `next-auth/react` with callback to `/login/student`

### Welcome Card
- White background, rounded-2xl, shadow, border
- Left: blue circle avatar with user icon
- Right: bold "Welcome, [name]" + masked email below in gray

### Course Catalog
- Reuses existing `components/Courses.tsx` but with section heading "Your Courses"
- 11 courses in responsive grid: 1 col (mobile), 2 col (sm), 3 col (lg)
- Course cards: gradient icon, title, description, "Watch Playlist" CTA
- Clicking a card opens YouTube playlist in new tab

## Dependencies

- `next-auth/react` — session management
- `lucide-react` — icons (User, LogOut)
- `components/Courses.tsx` — existing course cards

## No Backend Changes Required

- No new API routes needed
- Courses are static data in `Courses.tsx`
- Auth handled entirely client-side with `useSession`