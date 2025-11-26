// src/app/admin/verification-history/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { institutionDataApi, VerificationRecord } from '@/api/endpoints/institutionDataAPI';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Clock,
    AlertTriangle,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function VerificationHistoryPage() {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);

    const institutionId = user?.entity_type === 'institution' ? user.entity_id : null;

    const [records, setRecords] = useState<VerificationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [limit, setLimit] = useState(50);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin/login');
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        if (institutionId) {
            loadHistory();
        }
    }, [institutionId, limit]);

    const loadHistory = async () => {
        if (!institutionId) return;

        try {
            setLoading(true);
            setError(null);
            const data = await institutionDataApi.getVerificationHistory(institutionId, limit);
            setRecords(data);
        } catch (err: any) {
            console.error('Error loading verification history:', err);
            setError(err.response?.data?.detail || 'Failed to load verification history');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    // Filter records based on search
    const filteredRecords = records.filter((record) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            record.field_name.toLowerCase().includes(searchLower) ||
            record.verified_by.toLowerCase().includes(searchLower) ||
            record.old_value?.toLowerCase().includes(searchLower) ||
            record.new_value?.toLowerCase().includes(searchLower)
        );
    });

    // Pagination
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRecords = filteredRecords.slice(startIndex, endIndex);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatFieldName = (field: string) => {
        return field
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const formatValue = (value: string | null) => {
        if (!value) return '—';

        // If it's a number, format with commas
        const num = parseFloat(value);
        if (!isNaN(num)) {
            // If it looks like a currency (large number)
            if (num >= 100) {
                return `$${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
            }
            // Otherwise just the number
            return num.toString();
        }

        return value;
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Field', 'Old Value', 'New Value', 'Updated By', 'Notes'];
        const rows = filteredRecords.map((record) => [
            formatDate(record.verified_at),
            formatFieldName(record.field_name),
            record.old_value || '',
            record.new_value || '',
            record.verified_by,
            record.notes || '',
        ]);

        const csv = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `verification-history-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 rounded-full border-b-2 border-gray-700 animate-spin" />
                    <p className="mt-4 text-gray-600">Loading verification history...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card>
                        <CardBody>
                            <div className="flex items-center gap-3 text-red-600">
                                <AlertTriangle className="h-6 w-6" />
                                <div>
                                    <p className="font-semibold">Error Loading History</p>
                                    <p className="text-sm text-gray-600">{error}</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">Verification History</h1>
                            <Link href="/admin/data-quality">
                                <Button variant="secondary" size="sm">
                                    Back to Dashboard
                                </Button>
                            </Link>
                        </div>
                        <p className="text-gray-600">Complete audit trail of all data changes and verifications</p>
                    </div>

                    {/* Filters & Actions */}
                    <Card className="mb-6">
                        <CardBody>
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                {/* Search */}
                                <div className="flex-1 max-w-md">
                                    <div className="relative">
                                        <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setCurrentPage(1); // Reset to first page on search
                                            }}
                                            placeholder="Search by field, value, or email..."
                                            className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <select
                                        value={limit}
                                        onChange={(e) => setLimit(parseInt(e.target.value))}
                                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                                    >
                                        <option value={25}>Last 25</option>
                                        <option value={50}>Last 50</option>
                                        <option value={100}>Last 100</option>
                                        <option value={200}>Last 200</option>
                                    </select>

                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={exportToCSV}
                                        disabled={filteredRecords.length === 0}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Export CSV
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardBody>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">{records.length}</div>
                                    <div className="text-sm text-gray-600 mt-1">Total Changes</div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {new Set(records.map((r) => r.field_name)).size}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">Fields Updated</div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {records.length > 0
                                            ? formatDate(records[0].verified_at).split(',')[0]
                                            : '—'}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">Last Update</div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* History Table */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-gray-600" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Change Log
                                    {filteredRecords.length !== records.length && (
                                        <span className="ml-2 text-sm font-normal text-gray-500">
                                            ({filteredRecords.length} of {records.length} records)
                                        </span>
                                    )}
                                </h3>
                            </div>
                        </CardHeader>
                        <CardBody>
                            {currentRecords.length === 0 ? (
                                <div className="text-center py-12">
                                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600 font-medium">No verification history found</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {searchTerm
                                            ? 'Try adjusting your search'
                                            : 'Changes will appear here once you update your data'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Table */}
                                    <div className="hidden lg:block overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Date & Time
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Field
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Change
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Updated By
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Notes
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {currentRecords.map((record) => (
                                                    <tr key={record.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatDate(record.verified_at)}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {formatFieldName(record.field_name)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-gray-500 line-through">
                                                                    {formatValue(record.old_value)}
                                                                </span>
                                                                <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                                <span className="text-gray-900 font-medium">
                                                                    {formatValue(record.new_value)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            {record.verified_by}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-gray-500">
                                                            {record.notes || '—'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Cards */}
                                    <div className="lg:hidden space-y-4">
                                        {currentRecords.map((record) => (
                                            <div
                                                key={record.id}
                                                className="border border-gray-200 rounded-lg p-4 bg-white"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {formatFieldName(record.field_name)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(record.verified_at)}
                                                    </span>
                                                </div>

                                                <div className="space-y-2 mb-3">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-gray-500 line-through">
                                                            {formatValue(record.old_value)}
                                                        </span>
                                                        <ArrowRight className="h-4 w-4 text-gray-400" />
                                                        <span className="text-gray-900 font-medium">
                                                            {formatValue(record.new_value)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="text-xs text-gray-600 border-t border-gray-100 pt-2">
                                                    <p>
                                                        <span className="font-medium">Updated by:</span> {record.verified_by}
                                                    </p>
                                                    {record.notes && (
                                                        <p className="mt-1">
                                                            <span className="font-medium">Notes:</span> {record.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                                            <div className="text-sm text-gray-600">
                                                Showing {startIndex + 1} to {Math.min(endIndex, filteredRecords.length)} of{' '}
                                                {filteredRecords.length} records
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>

                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                        .filter((page) => {
                                                            // Show first, last, current, and adjacent pages
                                                            return (
                                                                page === 1 ||
                                                                page === totalPages ||
                                                                Math.abs(page - currentPage) <= 1
                                                            );
                                                        })
                                                        .map((page, index, array) => (
                                                            <div key={page} className="flex items-center">
                                                                {index > 0 && array[index - 1] !== page - 1 && (
                                                                    <span className="px-2 text-gray-400">...</span>
                                                                )}
                                                                <button
                                                                    onClick={() => setCurrentPage(page)}
                                                                    className={`
                                    px-3 py-1 text-sm rounded-md
                                    ${currentPage === page
                                                                            ? 'bg-gray-900 text-white'
                                                                            : 'text-gray-600 hover:bg-gray-100'
                                                                        }
                                  `}
                                                                >
                                                                    {page}
                                                                </button>
                                                            </div>
                                                        ))}
                                                </div>

                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}