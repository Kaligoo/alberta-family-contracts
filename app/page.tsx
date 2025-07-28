import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, FileText, Users, CheckCircle } from 'lucide-react';
import { Navigation } from '@/components/navigation';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                Protect Your Family
                <span className="block text-orange-500">With Legal Clarity</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Create professional cohabitation agreements and family contracts in minutes. 
                Secure your relationship with legally sound documents that protect both partners.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Cohabitation Agreement</h3>
                      <p className="text-sm text-gray-600">Professional legal document</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">$700</div>
                      <div className="text-sm text-gray-500">Market value</div>
                    </div>
                  </div>
                </div>
                <a href="/sign-up">
                  <Button
                    size="lg"
                    className="w-full text-lg bg-orange-500 hover:bg-orange-600"
                  >
                    Start Your Free Preview
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <p className="text-sm text-gray-500 text-center">No credit card required • Get started in 2 minutes</p>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg">
                <div className="relative mx-auto w-full rounded-lg shadow-lg">
                  <div className="bg-white rounded-lg p-8 shadow-xl">
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white mb-4">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">How Does It Work?</h3>
                      <div className="space-y-4 text-left">
                        <div className="flex items-start text-gray-700">
                          <div className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                            1
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Build Your Contract</span>
                            <p className="text-gray-600 mt-1">Use our platform to create a customized cohabitation agreement tailored to your specific needs and circumstances.</p>
                          </div>
                        </div>
                        <div className="flex items-start text-gray-700">
                          <div className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                            2
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Preview Your Agreement</span>
                            <p className="text-gray-600 mt-1">Review your complete contract to ensure all details are accurate before making any payment.</p>
                          </div>
                        </div>
                        <div className="flex items-start text-gray-700">
                          <div className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                            3
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Complete Payment</span>
                            <p className="text-gray-600 mt-1">Pay securely for your professional legal document once you're satisfied with the preview.</p>
                          </div>
                        </div>
                        <div className="flex items-start text-gray-700">
                          <div className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                            4
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Legal Consultation</span>
                            <p className="text-gray-600 mt-1">Your contract is sent to qualified lawyers who will meet with each partner virtually to provide legal advice and facilitate signing.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Shield className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Legal Protection
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Comprehensive agreements that protect both partners' rights, 
                  assets, and interests in your relationship.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <FileText className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Professional Documents
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Generate legally compliant cohabitation agreements tailored to your 
                  specific situation and local laws.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Users className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Easy Setup
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Simple step-by-step process to gather your information and 
                  generate your personalized agreement in minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Ready to protect your family?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Join thousands of couples who have secured their relationships with 
                professional cohabitation agreements. Start your free preview today 
                and see exactly what your personalized document will include.
              </p>
              <div className="mt-6 flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-gray-600">No hidden fees or subscription required</span>
              </div>
              <div className="mt-2 flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-gray-600">Instant preview of your agreement</span>
              </div>
              <div className="mt-2 flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-gray-600">Pay only when you're ready to download</span>
              </div>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <a href="/sign-up">
                <Button
                  size="lg"
                  className="text-lg bg-orange-500 hover:bg-orange-600 px-8 py-3"
                >
                  Get Your Free Preview
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
      </main>
    </div>
  );
}