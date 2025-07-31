'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Edit, Loader2, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { isContractPaid } from '@/lib/utils/payment';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ContractPreviewPage() {
  const params = useParams();
  const contractId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfReady, setPdfReady] = useState(false);
  
  const { data: contractData, mutate } = useSWR(
    `/api/contracts/${contractId}`,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  );

  const contract = contractData?.contract;
  const isPaid = isContractPaid(contract);
  
  // Hide purchase button if contract is paid
  const shouldHidePurchaseButton = isPaid;
  

  // Force data refresh on mount to ensure we have latest payment status
  useEffect(() => {
    if (contractId) {
      mutate();
    }
  }, [contractId, mutate]);

  useEffect(() => {
    const checkPdfAvailability = async () => {
      if (!contractId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Test if the PDF endpoint is working
        const response = await fetch(`/api/contracts/${contractId}/pdf-preview`, {
          method: 'HEAD' // Just check if endpoint is available
        });
        
        if (response.ok) {
          setPdfReady(true);
        } else {
          setError('Failed to generate PDF preview');
        }
      } catch (err) {
        console.error('Error checking PDF availability:', err);
        setError('Failed to load PDF preview');
      } finally {
        setIsLoading(false);
      }
    };

    checkPdfAvailability();
  }, [contractId]);

  // Direct URL to the PDF endpoint
  const pdfUrl = contractId ? `/api/contracts/${contractId}/pdf-preview` : null;

  const handlePurchase = () => {
    // Don't navigate if contract is already paid
    if (isPaid) return;
    
    // Navigate to the embedded purchase page instead of directly to Stripe
    window.location.href = `/dashboard/contracts/${contractId}/purchase`;
  };

  if (isLoading) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Generating PDF preview...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href={`/dashboard/edit-contract`}>
              <Button variant="outline">Back to Edit Contract</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/dashboard/edit-contract"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Edit Contract
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Preview & Review</h1>
              <p className="text-gray-600">
                Review the first page of your cohabitation agreement
              </p>
            </div>
            
            <div className="flex gap-3">
              <Link href="/dashboard/edit-contract">
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Contract
                </Button>
              </Link>
              {!shouldHidePurchaseButton && (
                <Button 
                  onClick={handlePurchase}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Purchase - $735 CAD
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* PDF Preview */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          {pdfReady && pdfUrl ? (
            <div className="space-y-4">
              {/* Primary PDF viewer - iframe */}
              <div className="w-full h-[700px] border border-gray-200 rounded">
                <iframe
                  src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&page=1&zoom=FitH`}
                  className="w-full h-full rounded"
                  title="Contract Preview"
                  style={{ border: 'none' }}
                />
              </div>
              
              {/* Fallback PDF viewer - embed */}
              <div className="w-full h-[700px] border border-gray-200 rounded hidden" id="pdf-embed-fallback">
                <embed
                  src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  type="application/pdf"
                  className="w-full h-full rounded"
                />
              </div>
              
              <div className="text-center border-t pt-4">
                <p className="text-sm text-gray-600 mb-3">
                  Having trouble viewing the PDF? Try these options:
                </p>
                <div className="flex justify-center gap-4">
                  <a 
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    Open in new tab
                  </a>
                  <a 
                    href={pdfUrl}
                    download="contract-preview.pdf"
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    Download PDF
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[700px]">
              <p className="text-gray-400">Unable to load PDF preview</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-4">
            {isPaid 
              ? "This preview shows the first page of your contract. Your complete agreement is available for download."
              : "This preview shows the first page of your contract. Purchase to download the complete document."
            }
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard/edit-contract">
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Make Changes
              </Button>
            </Link>
            {!isPaid && (
              <Button 
                onClick={handlePurchase}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Purchase Complete Agreement - $735 CAD
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}