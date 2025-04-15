
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Globe, Lock, Heart, Map, Users, Shield } from "lucide-react";

export const PublicHome: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="bg-white shadow-sm dark:bg-gray-900 mb-6">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gestalt-purple flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <span className="text-xl font-bold text-gestalt-purple-dark">Gestalt</span>
              </Link>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/onboarding"
                className="inline-flex items-center justify-center rounded-md bg-gestalt-purple px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-gestalt-purple-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gestalt-purple"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="py-12 md:py-20">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 md:text-6xl">
            <span className="text-gestalt-purple">Gestalt</span>: Connect with your local community
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A local-first, privacy-respecting platform for meaningful connections and healthy digital engagement.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/onboarding" className="inline-flex items-center justify-center rounded-md bg-gestalt-purple px-6 py-3 text-base font-medium text-white shadow transition-colors hover:bg-gestalt-purple-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gestalt-purple">
              Explore Your Community
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/about" className="inline-flex items-center justify-center rounded-md border border-gestalt-purple bg-transparent px-6 py-3 text-base font-medium text-gestalt-purple shadow-sm transition-colors hover:bg-gestalt-purple/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gestalt-purple">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-12 bg-gestalt-gray/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Core Principles</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Local First */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gestalt-purple/10 flex items-center justify-center mb-4">
                <Map className="h-6 w-6 text-gestalt-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Local First</h3>
              <p className="text-gray-600">
                Rooted in your local community by default, with the ability to expand your scope outward as needed.
              </p>
            </div>

            {/* User Empowerment */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gestalt-purple/10 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-gestalt-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3">User Empowerment</h3>
              <p className="text-gray-600">
                Your data is yours. We believe in privacy-respecting, portable data without exploitative algorithms.
              </p>
            </div>

            {/* Healthy UX */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gestalt-purple/10 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-gestalt-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Healthy UX</h3>
              <p className="text-gray-600">
                We avoid addictive patterns and design for digital wellness, encouraging meaningful engagement.
              </p>
            </div>

            {/* Modular Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gestalt-purple/10 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-gestalt-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Modular Information</h3>
              <p className="text-gray-600">
                Add/remove feeds from various sources, curating your information landscape exactly as you prefer.
              </p>
            </div>

            {/* Community Driven */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gestalt-purple/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-gestalt-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Driven</h3>
              <p className="text-gray-600">
                Community moderation, positive reinforcement, and collaborative tools over top-down control.
              </p>
            </div>

            {/* Open Source */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gestalt-purple/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-gestalt-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Open Source</h3>
              <p className="text-gray-600">
                Fully open-source and self-hostable. Anyone can run their own instance or contribute to the project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gestalt-purple text-white">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to connect with your local community?</h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto opacity-90">
            Join Gestalt today and discover a healthier, more meaningful way to engage with your local community and beyond.
          </p>
          <Link
            to="/onboarding"
            className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-base font-medium text-gestalt-purple shadow transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
