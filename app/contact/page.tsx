import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Clock, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                Contact Us
              </h1>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Have questions about our services? Need assistance with your family contract? 
                We're here to help you protect your family's future.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16">
              
              {/* Contact Form */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input 
                        type="text" 
                        id="firstName" 
                        name="firstName" 
                        required 
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input 
                        type="text" 
                        id="lastName" 
                        name="lastName" 
                        required 
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input 
                      type="email" 
                      id="email" 
                      name="email" 
                      required 
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <select 
                      id="subject" 
                      name="subject" 
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="contract">Contract Questions</option>
                      <option value="technical">Technical Support</option>
                      <option value="legal">Legal Consultation</option>
                      <option value="billing">Billing Questions</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <textarea 
                      id="message" 
                      name="message" 
                      required
                      rows={6}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      placeholder="Please describe your question or how we can help you..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-orange-500 hover:bg-orange-600"
                  >
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="mt-12 lg:mt-0">
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in touch</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <Mail className="h-6 w-6 text-orange-500 mt-1 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">Email</h3>
                        <p className="text-gray-600">info@agreeable.com</p>
                        <p className="text-sm text-gray-500 mt-1">
                          We typically respond within 24 hours
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Phone className="h-6 w-6 text-orange-500 mt-1 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">Phone</h3>
                        <p className="text-gray-600">403-910-5387</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Monday - Friday, 9:00 AM - 5:00 PM MST
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <MapPin className="h-6 w-6 text-orange-500 mt-1 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">Office</h3>
                        <p className="text-gray-600">
                          Kahane Law Office<br />
                          Calgary, Alberta
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Serving families across Alberta
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Clock className="h-6 w-6 text-orange-500 mt-1 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">Business Hours</h3>
                        <div className="text-gray-600 text-sm">
                          <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
                          <p>Saturday - Sunday: Closed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-orange-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MessageSquare className="h-5 w-5 text-orange-500 mr-2" />
                    Quick Questions?
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-800">How long does it take to create a contract?</p>
                      <p className="text-gray-600">Most contracts are completed in 10-15 minutes.</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Are the contracts legally binding?</p>
                      <p className="text-gray-600">Yes, our contracts comply with Alberta family law.</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Can I make changes after purchase?</p>
                      <p className="text-gray-600">Contact us for assistance with contract modifications.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Create your family contract today with our simple, guided process.
            </p>
            <div className="mt-8">
              <a
                href="/sign-up"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 transition-colors"
              >
                Start Your Free Preview
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}