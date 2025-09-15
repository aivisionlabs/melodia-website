import React from 'react';
import { ArrowLeft, Clock, CreditCard, Shield, CheckCircle, XCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Refund & Cancellation Policy
            </h1>
            <p className="text-xl text-gray-300">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg shadow-lg p-8 prose prose-lg max-w-none border border-slate-700">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Refund Policy</h2>
            <p className="text-gray-300 mb-6">
              At Melodia, we strive to provide the best possible service. However, we understand that sometimes you may need to request a refund. This policy outlines our refund and cancellation procedures.
            </p>

            <h2 className="text-2xl font-semibold text-white mb-4">2. Refund Eligibility</h2>
            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-white">Full Refund Available</h3>
                  <p className="text-gray-300">If song generation fails due to technical issues on our end</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-white">Partial Refund Available</h3>
                  <p className="text-gray-300">If you&apos;re not satisfied with the generated song quality (within 24 hours)</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <XCircle className="h-6 w-6 text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-white">No Refund</h3>
                  <p className="text-gray-300">If you change your mind after successful song generation and download</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-4">3. Refund Process</h2>
            <div className="bg-slate-700 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">How to Request a Refund:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>Contact our support team at <span className="text-yellow-400">support@melodia.com</span></li>
                <li>Provide your order number and reason for refund</li>
                <li>Include any relevant screenshots or details</li>
                <li>We will review your request within 24-48 hours</li>
                <li>If approved, refund will be processed within 5-7 business days</li>
              </ol>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-4">4. Cancellation Policy</h2>
            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <Clock className="h-6 w-6 text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-white">Before Song Generation</h3>
                  <p className="text-gray-300">You can cancel your order anytime before the song generation process begins. Full refund will be provided.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-6 w-6 text-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-white">During Song Generation</h3>
                  <p className="text-gray-300">Once the generation process starts, cancellation may not be possible. Contact support for assistance.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <XCircle className="h-6 w-6 text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-white">After Song Completion</h3>
                  <p className="text-gray-300">Cancellation is not possible after successful song generation and download.</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-4">5. Payment Methods & Refunds</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCard className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Credit/Debit Cards</h3>
                </div>
                <p className="text-gray-300">Refunds will be credited to your original payment method within 5-7 business days.</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Digital Wallets</h3>
                </div>
                <p className="text-gray-300">Refunds to digital wallets may take 3-5 business days to process.</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-4">6. Processing Time</h2>
            <div className="bg-slate-700 rounded-lg p-6 mb-6">
              <ul className="space-y-2 text-gray-300">
                <li><strong className="text-white">Refund Request Review:</strong> 24-48 hours</li>
                <li><strong className="text-white">Refund Processing:</strong> 5-7 business days</li>
                <li><strong className="text-white">Bank Processing:</strong> Additional 2-3 business days (varies by bank)</li>
                <li><strong className="text-white">Total Time:</strong> Up to 10 business days from request approval</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-4">7. Special Circumstances</h2>
            <div className="space-y-4 mb-6">
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Technical Issues</h3>
                <p className="text-gray-300">If our service experiences technical difficulties that prevent song generation, we will provide a full refund or reattempt the generation at no additional cost.</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Quality Issues</h3>
                <p className="text-gray-300">If you&apos;re not satisfied with the song quality, please contact us within 24 hours of receiving your song. We may offer a partial refund or regeneration.</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-4">8. Contact Information</h2>
            <div className="bg-slate-700 rounded-lg p-6 mb-6">
              <p className="text-gray-300 mb-4">For refund requests or questions about this policy, please contact us:</p>
              <ul className="space-y-2 text-gray-300">
                <li><strong className="text-white">Email:</strong> support@melodia.com</li>
                <li><strong className="text-white">Subject Line:</strong> &quot;Refund Request - [Your Order Number]&quot;</li>
                <li><strong className="text-white">Response Time:</strong> Within 24 hours</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-4">9. Policy Updates</h2>
            <p className="text-gray-300 mb-6">
              We reserve the right to update this refund and cancellation policy at any time. Changes will be posted on this page with an updated &quot;Last modified&quot; date. Continued use of our service after changes constitutes acceptance of the new policy.
            </p>

            <div className="mt-8 p-4 bg-yellow-900/20 border-l-4 border-yellow-400">
              <p className="text-yellow-200">
                <strong>Note:</strong> This refund and cancellation policy is designed to be fair to both customers and our business. We aim to resolve all issues amicably and provide excellent customer service.
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
