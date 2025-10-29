"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Note: Metadata should be in layout.tsx for client components
// We'll create a layout file for this

// WhatsApp Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
  </svg>
);

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setStatusMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus("success");
        setStatusMessage(data.message || "Message sent successfully!");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setSubmitStatus("error");
        setStatusMessage(
          data.error || "Failed to send message. Please try again."
        );
      }
    } catch (error) {
      setSubmitStatus("error");
      setStatusMessage(
        "Network error. Please try again or contact us directly."
      );
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-teal">
      <Header />
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-secondary">
              Contact Us
            </h1>
            <p className="text-xl max-w-2xl mx-auto text-secondary">
              Get in touch with us! We&apos;d love to hear from you and help you
              create amazing personalized songs.
            </p>
          </div>

          {/* Contact Information - Moved to Top */}
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Phone & WhatsApp Combined */}
              <div className="bg-secondary rounded-lg p-6 border border-primary text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex space-x-4">
                    <Phone className="h-8 w-8 text-primary" />
                    <WhatsAppIcon className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-teal mb-4">
                  Phone & WhatsApp
                </h3>

                {/* Primary Number */}
                <div className="space-y-2 mb-4">
                  <p className="text-teal font-medium text-lg">+918880522285</p>
                  <div className="flex space-x-2 justify-center">
                    <a
                      href="tel:+918880522285"
                      className="bg-primary text-teal px-3 py-1 rounded-md hover:scale-105 transition-transform font-medium text-sm inline-block"
                    >
                      📞 Call
                    </a>
                    <a
                      href="https://wa.me/918880522285"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors font-medium text-sm flex items-center space-x-1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                      </svg>
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Secondary Number */}
                <div className="space-y-2">
                  <p className="text-teal font-medium text-lg">+919008638618</p>
                  <div className="flex space-x-2 justify-center">
                    <a
                      href="tel:+919008638618"
                      className="bg-primary text-teal px-3 py-1 rounded-md hover:scale-105 transition-transform font-medium text-sm inline-block"
                    >
                      📞 Call
                    </a>
                    <a
                      href="https://wa.me/919008638618"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors font-medium text-sm flex items-center space-x-1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                      </svg>
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-secondary rounded-lg p-6 border border-primary text-center">
                <div className="flex justify-center mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-teal mb-2">Email</h3>
                <p className="text-teal mb-4 font-medium">
                  info@melodia-songs.com
                </p>
                <a
                  href="mailto:info@melodia-songs.com"
                  className="bg-primary text-teal px-4 py-2 rounded-md hover:scale-105 transition-transform font-medium inline-block"
                >
                  Send Email
                </a>
              </div>
            </div>

            {/* Social Media */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-secondary mb-6">
                Follow Us
              </h3>
              <div className="flex justify-center space-x-6">
                <a
                  href="https://www.instagram.com/melodia.songs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-primary transition-colors"
                >
                  <span className="sr-only">Instagram</span>
                  <svg
                    className="h-8 w-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://x.com/melodia_songs?t=-JQpro8iywfJoPTWgsFWDA&s=09"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-primary transition-colors"
                >
                  <span className="sr-only">X (Twitter)</span>
                  <svg
                    className="h-8 w-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L8.084 4.126H6.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form - Moved to Top */}
          <div className="mb-16">
            <div
              id="contact-form"
              className="bg-secondary rounded-lg shadow-elegant p-8 border border-primary max-w-4xl mx-auto"
            >
              <h2 className="text-2xl font-semibold mb-6 text-teal text-center">
                Send us a Message
              </h2>

              {/* Success Message */}
              <form className="space-y-6 mb-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-teal mb-2"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-primary bg-secondary text-teal rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                      placeholder="Your first name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-teal mb-2"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-primary bg-secondary text-teal rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                      placeholder="Your last name"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-teal mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-primary bg-secondary text-teal rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-teal mb-2"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-primary bg-secondary text-teal rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-teal mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-primary bg-secondary text-teal rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-primary hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-teal py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all font-medium shadow-elegant"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>

              {submitStatus === "success" && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6">
                  <p className="font-semibold">✓ Success!</p>
                  <p className="text-sm">{statusMessage}</p>
                </div>
              )}

              {/* Error Message */}
              {submitStatus === "error" && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
                  <p className="font-semibold">✗ Error</p>
                  <p className="text-sm">{statusMessage}</p>
                </div>
              )}
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <div className="rounded-lg p-8 border bg-secondary border-primary">
              <h3 className="text-2xl font-semibold mb-6 text-center text-teal">
                How It Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary">
                    <span className="text-2xl font-bold text-teal">1</span>
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-teal">
                    Tell Us Your Story
                  </h4>
                  <p className="text-teal">
                    Share details about the person, occasion, or moment you want
                    to celebrate.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary">
                    <span className="text-2xl font-bold text-teal">2</span>
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-teal">
                    We Create Your Song
                  </h4>
                  <p className="text-teal">
                    Our team creates personalized lyrics and music tailored to
                    your story.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary">
                    <span className="text-2xl font-bold text-teal">3</span>
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-teal">
                    Share & Enjoy
                  </h4>
                  <p className="text-teal">
                    Download, share, and create lasting memories with your
                    personalized song.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-secondary text-center mb-12">
              Frequently Asked Questions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-secondary rounded-lg shadow-elegant p-6 border border-primary">
                <h3 className="text-lg font-semibold text-teal mb-3">
                  How long does it take to create a song?
                </h3>
                <p className="text-teal">
                  Typically, it takes 2-5 hours to generate your personalized
                  song. Our team creates both lyrics and music tailored to your
                  specifications.
                </p>
              </div>

              {/* <div className="bg-secondary rounded-lg shadow-elegant p-6 border border-primary">
                <h3 className="text-lg font-semibold text-teal mb-3">
                  Can I edit the lyrics after generation?
                </h3>
                <p className="text-teal">
                  Yes! You can edit the generated lyrics before creating the
                  final song. We provide a user-friendly editor for making
                  changes.
                </p>
              </div> */}

              <div className="bg-secondary rounded-lg shadow-elegant p-6 border border-primary">
                <h3 className="text-lg font-semibold text-teal mb-3">
                  What languages are supported?
                </h3>
                <p className="text-teal">
                  We support multiple languages including English, Hindi,
                  Punjabi, Gujrati, French and more. You can specify your
                  preferred language during song creation.
                </p>
              </div>

              <div className="bg-secondary rounded-lg shadow-elegant p-6 border border-primary">
                <h3 className="text-lg font-semibold text-teal mb-3">
                  Is there a limit on song length?
                </h3>
                <p className="text-teal">
                  Songs are typically 2-4 minutes long, which is perfect for
                  most occasions. You can specify if you want a shorter or
                  longer version.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-primary rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-teal mb-4">
              Ready to Create Your First Song?
            </h2>
            <p className="text-xl text-teal mb-8">
              Join thousands of people who have already created meaningful
              musical memories with Melodia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="bg-secondary text-teal px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Start Creating
              </Link>
              <a
                href="#contact-form"
                className="border-2 border-secondary text-secondary px-8 py-3 rounded-full font-semibold text-lg hover:bg-secondary hover:text-teal transition-colors"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
