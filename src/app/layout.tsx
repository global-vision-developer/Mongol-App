
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import { PT_Sans, Space_Grotesk } from 'next/font/google';
import { cn } from '@/lib/utils';
import { LanguageProvider } from '@/contexts/LanguageContext';

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
  title: 'Mongol',
  description: 'Your super app for all needs in China.',
  // PWA specific metadata removed for debugging
  // manifest: "/manifest.json",
  // themeColor: "#3F51B5",
  // appleWebApp: {
  //   capable: true,
  //   statusBarStyle: "default",
  //   title: "Mongol",
  // },
  // formatDetection: {
  //  telephone: false,
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(ptSans.variable, spaceGrotesk.variable)}>
      <head>
        {/* <link rel="manifest" href="/manifest.json" /> */}
        {/* <meta name="theme-color" content="#3F51B5" /> */}
        {/* <meta name="apple-mobile-web-app-capable" content="yes" /> */}
        {/* <meta name="apple-mobile-web-app-status-bar-style" content="default" /> */}
        {/* <meta name="apple-mobile-web-app-title" content="Mongol" /> */}
        {/* <link rel="apple-touch-icon" href="/icons/icon-192x192.png" /> */}
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
