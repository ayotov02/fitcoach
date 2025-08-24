import { LoginForm } from '@/components/auth/login-form';
import { MainLayout } from '@/components/layout/main-layout';

export default function LoginPage() {
  return (
    <MainLayout>
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <LoginForm />
      </div>
    </MainLayout>
  );
}