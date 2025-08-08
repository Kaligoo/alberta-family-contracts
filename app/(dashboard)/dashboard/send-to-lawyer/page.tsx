'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Mail, Send, CheckCircle, Loader2, FileText, Plus, X } from 'lucide-react';
import { EmailProgressBar } from '@/components/ui/email-progress-bar';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { isContractPaid } from '@/lib/utils/payment';

const formatContractTypeName = (contractType: string) => {
  switch (contractType) {
    case 'cohabitation':
      return 'Alberta Cohabitation Agreement';
    case 'prenuptial':
      return 'Alberta Prenuptial Agreement';
    case 'postnuptial':
      return 'Alberta Postnuptial Agreement';
    default:
      return 'Alberta Family Agreement';
  }
};

const formatPhoneNumber = (phone: string) => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format as xxx-xxx-xxxx if we have 10 digits
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Return original if not 10 digits
  return phone;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface LawyerOption {
  id: number;
  name: string;
  email: string;
  firm: string;
  phone?: string;
  website?: string;
  party: 'user' | 'partner' | 'both';
}

function SendToLawyerPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const contractId = searchParams.get('contractId');
  const sessionId = searchParams.get('session_id');
  const paymentSuccess = searchParams.get('payment_success') === 'true';
  
  const [selectedLawyers, setSelectedLawyers] = useState<{
    user: number | null;
    partner: number | null;
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

  // Add lawyer form state
  const [showAddLawyerForm, setShowAddLawyerForm] = useState<'user' | 'partner' | null>(null);
  const [addLawyerData, setAddLawyerData] = useState({ name: '', email: '', firm: '', phone: '' });
  const [isAddingLawyer, setIsAddingLawyer] = useState(false);
  const [addLawyerError, setAddLawyerError] = useState('');

  // Fetch contract data
  const { data: contractData, error } = useSWR(
    contractId ? `/api/contracts/${contractId}` : null,
    fetcher
  );

  // Fetch lawyers data
  const { data: lawyersData, error: lawyersError, mutate } = useSWR(
    '/api/lawyers',
    fetcher
  );

  const lawyerOptions: LawyerOption[] = lawyersData?.lawyers || [];

  const contract = contractData?.contract;
  const isPaid = isContractPaid(contract);

  // Verify payment if session_id is present
  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setPaymentLoading(false);
        // Check if contract is already paid
        if (isPaid) {
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
  }, [sessionId, isPaid, contractData]);

  const handleLawyerSelect = (party: 'user' | 'partner', lawyerId: number) => {
    setSelectedLawyers(prev => ({
      ...prev,
      [party]: lawyerId
    }));
  };

  const handleAddLawyer = async () => {
    if (!addLawyerData.name || !addLawyerData.email || !addLawyerData.firm) {
      setAddLawyerError('Name, email, and firm are required');
      return;
    }

    setIsAddingLawyer(true);
    setAddLawyerError('');

    try {
      const response = await fetch('/api/lawyers/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addLawyerData,
          party: showAddLawyerForm === 'user' ? 'user' : 'partner'
        })
      });

      if (response.ok) {
        mutate(); // Refresh lawyers list
        setAddLawyerData({ name: '', email: '', firm: '', phone: '' });
        setShowAddLawyerForm(null);
      } else {
        const error = await response.json();
        setAddLawyerError(error.error || 'Failed to add lawyer');
      }
    } catch (error) {
      setAddLawyerError('Network error occurred');
    } finally {
      setIsAddingLawyer(false);
    }
  };

  // Get selected lawyer details
  const selectedUserLawyer = lawyerOptions.find(l => l.id === selectedLawyers.user);
  const selectedPartnerLawyer = lawyerOptions.find(l => l.id === selectedLawyers.partner);

  // Check if lawyers are from same firm
  const areLawyersFromSameFirm = selectedUserLawyer && selectedPartnerLawyer && 
    selectedUserLawyer.firm.toLowerCase() === selectedPartnerLawyer.firm.toLowerCase();

  // Filter lawyers based on party and same-firm prevention
  const getUserLawyers = () => {
    const baseLawyers = lawyerOptions.filter(l => l.party === 'user' || l.party === 'both');
    if (!selectedPartnerLawyer) return baseLawyers;
    // Filter out lawyers from same firm as selected partner lawyer
    return baseLawyers.filter(l => l.firm.toLowerCase() !== selectedPartnerLawyer.firm.toLowerCase());
  };

  const getPartnerLawyers = () => {
    const baseLawyers = lawyerOptions.filter(l => l.party === 'partner' || l.party === 'both');
    if (!selectedUserLawyer) return baseLawyers;
    // Filter out lawyers from same firm as selected user lawyer
    return baseLawyers.filter(l => l.firm.toLowerCase() !== selectedUserLawyer.firm.toLowerCase());
  };

  const handleSendToLawyers = async () => {
    if (!selectedLawyers.user || !selectedLawyers.partner || !contractId) {
      return;
    }

    // Check payment status
    if (!paymentVerified && !isPaid) {
      setSendStatus({
        success: false,
        message: 'Payment must be completed before sending to lawyers. Please complete your purchase first.'
      });
      return;
    }

    setIsSending(true);
    setSendStatus(null);
    
    // Scroll to top so user can see the progress bar
    window.scrollTo({ top: 0, behavior: 'smooth' });

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

        {/* Same Firm Warning */}
        {areLawyersFromSameFirm && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="h-5 w-5 text-red-600 mr-3">⚠</div>
                <div>
                  <h3 className="font-semibold text-red-800">Same Law Firm Selected</h3>
                  <p className="text-red-700 text-sm">
                    Both lawyers are from the same firm ({selectedUserLawyer?.firm}). For proper legal representation, 
                    each party must have independent counsel from different law firms. Please select lawyers from different firms.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Required Message */}
        {!paymentLoading && !paymentVerified && !isPaid && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
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

        {/* Email Progress Bar */}
        {isSending && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <EmailProgressBar
                isEmailSending={isSending}
                onComplete={() => {
                  // Progress bar completion is handled by the main sending process
                }}
                onError={(error) => {
                  setSendStatus({
                    success: false,
                    message: error
                  });
                  setIsSending(false);
                }}
              />
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
              {getUserLawyers().map((lawyer) => (
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
                      {lawyer.phone && (
                        <div className="text-sm text-gray-500">{formatPhoneNumber(lawyer.phone)}</div>
                      )}
                      {lawyer.website && (
                        <div className="text-xs text-blue-600 mt-1">
                          <a href={lawyer.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {lawyer.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              ))}
              {getUserLawyers().length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No lawyers available for user representation
                </div>
              )}
              
              {/* Add Lawyer Button */}
              {showAddLawyerForm !== 'user' && (
                <Button
                  onClick={() => setShowAddLawyerForm('user')}
                  variant="outline"
                  className="w-full mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Lawyer
                </Button>
              )}

              {/* Add Lawyer Form */}
              {showAddLawyerForm === 'user' && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Add New Lawyer</h4>
                    <Button
                      onClick={() => {
                        setShowAddLawyerForm(null);
                        setAddLawyerData({ name: '', email: '', firm: '', phone: '' });
                        setAddLawyerError('');
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Lawyer Name"
                      value={addLawyerData.name}
                      onChange={(e) => setAddLawyerData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={addLawyerData.email}
                      onChange={(e) => setAddLawyerData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Law Firm Name"
                      value={addLawyerData.firm}
                      onChange={(e) => setAddLawyerData(prev => ({ ...prev, firm: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number (optional)"
                      value={addLawyerData.phone}
                      onChange={(e) => setAddLawyerData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                    <Button
                      onClick={handleAddLawyer}
                      disabled={isAddingLawyer}
                      className="w-full"
                      size="sm"
                    >
                      {isAddingLawyer ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Lawyer'
                      )}
                    </Button>
                    {addLawyerError && (
                      <p className="text-red-600 text-xs">{addLawyerError}</p>
                    )}
                  </div>
                </div>
              )}
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
              {getPartnerLawyers().map((lawyer) => (
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
                      {lawyer.phone && (
                        <div className="text-sm text-gray-500">{formatPhoneNumber(lawyer.phone)}</div>
                      )}
                      {lawyer.website && (
                        <div className="text-xs text-blue-600 mt-1">
                          <a href={lawyer.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {lawyer.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              ))}
              {getPartnerLawyers().length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No lawyers available for partner representation
                </div>
              )}
              
              {/* Add Lawyer Button */}
              {showAddLawyerForm !== 'partner' && (
                <Button
                  onClick={() => setShowAddLawyerForm('partner')}
                  variant="outline"
                  className="w-full mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Lawyer
                </Button>
              )}

              {/* Add Lawyer Form */}
              {showAddLawyerForm === 'partner' && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Add New Lawyer</h4>
                    <Button
                      onClick={() => {
                        setShowAddLawyerForm(null);
                        setAddLawyerData({ name: '', email: '', firm: '', phone: '' });
                        setAddLawyerError('');
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Lawyer Name"
                      value={addLawyerData.name}
                      onChange={(e) => setAddLawyerData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={addLawyerData.email}
                      onChange={(e) => setAddLawyerData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Law Firm Name"
                      value={addLawyerData.firm}
                      onChange={(e) => setAddLawyerData(prev => ({ ...prev, firm: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number (optional)"
                      value={addLawyerData.phone}
                      onChange={(e) => setAddLawyerData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                    <Button
                      onClick={handleAddLawyer}
                      disabled={isAddingLawyer}
                      className="w-full"
                      size="sm"
                    >
                      {isAddingLawyer ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Lawyer'
                      )}
                    </Button>
                    {addLawyerError && (
                      <p className="text-red-600 text-xs">{addLawyerError}</p>
                    )}
                  </div>
                </div>
              )}
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
                  <div>{formatContractTypeName(contract?.contractType || 'cohabitation')}</div>
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
            disabled={!selectedLawyers.user || !selectedLawyers.partner || isSending || (!paymentVerified && !isPaid) || areLawyersFromSameFirm}
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
        {!paymentVerified && !isPaid && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Complete payment to enable sending contract to lawyers
            </p>
          </div>
        )}

        {/* Same firm prevention note */}
        {areLawyersFromSameFirm && (
          <div className="mt-4 text-center">
            <p className="text-sm text-red-600">
              Cannot send to lawyers from the same firm. Please select lawyers from different firms.
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