import React from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { TuitionData } from '@/types/api';

interface TuitionCardProps {
    tuition: TuitionData;
    className?: string;
}

export default function TuitionCard({ tuition, className = '' }: TuitionCardProps) {
    const formatCurrency = (amount: number | null) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const calculateTotal = (tuition: number | null, fees: number | null) => {
        if (!tuition && !fees) return null;
        return (tuition || 0) + (fees || 0);
    };

    const inStateTotal = calculateTotal(tuition.tuition_in_state, tuition.required_fees_in_state);
    const outStateTotal = calculateTotal(tuition.tuition_out_state, tuition.required_fees_out_state);

    return (
        <Card className={className}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                        Tuition & Fees
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Academic Year {tuition.academic_year}
                    </p>
                </div>
                {tuition.is_admin_verified && (
                    <Badge variant="success">✓ Verified</Badge>
                )}
            </div>

            <div className="space-y-6">
                {/* In-State Costs */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">In-State Students</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-gray-600">Tuition</span>
                            <span className="text-lg font-semibold text-gray-900">
                                {formatCurrency(tuition.tuition_in_state)}
                            </span>
                        </div>
                        {tuition.required_fees_in_state && (
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm text-gray-600">Required Fees</span>
                                <span className="text-lg font-semibold text-gray-900">
                                    {formatCurrency(tuition.required_fees_in_state)}
                                </span>
                            </div>
                        )}
                        {inStateTotal && (
                            <div className="flex justify-between items-baseline pt-2 border-t border-gray-200">
                                <span className="text-sm font-semibold text-gray-700">Total</span>
                                <span className="text-xl font-bold text-blue-600">
                                    {formatCurrency(inStateTotal)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Out-of-State Costs */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Out-of-State Students</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-gray-600">Tuition</span>
                            <span className="text-lg font-semibold text-gray-900">
                                {formatCurrency(tuition.tuition_out_state)}
                            </span>
                        </div>
                        {tuition.required_fees_out_state && (
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm text-gray-600">Required Fees</span>
                                <span className="text-lg font-semibold text-gray-900">
                                    {formatCurrency(tuition.required_fees_out_state)}
                                </span>
                            </div>
                        )}
                        {outStateTotal && (
                            <div className="flex justify-between items-baseline pt-2 border-t border-gray-200">
                                <span className="text-sm font-semibold text-gray-700">Total</span>
                                <span className="text-xl font-bold text-blue-600">
                                    {formatCurrency(outStateTotal)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Room & Board */}
                {tuition.room_board_on_campus && (
                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-baseline">
                            <div>
                                <span className="text-sm font-semibold text-gray-700">Room & Board</span>
                                <p className="text-xs text-gray-500 mt-0.5">(On-Campus)</p>
                            </div>
                            <span className="text-xl font-bold text-gray-900">
                                {formatCurrency(tuition.room_board_on_campus)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Data Source */}
                {tuition.data_source && (
                    <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                            <span className="font-medium">Source:</span> {tuition.data_source}
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
}