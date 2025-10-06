import React from "react";
import Link from "next/link";
import {
  RefreshCw,
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RefundPolicyPage() {
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
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our commitment to fair and transparent refund practices for our
              AI-powered song creation service.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Last updated: January 2024
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Policy Overview
            </h2>
            <p className="text-gray-300 mb-4">
              At Melodia, we strive to provide exceptional AI-generated songs
              that meet your expectations. This Refund & Cancellation Policy
              outlines the circumstances under which refunds may be issued and
              our cancellation procedures.
            </p>
            <p className="text-gray-300">
              We believe in fair and transparent practices, and we&apos;re
              committed to resolving any issues you may have with our service.
            </p>
          </div>

          {/* Refund Eligibility */}
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Refund Eligibility
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  Eligible for Refund
                </h3>
                <ul className="text-gray-300 space-y-2 ml-7">
                  <li>• Technical failure preventing song generation</li>
                  <li>• Service unavailable for more than 24 hours</li>
                  <li>• Duplicate charges due to system error</li>
                  <li>• Song generation fails to complete after 30 minutes</li>
                  <li>• Significant deviation from requested specifications</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <XCircle className="h-5 w-5 text-red-400 mr-2" />
                  Not Eligible for Refund
                </h3>
                <ul className="text-gray-300 space-y-2 ml-7">
                  <li>• Change of mind after successful song generation</li>
                  <li>• Dissatisfaction with AI-generated content quality</li>
                  <li>• Personal preference regarding musical style</li>
                  <li>• Failure to provide accurate input information</li>
                  <li>
                    • Account termination due to Terms of Service violations
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Refund Process */}
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Refund Process
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Clock className="h-5 w-5 text-yellow-400 mr-2" />
                  How to Request a Refund
                </h3>
                <ol className="text-gray-300 space-y-2 ml-7">
                  <li>
                    1. Contact our support team within 7 days of the issue
                  </li>
                  <li>2. Provide your order number and account details</li>
                  <li>3. Describe the specific issue you encountered</li>
                  <li>4. Include any relevant screenshots or error messages</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <RefreshCw className="h-5 w-5 text-yellow-400 mr-2" />
                  Processing Timeline
                </h3>
                <ul className="text-gray-300 space-y-2 ml-7">
                  <li>• Initial response within 24 hours</li>
                  <li>• Investigation period: 2-5 business days</li>
                  <li>• Refund processing: 3-10 business days</li>
                  <li>
                    • Refund appears on your statement: 1-2 billing cycles
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Cancellation Policy
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Song Generation Cancellation
                </h3>
                <p className="text-gray-300 mb-4">
                  You may cancel a song generation request before the AI begins
                  processing. Once processing has started, cancellation may not
                  be possible due to the automated nature of our service.
                </p>
                <ul className="text-gray-300 space-y-2 ml-4">
                  <li>
                    • Cancellation within 5 minutes of request: Full refund
                  </li>
                  <li>
                    • Cancellation after processing begins: Case-by-case
                    evaluation
                  </li>
                  <li>• Cancellation due to technical issues: Full refund</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Account Cancellation
                </h3>
                <p className="text-gray-300">
                  You may cancel your account at any time. Account cancellation
                  will not automatically trigger refunds for previous purchases,
                  but you may request refunds for eligible transactions
                  separately.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <CreditCard className="h-6 w-6 text-yellow-400 mr-2" />
              Refund Methods
            </h2>

            <div className="space-y-4">
              <p className="text-gray-300">
                Refunds will be processed using the same payment method used for
                the original transaction:
              </p>

              <ul className="text-gray-300 space-y-2 ml-4">
                <li>
                  • <strong>Credit/Debit Cards:</strong> Refunded to the
                  original card
                </li>
                <li>
                  • <strong>PayPal:</strong> Refunded to your PayPal account
                </li>
                <li>
                  • <strong>Bank Transfer:</strong> Refunded to your bank
                  account
                </li>
                <li>
                  • <strong>Digital Wallets:</strong> Refunded to your wallet
                  account
                </li>
              </ul>

              <p className="text-gray-300">
                If the original payment method is no longer available, we may
                issue refunds via alternative methods at our discretion.
              </p>
            </div>
          </div>

          {/* Special Circumstances */}
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Special Circumstances
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <AlertCircle className="h-5 w-5 text-orange-400 mr-2" />
                  Force Majeure Events
                </h3>
                <p className="text-gray-300">
                  In cases of force majeure events (natural disasters,
                  pandemics, etc.) that affect our service availability, we will
                  work with customers on a case-by-case basis to provide
                  appropriate solutions, which may include refunds or service
                  credits.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Technical Issues
                </h3>
                <p className="text-gray-300">
                  If our AI systems experience widespread technical issues
                  affecting multiple users, we may proactively issue refunds or
                  service credits without requiring individual requests.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Billing Errors
                </h3>
                <p className="text-gray-300">
                  Any billing errors on our part will be corrected immediately,
                  and affected customers will receive full refunds plus any
                  applicable compensation.
                </p>
              </div>
            </div>
          </div>

          {/* Dispute Resolution */}
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Dispute Resolution
            </h2>

            <div className="space-y-4">
              <p className="text-gray-300">
                If you disagree with our refund decision, you may:
              </p>

              <ol className="text-gray-300 space-y-2 ml-4">
                <li>
                  1. <strong>Appeal:</strong> Request a review by our management
                  team
                </li>
                <li>
                  2. <strong>Mediation:</strong> Engage in mediation through a
                  third-party service
                </li>
                <li>
                  3. <strong>Legal Action:</strong> Pursue legal remedies as
                  permitted by law
                </li>
              </ol>

              <p className="text-gray-300">
                We encourage customers to contact us first to resolve any
                disputes amicably before pursuing other options.
              </p>
            </div>
          </div>

          {/* Policy Updates */}
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Policy Updates
            </h2>

            <p className="text-gray-300">
              We may update this Refund & Cancellation Policy from time to time.
              Changes will be posted on this page with an updated &quot;Last
              updated&quot; date. We encourage you to review this policy
              periodically.
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Contact Us for Refunds
            </h2>

            <p className="text-gray-300 mb-6">
              To request a refund or discuss cancellation, please contact us:
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-yellow-400" />
                <span className="text-gray-300">aivisionlabs555@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-yellow-400" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="text-gray-300">
                <p>Please include:</p>
                <ul className="ml-4 mt-2 space-y-1">
                  <li>• Your order number</li>
                  <li>• Account email address</li>
                  <li>• Description of the issue</li>
                  <li>• Preferred refund method</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Need Help with a Refund?
            </h2>
            <p className="text-xl text-yellow-100 mb-8">
              Our support team is here to help resolve any issues quickly and
              fairly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-yellow-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Contact Support
              </Link>
              <Link
                href="/terms"
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-white hover:text-yellow-600 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
