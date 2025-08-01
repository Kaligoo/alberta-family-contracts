'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function AffiliateTrackerInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    
    if (ref) {
      // Store affiliate code in localStorage
      localStorage.setItem('affiliateCode', ref);
      
      // Track affiliate click
      fetch('/api/affiliate/track-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: ref }),
      }).catch(console.error);
    }
  }, [searchParams]);

  useEffect(() => {
    // Check for coupon code in URL
    const coupon = searchParams.get('coupon');
    
    if (coupon) {
      localStorage.setItem('couponCode', coupon);
    }
  }, [searchParams]);

  return null; // This component doesn't render anything
}

export default function AffiliateTracker() {
  return (
    <Suspense fallback={null}>
      <AffiliateTrackerInner />
    </Suspense>
  );
}