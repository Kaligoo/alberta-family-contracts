'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Mail, Phone, FileText, Clock, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function ComplicatedContractPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/dashboard/contracts/new" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to New Contract
          </Link>
          
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Complex Agreement Needed</h1>
          <p className="text-gray-600">
            Your situation requires a custom agreement that goes beyond our basic templates.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              About Our Website Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              This website is designed for <strong>basic family agreements</strong> with standard property arrangements. 
              Our templates work well for straightforward situations where couples want:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Simple property separation rules</li>
              <li>Standard financial arrangements</li>
              <li>Basic cohabitation, prenuptial, or postnuptial terms</li>
            </ul>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                <strong>For complex situations,</strong> you'll get better results working directly with a lawyer 
                who can create a fully customized agreement tailored to your specific needs.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Custom Agreement Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              More complicated custom agreements can be handled by a qualified family lawyer:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Hourly Basis</h3>
                </div>
                <p className="text-sm text-blue-800">
                  Work with a lawyer on an hourly rate for complex, multi-layered agreements 
                  requiring extensive customization.
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <h3 className="font-semibold text-green-900">Flat Fee Quote</h3>
                </div>
                <p className="text-sm text-green-800">
                  Get a fixed-price quote for your specific situation, providing cost certainty 
                  for your custom agreement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-orange-500" />
              Get Professional Help
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Ready to discuss your complex agreement needs? Contact our legal team:
            </p>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <div className="text-center">
                <Mail className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold text-orange-900 mb-2">Email Consultation</h3>
                <p className="text-orange-800 mb-4">
                  Describe your situation and we'll provide guidance on the best approach for your custom agreement.
                </p>
                <a 
                  href="mailto:ghorvath@kahanelaw.com?subject=Complex Family Agreement - Custom Quote Request"
                  className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email: ghorvath@kahanelaw.com
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Link href="/dashboard/contracts/new">
            <Button variant="outline" className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Choose a Basic Option Instead
            </Button>
          </Link>
          <Link href="/dashboard/contracts">
            <Button className="flex-1">
              Back to Contracts
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}