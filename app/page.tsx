'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, FileText, Users, CheckCircle, Lock, Mail, User, Star, Clock, CreditCard, Zap } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import Image from 'next/image';
import Link from 'next/link';
import AffiliateTracker from '@/components/affiliate-tracker';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HomePage() {
  const { data: authData } = useSWR('/api/auth/me', fetcher);
  const isAuthenticated = authData?.authenticated;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AffiliateTracker />
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-8 pb-20">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Content */}
              <div className="max-w-2xl">
                {/* Trust Badge */}
                <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Trusted by 500+ couples</span>
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>

                <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-6">
                  Your
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Family Agreement
                  </span>
                  <span className="block text-4xl lg:text-5xl font-bold">Made Simple</span>
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Professional legal agreements in minutes, not weeks. Create cohabitation, 
                  prenuptial, and postnuptial agreements with confidence.
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mx-auto mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">15 min</div>
                    <div className="text-sm text-gray-600">Average time</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mx-auto mb-2">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">$700</div>
                    <div className="text-sm text-gray-600">All inclusive</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full mx-auto mb-2">
                      <Zap className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">Instant</div>
                    <div className="text-sm text-gray-600">Preview</div>
                  </div>
                </div>
              </div>

              {/* Right Column - Login Card */}
              <div className="relative">
                <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                  {isAuthenticated ? (
                    <>
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
                        <p className="text-gray-600">Continue where you left off</p>
                      </div>
                      
                      <div className="space-y-4">
                        <Link href="/dashboard">
                          <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg py-4 rounded-xl">
                            <ArrowRight className="mr-3 h-5 w-5" />
                            Go to Dashboard
                          </Button>
                        </Link>
                        <Link href="/dashboard/contracts/new">
                          <Button variant="outline" size="lg" className="w-full border-2 border-gray-200 text-gray-700 hover:bg-gray-50 text-lg py-4 rounded-xl">
                            <FileText className="mr-3 h-5 w-5" />
                            Start New Agreement
                          </Button>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Started</h2>
                        <p className="text-gray-600">Create your agreement in minutes</p>
                      </div>
                      
                      <div className="space-y-4">
                        <Link href="/sign-up">
                          <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg py-4 rounded-xl">
                            <User className="mr-3 h-5 w-5" />
                            Create Account
                          </Button>
                        </Link>
                        
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-medium">or</span>
                          </div>
                        </div>

                        <Button 
                          variant="outline" 
                          size="lg" 
                          className="w-full border-2 border-gray-200 text-gray-700 hover:bg-gray-50 text-lg py-4 rounded-xl"
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

                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                          <Shield className="w-4 h-4" />
                          <span>Free preview • No credit card required</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Floating Pricing Card */}
                <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg text-gray-400 line-through">$999</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">$700</span>
                      </div>
                      <div className="text-xs text-gray-500">+ 5% GST</div>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="text-xs text-gray-600">
                      <div className="font-medium">All-inclusive</div>
                      <div>*Excludes lawyer fees</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 rounded-full px-4 py-2 text-sm font-medium mb-4">
                <CheckCircle className="w-4 h-4" />
                Trusted Legal Platform
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Why Choose Agreeable.ca
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Professional legal agreements with the support you need to make them legally binding
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="group">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-14 h-14 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Three Agreement Types</h3>
                  <p className="text-gray-600 text-center leading-relaxed">Cohabitation, prenuptial, and postnuptial agreements tailored to your needs</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl w-14 h-14 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Free Preview</h3>
                  <p className="text-gray-600 text-center leading-relaxed">See exactly what your personalized agreement will look like before you buy</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl w-14 h-14 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Legal Support</h3>
                  <p className="text-gray-600 text-center leading-relaxed">Connect with qualified lawyers for independent legal advice and signing</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl w-14 h-14 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Lock className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Secure Process</h3>
                  <p className="text-gray-600 text-center leading-relaxed">SSL encrypted data and secure payment processing with no hidden fees</p>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 text-center">
              <div className="inline-flex items-center space-x-8 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-8 py-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Bank-Level Security</span>
                </div>
                <div className="w-px h-6 bg-gray-200"></div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">500+ Happy Couples</span>
                </div>
                <div className="w-px h-6 bg-gray-200"></div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Lawyer Approved</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Background with modern gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.3),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white text-sm font-medium mb-6">
                <CheckCircle className="w-4 h-4" />
                500+ Couples Protected
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Ready to Protect Your
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Future Together?
                </span>
              </h2>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl mx-auto">
                Join hundreds of couples who have secured their future with professional family agreements. 
                Start your free preview today.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link href="/sign-up">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <FileText className="mr-3 h-5 w-5" />
                  Start Your Free Preview
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
              
              <Link href="/contact">
                <Button variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-lg px-8 py-4 rounded-xl">
                  <Mail className="mr-3 h-5 w-5" />
                  Ask Questions
                </Button>
              </Link>
            </div>

            {/* Final trust indicators */}
            <div className="flex justify-center items-center space-x-6 text-white/80">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Secure & Private</span>
              </div>
              <div className="w-px h-4 bg-white/30"></div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm">15 Minutes</span>
              </div>
              <div className="w-px h-4 bg-white/30"></div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">No Credit Card</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}