'use client';

import { useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DollarSign, Search, Calendar, Award } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ScholarshipsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Find Scholarships
          </h1>
          <p className="text-lg text-gray-600">
            Browse 126 verified scholarships
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search scholarships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Coming Soon Message */}
        <Card>
          <CardBody className="text-center py-12">
            <Award className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Scholarships Coming Soon
            </h2>
            <p className="text-gray-600 mb-6">
              We're working on bringing you 126 verified scholarships. Check back soon!
            </p>
            <Button variant="primary">
              Get Notified
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
