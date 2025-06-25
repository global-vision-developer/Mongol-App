'use client';

/**
 * This page is intentionally left minimal and returns null.
 * The primary routing logic for the root path ("/") is handled by `src/app/page.tsx`,
 * which redirects users based on their authentication status.
 *
 * This file exists to satisfy the Next.js routing structure within the (main) group,
 * but its role is passive. By returning null, it avoids rendering anything and
 * prevents build conflicts on platforms like Vercel that can arise from having
 * two page components handling the same root path.
 */
export default function MainPage() {
  // Returning null makes this component render nothing, which is the desired behavior
  // as the redirect is handled by the root page.tsx.
  return null;
}
