import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, FileText, Users, CheckCircle, Lock, Mail, User } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import Image from 'next/image';
import Link from 'next/link';
import AffiliateTracker from '@/components/affiliate-tracker';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <AffiliateTracker />
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Content */}
              <div className="max-w-xl">
                <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-tight mb-8">
                  Create Your
                  <span className="block text-blue-600">Family Agreement</span>
                  <span className="block">in Minutes</span>
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Professional cohabitation, prenuptial, and postnuptial agreements. 
                  Secure your relationship with legally sound documents.
                </p>

                {/* Login Form */}
                <div className="bg-gray-50 rounded-2xl p-8 mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Start Your Agreement</h2>
                  
                  <div className="space-y-4">
                    <Link href="/sign-up">
                      <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-4">
                        <User className="mr-3 h-5 w-5" />
                        Create Account
                      </Button>
                    </Link>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-50 text-gray-500">or</span>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 text-lg py-4"
                    >
                      <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </Button>

                    <div className="text-center">
                      <Link href="/sign-in" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Already have an account? Sign in
                      </Link>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 text-center mt-4">
                    Free preview • No credit card required
                  </p>
                </div>

                {/* Pricing */}
                <div className="flex items-center space-x-4 text-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl text-gray-400 line-through">$999</span>
                    <span className="text-4xl font-bold text-blue-600">$700</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>+ 5% GST</div>
                    <div className="text-xs">*Excludes lawyer fees</div>
                  </div>
                </div>
              </div>

              {/* Right Column - Image */}
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/hero-image.png"
                    alt="Happy couple signing agreement"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose Agreeable.ca
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Professional legal agreements with the support you need to make them legally binding
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Three Agreement Types</h3>
                <p className="text-gray-600">Cohabitation, prenuptial, and postnuptial agreements tailored to your needs</p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Preview</h3>
                <p className="text-gray-600">See exactly what your personalized agreement will look like before you buy</p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Legal Support</h3>
                <p className="text-gray-600">Connect with qualified lawyers for independent legal advice and signing</p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Process</h3>
                <p className="text-gray-600">SSL encrypted data and secure payment processing with no hidden fees</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Protect Your Relationship?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join hundreds of couples who have secured their future with professional family agreements
            </p>
            <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:space-x-4">
              <Link href="/sign-up">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 text-lg px-8 py-4">
                  Start Your Free Preview
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4">
                  Ask Questions
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}