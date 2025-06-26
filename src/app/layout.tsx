
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import { PT_Sans, Space_Grotesk } from 'next/font/google';
import { cn } from '@/lib/utils';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { VersionCheck } from '@/components/VersionCheck';

const ptSans = PT_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-pt-sans',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Altan Zam',
  description: 'Your super app for all needs in China.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(ptSans.variable, spaceGrotesk.variable)}>
      <head />
      <body className="font-body antialiased">
        <AuthProvider>
          <LanguageProvider>
            {children}
            <Toaster />
            <VersionCheck />
          </LanguageProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
