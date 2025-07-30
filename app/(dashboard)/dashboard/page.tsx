'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Always redirect to get-started as the default dashboard experience
    router.push('/dashboard/get-started');
  }, [router]);

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <span className="ml-2 text-gray-600">Redirecting to get started...</span>
        </div>
      </div>
    </section>
  );
}