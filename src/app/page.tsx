'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Search, GraduationCap, DollarSign, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-800 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Find Your Perfect College Match
            </h1>
            <p className="text-xl sm:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Discover institutions and scholarships that align with your goals, all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/institutions">
                <Button variant="accent" size="lg" className="w-full sm:w-auto">
                  <Search className="mr-2 h-5 w-5" />
                  Explore Institutions
                </Button>
              </Link>
              <Link href="/scholarships">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Find Scholarships
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose CampusConnect?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to make informed college decisions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<GraduationCap className="h-12 w-12 text-primary-600" />}
              title="609 Institutions"
              description="Browse comprehensive profiles of colleges and universities across the United States"
            />
            <FeatureCard
              icon={<DollarSign className="h-12 w-12 text-success-600" />}
              title="126 Scholarships"
              description="Find verified scholarships with detailed requirements and application information"
            />
            <FeatureCard
              icon={<TrendingUp className="h-12 w-12 text-accent-600" />}
              title="Rich Content"
              description="Virtual campus tours, videos, galleries, and detailed program information"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <StatCard number="609" label="Institutions" />
            <StatCard number="126" label="Scholarships" />
            <StatCard number="50+" label="States Covered" />
            <StatCard number="100%" label="Verified Data" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            For Institutions
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Showcase your campus with rich profiles, galleries, and videos
          </p>
          <Link href="/admin/login">
            <Button variant="accent" size="lg">
              Start Free Trial
            </Button>
          </Link>
          <p className="mt-4 text-sm text-primary-200">
            30-day free trial • $39.99/month after • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl sm:text-5xl font-bold text-primary-600 mb-2">{number}</div>
      <div className="text-gray-600 text-lg">{label}</div>
    </div>
  );
}
