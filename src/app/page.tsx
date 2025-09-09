'use client';

import Dashboard from '@/components/app/dashboard';
import Header from '@/components/app/header';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';

export default function Home() {
  const { user, loading, loginWithGoogle } = useAuth();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <p>Loading...</p>
          </div>
        ) : user ? (
          <Dashboard />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              FuelWise에 오신 것을 환영합니다
            </h1>
            <p className="text-muted-foreground">
              시작하려면 구글 계정으로 로그인하세요.
            </p>
            <Button
              size="lg"
              onClick={loginWithGoogle}
              className="gap-2"
            >
              <FcGoogle className="h-5 w-5" />
              Google로 로그인
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
