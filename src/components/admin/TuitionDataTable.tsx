// src/components/admin/TuitionDataTable.tsx
import React from 'react';
import Badge from '@/components/ui/Badge';
import { TuitionData } from '@/types/api';

interface TuitionDataTableProps {
    data: TuitionData[];
    onEdit: (tuition: TuitionData) => void;
    onVerify: (id: number) => void;
    className?: string;
}

export default function TuitionDataTable({
    data,
    onEdit,
    onVerify,
    className = ''
}: TuitionDataTableProps) {
    const formatCurrency = (amount: number | null) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (data.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No tuition data available</p>
            </div>
        );
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Academic Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            In-State
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Out-of-State
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Room & Board
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((tuition) => (
                        <tr key={tuition.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {tuition.academic_year}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(tuition.tuition_in_state)}
                                {tuition.required_fees_in_state && (
                                    <div className="text-xs text-gray-500">
                                        + {formatCurrency(tuition.required_fees_in_state)} fees
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(tuition.tuition_out_state)}
                                {tuition.required_fees_out_state && (
                                    <div className="text-xs text-gray-500">
                                        + {formatCurrency(tuition.required_fees_out_state)} fees
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(tuition.room_board_on_campus)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {tuition.is_admin_verified ? (
                                    <Badge variant="success">Verified</Badge>
                                ) : (
                                    <Badge variant="warning">Unverified</Badge>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => onEdit(tuition)}
                                    className="mr-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Edit
                                </button>
                                {!tuition.is_admin_verified && (
                                    <button
                                        onClick={() => onVerify(tuition.id)}
                                        className="px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Verify
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {data.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Showing {data.length} record{data.length !== 1 ? 's' : ''}
                    </p>
                </div>
            )}
        </div>
    );
}