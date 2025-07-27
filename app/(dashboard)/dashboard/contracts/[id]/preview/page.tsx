'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Download, Edit, Printer, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Contract {
  id: number;
  userFullName: string;
  partnerFullName: string;
  userJobTitle: string;
  partnerJobTitle: string;
  userIncome: string;
  partnerIncome: string;
  children: Array<{
    name: string;
    age?: number;
    relationship: 'biological' | 'step' | 'adopted';
    parentage: 'user' | 'partner' | 'both';
  }>;
  contractType: string;
  status: string;
  residenceAddress: string;
  residenceOwnership: string;
  expenseSplitType: string;
  additionalClauses: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export default function ContractPreviewPage() {
  const params = useParams();
  const contractId = params.id as string;
  
  const { data: contractData, error } = useSWR(
    `/api/contracts/${contractId}`,
    fetcher
  );

  const contract: Contract = contractData?.contract;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: string) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(parseFloat(amount));
  };

  if (error) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-600">Failed to load contract. Please try again.</p>
              <Link href="/dashboard/contracts" className="inline-block mt-4">
                <Button variant="outline">Back to Contracts</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (!contractData) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-gray-600">Loading contract preview...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href={`/dashboard/contracts/${contractId}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Edit
          </Link>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Contract Preview</h1>
              <p className="text-gray-600">
                Review your cohabitation agreement before finalizing.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/contracts/${contractId}`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
          
          {/* Purchase Button - Moved to top */}
          <div className="flex justify-center mb-6">
            <PaymentButton contractId={contractId} />
          </div>
        </div>

        {/* Contract Document Preview */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  COHABITATION AGREEMENT
                </h1>
                <p className="text-lg text-gray-600">Province of Alberta, Canada</p>
                <p className="text-sm text-gray-500 mt-4">
                  Document created on {formatDate(contract.createdAt)}
                </p>
              </div>

              {/* Parties */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">PARTIES</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900">Party A</h3>
                      <p className="text-gray-700">{contract.userFullName || 'Not specified'}</p>
                      {contract.userJobTitle && (
                        <p className="text-sm text-gray-600">Occupation: {contract.userJobTitle}</p>
                      )}
                      {contract.userIncome && (
                        <p className="text-sm text-gray-600">Annual Income: {formatCurrency(contract.userIncome)}</p>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Party B</h3>
                      <p className="text-gray-700">{contract.partnerFullName || 'Not specified'}</p>
                      {contract.partnerJobTitle && (
                        <p className="text-sm text-gray-600">Occupation: {contract.partnerJobTitle}</p>
                      )}
                      {contract.partnerIncome && (
                        <p className="text-sm text-gray-600">Annual Income: {formatCurrency(contract.partnerIncome)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Residence */}
              {contract.residenceAddress && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">RESIDENCE</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 mb-2">
                      <strong>Address:</strong> {contract.residenceAddress}
                    </p>
                    {contract.residenceOwnership && (
                      <p className="text-gray-700">
                        <strong>Ownership:</strong> {contract.residenceOwnership.charAt(0).toUpperCase() + contract.residenceOwnership.slice(1)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Financial Arrangements */}
              {contract.expenseSplitType && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">FINANCIAL ARRANGEMENTS</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">
                      <strong>Expense Split:</strong> {
                        contract.expenseSplitType === 'equal' ? 'Equal split (50/50)' :
                        contract.expenseSplitType === 'proportional' ? 'Proportional to income' :
                        contract.expenseSplitType === 'custom' ? 'Custom arrangement' :
                        contract.expenseSplitType
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Additional Clauses */}
              {contract.additionalClauses && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">ADDITIONAL TERMS AND CONDITIONS</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{contract.additionalClauses}</p>
                  </div>
                </div>
              )}

              {/* Standard Clauses */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">STANDARD PROVISIONS</h2>
                <div className="space-y-4 text-gray-700">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">1. INTERPRETATION</h3>
                    <p className="text-sm">This Agreement shall be governed by and interpreted in accordance with the laws of the Province of Alberta and the laws of Canada applicable therein.</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">2. FINANCIAL INDEPENDENCE</h3>
                    <p className="text-sm">Each party acknowledges that they are financially independent and capable of supporting themselves.</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">3. PROPERTY RIGHTS</h3>
                    <p className="text-sm">Property owned by each party before cohabitation shall remain the separate property of that party.</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">4. AMENDMENT</h3>
                    <p className="text-sm">This Agreement may only be amended by written agreement signed by both parties.</p>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">SIGNATURES</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="border-t border-gray-300 pt-4">
                    <p className="text-sm text-gray-600 mb-2">Party A Signature</p>
                    <p className="font-medium">{contract.userFullName}</p>
                    <p className="text-sm text-gray-500">Date: ________________</p>
                  </div>
                  <div className="border-t border-gray-300 pt-4">
                    <p className="text-sm text-gray-600 mb-2">Party B Signature</p>
                    <p className="font-medium">{contract.partnerFullName}</p>
                    <p className="text-sm text-gray-500">Date: ________________</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center">
          <Link href={`/dashboard/contracts/${contractId}`}>
            <Button variant="outline" size="lg">
              <Edit className="mr-2 h-4 w-4" />
              Make Changes
            </Button>
          </Link>
        </div>

        {contract.notes && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Personal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{contract.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}

function PaymentButton({ contractId }: { contractId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Payment button clicked for contract:', contractId);
    setIsLoading(true);
    setError('');

    try {
      console.log('Making payment request...');
      const response = await fetch(`/api/contracts/${contractId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Payment response status:', response.status);
      console.log('Payment response headers:', Object.fromEntries(response.headers.entries()));
      
      const text = await response.text();
      console.log('Payment response text:', text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        setError('Invalid response from server');
        return;
      }
      
      console.log('Payment response data:', data);

      if (response.ok && data.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        window.location.href = data.url;
      } else {
        console.error('Payment error:', data);
        setError(data.error || `Failed to create payment session (Status: ${response.status})`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Network error: Failed to initiate payment. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a simple test function
  const testClick = () => {
    console.log('Button clicked - basic test working');
    alert('Button click detected! Check console for payment details.');
    handlePayment();
  };

  return (
    <div className="text-center">
      <Button 
        onClick={testClick}
        disabled={isLoading}
        size="lg" 
        className="bg-orange-500 hover:bg-orange-600 px-8 py-3"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Purchase Complete Agreement - $700 CAD
          </>
        )}
      </Button>
      {error && (
        <p className="text-red-600 text-sm mt-2 max-w-md mx-auto">{error}</p>
      )}
      <p className="text-xs text-gray-500 mt-2">
        Secure payment processed by Stripe
      </p>
    </div>
  );
}