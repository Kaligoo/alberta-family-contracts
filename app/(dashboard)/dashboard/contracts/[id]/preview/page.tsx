'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Edit, Loader2, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ContractPreviewPage() {
  const params = useParams();
  const contractId = params.id as string;
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { data: contractData } = useSWR(
    `/api/contracts/${contractId}`,
    fetcher
  );

  useEffect(() => {
    const generatePdfPreview = async () => {
      if (!contractId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/contracts/${contractId}/pdf-preview`);
        
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        } else {
          setError('Failed to generate PDF preview');
        }
      } catch (err) {
        console.error('Error generating PDF preview:', err);
        setError('Failed to load PDF preview');
      } finally {
        setIsLoading(false);
      }
    };

    generatePdfPreview();

    // Cleanup URL when component unmounts
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [contractId]);

  const handlePurchase = async () => {
    try {
      const response = await fetch(`/api/contracts/${contractId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
    }
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
              <Button 
                onClick={handlePurchase}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Purchase - $735 CAD
              </Button>
            </div>
          </div>
        </div>

        {/* PDF Preview */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-[800px] rounded-lg"
              title="Contract Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-[800px]">
              <p className="text-gray-400">Unable to load PDF preview</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-4">
            This preview shows the first page of your contract. Purchase to download the complete document.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard/edit-contract">
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Make Changes
              </Button>
            </Link>
            <Button 
              onClick={handlePurchase}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Purchase Complete Agreement - $735 CAD
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}