
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Always redirect the root path to the main services page.
  redirect('/services');
}
