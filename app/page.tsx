import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, FileText, Users, CheckCircle, Lock } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <div className="mb-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <Lock className="w-4 h-4 mr-2" />
                  Secure & Professional
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                Protect Your Family
                <span className="block text-blue-600">With Legal Clarity</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                Create professional cohabitation agreements and family contracts in minutes. 
                Secure your relationship with legally sound documents that protect both partners.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 space-y-6">
                <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Cohabitation Agreement</h3>
                      <p className="text-sm text-gray-600">Professional legal document</p>
                      <p className="text-xs text-red-600 mt-1">*Excludes individual lawyer consultation fees</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">$735</div>
                      <div className="text-sm text-gray-500">inc. 5% GST</div>
                    </div>
                  </div>
                </div>
                <a href="/sign-up">
                  <Button
                    size="lg"
                    className="w-full text-lg bg-blue-600 hover:bg-blue-700 shadow-lg"
                  >
                    Start Your Free Preview
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <p className="text-sm text-gray-600 text-center">No credit card required • Get started in 2 minutes</p>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full">
                <Image 
                  src="/family-hero.jpg"
                  alt="Happy family representing legal protection and security"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-2xl object-cover w-full h-96"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Simple steps to create your professional legal agreement</p>
          </div>
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Agreement</h3>
                <p className="text-gray-600">Select the type of family agreement that fits your situation</p>
              </div>
            </div>

            <div className="mt-8 lg:mt-0 text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mx-auto mb-4">
                <FileText className="h-8 w-8" />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fill Details</h3>
                <p className="text-gray-600">Complete your information using our guided questionnaire</p>
              </div>
            </div>

            <div className="mt-8 lg:mt-0 text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mx-auto mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Review & Purchase</h3>
                <p className="text-gray-600">Preview your agreement and complete secure payment</p>
              </div>
            </div>

            <div className="mt-8 lg:mt-0 text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal Consultation</h3>
                <p className="text-gray-600">Each partner meets with a qualified lawyer for advice and signing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Ready to protect your family?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-600">
                Join thousands of couples who have secured their relationships with 
                professional cohabitation agreements. Start your free preview today 
                and see exactly what your personalized document will include.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">SSL encrypted and secure payment processing</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">No hidden fees or subscription required</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Instant preview of your agreement</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Professional legal consultation included</span>
                </div>
              </div>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Start Your Agreement</h3>
                  <a href="/sign-up">
                    <Button
                      size="lg"
                      className="w-full text-lg bg-blue-600 hover:bg-blue-700 mb-4"
                    >
                      Get Your Free Preview
                      <ArrowRight className="ml-3 h-6 w-6" />
                    </Button>
                  </a>
                  <p className="text-sm text-gray-500">No credit card required</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </main>
    </div>
  );
}