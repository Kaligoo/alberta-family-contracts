'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Download, CheckCircle, ArrowLeft, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

export default function ContractDownloadPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const contractId = params.id as string;
  const sessionId = searchParams.get('session_id');
  
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('Payment session not found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/stripe/verify-payment?session_id=${sessionId}`);
        const data = await response.json();
        
        if (response.ok && data.paid) {
          setPaymentVerified(true);
        } else {
          setError(data.error || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setError('Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  const handleDownload = async () => {
    setIsDownloading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/contracts/${contractId}/pdf`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `cohabitation-agreement-${contractId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        setError('Failed to download contract');
      }
    } catch (error) {
      console.error('Error downloading contract:', error);
      setError('Failed to download contract');
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-gray-600">Verifying payment...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (error || !paymentVerified) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Issue</h3>
                <p className="text-gray-600 mb-6">
                  {error || 'Payment could not be verified. Please contact support.'}
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href={`/dashboard/contracts/${contractId}/preview`}>
                    <Button variant="outline">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Preview
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button>Contact Support</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Payment Successful!</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-6">
              <p className="text-gray-600">
                Your payment has been processed successfully. Your professional cohabitation agreement is now ready for download.
              </p>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Alberta Cohabitation Agreement</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Professional legal document customized for your situation
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <span>✓ Legally compliant</span>
                  <span>✓ Alberta-specific</span>
                  <span>✓ Ready to sign</span>
                </div>
              </div>

              <Button 
                onClick={handleDownload}
                disabled={isDownloading}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-3"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download Your Contract
                  </>
                )}
              </Button>

              <div className="text-sm text-gray-500">
                <p>
                  Having issues? <Link href="/contact" className="text-orange-500 hover:underline">Contact our support team</Link>
                </p>
              </div>

              <div className="border-t pt-6">
                <Link href="/dashboard/contracts">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Contracts
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Receipt */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Payment Receipt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Item:</span>
                <span>Alberta Cohabitation Agreement</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span>$700.00 CAD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span>Credit Card</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Paid</span>
              </div>
              {sessionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-xs">{sessionId.slice(0, 20)}...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}