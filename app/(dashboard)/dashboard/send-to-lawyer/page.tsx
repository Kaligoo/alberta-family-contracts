'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Mail, Send, CheckCircle, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface LawyerOption {
  id: string;
  name: string;
  email: string;
  firm: string;
  party: 'user' | 'partner';
}

const lawyerOptions: LawyerOption[] = [
  {
    id: 'user-lawyer-1',
    name: 'Garrett Horvath',
    email: 'ghorvath@kahanelaw.com',
    firm: 'Kahane Law',
    party: 'user'
  },
  {
    id: 'user-lawyer-2', 
    name: 'Garrett Horvath',
    email: 'garrett.horvath@gmail.com',
    firm: 'Alternative Contact',
    party: 'user'
  },
  {
    id: 'partner-lawyer-1',
    name: 'Garrett Horvath',
    email: 'ghorvath@kahanelaw.com', 
    firm: 'Kahane Law',
    party: 'partner'
  },
  {
    id: 'partner-lawyer-2',
    name: 'Garrett Horvath',
    email: 'garrett.horvath@gmail.com',
    firm: 'Alternative Contact', 
    party: 'partner'
  }
];

function SendToLawyerPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const contractId = searchParams.get('contractId');
  const sessionId = searchParams.get('session_id');
  const paymentSuccess = searchParams.get('payment_success') === 'true';
  
  const [selectedLawyers, setSelectedLawyers] = useState<{
    user: string | null;
    partner: string | null;
  }>({
    user: null,
    partner: null
  });
  
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(!!sessionId);

  const { data: contractData, error } = useSWR(
    contractId ? `/api/contracts/${contractId}` : null,
    fetcher
  );

  const contract = contractData?.contract;

  // Verify payment if session_id is present
  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setPaymentLoading(false);
        // Check if contract is already paid
        if (contract?.isPaid) {
          setPaymentVerified(true);
        }
        return;
      }

      try {
        const response = await fetch(`/api/stripe/verify-payment?session_id=${sessionId}`);
        const data = await response.json();
        
        if (response.ok && data.paid) {
          setPaymentVerified(true);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
      } finally {
        setPaymentLoading(false);
      }
    };

    if (contractData) {
      verifyPayment();
    }
  }, [sessionId, contract?.isPaid, contractData]);

  const handleLawyerSelect = (party: 'user' | 'partner', lawyerId: string) => {
    setSelectedLawyers(prev => ({
      ...prev,
      [party]: lawyerId
    }));
  };

  const handleSendToLawyers = async () => {
    if (!selectedLawyers.user || !selectedLawyers.partner || !contractId) {
      return;
    }

    // Check payment status
    if (!paymentVerified && !contract?.isPaid) {
      setSendStatus({
        success: false,
        message: 'Payment must be completed before sending to lawyers. Please complete your purchase first.'
      });
      return;
    }

    setIsSending(true);
    setSendStatus(null);

    try {
      // First generate the Word document
      const docResponse = await fetch(`/api/contracts/${contractId}/generate-professional`, {
        method: 'POST'
      });

      if (!docResponse.ok) {
        throw new Error('Failed to generate contract document');
      }

      const docBlob = await docResponse.blob();

      // Get selected lawyer details
      const userLawyer = lawyerOptions.find(l => l.id === selectedLawyers.user);
      const partnerLawyer = lawyerOptions.find(l => l.id === selectedLawyers.partner);

      // Create FormData to send email with attachment
      const formData = new FormData();
      formData.append('contractId', contractId);
      formData.append('userLawyerEmail', userLawyer?.email || '');
      formData.append('userLawyerName', userLawyer?.name || '');
      formData.append('partnerLawyerEmail', partnerLawyer?.email || '');
      formData.append('partnerLawyerName', partnerLawyer?.name || '');
      formData.append('userFullName', contract?.userFullName || '');
      formData.append('partnerFullName', contract?.partnerFullName || '');
      formData.append('contractDocument', docBlob, `cohabitation-agreement-${contractId}.docx`);

      // Send to email API endpoint (to be created)
      const emailResponse = await fetch('/api/send-contract-to-lawyers', {
        method: 'POST',
        body: formData
      });

      if (emailResponse.ok) {
        setSendStatus({
          success: true,
          message: 'Contract successfully sent to both lawyers! They will contact you to schedule consultations.'
        });
      } else {
        const errorData = await emailResponse.json();
        setSendStatus({
          success: false,
          message: errorData.error || 'Failed to send contract to lawyers'
        });
      }
    } catch (error) {
      console.error('Error sending to lawyers:', error);
      setSendStatus({
        success: false,
        message: 'An error occurred while sending the contract'
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!contractId) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-600">Contract ID not provided.</p>
              <Link href="/dashboard" className="inline-block mt-4">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (error || (!contractData && contractId)) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-600">Failed to load contract. Please try again.</p>
              <Link href="/dashboard" className="inline-block mt-4">
                <Button variant="outline">Back to Dashboard</Button>
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
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-gray-600">Loading contract...</span>
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
            href="/dashboard" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Send Contract to Lawyers</h1>
          <p className="text-gray-600">
            Select legal counsel for both parties. Your contract will be sent as a Word document for review and consultation.
          </p>
        </div>

        {/* Payment Success Message */}
        {paymentSuccess && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-green-800">Purchase Successful!</h3>
                  <p className="text-green-700 text-sm">
                    Your payment has been processed and you will receive an email with the PDF of your contract. 
                    Now please select which lawyers you want to send the contract to. They will get in touch with you 
                    to book a meeting to provide independent legal advice and sign the agreement, in person or virtually.
                  </p>
                  <p className="text-green-700 text-sm mt-2 font-medium">
                    Remember: Both lawyers must be from separate law firms.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Required Message */}
        {!paymentLoading && !paymentVerified && !contract?.isPaid && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="h-5 w-5 text-yellow-600 mr-3">⚠</div>
                <div>
                  <h3 className="font-semibold text-yellow-800">Payment Required</h3>
                  <p className="text-yellow-700 text-sm">
                    You must complete payment before you can send your contract to lawyers. 
                    <Link href={`/dashboard/contracts/${contractId}/preview`} className="text-yellow-800 underline ml-1">
                      Click here to purchase your agreement.
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {sendStatus && (
          <Card className={`mb-6 ${sendStatus.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center">
                {sendStatus.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <div className="h-5 w-5 text-red-600 mr-2">⚠</div>
                )}
                <p className={sendStatus.success ? 'text-green-700' : 'text-red-700'}>
                  {sendStatus.message}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Your Lawyer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Your Legal Counsel
              </CardTitle>
              <p className="text-sm text-gray-600">
                Select a lawyer to represent {contract?.userFullName || 'you'}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {lawyerOptions.filter(l => l.party === 'user').map((lawyer) => (
                <div key={lawyer.id} className="border rounded-lg p-3">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="radio"
                      name="userLawyer"
                      value={lawyer.id}
                      checked={selectedLawyers.user === lawyer.id}
                      onChange={() => handleLawyerSelect('user', lawyer.id)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{lawyer.name}</div>
                      <div className="text-sm text-gray-600">{lawyer.firm}</div>
                      <div className="text-sm text-gray-500">{lawyer.email}</div>
                    </div>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Partner's Lawyer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Partner's Legal Counsel
              </CardTitle>
              <p className="text-sm text-gray-600">
                Select a lawyer to represent {contract?.partnerFullName || 'your partner'}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {lawyerOptions.filter(l => l.party === 'partner').map((lawyer) => (
                <div key={lawyer.id} className="border rounded-lg p-3">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="radio"
                      name="partnerLawyer"
                      value={lawyer.id}
                      checked={selectedLawyers.partner === lawyer.id}
                      onChange={() => handleLawyerSelect('partner', lawyer.id)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{lawyer.name}</div>
                      <div className="text-sm text-gray-600">{lawyer.firm}</div>
                      <div className="text-sm text-gray-500">{lawyer.email}</div>
                    </div>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Contract Details */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Contract to be Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Parties:</span>
                  <div>{contract?.userFullName} & {contract?.partnerFullName}</div>
                </div>
                <div>
                  <span className="font-medium">Document Type:</span>
                  <div>Alberta Cohabitation Agreement</div>
                </div>
                <div>
                  <span className="font-medium">Format:</span>
                  <div>Microsoft Word (.docx)</div>
                </div>
                <div>
                  <span className="font-medium">Contract ID:</span>
                  <div>#{contractId}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Send Button */}
        <div className="mt-8 flex gap-4">
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button 
            onClick={handleSendToLawyers}
            disabled={!selectedLawyers.user || !selectedLawyers.partner || isSending || (!paymentVerified && !contract?.isPaid)}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send to Lawyers
              </>
            )}
          </Button>
        </div>

        {/* Payment required note under button */}
        {!paymentVerified && !contract?.isPaid && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Complete payment to enable sending contract to lawyers
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function SendToLawyerPage() {
  return (
    <Suspense fallback={
      <section className="flex-1 p-4 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    }>
      <SendToLawyerPageContent />
    </Suspense>
  );
}