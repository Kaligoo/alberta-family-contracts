'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function PurchaseSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // This page should no longer be used - redirect to send-to-lawyer page
    // Extract contractId from session metadata if available, otherwise go to dashboard
    if (sessionId) {
      // In a real implementation, you might want to fetch the session details to get the contractId
      // For now, we'll redirect to dashboard
      router.replace('/dashboard');
    } else {
      router.replace('/dashboard');
    }
  }, [sessionId, router]);

  // Show loading state while redirecting
  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    </section>
  );
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={<div className="flex-1 p-4 lg:p-8"><div className="max-w-3xl mx-auto"><div className="text-center py-12">Loading...</div></div></div>}>
      <PurchaseSuccessContent />
    </Suspense>
  );
}