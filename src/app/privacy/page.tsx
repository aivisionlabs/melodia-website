import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-300">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-lg p-8 prose prose-lg max-w-none border border-slate-700">
          <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
          <p className="text-gray-300 mb-6">
            At Melodia, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered song creation platform.
          </p>

          <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Personal Information</h3>
          <p className="text-gray-300 mb-4">We may collect the following personal information:</p>
          <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
            <li><strong>Account Information:</strong> Name, email address, password, and profile details</li>
            <li><strong>Song Requests:</strong> Recipient names, relationships, occasions, and personal details you provide</li>
            <li><strong>Custom Content:</strong> Lyrics, messages, and other content you create or upload</li>
            <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely through third-party providers)</li>
            <li><strong>Communication Data:</strong> Messages you send to us through contact forms or support channels</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Technical Information</h3>
          <p className="text-gray-300 mb-4">We automatically collect certain technical information:</p>
          <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
            <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
            <li><strong>Usage Data:</strong> Pages visited, features used, time spent, and interaction patterns</li>
            <li><strong>Log Data:</strong> Server logs, error reports, and performance metrics</li>
            <li><strong>Cookies and Tracking:</strong> Information stored in cookies and similar technologies</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-300 mb-4">We use your information for the following purposes:</p>
          <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
            <li><strong>Service Provision:</strong> To create personalized songs and provide our core services</li>
            <li><strong>Account Management:</strong> To create and maintain your user account</li>
            <li><strong>Communication:</strong> To send you updates, notifications, and respond to your inquiries</li>
            <li><strong>Payment Processing:</strong> To process payments and manage subscriptions</li>
            <li><strong>Service Improvement:</strong> To analyze usage patterns and improve our platform</li>
            <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
            <li><strong>Security:</strong> To protect against fraud, abuse, and security threats</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mb-4">4. Information Sharing and Disclosure</h2>
          <p className="text-gray-300 mb-4">We may share your information in the following circumstances:</p>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Service Providers</h3>
          <p className="text-gray-300 mb-4">
            We work with trusted third-party service providers who help us operate our platform:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
            <li>AI and machine learning service providers (Suno, Gemini)</li>
            <li>Payment processors (Razorpay, Stripe)</li>
            <li>Cloud hosting and storage providers</li>
            <li>Analytics and monitoring services</li>
            <li>Customer support tools</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Legal Requirements</h3>
          <p className="text-gray-300 mb-6">
            We may disclose your information if required by law, court order, or to protect our rights, property, or safety, or that of our users or the public.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Business Transfers</h3>
          <p className="text-gray-300 mb-6">
            In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.
          </p>

          <h2 className="text-2xl font-semibold text-white mb-4">5. Data Security</h2>
          <p className="text-gray-300 mb-4">We implement appropriate security measures to protect your information:</p>
          <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
            <li><strong>Encryption:</strong> Data is encrypted in transit and at rest</li>
            <li><strong>Access Controls:</strong> Limited access to personal information on a need-to-know basis</li>
            <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
            <li><strong>Secure Infrastructure:</strong> Industry-standard security practices and monitoring</li>
            <li><strong>Employee Training:</strong> Staff training on data protection and privacy</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mb-4">6. Data Retention</h2>
          <p className="text-gray-300 mb-6">
            We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. Account information is retained while your account is active and for a reasonable period after closure. Generated songs may be retained longer for service continuity and legal compliance.
          </p>

          <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights and Choices</h2>
          <p className="text-gray-300 mb-4">You have the following rights regarding your personal information:</p>
          <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
            <li><strong>Access:</strong> Request a copy of your personal information</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            <li><strong>Restriction:</strong> Limit how we process your information</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mb-4">8. Cookies and Tracking Technologies</h2>
          <p className="text-gray-300 mb-4">We use cookies and similar technologies to:</p>
          <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
            <li>Remember your preferences and settings</li>
            <li>Analyze website traffic and usage patterns</li>
            <li>Provide personalized content and features</li>
            <li>Improve our services and user experience</li>
          </ul>
          <p className="text-gray-300 mb-6">
            You can control cookie settings through your browser preferences, but disabling cookies may affect some functionality.
          </p>

          <h2 className="text-2xl font-semibold text-white mb-4">9. International Data Transfers</h2>
          <p className="text-gray-300 mb-6">
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with applicable data protection laws.
          </p>

          <h2 className="text-2xl font-semibold text-white mb-4">10. Children&apos;s Privacy</h2>
          <p className="text-gray-300 mb-6">
            Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
          </p>

          <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to This Privacy Policy</h2>
          <p className="text-gray-300 mb-6">
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the &quot;Last updated&quot; date. Your continued use of our service after changes constitutes acceptance of the updated policy.
          </p>

          <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Us</h2>
          <p className="text-gray-300 mb-6">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-300">
              <strong>Email:</strong> privacy@melodia.com<br />
              <strong>Address:</strong> 123 Music Street, Creative District, San Francisco, CA 94102<br />
              <strong>Phone:</strong> +1 (555) 123-4567<br />
              <strong>Data Protection Officer:</strong> dpo@melodia.com
            </p>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400">
            <p className="text-blue-800">
              <strong>Note:</strong> This Privacy Policy is designed to comply with major privacy regulations including GDPR, CCPA, and other applicable laws. For specific legal advice, please consult with a qualified attorney.
            </p>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
