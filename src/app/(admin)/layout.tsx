import Image from 'next/image';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-stone-50">

        {/* Hero — navbar overlays this transparently */}
        <div className="relative h-52 lg:h-60 overflow-hidden">
          <Image
            src="/gallery/gallery-2.jpg"
            fill
            className="object-cover object-center"
            alt=""
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/40 to-transparent" />
        </div>

        {/* Content overlaps hero bottom edge */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10 lg:-mt-14 relative z-10 pb-10 lg:pb-14">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-6 lg:items-stretch">
            <AdminSidebar />
            <main className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-stone-100 p-5 sm:p-6">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}
