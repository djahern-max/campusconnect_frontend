// src/app/contact/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { Building2, Mail, Phone, Check } from 'lucide-react';
import apiClient from '@/api/client';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution_name: '',
    phone_number: '',
    inquiry_type: 'HIGHER_EDUCATION',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Submit to backend API
      await apiClient.post('/contact/submit', {
        name: formData.name,
        email: formData.email,
        institution_name: formData.institution_name,
        phone_number: formData.phone_number || null,
        inquiry_type: formData.inquiry_type,
        message: formData.message
      });

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit inquiry:', err);
      setError(err.response?.data?.detail || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full">
          <CardBody className="text-center py-12">
            <div className="mb-6 flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <Check className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Thank You!
            </h2>
            <p className="text-gray-600 mb-6">
              We've received your inquiry and will be in touch within 1-2 business days.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: '',
                  email: '',
                  institution_name: '',
                  phone_number: '',
                  inquiry_type: 'HIGHER_EDUCATION',
                  message: ''
                });
              }}
              className="bg-gray-900 hover:bg-gray-800"
            >
              Submit Another Inquiry
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get Your Institution on TheCollegeDirectory.com
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join hundreds of institutions showcasing their programs to prospective students.
            Create a rich, customizable page to tell your story.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <BenefitCard
            icon={<Building2 className="h-8 w-8 text-gray-900" />}
            title="Rich Profiles"
            description="Upload galleries, videos, and detailed content about your institution"
          />
          <BenefitCard
            icon={<Mail className="h-8 w-8 text-gray-900" />}
            title="Reach Students"
            description="Connect with students actively searching for their perfect college match"
          />
          <BenefitCard
            icon={<Phone className="h-8 w-8 text-gray-900" />}
            title="Easy Management"
            description="Update your profile anytime through our simple admin dashboard"
          />
        </div>

        {/* Contact Form */}
        <Card>
          <CardBody>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Request Information
            </h2>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@institution.edu"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="institution_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Institution/Organization Name *
                  </label>
                  <Input
                    id="institution_name"
                    name="institution_name"
                    type="text"
                    required
                    value={formData.institution_name}
                    onChange={handleChange}
                    placeholder="University of Example"
                  />
                </div>

                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="inquiry_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  id="inquiry_type"
                  name="inquiry_type"
                  required
                  value={formData.inquiry_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="HIGHER_EDUCATION">Higher Education Institution</option>
                  <option value="SCHOLARSHIP_ORGANIZATION">Scholarship Organization</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Tell us about your institution and what you're looking for..."
                />
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Pricing:</strong> $39.99/month with a 1 YEAR FREE TRIAL!!
                  That's right - you pay nothing for an entire year, then just $39.99/month after that.  We need your help buildign the most comprehinsive college directory on the web!  Our mission is to help students pay for college and realize their true potential.  Join us!
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Cancel anytime. No long-term contracts required.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full bg-gray-900 hover:bg-gray-800"
              >
                Submit Inquiry
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Questions? Email us at{' '}
            <a href="mailto:dane@magicscholar.com" className="text-gray-900 font-medium hover:underline">
              dane@magicscholar.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}