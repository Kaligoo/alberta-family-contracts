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
                  Professional family law services delivered through innovative technology, 
                  making legal protection accessible and affordable for Alberta families.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Garrett's Bio Section */}
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
                    <p className="text-gray-600 text-sm mt-1">Associate at Kahane Law Office</p>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-8 mt-8 lg:mt-0">
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Background</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                        <GraduationCap className="h-5 w-5 text-orange-500 mr-2" />
                        Education & Qualifications
                      </h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• Graduated from Thompson Rivers University Faculty of Law</li>
                        <li>• Placed on Dean's List during law school</li>
                        <li>• Bachelor's Degree in Management Information Systems, University of Lethbridge (2005)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                        <Award className="h-5 w-5 text-orange-500 mr-2" />
                        Professional Experience
                      </h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• Associate at Kahane Law Office since September 2015</li>
                        <li>• Specializes in family and civil litigation</li>
                        <li>• Previous experience at civil litigation and criminal law firms</li>
                        <li>• Former technology sales professional at a global technology company</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                        <Users className="h-5 w-5 text-orange-500 mr-2" />
                        Leadership & Achievements
                      </h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• Co-founder of the Society of Law Students at Thompson Rivers University</li>
                        <li>• Developed the society's website and edited its constitution</li>
                        <li>• Served as Clubs and Events Coordinator</li>
                        <li>• Represented Thompson Rivers University on BC Law Moot Team</li>
                      </ul>
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
                Our Mission
              </h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                To make professional family law services accessible to all Alberta families through 
                innovative technology, combining legal expertise with user-friendly tools.
              </p>
            </div>

            <div className="mt-16 lg:grid lg:grid-cols-3 lg:gap-8">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 rounded-md bg-orange-500 flex items-center justify-center">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Legal Excellence</h3>
                <p className="mt-2 text-gray-600">
                  Every document is crafted with the same attention to detail and legal rigor 
                  you'd expect from a traditional law firm.
                </p>
              </div>

              <div className="mt-10 lg:mt-0 text-center">
                <div className="mx-auto h-12 w-12 rounded-md bg-orange-500 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Accessibility</h3>
                <p className="mt-2 text-gray-600">
                  Professional legal services shouldn't be limited by geography or cost. 
                  We bring expert legal assistance directly to you.
                </p>
              </div>

              <div className="mt-10 lg:mt-0 text-center">
                <div className="mx-auto h-12 w-12 rounded-md bg-orange-500 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Alberta-Focused</h3>
                <p className="mt-2 text-gray-600">
                  Our services are specifically tailored to Alberta law and regulations, 
                  ensuring your documents comply with local requirements.
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