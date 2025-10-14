import React from "react";
import Link from "next/link";
import {
  Music,
  Heart,
  Users,
  Zap,
  Award,
  Globe,
  Star,
  Shield,
  Clock,
  Sparkles,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">
              About Melodia
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              We believe that every special moment deserves a unique soundtrack.
              Melodia is a platform that creates personalized songs to celebrate
              the people and moments that matter most in your life.
            </p>
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white px-8 py-3 rounded-full font-semibold text-lg">
                Creating Musical Memories Since 2024
              </div>
            </div>
          </div>

          {/* Our Story */}
          <div className="mb-16">
            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                Our Story
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-gray-300 mb-6 text-lg">
                    Melodia was born from a simple yet powerful idea: what if
                    technology could help us express our deepest emotions
                    through music? Our founders, passionate musicians and
                    technologists, recognized that while everyone has stories
                    worth telling, not everyone has the musical skills to turn
                    those stories into songs.
                  </p>
                  <p className="text-gray-300 mb-6 text-lg">
                    We set out to democratize music creation, making it
                    accessible to everyone regardless of their musical
                    background. Through innovative technology and creative
                    expertise, we&apos;ve created a platform that understands
                    the nuances of human emotion and translates them into
                    beautiful, personalized musical experiences.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-yellow-400" />
                    <span className="text-gray-300">
                      Making music accessible to everyone
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-64 h-64 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto">
                    <Music className="h-32 w-32 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission & Values */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
              <h3 className="text-2xl font-semibold text-white mb-4">
                Our Mission
              </h3>
              <p className="text-gray-300 mb-6">
                To democratize music creation by making it accessible to
                everyone, regardless of musical background or technical
                expertise. We believe that every person has a story worth
                telling through music.
              </p>
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-yellow-400" />
                <span className="text-gray-300">
                  Making music accessible to everyone
                </span>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
              <h3 className="text-2xl font-semibold text-white mb-4">
                Our Values
              </h3>
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
            <h3 className="text-2xl font-semibold text-white mb-6 text-center">
              How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Tell Us Your Story
                </h4>
                <p className="text-gray-300">
                  Share details about the person, occasion, or moment you want
                  to celebrate.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  We Create Your Song
                </h4>
                <p className="text-gray-300">
                  Our team generates personalized lyrics and music tailored to
                  your story.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Share & Enjoy
                </h4>
                <p className="text-gray-300">
                  Download, share, and create lasting memories with your
                  personalized song.
                </p>
              </div>
            </div>
          </div>

          {/* Our Process */}
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-16">
            <h3 className="text-2xl font-semibold text-white mb-6 text-center">
              Our Creative Process
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">
                  Lyrics Creation
                </h4>
                <p className="text-gray-300 mb-4">
                  Our creative team analyzes your input to craft meaningful,
                  personalized lyrics that capture the essence of your story.
                </p>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  <span className="text-gray-300">Creative storytelling</span>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">
                  Music Composition
                </h4>
                <p className="text-gray-300 mb-4">
                  Our talented musicians compose original melodies and harmonies
                  that perfectly complement your lyrics.
                </p>
                <div className="flex items-center space-x-2">
                  <Music className="h-5 w-5 text-yellow-400" />
                  <span className="text-gray-300">
                    Professional music production
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Team & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
              <h3 className="text-2xl font-semibold text-white mb-6">
                Our Team
              </h3>
              <p className="text-gray-300 mb-6">
                We&apos;re a passionate team of musicians, songwriters, and
                creative professionals who believe in the power of music to
                bring people together. Our diverse backgrounds in music and
                creative arts drive us to create meaningful solutions that make
                music creation accessible to everyone.
              </p>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-yellow-400" />
                <span className="text-gray-300">
                  Passionate creators and innovators
                </span>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
              <h3 className="text-2xl font-semibold text-white mb-6">
                By the Numbers
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    10K+
                  </div>
                  <div className="text-gray-300">Songs Created</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    5K+
                  </div>
                  <div className="text-gray-300">Happy Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    15+
                  </div>
                  <div className="text-gray-300">Languages</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    99%
                  </div>
                  <div className="text-gray-300">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>

          {/* Commitment */}
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-16">
            <h3 className="text-2xl font-semibold text-white mb-6 text-center">
              Our Commitment to You
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Privacy First
                </h4>
                <p className="text-gray-300">
                  Your personal stories and data are protected with
                  enterprise-grade security.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Quality Assured
                </h4>
                <p className="text-gray-300">
                  Every song is crafted with care and attention to detail.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Always Available
                </h4>
                <p className="text-gray-300">
                  Create songs anytime, anywhere with our 24/7 platform.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Create Your First Song?
            </h2>
            <p className="text-xl text-yellow-100 mb-8">
              Join thousands of people who have already created meaningful
              musical memories with Melodia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="bg-white text-yellow-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Start Creating
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-white hover:text-yellow-600 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
