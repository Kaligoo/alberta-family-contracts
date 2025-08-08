import { Navigation } from '@/components/navigation';
import { Scale, GraduationCap, Award, Users, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-8">
                <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                  About Alberta Family Contracts
                </h1>
                <p className="mt-4 text-xl text-gray-600">
                  Our goal is to provide budget-friendly agreement drafts customized to your specific needs 
                  at a fraction of the price of having a lawyer draft them traditionally. Real legal 
                  protection, not the inadequate documents offered by non-lawyer services.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Access to Justice Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-4">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="text-center">
                    <div className="mx-auto h-24 w-24 rounded-full bg-orange-500 flex items-center justify-center mb-4">
                      <Scale className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Garrett Horvath</h3>
                    <p className="text-orange-600 font-medium">Family Law Lawyer</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Over 10 Years Experience | 
                      <a 
                        href="https://kahanelaw.com/our-lawyers/garrett-horvath-calgary-family-law-lawyer/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:text-orange-700 underline ml-1"
                      >
                        Kahane Law
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-8 mt-8 lg:mt-0">
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Bridging the Access to Justice Gap</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <Scale className="h-5 w-5 text-orange-500 mr-2" />
                        The Problem with Access to Justice
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Access to justice remains one of Canada's most pressing legal challenges. Many Albertans cannot afford 
                        traditional legal services, with lawyer fees often ranging from $300-$600 per hour. This leaves families 
                        vulnerable, forced to navigate complex legal matters without proper protection or representation.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <Users className="h-5 w-5 text-orange-500 mr-2" />
                        Why Budget-Friendly Legal Options Matter
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Legal protection shouldn't be a luxury. Everyone deserves access to properly drafted legal documents 
                        that protect their family's interests. By leveraging technology and streamlined processes, we can 
                        deliver lawyer-quality documents at a fraction of traditional cost, making legal protection accessible 
                        to working families across Alberta.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <Award className="h-5 w-5 text-orange-500 mr-2" />
                        The Lawyer Advantage
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        As a Family Lawyer employed with <a href="https://kahanelaw.com/our-lawyers/garrett-horvath-calgary-family-law-lawyer/" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 underline">Kahane Law</a> with over 10 years of family law experience, I've seen firsthand how inadequate legal documents 
                        can devastate families. Other online options are not provided by lawyers and frankly, they suck. 
                        They often fail to meet the legal requirements for binding agreements under Alberta law, leaving 
                        you with worthless documents when you need protection most.
                      </p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="text-red-800 font-semibold mb-2">Warning About Non-Lawyer Services</h4>
                      <p className="text-red-700 text-sm">
                        Many online document services are created by non-lawyers and fail to satisfy the legal requirements 
                        for enforceable agreements. When disputes arise, these inadequate documents often cannot be enforced 
                        by courts, leaving you without the protection you thought you had purchased.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Our Mission: Democratizing Legal Protection
              </h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                To bridge the access to justice gap by providing lawyer-drafted, legally binding family 
                agreements at affordable prices, ensuring every Alberta family can protect their future 
                without breaking their budget.
              </p>
            </div>

            <div className="mt-16 lg:grid lg:grid-cols-3 lg:gap-8">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 rounded-md bg-orange-500 flex items-center justify-center">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Lawyer-Drafted Quality</h3>
                <p className="mt-2 text-gray-600">
                  Unlike non-lawyer services that produce inadequate documents, every agreement 
                  is crafted by an experienced family lawyer to ensure legal enforceability.
                </p>
              </div>

              <div className="mt-10 lg:mt-0 text-center">
                <div className="mx-auto h-12 w-12 rounded-md bg-orange-500 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Affordable Access</h3>
                <p className="mt-2 text-gray-600">
                  Breaking down cost barriers to legal protection. Professional-quality family 
                  agreements at a fraction of traditional legal fees.
                </p>
              </div>

              <div className="mt-10 lg:mt-0 text-center">
                <div className="mx-auto h-12 w-12 rounded-md bg-orange-500 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Alberta Law Compliant</h3>
                <p className="mt-2 text-gray-600">
                  Specifically designed for Alberta's Family Property Act and current legislation, 
                  ensuring your documents meet all legal requirements for enforceability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Ready to protect your family's future?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start your free preview today and see how easy professional legal protection can be.
            </p>
            <div className="mt-8">
              <a
                href="/sign-up"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 transition-colors"
              >
                Get Started
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}