'use client';

import { Navigation } from '@/components/navigation';
import { Shield, Users, FileText, Scale, AlertTriangle, BookOpen, Clock, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function AlbertaFamilyLawPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 rounded-full px-4 py-2 text-sm font-medium mb-4">
                <Scale className="w-4 h-4" />
                Legal Information Only
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Alberta Family Law
                <span className="block text-3xl lg:text-4xl text-blue-600 mt-2">Information Guide</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Understanding property division and support under Alberta's Family Property Act and Family Law Act. 
                This information is current as of 2024 and reflects changes made since 2020.
              </p>
            </div>

            {/* Important Disclaimer */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg mb-8">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Legal Disclaimer</h3>
                  <p className="text-yellow-700">
                    This page provides general legal information only and is not legal advice. 
                    Every situation is unique, and you should consult with a qualified Alberta family lawyer 
                    for advice specific to your circumstances. Laws can change, and this information should not 
                    be used as a substitute for professional legal counsel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="w-6 h-6 mr-3 text-blue-600" />
                Table of Contents
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <a href="#property-division" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors">
                    <div className="font-medium text-gray-900">Property Division Under the Family Property Act</div>
                    <div className="text-sm text-gray-600">Equal division, exempt property, and special circumstances</div>
                  </a>
                  <a href="#adult-interdependent" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors">
                    <div className="font-medium text-gray-900">Adult Interdependent Partners (AIPs)</div>
                    <div className="text-sm text-gray-600">Definition, requirements, and rights</div>
                  </a>
                  <a href="#exempt-property" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors">
                    <div className="font-medium text-gray-900">Exempt Property</div>
                    <div className="text-sm text-gray-600">What property is not divided and special rules</div>
                  </a>
                </div>
                <div className="space-y-3">
                  <a href="#spousal-support" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors">
                    <div className="font-medium text-gray-900">Spousal and Partner Support</div>
                    <div className="text-sm text-gray-600">Eligibility, calculation, and duration</div>
                  </a>
                  <a href="#cohabitation-agreements" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors">
                    <div className="font-medium text-gray-900">Cohabitation Agreements</div>
                    <div className="text-sm text-gray-600">Protection and planning for unmarried couples</div>
                  </a>
                  <a href="#time-limits" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors">
                    <div className="font-medium text-gray-900">Time Limits and Claims</div>
                    <div className="text-sm text-gray-600">Deadlines for making property and support claims</div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Property Division Section */}
        <section id="property-division" className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <FileText className="w-8 h-8 mr-3 text-blue-600" />
              Property Division Under the Family Property Act
            </h2>

            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Key Changes Since 2020</h3>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-6">
                  <p className="text-blue-800">
                    <strong>Important:</strong> On January 1, 2020, the Matrimonial Property Act was renamed the Family Property Act 
                    and was amended to apply to both Adult Interdependent Partners and married spouses. These changes generally 
                    only apply to couples who separate on or after January 1, 2020.
                  </p>
                </div>

                <h4 className="text-xl font-semibold text-gray-900 mb-3">Basic Principle: Equal Division</h4>
                <p className="text-gray-700 mb-4">
                  The starting point under Alberta's Family Property Act is that all family property acquired during 
                  the relationship should be divided equally between the parties. This applies to both married spouses 
                  and Adult Interdependent Partners.
                </p>

                <h4 className="text-xl font-semibold text-gray-900 mb-3">What is Family Property?</h4>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                  <li>Real estate (homes, land, investment properties)</li>
                  <li>Bank accounts, investments, and savings</li>
                  <li>Vehicles, boats, and recreational vehicles</li>
                  <li>Business interests and professional practices</li>
                  <li>Pension benefits and RRSPs</li>
                  <li>Household goods and personal property</li>
                  <li>Debts and liabilities (which are shared equally)</li>
                </ul>

                <h4 className="text-xl font-semibold text-gray-900 mb-3">Property Valuation</h4>
                <p className="text-gray-700">
                  Property is valued at the date of trial, not the date of separation, unless the parties agree 
                  otherwise in writing. This can be significant for appreciating or depreciating assets.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Unequal Division - Section 8 Factors</h3>
                <p className="text-gray-700 mb-4">
                  Courts can order an unequal division of family property if equal division would be unjust or inequitable. 
                  The court considers factors including:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Length of the relationship</li>
                    <li>Contributions to acquisition of property</li>
                    <li>Direct or indirect contributions to family welfare</li>
                    <li>Economic advantages or disadvantages from the relationship</li>
                  </ul>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Dissipation or waste of family assets</li>
                    <li>Financial obligations at marriage and trial</li>
                    <li>Tax consequences of property division</li>
                    <li>Any other relevant circumstances</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Adult Interdependent Partners Section */}
        <section id="adult-interdependent" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <Users className="w-8 h-8 mr-3 text-purple-600" />
              Adult Interdependent Partners (AIPs)
            </h2>

            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg border">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Definition and Requirements</h3>
                <p className="text-gray-700 mb-6">
                  Adult Interdependent Partners are adults in a "relationship of interdependence" where they share 
                  one another's lives, are emotionally committed to one another, and function as an economic and domestic unit.
                </p>

                <h4 className="text-xl font-semibold text-gray-900 mb-3">Three Ways to Become an AIP:</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-purple-50 rounded-xl p-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <h5 className="font-semibold text-gray-900 mb-2">Three Years Cohabitation</h5>
                    <p className="text-gray-700 text-sm">
                      Living together in a relationship of interdependence for three or more continuous years.
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <h5 className="font-semibold text-gray-900 mb-2">Having a Child</h5>
                    <p className="text-gray-700 text-sm">
                      Living together in a relationship of "some permanence" and having a child together (including adoption).
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <h5 className="font-semibold text-gray-900 mb-2">Signed Agreement</h5>
                    <p className="text-gray-700 text-sm">
                      Signing an Adult Interdependent Partner Agreement (no minimum time requirement).
                    </p>
                  </div>
                </div>

                <div className="mt-8 bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Important Notes:</h4>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>The relationship does not need to be romantic or sexual</li>
                    <li>Related persons (by blood or adoption) can only become AIPs through a signed agreement</li>
                    <li>Minimum age is 16 years (compared to 18 for marriage)</li>
                    <li>No formal registration required with the government</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Rights and Obligations of AIPs</h3>
                <p className="text-gray-700 mb-4">
                  Since January 1, 2020, Adult Interdependent Partners have the same property division rights 
                  as married couples under the Family Property Act.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Rights Include:</h4>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                      <li>Equal division of family property</li>
                      <li>Claims for partner support</li>
                      <li>Protection from property disposal</li>
                      <li>Rights to the family home</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Obligations Include:</h4>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                      <li>Mutual support obligations</li>
                      <li>Equal responsibility for family debts</li>
                      <li>Financial disclosure requirements</li>
                      <li>Good faith in property dealings</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Exempt Property Section */}
        <section id="exempt-property" className="py-16 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <Shield className="w-8 h-8 mr-3 text-green-600" />
              Exempt Property
            </h2>

            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">What Property is Exempt? (Section 7)</h3>
                <p className="text-gray-700 mb-6">
                  Certain property is "exempt" and belongs exclusively to the person who owns it, not subject to equal division:
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Property Owned Before Relationship</h4>
                      <p className="text-green-700 text-sm">Assets owned by either party before the marriage or adult interdependent relationship began.</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Gifts from Third Parties</h4>
                      <p className="text-blue-700 text-sm">Gifts received from family, friends, or others during the relationship (not gifts between partners).</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Inheritances</h4>
                      <p className="text-purple-700 text-sm">Property inherited by one partner during the relationship.</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Personal Injury Awards</h4>
                      <p className="text-yellow-700 text-sm">Compensation for personal injury, excluding loss of income awards.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-orange-50 border-l-4 border-orange-400 p-6 rounded-r-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">Important: Traceability Requirement</h4>
                  <p className="text-orange-700">
                    To claim property as exempt, you must be able to trace it to existing assets. If exempt property 
                    is mixed with family property or cannot be traced, it may lose its exempt status.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Increase in Value of Exempt Property</h3>
                <p className="text-gray-700 mb-4">
                  While the original value of exempt property is protected, any increase in value during the 
                  relationship may be subject to division based on "just and equitable" principles.
                </p>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Example:</h4>
                  <p className="text-gray-700">
                    Partner A owns a house worth $300,000 before the relationship. During the 10-year relationship, 
                    the house appreciates to $500,000. The original $300,000 remains exempt, but the $200,000 
                    increase may be divided between the partners based on factors like contributions to maintenance, 
                    improvements, and other circumstances.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Spousal Support Section */}
        <section id="spousal-support" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <CreditCard className="w-8 h-8 mr-3 text-indigo-600" />
              Spousal and Partner Support
            </h2>

            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg border">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Eligibility for Support</h3>
                <div className="bg-indigo-50 border-l-4 border-indigo-400 p-6 rounded-r-lg mb-6">
                  <p className="text-indigo-800">
                    <strong>Important:</strong> There is no automatic right to spousal or partner support. 
                    Support is only awarded where specific criteria are met.
                  </p>
                </div>

                <h4 className="text-xl font-semibold text-gray-900 mb-3">Grounds for Support:</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h5 className="font-semibold text-blue-800 mb-2">Economic Disadvantage</h5>
                    <p className="text-blue-700 text-sm">
                      One partner has suffered an economic disadvantage because of the relationship or its breakdown, 
                      such as career sacrifices for child-rearing or supporting the other's career.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6">
                    <h5 className="font-semibold text-green-800 mb-2">Child Care Responsibilities</h5>
                    <p className="text-green-700 text-sm">
                      Financial consequences arise from taking care of children, including reduced earning capacity 
                      or ongoing childcare obligations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Federal vs. Provincial Law</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-red-50 rounded-lg p-6">
                    <h4 className="font-semibold text-red-800 mb-3">Federal Divorce Act</h4>
                    <ul className="text-red-700 text-sm space-y-2">
                      <li>• Applies to married couples seeking divorce</li>
                      <li>• Governs spousal support in divorce proceedings</li>
                      <li>• Uses Spousal Support Advisory Guidelines</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-800 mb-3">Alberta Family Law Act</h4>
                    <ul className="text-blue-700 text-sm space-y-2">
                      <li>• Applies to separated married couples (not divorcing)</li>
                      <li>• Applies to Adult Interdependent Partners</li>
                      <li>• Provincial support guidelines may apply</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Support Calculation Factors</h3>
                <p className="text-gray-700 mb-4">
                  Courts consider various factors when determining support amount and duration:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Financial Factors</h4>
                    <ul className="text-gray-700 text-sm space-y-1">
                      <li>• Income and earning capacity</li>
                      <li>• Assets and liabilities</li>
                      <li>• Standard of living</li>
                      <li>• Financial needs</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Relationship Factors</h4>
                    <ul className="text-gray-700 text-sm space-y-1">
                      <li>• Length of relationship</li>
                      <li>• Roles during relationship</li>
                      <li>• Age and health</li>
                      <li>• Childcare responsibilities</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Other Considerations</h4>
                    <ul className="text-gray-700 text-sm space-y-1">
                      <li>• Self-sufficiency prospects</li>
                      <li>• Economic hardship</li>
                      <li>• Misconduct affecting assets</li>
                      <li>• Any other relevant factors</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 bg-yellow-50 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Priority:</strong> Child support always takes priority over spousal/partner support. 
                    Spousal support can only be awarded after child support obligations are met.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cohabitation Agreements Section */}
        <section id="cohabitation-agreements" className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <FileText className="w-8 h-8 mr-3 text-purple-600" />
              Cohabitation Agreements
            </h2>

            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">What is a Cohabitation Agreement?</h3>
                <p className="text-gray-700 mb-6">
                  A cohabitation agreement is a legal contract used by unmarried couples to set out their rights 
                  and obligations during their relationship and upon separation. It's similar to a prenuptial 
                  agreement for married couples.
                </p>

                <h4 className="text-xl font-semibold text-gray-900 mb-3">What Can Be Included:</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h5 className="font-semibold text-purple-800 mb-2">Property Division</h5>
                      <p className="text-purple-700 text-sm">How assets and debts will be divided upon separation, potentially opting out of equal division rules.</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Support Obligations</h5>
                      <p className="text-blue-700 text-sm">Whether spousal/partner support will be paid, for how long, and in what amount.</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-2">Shared Expenses</h5>
                      <p className="text-green-700 text-sm">How household expenses, mortgage payments, and other costs will be shared during the relationship.</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h5 className="font-semibold text-yellow-800 mb-2">Specific Assets</h5>
                      <p className="text-yellow-700 text-sm">Protection of specific assets like business interests, family property, or investments.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Why Consider a Cohabitation Agreement?</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Asset Protection</h4>
                    <p className="text-gray-700 text-sm">Protect assets acquired before the relationship or received as gifts/inheritances.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Scale className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Certainty</h4>
                    <p className="text-gray-700 text-sm">Avoid uncertainty about property division and support obligations if the relationship ends.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Cost Savings</h4>
                    <p className="text-gray-700 text-sm">Reduce potential legal costs and disputes by having clear agreements in advance.</p>
                  </div>
                </div>

                <div className="mt-8 bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Important Requirements:</h4>
                  <ul className="text-red-700 space-y-1">
                    <li>• Both parties must have independent legal advice</li>
                    <li>• Full financial disclosure is required</li>
                    <li>• The agreement must be fair and not unconscionable</li>
                    <li>• Agreements cannot override child support obligations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Time Limits Section */}
        <section id="time-limits" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <Clock className="w-8 h-8 mr-3 text-red-600" />
              Time Limits and Claims
            </h2>

            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg border">
                <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg mb-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Critical Time Limits</h3>
                  <p className="text-red-700">
                    Failure to make claims within the specified time limits can result in permanent loss of rights. 
                    It's essential to act quickly and consult with a lawyer promptly after separation.
                  </p>
                </div>

                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Property Division Claims</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-800 mb-3">Adult Interdependent Partners</h4>
                    <p className="text-blue-700 mb-3">
                      <strong>2 years</strong> from the date you knew or should have known the relationship ended.
                    </p>
                    <p className="text-blue-700 text-sm">
                      This time limit applies to property division claims under the Family Property Act 
                      for relationships that ended on or after January 1, 2020.
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h4 className="font-semibold text-purple-800 mb-3">Married Spouses</h4>
                    <p className="text-purple-700 mb-3">
                      Time limits vary depending on whether you're seeking divorce or separation only.
                    </p>
                    <p className="text-purple-700 text-sm">
                      Under the Family Property Act: similar 2-year limitation applies for separated 
                      spouses not seeking divorce.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Support Claims</h3>
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-6">
                    <h4 className="font-semibold text-green-800 mb-3">Partner Support (AIPs)</h4>
                    <p className="text-green-700">
                      Must be claimed within <strong>2 years</strong> of the end of the adult interdependent relationship.
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-6">
                    <h4 className="font-semibold text-indigo-800 mb-3">Spousal Support</h4>
                    <p className="text-indigo-700">
                      Time limits depend on whether the claim is under federal (Divorce Act) or provincial 
                      (Family Law Act) legislation. Generally, claims should be made promptly after separation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Protecting Your Rights</h3>
                <div className="space-y-4">
                  <div className="bg-yellow-50 rounded-lg p-6">
                    <h4 className="font-semibold text-yellow-800 mb-3">Steps to Take Immediately:</h4>
                    <ul className="text-yellow-700 space-y-2">
                      <li>• Document the separation date and circumstances</li>
                      <li>• Consult with a family lawyer as soon as possible</li>
                      <li>• Gather financial documentation and records</li>
                      <li>• Avoid disposing of or transferring significant assets</li>
                      <li>• Consider filing a Statement of Claim to preserve rights</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white mb-6">
                Need a Family Agreement?
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Protect your relationship with a professionally drafted cohabitation, prenuptial, or postnuptial agreement.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/sign-up">
                <button className="bg-white text-blue-600 hover:bg-gray-50 text-lg px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  Start Your Agreement
                </button>
              </Link>
              <Link href="/contact">
                <button className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-lg px-8 py-4 rounded-xl font-semibold">
                  Ask Questions
                </button>
              </Link>
            </div>

            <div className="mt-8 text-white/80 text-sm">
              <p>This information is for educational purposes only and is not legal advice.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}