'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail, Phone, Home } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PurchaseSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <Card className="text-center">
          <CardHeader className="pb-6">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl text-green-600 mb-2">
              Purchase Successful!
            </CardTitle>
            <p className="text-lg text-gray-600">
              Thank you for your purchase of the Alberta Cohabitation Agreement
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                What happens next?
              </h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Email Confirmation</p>
                    <p className="text-sm text-green-700">
                      You'll receive a receipt and confirmation email within the next few minutes.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Personal Contact</p>
                    <p className="text-sm text-green-700">
                      Our legal team will contact you within 1-2 business days to finalize your agreement.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Home className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Document Delivery</p>
                    <p className="text-sm text-green-700">
                      Your completed cohabitation agreement will be delivered within 3-5 business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Need to make changes?</h4>
              <p className="text-sm text-blue-700">
                You can still make modifications to your agreement information in your dashboard 
                before we finalize the document.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Questions or concerns?</h4>
              <p className="text-sm text-gray-700 mb-3">
                Contact us at <strong>info@albertafamilycontracts.com</strong> or call us at <strong>(403) 555-0123</strong>
              </p>
              <p className="text-xs text-gray-600">
                Reference Order ID: {sessionId ? sessionId.substring(0, 10) + '...' : 'N/A'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  Return to Dashboard
                </Button>
              </Link>
              <Link href="/contact" className="flex-1">
                <Button variant="outline" className="w-full">
                  Contact Us
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}