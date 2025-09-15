import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, Music, Heart, Users, Zap, Award, Globe } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <div className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get in touch with us! We&apos;d love to hear from you and help you create amazing personalized songs.
          </p>
        </div>

        {/* About Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">
              About Melodia
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8">
              We believe that every special moment deserves a unique soundtrack. Melodia is an AI-powered platform that creates personalized songs to celebrate the people and moments that matter most in your life.
            </p>
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white px-8 py-3 rounded-full font-semibold text-lg">
                Creating Musical Memories Since 2024
              </div>
            </div>
          </div>

          {/* Mission & Values */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
              <h3 className="text-2xl font-semibold text-white mb-4">Our Mission</h3>
              <p className="text-gray-300 mb-6">
                To democratize music creation by making it accessible to everyone, regardless of musical background or technical expertise. We believe that every person has a story worth telling through music.
              </p>
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-yellow-400" />
                <span className="text-gray-300">Making music accessible to everyone</span>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
              <h3 className="text-2xl font-semibold text-white mb-4">Our Values</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center space-x-2">
                  <Music className="h-5 w-5 text-yellow-400" />
                  <span>Creativity and innovation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-yellow-400" />
                  <span>User-centric approach</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  <span>Quality and excellence</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-yellow-400" />
                  <span>Accessibility for all</span>
                </li>
              </ul>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-16">
            <h3 className="text-2xl font-semibold text-white mb-6 text-center">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Tell Us Your Story</h4>
                <p className="text-gray-300">Share details about the person, occasion, or moment you want to celebrate.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">AI Creates Your Song</h4>
                <p className="text-gray-300">Our advanced AI generates personalized lyrics and music tailored to your story.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Share & Enjoy</h4>
                <p className="text-gray-300">Download, share, and create lasting memories with your personalized song.</p>
              </div>
            </div>
          </div>

          {/* Technology */}
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-16">
            <h3 className="text-2xl font-semibold text-white mb-6 text-center">Powered by Advanced AI</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Lyrics Generation</h4>
                <p className="text-gray-300 mb-4">
                  Our AI analyzes your input to create meaningful, personalized lyrics that capture the essence of your story.
                </p>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  <span className="text-gray-300">Natural language processing</span>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Music Composition</h4>
                <p className="text-gray-300 mb-4">
                  Advanced algorithms compose original melodies and harmonies that perfectly complement your lyrics.
                </p>
                <div className="flex items-center space-x-2">
                  <Music className="h-5 w-5 text-yellow-400" />
                  <span className="text-gray-300">AI music generation</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">
                Get in Touch
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Mail className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Email</h3>
                    <p className="text-gray-300">support@melodia.com</p>
                    <p className="text-gray-300">hello@melodia.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Phone className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Phone</h3>
                    <p className="text-gray-300">+1 (555) 123-4567</p>
                    <p className="text-gray-300">+1 (555) 987-6543</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <MapPin className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Address</h3>
                    <p className="text-gray-300">
                      123 Music Street<br />
                      Creative District<br />
                      San Francisco, CA 94102
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Business Hours</h3>
                    <p className="text-gray-300">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div id="contact-form" className="bg-slate-800 rounded-lg shadow-lg p-8 border border-slate-700">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Send us a Message
            </h2>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors font-medium"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-800 rounded-lg shadow-md p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                How long does it take to create a song?
              </h3>
              <p className="text-gray-300">
                Typically, it takes 2-5 minutes to generate your personalized song. The AI creates both lyrics and music tailored to your specifications.
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg shadow-md p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                Can I edit the lyrics after generation?
              </h3>
              <p className="text-gray-300">
                Yes! You can edit the generated lyrics before creating the final song. We provide a user-friendly editor for making changes.
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg shadow-md p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                What languages are supported?
              </h3>
              <p className="text-gray-300">
                We support multiple languages including English, Hindi, Spanish, French, and more. You can specify your preferred language during song creation.
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg shadow-md p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                Is there a limit on song length?
              </h3>
              <p className="text-gray-300">
                Songs are typically 2-4 minutes long, which is perfect for most occasions. You can specify if you want a shorter or longer version.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create Your First Song?
          </h2>
          <p className="text-xl text-yellow-100 mb-8">
            Join thousands of people who have already created meaningful musical memories with Melodia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-white text-yellow-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Start Creating
            </Link>
            <a
              href="#contact-form"
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-white hover:text-yellow-600 transition-colors"
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
