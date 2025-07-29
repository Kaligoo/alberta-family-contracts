import { Navigation } from '@/components/navigation';

export default function FAQPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600">
              Everything you need to know about cohabitation agreements in Alberta
            </p>
          </div>

          <div className="space-y-8">
            {/* Section 1: Basic Information */}
            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    What is a cohabitation agreement?
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    A cohabitation agreement is a legally binding contract between two people who are living together 
                    or planning to live together in a romantic relationship but are not married. In Alberta, this agreement 
                    outlines how property, debts, and other financial matters will be handled during the relationship and 
                    in the event of separation.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Do I need a cohabitation agreement in Alberta?
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    While not legally required, a cohabitation agreement is highly recommended for unmarried couples in Alberta. 
                    Unlike married couples, common-law partners (called "adult interdependent partners" in Alberta) have limited 
                    property rights under Alberta's Family Property Act (2020). A cohabitation agreement provides clarity and 
                    protection for both parties regarding property division and support obligations.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    When should I consider getting a cohabitation agreement?
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    You should consider a cohabitation agreement if you're planning to move in together, 
                    have significant assets or debts, own property together, have children from previous relationships, 
                    or want to clarify financial responsibilities and expectations in your relationship.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Is this agreement also a prenuptial agreement?
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    <strong>Yes!</strong> Our cohabitation agreement is specifically drafted to function as both a cohabitation 
                    agreement and a prenuptial agreement. This means that if you decide to get married later, your existing 
                    agreement automatically continues to protect both parties as a marriage contract—you won't need to purchase 
                    another contract.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    This dual functionality provides exceptional value because:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 mb-3 space-y-1">
                    <li>You're protected whether you remain common-law partners or get married</li>
                    <li>There's no need to create a separate prenuptial agreement if you decide to marry</li>
                    <li>Your financial arrangements and property agreements remain consistent through relationship changes</li>
                    <li>You save money by not having to purchase additional legal documents</li>
                  </ul>
                  <p className="text-gray-600 leading-relaxed">
                    The agreement includes specific provisions that address both cohabitation and marriage scenarios, 
                    ensuring comprehensive protection regardless of your relationship status. This makes it an excellent 
                    investment for couples who are living together and may consider marriage in the future.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: Legal Requirements */}
            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Legal Requirements in Alberta</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    What is an Adult Interdependent Partner in Alberta?
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Under Alberta's Family Law Act, you are considered "adult interdependent partners" if you:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
                    <li>Have lived together in a relationship of interdependence for at least 3 continuous years</li>
                    <li>Have lived together in a relationship of interdependence and have a child together</li>
                    <li>Have entered into an adult interdependent partner agreement</li>
                  </ul>
                  <p className="text-gray-600 leading-relaxed">
                    Adult interdependent partners have some legal rights under the Family Property Act (2020), but these 
                    rights are more limited than those of married couples.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    How does the Family Property Act (2020) affect unmarried couples?
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    The Family Property Act, which replaced the Matrimonial Property Act in 2020, provides some property 
                    rights for adult interdependent partners, but these are more limited than for married couples. 
                    Adult interdependent partners may have claims to property acquired during the relationship, but 
                    the process is more complex and uncertain than for married couples.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Legal Requirements for Agreements */}
            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Requirements for Valid Agreements</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    What makes a cohabitation agreement legally binding in Alberta?
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    For a cohabitation agreement to be legally binding in Alberta, it must be:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                    <li>In writing and signed by both parties</li>
                    <li>Made voluntarily without coercion or duress</li>
                    <li>Based on full financial disclosure from both parties</li>
                    <li>Fair and reasonable at the time it was made</li>
                    <li>Properly witnessed (recommended)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Do we need lawyers to create a cohabitation agreement?
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Under Section 38 of Alberta's Family Property Act, if you want your cohabitation agreement to have 
                    the strongest legal protection, each party must obtain independent legal advice from separate lawyers. 
                    The Act specifically states that "the acknowledgements shall be made before a different lawyer for each party."
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    This requirement ensures that both parties fully understand the agreement and that it meets all legal 
                    requirements for enforceability. Courts will look much more favorably on agreements where both parties 
                    had independent legal representation from different lawyers.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Why do we need separate lawyers under Alberta law?
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Section 38 of the Family Property Act requires each party to have their own independent lawyer to 
                    ensure maximum legal protection. This means:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 mb-3 space-y-1">
                    <li>Each person must consult with their own lawyer (not the same lawyer)</li>
                    <li>Each lawyer provides independent advice to their client only</li>
                    <li>This prevents conflicts of interest and ensures fair representation</li>
                    <li>Both lawyers confirm their clients understand the agreement's implications</li>
                    <li>The separate legal advice makes the agreement much stronger in court</li>
                  </ul>
                  <p className="text-gray-600 leading-relaxed">
                    While agreements without separate lawyers may still be valid, following Section 38 provides the 
                    strongest legal protection and enforceability.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Can a cohabitation agreement be changed or cancelled?
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Yes, a cohabitation agreement can be modified or cancelled, but both parties must agree to the changes 
                    in writing. It's recommended to review and update your agreement periodically, especially after major 
                    life events like having children, buying property, or significant changes in income.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: What to Include */}
            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What Should Be Included</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    What topics should a cohabitation agreement cover under Alberta law?
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    A comprehensive cohabitation agreement should address:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Property ownership and division (including exempt and family property under the Family Property Act)</li>
                    <li>Debt responsibility and management</li>
                    <li>Household expenses and financial contributions</li>
                    <li>Bank accounts and investments</li>
                    <li>Partner support obligations (formerly spousal support)</li>
                    <li>Children and parenting arrangements</li>
                    <li>Life insurance and beneficiaries</li>
                    <li>Whether you want to be considered adult interdependent partners</li>
                    <li>Dispute resolution procedures (mediation, arbitration)</li>
                    <li>What happens if you marry later</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    How should we handle property under the Family Property Act?
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Under Alberta's Family Property Act (2020), property is classified as either "exempt property" 
                    (generally property owned before the relationship) or "family property" (property acquired during 
                    the relationship). For adult interdependent partners, the division rules are complex and different 
                    from married couples. Your cohabitation agreement should clearly specify how all property will be 
                    treated, including pre-relationship property, increases in value, and jointly acquired property.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    What about spousal support in Alberta?
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Under Alberta's Family Law Act, adult interdependent partners may be entitled to partner support after separation 
                    if they qualify as adult interdependent partners (lived together for at least 3 years, have a child together, 
                    or entered into an adult interdependent partner agreement). Your cohabitation agreement can address whether 
                    partner support will be paid and under what circumstances.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: Common Concerns */}
            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Concerns</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Will having a cohabitation agreement hurt our relationship?
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Many couples find that discussing and creating a cohabitation agreement actually strengthens their 
                    relationship by encouraging open communication about finances, expectations, and future goals. 
                    It's a practical step that demonstrates commitment to fairness and transparency.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    What happens if we get married later?
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our cohabitation agreement is designed to automatically continue as a marriage contract (prenuptial agreement) 
                    if you decide to get married—no additional purchase required! The agreement includes specific provisions 
                    that address both cohabitation and marriage scenarios, ensuring your protection and financial arrangements 
                    remain consistent whether you're common-law partners or married. See the "Is this agreement also a prenuptial 
                    agreement?" section above for more details about this dual functionality.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    How much does a cohabitation agreement cost?
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Costs vary depending on complexity and whether you use lawyers. Simple agreements might cost a few 
                    hundred dollars, while complex agreements with full legal representation can cost several thousand dollars. 
                    However, this is often much less expensive than resolving disputes through court proceedings later.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Can the court override our cohabitation agreement?
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Under the Family Property Act (2020), Alberta courts generally respect cohabitation agreements that were 
                    fairly made with proper disclosure and independent legal advice. However, courts may set aside agreements 
                    if they are found to be significantly unfair, were made under duress, involved material non-disclosure, 
                    or if circumstances have changed dramatically since signing. The Act provides courts with discretion to 
                    ensure fair outcomes.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6: Getting Help */}
            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Help</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Where can I get more information about Alberta family law?
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    For more detailed information about family law in Alberta, you can consult:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Alberta Courts website (albertacourts.ca)</li>
                    <li>Legal Aid Alberta</li>
                    <li>Law Society of Alberta for lawyer referrals</li>
                    <li>Family Justice Services</li>
                    <li>A qualified family law lawyer</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Should I use a template or hire lawyers?
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    While well-drafted templates can provide a starting point, Section 38 of the Family Property Act 
                    strongly encourages each party to obtain independent legal advice from separate lawyers for maximum 
                    legal protection. This is especially important if you have significant assets, complex financial 
                    situations, children, or business interests. Even with simpler situations, having both parties 
                    consult with different qualified Alberta family lawyers ensures your agreement meets all legal 
                    requirements and will be enforceable when needed.
                  </p>
                </div>
              </div>
            </section>

            {/* Important Legal Requirement */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Family Property Act Section 38 Requirement
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    <strong>Each party must obtain independent legal advice from a different lawyer</strong> for the strongest 
                    legal protection. The Family Property Act specifically requires separate legal counsel to ensure both 
                    parties fully understand their rights and obligations under the agreement.
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Legal Disclaimer
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    This information is provided for general educational purposes only and does not constitute legal advice. 
                    Alberta family law, including the Family Property Act (2020) and related legislation, can be complex, 
                    and every situation is unique. Always consult with a qualified Alberta family law lawyer for advice 
                    specific to your circumstances.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}