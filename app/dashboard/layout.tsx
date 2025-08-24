import { requireAuth } from '@/lib/auth/auth-helpers';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default async function DashboardLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure user is authenticated before rendering dashboard
  await requireAuth();

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}