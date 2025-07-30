'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Download, Edit, Printer, Loader2, FileText, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { StepIndicator } from '@/components/ui/step-indicator';

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
    birthdate?: string;
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
          
          {/* Step Indicator */}
          <StepIndicator
            steps={[
              { id: 'edit', name: 'Fill Out Form' },
              { id: 'preview', name: 'Preview Contract' },
              { id: 'purchase', name: 'Purchase & Download' },
            ]}
            currentStep="preview"
            completedSteps={['edit']}
          />
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Step 2: Preview Contract</h1>
              <p className="text-gray-600">
                Review your cohabitation agreement before purchasing.
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
        </div>

        {/* Contract Document Preview - Matching Word Template Exactly */}
        <div className="bg-white shadow-lg border border-gray-200 mb-6" style={{ fontFamily: 'Times, "Times New Roman", serif' }}>
          <div className="p-8 md:p-12 lg:p-16 max-w-[8.5in] mx-auto text-black">
            
            {/* Page Header - Exactly as in Word template */}
            <div className="text-center mb-8">
              <p className="text-lg leading-relaxed mb-4">
                {contract.userFullName || '[Your Name]'} (hereinafter referred to as "{contract.userFirstName || contract.userFullName?.split(' ')[0] || '[Your First Name]'}")
              </p>
              <p className="text-lg leading-relaxed mb-4">- and -</p>
              <p className="text-lg leading-relaxed mb-8">
                {contract.partnerFullName || '[Partner Name]'} (hereinafter referred to as "{contract.partnerFirstName || contract.partnerFullName?.split(' ')[0] || '[Partner First Name]'}")
              </p>
              
              <div className="border-b-2 border-black w-96 mx-auto mb-2"></div>
              <div className="border-b border-black w-48 mx-auto mb-6"></div>
              
              <h1 className="text-2xl font-bold tracking-wide mb-6">
                COHABITATION AND PRENUPTIAL AGREEMENT
              </h1>
              
              <div className="border-b-2 border-black w-96 mx-auto mb-2"></div>
              <div className="border-b border-black w-48 mx-auto mb-8"></div>
              
              <div className="text-left max-w-sm mx-auto mb-8">
                <p className="text-sm leading-relaxed">
                  Drafted by Garrett Horvath<br/>
                  Kahane Law LLP<br/>
                  7309 Flint Rd SE<br/>
                  Calgary, Alberta T2H 1G4<br/>
                  ghorvath@kahanelaw.com<br/>
                  Ph: 403-910-5387
                </p>
              </div>
            </div>

            {/* Agreement Header */}
            <div className="mb-8">
              <p className="text-base font-bold mb-6">
                THIS AGREEMENT MADE effective upon execution by both parties.
              </p>
              
              <p className="text-base font-bold mb-4">BETWEEN:</p>
              
              <p className="text-base leading-relaxed mb-4">
                {contract.userFullName || '[Your Name]'} (hereinafter referred to as "{contract.userFirstName || contract.userFullName?.split(' ')[0] || '[Your First Name]'}")
              </p>
              
              <p className="text-base leading-relaxed mb-4">- and -</p>
              
              <p className="text-base leading-relaxed mb-8">
                {contract.partnerFullName || '[Partner Name]'} (hereinafter referred to as "{contract.partnerFirstName || contract.partnerFullName?.split(' ')[0] || '[Partner First Name]'}")
              </p>
            </div>

            {/* Main Title */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold tracking-wide">
                COHABITATION AND PRENUPTIAL AGREEMENT
              </h2>
            </div>

            {/* Part I: Recitals */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-6">PART I: RECITALS</h3>
              
              <div className="space-y-4 text-base leading-relaxed">
                <p>
                  {contract.userFirstName || contract.userFullName?.split(' ')[0] || '[Your First Name]'} and {contract.partnerFirstName || contract.partnerFullName?.split(' ')[0] || '[Partner First Name]'} currently live together. They are engaged to be married and intend to be married [Marriage Date].
                </p>
                
                <p>
                  {contract.userFirstName || contract.userFullName?.split(' ')[0] || '[Your First Name]'} and {contract.partnerFirstName || contract.partnerFullName?.split(' ')[0] || '[Partner First Name]'} have resided together since {contract.cohabDate ? formatDate(contract.cohabDate) : '[Cohabitation Start Date]'}.
                </p>
                
                <p>
                  {contract.userFirstName || contract.userFullName?.split(' ')[0] || '[Your First Name]'}, presently age {contract.userAge || '[Your Age]'}, owns assets and is responsible for debts as set out in the attached Schedule A. {contract.userJobTitle ? `She is presently ${contract.userJobTitle}.` : 'She is presently [Your Occupation].'} {contract.userIncome ? `Her current income is approximately ${formatCurrency(contract.userIncome)} annually.` : 'Her current income is approximately [Your Annual Income] annually.'}
                </p>
                
                <p>
                  {contract.partnerFirstName || contract.partnerFullName?.split(' ')[0] || '[Partner First Name]'}, presently age {contract.partnerAge || '[Partner Age]'}, owns assets and is responsible for debts as set out in the attached Schedule B. {contract.partnerJobTitle ? `He is presently ${contract.partnerJobTitle}.` : 'He is presently [Partner Occupation].'} {contract.partnerIncome ? `His current income is approximately ${formatCurrency(contract.partnerIncome)} annually.` : 'His current income is approximately [Partner Annual Income] annually.'}
                </p>
                
                <p>
                  {contract.children && contract.children.length > 0 
                    ? `The parties have ${contract.children.length} child${contract.children.length > 1 ? 'ren' : ''} as detailed in this agreement: ${contract.children.map((child: any) => {
                        const childInfo = child.name;
                        if (child.birthdate) {
                          const birthYear = new Date(child.birthdate).getFullYear();
                          return `${childInfo} (born ${birthYear})`;
                        }
                        return childInfo;
                      }).join(', ')}.`
                    : 'There are no children of the relationship as of the Effective Date of this Agreement. The parties may or may not have children together in the future, either biological or adopted.'
                  }
                </p>
                
                <p>
                  {contract.userFirstName || contract.userFullName?.split(' ')[0] || '[Your First Name]'} and {contract.partnerFirstName || contract.partnerFullName?.split(' ')[0] || '[Partner First Name]'} acknowledge that she/he:
                </p>
                
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>has had independent legal advice as evidenced by the execution of the certificates attached to this Agreement;</li>
                  <li>understands his or her respective rights and obligations under this Agreement; and</li>
                  <li>is signing this Agreement voluntarily and is under no duress or undue influence from the other party.</li>
                </ul>
                
                <p>
                  {contract.userFirstName || contract.userFullName?.split(' ')[0] || '[Your First Name]'} and {contract.partnerFirstName || contract.partnerFullName?.split(' ')[0] || '[Partner First Name]'} have been advised and informed of the assets and liabilities of the other as of the Effective Date of this Agreement through the completion of and exchange of their respective Schedules, attached to this Agreement.
                </p>
              </div>
            </div>

            {/* Property Section - Based on residence information */}
            {contract.residenceAddress && (
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">{contract.residenceAddress} (the "House")</h3>
                
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    The parties have purchased or reside at the property located at {contract.residenceAddress}. The parties have resided together at this property.
                  </p>
                  
                  {contract.residenceOwnership && (
                    <p>
                      The property ownership structure is: {contract.residenceOwnership.charAt(0).toUpperCase() + contract.residenceOwnership.slice(1)}.
                    </p>
                  )}
                  
                  {contract.expenseSplitType && (
                    <p>
                      The parties agree that they are sharing the costs of the residence {
                        contract.expenseSplitType === 'equal' ? 'equally' :
                        contract.expenseSplitType === 'proportional' ? 'proportionally based on income' :
                        'according to their custom arrangement'
                      }.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Additional Clauses */}
            {contract.additionalClauses && (
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">ADDITIONAL TERMS</h3>
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {contract.additionalClauses}
                </p>
              </div>
            )}

            {/* Signature Section - Legal Format */}
            <div className="mt-12 pt-8">
              <p className="text-center font-bold mb-8">
                [Remainder of page intentionally left blank]
              </p>
              
              <div className="mt-16">
                <h3 className="text-lg font-bold text-center mb-8">EXECUTION</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div>
                    <div className="mb-4">
                      <div className="border-b-2 border-black h-12 mb-2"></div>
                      <p className="font-bold">{contract.userFullName || '[Your Full Name]'}</p>
                      <p className="text-sm">({contract.userFirstName || contract.userFullName?.split(' ')[0] || '[Your First Name]'})</p>
                    </div>
                    
                    <div className="mt-8">
                      <div className="border-b border-black w-32 mb-2"></div>
                      <p className="text-sm">Date</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-4">
                      <div className="border-b-2 border-black h-12 mb-2"></div>
                      <p className="font-bold">{contract.partnerFullName || '[Partner Full Name]'}</p>
                      <p className="text-sm">({contract.partnerFirstName || contract.partnerFullName?.split(' ')[0] || '[Partner First Name]'})</p>
                    </div>
                    
                    <div className="mt-8">
                      <div className="border-b border-black w-32 mb-2"></div>
                      <p className="text-sm">Date</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Section - if available */}
            {(contract.userEmail || contract.partnerEmail || contract.userPhone || contract.partnerPhone || contract.userAddress || contract.partnerAddress) && (
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">CONTACT INFORMATION</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-base leading-relaxed">
                  <div>
                    <p className="font-bold mb-2">{contract.userFirstName || contract.userFullName?.split(' ')[0] || '[Your First Name]'}:</p>
                    {contract.userEmail && <p>Email: {contract.userEmail}</p>}
                    {contract.userPhone && <p>Phone: {contract.userPhone}</p>}
                    {contract.userAddress && <p>Address: {contract.userAddress}</p>}
                  </div>
                  
                  <div>
                    <p className="font-bold mb-2">{contract.partnerFirstName || contract.partnerFullName?.split(' ')[0] || '[Partner First Name]'}:</p>
                    {contract.partnerEmail && <p>Email: {contract.partnerEmail}</p>}
                    {contract.partnerPhone && <p>Phone: {contract.partnerPhone}</p>}
                    {contract.partnerAddress && <p>Address: {contract.partnerAddress}</p>}
                  </div>
                </div>
              </div>
            )}


            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-300 text-xs text-gray-600">
              <p className="text-center">
                This document is a preview generated by Alberta Family Contracts on {formatDate(contract.createdAt)}
              </p>
              <p className="text-center mt-2">
                Contract ID: #{contract.id} | Status: {contract.status || 'Draft'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Following the new workflow */}
        <div className="space-y-6">
          {/* Step 3: Purchase Button - Primary Action */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Step 3: Purchase & Download</h3>
            <PaymentButton contractId={contractId} />
          </div>
          
          {/* Additional Options */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <PdfPreviewButton contractId={contractId} />
            <ProfessionalDocumentButton contractId={contractId} />
            <Link href={`/dashboard/contracts/${contractId}`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Make Changes
              </Button>
            </Link>
          </div>
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

function PdfPreviewButton({ contractId }: { contractId: string }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handlePdfPreview = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch(`/api/contracts/${contractId}/pdf`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `contract-${contractId}-preview.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate PDF preview');
      }
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      setError('Failed to generate PDF preview. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button 
        onClick={handlePdfPreview}
        disabled={isGenerating}
        variant="outline"
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating PDF Preview...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Preview PDF
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