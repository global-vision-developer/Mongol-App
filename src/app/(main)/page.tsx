
export default function MainPage() {
  // This page is necessary to prevent Next.js from showing a 404 for the root of the (main) group,
  // but it should not render anything as the root redirect is handled by `src/app/page.tsx`.
  // Making it a server component that returns null solves the Vercel build issue.
  return null;
}
