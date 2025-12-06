// src/components/public/ScholarshipCard.tsx
import React from 'react';
import { Scholarship } from '@/types';
import { MapPin, Calendar, Award } from 'lucide-react';

interface ScholarshipCardProps {
    scholarship: Scholarship;
    onClick?: () => void;
}

export default function ScholarshipCard({ scholarship, onClick }: ScholarshipCardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatScholarshipType = (type: string) => {
        return type.split('_').map(word =>
            word.charAt(0) + word.slice(1).toLowerCase()
        ).join(' ');
    };

    const amountDisplay = scholarship.amount_min === scholarship.amount_max
        ? formatCurrency(scholarship.amount_min)
        : `${formatCurrency(scholarship.amount_min)} - ${formatCurrency(scholarship.amount_max)}`;

    // Default placeholder image with scholarship type as background
    const getPlaceholderImage = () => {
        const colors = {
            'ACADEMIC_MERIT': 'from-blue-400 to-blue-600',
            'NEED_BASED': 'from-green-400 to-green-600',
            'STEM': 'from-purple-400 to-purple-600',
            'ARTS': 'from-pink-400 to-pink-600',
            'DIVERSITY': 'from-orange-400 to-orange-600',
            'ATHLETIC': 'from-red-400 to-red-600',
            'LEADERSHIP': 'from-yellow-400 to-yellow-600',
            'MILITARY': 'from-gray-400 to-gray-600',
            'CAREER_SPECIFIC': 'from-indigo-400 to-indigo-600',
        };
        return colors[scholarship.scholarship_type as keyof typeof colors] || 'from-gray-400 to-gray-600';
    };

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer group"
        >
            {/* Image */}
            <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                {scholarship.primary_image_url ? (
                    <img
                        src={scholarship.primary_image_url}
                        alt={scholarship.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getPlaceholderImage()} flex items-center justify-center`}>
                        <Award className="h-16 w-16 text-white opacity-30" />
                    </div>
                )}
            </div>

            <div className="p-4">
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[3.5rem]">
                    {scholarship.title}
                </h3>

                {/* Organization */}
                <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="text-sm truncate">{scholarship.organization}</span>
                </div>

                {/* Amount */}
                <div className="text-2xl font-bold text-green-600 mb-3">
                    {amountDisplay}
                </div>

                {/* Type Badge */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {formatScholarshipType(scholarship.scholarship_type)}
                    </span>
                    {scholarship.featured && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⭐ Featured
                        </span>
                    )}
                </div>

                {/* Deadline */}
                <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                        {scholarship.deadline ? (
                            <>Deadline: {formatDate(scholarship.deadline)}</>
                        ) : (
                            <>No deadline</>
                        )}
                    </span>
                </div>

                {scholarship.number_of_awards && (
                    <div className="mt-2 text-xs text-gray-500">
                        {scholarship.number_of_awards} awards available
                    </div>
                )}
            </div>
        </div>
    );
}