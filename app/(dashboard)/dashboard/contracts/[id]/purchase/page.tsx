'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart, Loader2, CreditCard, Shield, Lock, CheckCircle, Download, Send, FileText } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { isContractPaid } from '@/lib/utils/payment';

const formatContractTypeName = (contractType: string) => {
  switch (contractType) {
    case 'cohabitation':
      return 'cohabitation agreement';
    case 'prenuptial':
      return 'prenuptial agreement';
    case 'postnuptial':
      return 'postnuptial agreement';
    default:
      return 'family agreement';
  }
};

const formatContractTypeTitle = (contractType: string) => {
  switch (contractType) {
    case 'cohabitation':
      return 'Cohabitation Agreement';
    case 'prenuptial':
      return 'Prenuptial Agreement';
    case 'postnuptial':
      return 'Postnuptial Agreement';
    default:
      return 'Family Agreement';
  }
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ContractPurchasePage() {
  const params = useParams();
  const contractId = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isAcceptingTerms, setIsAcceptingTerms] = useState(false);
  
  const { data: contractData } = useSWR(
    `/api/contracts/${contractId}`,
    fetcher
  );

  const contract = contractData?.contract;
  const isPaid = isContractPaid(contract);
  const contractTermsAccepted = contract?.termsAccepted === 'true' || contract?.termsAccepted === true;

  const handleTermsAcceptance = async (accepted: boolean) => {
    if (!accepted) {
      setTermsAccepted(false);
      return;
    }

    setIsAcceptingTerms(true);
    try {
      const response = await fetch(`/api/contracts/${contractId}/accept-terms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setTermsAccepted(true);
      } else {
        setError('Failed to accept terms. Please try again.');
        setTermsAccepted(false);
      }
    } catch (err) {
      console.error('Terms acceptance error:', err);
      setError('Failed to accept terms. Please try again.');
      setTermsAccepted(false);
    } finally {
      setIsAcceptingTerms(false);
    }
  };

  const handlePurchase = async () => {
    // Don't initiate payment if contract is already paid
    if (isPaid) return;
    
    setIsLoading(true);
    setError(null);
    
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
        setError(errorData.error || 'Failed to initiate payment');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to initiate payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!contractData) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading contract details...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href={`/dashboard/contracts/${contractId}/preview`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Preview
          </Link>
          
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              {isPaid ? 'Next Steps' : 'Purchase Agreement'}
            </h1>
            <p className="text-gray-600">
              {isPaid 
                ? 'Your agreement is ready! Follow these steps to complete the legal process'
                : `Complete your purchase to download your personalized ${formatContractTypeName(contract?.contractType || 'cohabitation')}`
              }
            </p>
          </div>
        </div>

        {isPaid ? (
          /* Next Steps Content for Paid Contracts */
          <div className="space-y-6">
            {/* Payment Confirmation */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Payment Complete!</h3>
                  <p className="text-green-700">
                    Your {formatContractTypeName(contract?.contractType || 'cohabitation')} has been successfully purchased and is ready for the next steps.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Complete the Legal Process</CardTitle>
                <p className="text-gray-600">Follow these important steps to finalize your agreement</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Download */}
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                    <Download className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-2">Step 1: Download Your Agreement</h4>
                    <p className="text-blue-800 mb-3">
                      Download the PDF version of your personalized {formatContractTypeName(contract?.contractType || 'cohabitation')}. This document contains all the information you provided.
                    </p>
                    <Link href={`/dashboard/contracts/${contractId}/download`}>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Step 2: Send to Lawyers */}
                <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="bg-orange-100 rounded-full p-2 flex-shrink-0">
                    <Send className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-orange-900 mb-2">Step 2: Send to Independent Lawyers</h4>
                    <p className="text-orange-800 mb-3">
                      Each partner must obtain independent legal advice from separate lawyers. Use our system to send the agreement to two lawyers who will provide independent legal advice and assist with signing.
                    </p>
                    <Link href={`/dashboard/send-to-lawyer?contractId=${contractId}`}>
                      <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                        <Send className="mr-2 h-4 w-4" />
                        Send to Lawyers
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Step 3: Legal Review Process */}
                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-900 mb-2">Step 3: Independent Legal Advice & Signing</h4>
                    <p className="text-purple-800 mb-3">
                      Each lawyer will:
                    </p>
                    <ul className="text-purple-800 space-y-1 mb-3 ml-4">
                      <li>• Review the agreement with their respective client</li>
                      <li>• Provide independent legal advice</li>
                      <li>• Witness the signing of the agreement</li>
                      <li>• Ensure all legal requirements are met</li>
                    </ul>
                    <div className="bg-purple-100 rounded-lg p-3">
                      <p className="text-sm text-purple-800">
                        <strong>Important:</strong> Each partner must use a different lawyer to ensure independent legal advice. This is a legal requirement for {formatContractTypeName(contract?.contractType || 'cohabitation')}s in Alberta.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legal Requirements Notice */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-800">Legal Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-yellow-800">
                  <p>
                    <strong>Why Independent Legal Advice is Required:</strong>
                  </p>
                  <ul className="space-y-1 ml-4">
                    <li>• Ensures both parties fully understand the agreement</li>
                    <li>• Provides legal protection for both partners</li>
                    <li>• Makes the agreement legally enforceable</li>
                    <li>• Required by Alberta family law</li>
                  </ul>
                  <p className="mt-4">
                    <strong>Next:</strong> Use the "Send to Lawyers" feature to connect with qualified family lawyers who can provide the required independent legal advice and witness signatures.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Original Purchase Content for Unpaid Contracts */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Secure Payment Section - Main Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Secure Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">$735.00</div>
                    <div className="text-sm text-gray-600">CAD (includes 5% GST)</div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {!contractTermsAccepted && !isPaid && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                      <h4 className="font-medium text-gray-900">Terms and Conditions</h4>
                      <div className="text-sm text-gray-600 space-y-3">
                        <p>By purchasing this agreement, you acknowledge and agree that:</p>
                        <ul className="list-disc ml-5 space-y-1">
                          <li>This document provides legal information, not legal advice</li>
                          <li>Independent legal advice is required for both parties</li>
                          <li>Agreeable.ca is not responsible for the legal validity or enforcement of the agreement</li>
                          <li>The agreement must be reviewed and signed with qualified lawyers</li>
                          <li>Consultation fees with lawyers are separate and not included</li>
                        </ul>
                        <p>
                          By checking the box below, you agree to our{' '}
                          <Link href="/terms" className="text-blue-600 hover:text-blue-800 underline">
                            Terms of Service
                          </Link>
                          {' '}and acknowledge that you understand the requirements for making this agreement legally binding.
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="terms-acceptance"
                          checked={termsAccepted}
                          onChange={(e) => handleTermsAcceptance(e.target.checked)}
                          disabled={isAcceptingTerms}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label 
                          htmlFor="terms-acceptance" 
                          className="text-sm text-gray-700 cursor-pointer leading-5"
                        >
                          I have read and agree to the terms and conditions above, and I understand that independent legal advice is required to make this agreement legally binding.
                        </label>
                      </div>
                      {isAcceptingTerms && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Recording your acceptance...
                        </div>
                      )}
                    </div>
                  )}

                  <Button 
                    onClick={handlePurchase}
                    disabled={isLoading || isPaid || (!contractTermsAccepted && !termsAccepted)}
                    className={`w-full text-lg py-3 ${
                      isPaid 
                        ? "bg-gray-400 cursor-not-allowed" 
                        : (!contractTermsAccepted && !termsAccepted)
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    size="lg"
                  >
                    {isPaid ? (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Already Purchased
                      </>
                    ) : isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Purchase Now
                      </>
                    )}
                  </Button>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>Secure payment by Stripe</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span>SSL encrypted checkout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-green-600" />
                      <span>All major cards accepted</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Need help?</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Contact us before purchasing if you have questions.
                    </p>
                    <Link href="/contact" className="text-blue-600 hover:text-blue-800 text-sm">
                      Get in touch →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary - Right Column */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-lg">{formatContractTypeTitle(contract?.contractType || 'cohabitation')}</h3>
                    <p className="text-gray-600">
                      Professional legal agreement for {contract?.userFullName || '[Your Name]'} and {contract?.partnerFullName || '[Partner Name]'}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Agreement Document</span>
                      <span className="font-semibold">$700.00 CAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (5%)</span>
                      <span className="font-semibold">$35.00 CAD</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>$735.00 CAD</span>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                    <p className="text-sm text-red-800">
                      <strong>Note:</strong> This price excludes individual lawyer consultation fees for each partner.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}