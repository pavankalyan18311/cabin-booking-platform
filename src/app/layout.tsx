import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import AuthProvider from '@/components/shared/AuthProvider';
import HashScroll from '@/components/shared/HashScroll';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  axes: ['opsz', 'SOFT', 'WONK'],
});

export const metadata: Metadata = {
  title: { default: 'Relaxin Cabins — New Lisbon, WI', template: '%s | Relaxin Cabins' },
  description: '7 unique rentals in New Lisbon, WI — traditional log cabins, beachside luxury suites, and a grand lodge. Open year-round, pet-friendly, minutes from Castle Rock Lake.',
  keywords: ['cabin rental', 'New Lisbon WI', 'Wisconsin cabin', 'Castle Rock Lake', 'pet friendly cabin', 'vacation rental Wisconsin'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <HashScroll />
            <Navbar />
            <main className="flex-1 pb-16 lg:pb-0">{children}</main>
            <Footer />
            <MobileBottomNav />
            <Toaster position="top-right" richColors closeButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
