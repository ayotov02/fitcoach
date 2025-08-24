import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'FitCoach - AI-Powered Fitness Coaching Platform',
  description: 'Empowering fitness coaches with AI-driven insights and modern tools for better client management and workout planning.',
  keywords: ['fitness', 'coaching', 'AI', 'workout', 'training', 'health'],
  authors: [{ name: 'FitCoach Team' }],
  creator: 'FitCoach',
  publisher: 'FitCoach',
  openGraph: {
    type: 'website',
    title: 'FitCoach - AI-Powered Fitness Coaching Platform',
    description: 'Empowering fitness coaches with AI-driven insights and modern tools.',
    siteName: 'FitCoach',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FitCoach - AI-Powered Fitness Coaching Platform',
    description: 'Empowering fitness coaches with AI-driven insights and modern tools.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}