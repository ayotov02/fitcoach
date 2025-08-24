import { SignupForm } from '@/components/auth/signup-form';
import { MainLayout } from '@/components/layout/main-layout';

export default function SignupPage() {
  return (
    <MainLayout>
      <div className="container flex min-h-screen w-screen flex-col items-center justify-center py-8">
        <SignupForm />
      </div>
    </MainLayout>
  );
}