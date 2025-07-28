'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Download, Edit, Printer, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Contract {
  id: number;
  userFullName: string;
  partnerFullName: string;
  userFirstName: string;
  partnerFirstName: string;
  userAge: number;
  partnerAge: number;
  cohabDate: string;
  userJobTitle: string;
  partnerJobTitle: string;
  userIncome: string;
  partnerIncome: string;
  userEmail: string;
  partnerEmail: string;
  userPhone: string;
  partnerPhone: string;
  userAddress: string;
  partnerAddress: string;
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
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <div className="flex-1 max-w-xs">
              <ProfessionalDocumentButton contractId={contractId} />
            </div>
            <div className="flex-1 max-w-xs">
              <PaymentButton contractId={contractId} />
            </div>
          </div>
        </div>

        {/* Contract Document Preview - Legal Document Style */}
        <div className="bg-white shadow-lg border border-gray-200 mb-6" style={{ fontFamily: 'Times, "Times New Roman", serif' }}>
          <div className="p-8 md:p-12 lg:p-16 min-h-[11in] max-w-[8.5in] mx-auto">
            {/* Document Header */}
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-black mb-3 tracking-wide">
                COHABITATION AGREEMENT
              </h1>
              <div className="border-b-2 border-black w-64 mx-auto mb-4"></div>
              <p className="text-xl text-black font-medium">Province of Alberta, Canada</p>
              <p className="text-sm text-gray-600 mt-6">
                This agreement was created on {formatDate(contract.createdAt)}
              </p>
            </div>

            {/* Parties Section */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-black mb-6 text-center border-b border-gray-300 pb-2">
                THE PARTIES
              </h2>
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-none">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg text-black mb-3">FIRST PARTY:</h3>
                    <div className="ml-4 space-y-2">
                      <p className="text-black"><strong>Name:</strong> {contract.userFullName || '[First Party Name]'}</p>
                      {contract.userJobTitle && (
                        <p className="text-black"><strong>Occupation:</strong> {contract.userJobTitle}</p>
                      )}
                      {contract.userIncome && (
                        <p className="text-black"><strong>Annual Income:</strong> {formatCurrency(contract.userIncome)}</p>
                      )}
                      {contract.userEmail && (
                        <p className="text-black"><strong>Email:</strong> {contract.userEmail}</p>
                      )}
                      {contract.userPhone && (
                        <p className="text-black"><strong>Phone:</strong> {contract.userPhone}</p>
                      )}
                      {contract.userAddress && (
                        <p className="text-black"><strong>Address:</strong> {contract.userAddress}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-300 pt-6">
                    <h3 className="font-bold text-lg text-black mb-3">SECOND PARTY:</h3>
                    <div className="ml-4 space-y-2">
                      <p className="text-black"><strong>Name:</strong> {contract.partnerFullName || '[Second Party Name]'}</p>
                      {contract.partnerJobTitle && (
                        <p className="text-black"><strong>Occupation:</strong> {contract.partnerJobTitle}</p>
                      )}
                      {contract.partnerIncome && (
                        <p className="text-black"><strong>Annual Income:</strong> {formatCurrency(contract.partnerIncome)}</p>
                      )}
                      {contract.partnerEmail && (
                        <p className="text-black"><strong>Email:</strong> {contract.partnerEmail}</p>
                      )}
                      {contract.partnerPhone && (
                        <p className="text-black"><strong>Phone:</strong> {contract.partnerPhone}</p>
                      )}
                      {contract.partnerAddress && (
                        <p className="text-black"><strong>Address:</strong> {contract.partnerAddress}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Residence Section */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-black mb-6 text-center border-b border-gray-300 pb-2">
                RESIDENCE
              </h2>
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-none">
                <div className="space-y-3">
                  <p className="text-black text-lg leading-relaxed">
                    <strong>Property Address:</strong> {contract.residenceAddress || '[Residence Address]'}
                  </p>
                  {contract.residenceOwnership && (
                    <p className="text-black text-lg leading-relaxed">
                      <strong>Ownership Structure:</strong> {contract.residenceOwnership.charAt(0).toUpperCase() + contract.residenceOwnership.slice(1)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Arrangements */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-black mb-6 text-center border-b border-gray-300 pb-2">
                FINANCIAL ARRANGEMENTS
              </h2>
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-none">
                <div className="space-y-4">
                  <p className="text-black text-lg leading-relaxed">
                    <strong>Expense Sharing:</strong> {
                      contract.expenseSplitType === 'equal' ? 'All household expenses shall be split equally between both parties (50/50).' :
                      contract.expenseSplitType === 'proportional' ? 'Household expenses shall be allocated proportionally based on each party\'s respective income.' :
                      contract.expenseSplitType === 'custom' ? 'Household expenses shall be managed according to custom arrangements as agreed upon by both parties.' :
                      contract.expenseSplitType || 'To be determined by mutual agreement.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Standard Legal Provisions */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-black mb-6 text-center border-b border-gray-300 pb-2">
                TERMS AND CONDITIONS
              </h2>
              <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-none">
                  <h3 className="font-bold text-lg text-black mb-3">1. INTERPRETATION</h3>
                  <p className="text-black text-base leading-relaxed">
                    This Agreement shall be governed by and interpreted in accordance with the laws of the Province of Alberta and the laws of Canada applicable therein. Any disputes arising from this Agreement shall be resolved in the courts of Alberta.
                  </p>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-none">
                  <h3 className="font-bold text-lg text-black mb-3">2. FINANCIAL INDEPENDENCE</h3>
                  <p className="text-black text-base leading-relaxed">
                    Each party acknowledges that they are financially independent and capable of supporting themselves. Neither party shall be responsible for the debts or financial obligations of the other party incurred before or during the cohabitation.
                  </p>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-none">
                  <h3 className="font-bold text-lg text-black mb-3">3. PROPERTY RIGHTS</h3>
                  <p className="text-black text-base leading-relaxed">
                    Property owned by each party before the commencement of cohabitation shall remain the separate property of that party. Any property acquired jointly during cohabitation shall be owned in proportion to each party's financial contribution.
                  </p>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-none">
                  <h3 className="font-bold text-lg text-black mb-3">4. AMENDMENT AND TERMINATION</h3>
                  <p className="text-black text-base leading-relaxed">
                    This Agreement may only be amended by written agreement signed by both parties in the presence of independent legal counsel. This Agreement shall terminate upon the cessation of cohabitation or by mutual written consent.
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Clauses */}
            {contract.additionalClauses && (
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-black mb-6 text-center border-b border-gray-300 pb-2">
                  ADDITIONAL TERMS
                </h2>
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-none">
                  <p className="text-black text-base leading-relaxed whitespace-pre-wrap">
                    {contract.additionalClauses}
                  </p>
                </div>
              </div>
            )}

            {/* Signatures */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-8 text-center border-b border-gray-300 pb-2">
                EXECUTION
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="text-center">
                  <div className="border-b-2 border-black mb-2 pb-8">
                    {/* Signature line */}
                  </div>
                  <p className="font-bold text-black">{contract.userFullName || '[First Party Name]'}</p>
                  <p className="text-sm text-black mt-1">First Party</p>
                  <div className="mt-4">
                    <div className="border-b border-black mb-1 w-32 mx-auto"></div>
                    <p className="text-sm text-black">Date</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="border-b-2 border-black mb-2 pb-8">
                    {/* Signature line */}
                  </div>
                  <p className="font-bold text-black">{contract.partnerFullName || '[Second Party Name]'}</p>
                  <p className="text-sm text-black mt-1">Second Party</p>
                  <div className="mt-4">
                    <div className="border-b border-black mb-1 w-32 mx-auto"></div>
                    <p className="text-sm text-black">Date</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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

function ProfessionalDocumentButton({ contractId }: { contractId: string }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateDocument = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch(`/api/contracts/${contractId}/generate-professional`, {
        method: 'POST',
      });

      if (response.ok) {
        // Handle file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Get filename from response headers
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition?.match(/filename="([^"]+)"/)?.[1] || 'professional-contract.docx';
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate professional document');
      }
    } catch (error) {
      console.error('Error generating document:', error);
      setError('Failed to generate document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleGenerateDocument}
        disabled={isGenerating}
        variant="outline"
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Professional Document...
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            Download Professional Document
          </>
        )}
      </Button>
      {error && (
        <p className="text-red-600 text-sm text-center">{error}</p>
      )}
    </div>
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

  const handlePaymentClick = (e: React.MouseEvent) => {
    handlePayment(e);
  };

  return (
    <div className="text-center">
      <Button 
        onClick={handlePaymentClick}
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