import { redirect } from 'next/navigation'

// This server component permanently redirects to the /services page,
// which is the main landing page for authenticated users.
// This is the most efficient and build-friendly way to handle this redirect.
export default function MainPage() {
  redirect('/services')
}
