import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import AuthProvider from '@/components/shared/AuthProvider';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'Relax Cabin — Premium Cabin & Property Rentals', template: '%s | Relax Cabin' },
  description: 'Discover handpicked luxury cabin retreats nestled in nature. Book your perfect escape today with Relax Cabin.',
  keywords: ['cabin rental', 'vacation rental', 'mountain cabin', 'forest retreat', 'luxury cabin'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
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
