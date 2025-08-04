import { Navigation } from '@/components/navigation';

export default function PrivacyPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Privacy Policy
              </h1>
              <p className="text-lg text-gray-600">
                Agreeable.ca Privacy Policy
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="prose max-w-none">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 font-medium mb-2">Privacy Commitment:</p>
                <p className="text-blue-700 text-sm">
                  Agreeable.ca is committed to protecting your privacy and personal information in compliance with 
                  Canadian federal privacy laws (PIPEDA) and Alberta provincial privacy laws (PIPA and POPA where applicable). 
                  This policy explains how we collect, use, disclose, and protect your personal information.
                </p>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-600 mb-4">
                We collect personal information that you voluntarily provide to us when using our family contract creation service:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
                <li><strong>Contact Information:</strong> Name, email address, phone number, mailing address</li>
                <li><strong>Account Information:</strong> Username, password, account preferences</li>
                <li><strong>Contract Information:</strong> Personal details required for family contract creation including:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Full names, birthdates, and personal identifiers</li>
                    <li>Financial information (assets, debts, income)</li>
                    <li>Family information (children, dependents, relationships)</li>
                    <li>Property ownership and asset details</li>
                    <li>Employment and professional information</li>
                  </ul>
                </li>
                <li><strong>Payment Information:</strong> Billing address and payment method details (processed securely through Stripe)</li>
                <li><strong>Technical Information:</strong> IP address, browser type, device information, usage patterns</li>
                <li><strong>Communication Records:</strong> Support requests, feedback, and correspondence</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-600 mb-4">
                We use your personal information for the following purposes, in compliance with PIPEDA and Alberta PIPA:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
                <li><strong>Service Delivery:</strong> Creating, customizing, and generating your family contracts and agreements</li>
                <li><strong>Account Management:</strong> Creating and maintaining your user account, authentication, and access control</li>
                <li><strong>Payment Processing:</strong> Processing payments for our services through secure third-party processors</li>
                <li><strong>Customer Support:</strong> Responding to inquiries, providing technical support, and resolving issues</li>
                <li><strong>Legal Compliance:</strong> Meeting legal obligations under Canadian and Alberta privacy laws</li>
                <li><strong>Service Improvement:</strong> Analyzing usage patterns to enhance our platform and user experience</li>
                <li><strong>Security:</strong> Protecting against fraud, unauthorized access, and security threats</li>
                <li><strong>Communication:</strong> Sending important updates about your account, service changes, and legal notices</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Legal Basis for Processing</h2>
              <p className="text-gray-600 mb-4">
                Under PIPEDA and Alberta PIPA, we process your personal information based on:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
                <li><strong>Consent:</strong> You provide explicit consent when creating an account and using our services</li>
                <li><strong>Contract Performance:</strong> Processing necessary to fulfill our service agreement with you</li>
                <li><strong>Legal Obligations:</strong> Compliance with applicable Canadian and Alberta privacy laws</li>
                <li><strong>Legitimate Interests:</strong> Fraud prevention, security, and service improvement where appropriate</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-gray-600 mb-4">
                We do not sell, trade, or rent your personal information. We may share your information only in the following limited circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
                <li><strong>Service Providers:</strong> Trusted third-party vendors who assist in service delivery (payment processing, hosting, analytics)</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or legal process</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of business assets</li>
                <li><strong>Protection of Rights:</strong> To protect our rights, property, safety, or that of our users</li>
                <li><strong>With Consent:</strong> Any other sharing with your explicit consent</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Security and Protection</h2>
              <p className="text-gray-600 mb-4">
                We implement comprehensive security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
                <li><strong>Encryption:</strong> Data encrypted in transit and at rest using industry-standard protocols</li>
                <li><strong>Access Controls:</strong> Limited access to personal information on a need-to-know basis</li>
                <li><strong>Secure Infrastructure:</strong> Secure hosting with regular security updates and monitoring</li>
                <li><strong>Employee Training:</strong> Staff trained on privacy protection and data handling procedures</li>
                <li><strong>Regular Audits:</strong> Periodic security assessments and vulnerability testing</li>
                <li><strong>Incident Response:</strong> Procedures for detecting, reporting, and responding to data breaches</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-600 mb-6">
                We retain your personal information only as long as necessary to fulfill the purposes for which it was collected, 
                comply with legal obligations, and resolve disputes. Generally, account information is retained while your account 
                is active and for a reasonable period after account closure. Contract information may be retained for legal and 
                administrative purposes. You may request deletion of your information at any time, subject to legal retention requirements.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Your Privacy Rights</h2>
              <p className="text-gray-600 mb-4">
                Under PIPEDA and Alberta PIPA, you have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
                <li><strong>Access:</strong> Request access to your personal information we hold</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Withdrawal of Consent:</strong> Withdraw consent for processing (may limit service availability)</li>
                <li><strong>Data Portability:</strong> Request your data in a portable format</li>
                <li><strong>Complaint:</strong> File complaints with privacy regulators if you believe your rights have been violated</li>
              </ul>
              <p className="text-gray-600 mb-6">
                To exercise these rights, contact us using the information provided below. We will respond to your requests 
                within 45 days as required by Alberta PIPA, or within 30 days as required by PIPEDA.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Privacy Breach Notification</h2>
              <p className="text-gray-600 mb-6">
                In the event of a privacy breach that creates a real risk of significant harm, we will notify affected individuals 
                and relevant privacy authorities without unreasonable delay, in accordance with PIPEDA and Alberta PIPA requirements. 
                We will provide information about the breach, potential harm, and steps taken to address the situation.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-600 mb-6">
                While we primarily store and process data within Canada, some service providers may be located outside Canada. 
                When personal information is transferred internationally, we ensure appropriate safeguards are in place to protect 
                your information in accordance with Canadian privacy standards.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Cookies and Tracking Technologies</h2>
              <p className="text-gray-600 mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
                <li><strong>Essential Cookies:</strong> Required for basic site functionality and security</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use our service to improve performance</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="text-gray-600 mb-6">
                You can control cookie settings through your browser preferences.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Children's Privacy</h2>
              <p className="text-gray-600 mb-6">
                Our service is not intended for individuals under 18 years of age. We do not knowingly collect personal 
                information from children. If we become aware that we have collected personal information from a child, 
                we will take steps to delete such information promptly.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Privacy Officer and Contact Information</h2>
              <p className="text-gray-600 mb-4">
                We have designated a Privacy Officer responsible for ensuring compliance with privacy laws and handling privacy-related inquiries:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-gray-800 font-medium mb-2">Privacy Officer Contact:</p>
                <p className="text-gray-700 text-sm">
                  Email: privacy@agreeable.ca<br />
                  Subject Line: "Privacy Inquiry - [Your Request Type]"<br />
                  Response Time: Within 45 days for Alberta PIPA requests, 30 days for PIPEDA requests
                </p>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Regulatory Authority Contact Information</h2>
              <p className="text-gray-600 mb-4">
                If you have concerns about our privacy practices that cannot be resolved directly with us, you may contact:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
                <li><strong>Federal:</strong> Office of the Privacy Commissioner of Canada (PIPEDA complaints)</li>
                <li><strong>Alberta:</strong> Office of the Information and Privacy Commissioner of Alberta (PIPA complaints)</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Changes to This Privacy Policy</h2>
              <p className="text-gray-600 mb-6">
                We may update this privacy policy periodically to reflect changes in our practices, services, or legal requirements. 
                We will notify you of significant changes by email or through our service. The updated policy will be effective 
                immediately upon posting, and your continued use constitutes acceptance of the changes.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">15. Compliance and Accountability</h2>
              <p className="text-gray-600 mb-6">
                We are committed to ongoing compliance with PIPEDA, Alberta PIPA, and other applicable privacy laws. 
                We regularly review and update our privacy practices, conduct staff training, and maintain documentation 
                to demonstrate our accountability for privacy protection.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8">
                <p className="text-green-800 text-sm">
                  <strong>Questions or Concerns:</strong> If you have any questions about this Privacy Policy or our privacy practices, 
                  please contact our Privacy Officer at privacy@agreeable.ca. We are committed to addressing your concerns promptly 
                  and transparently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}