import ProtectedRoute from '@/components/shared/ProtectedRoute';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-dashboard pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-6 lg:items-stretch">
            <DashboardSidebar />
            <main className="flex-1 min-w-0">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
