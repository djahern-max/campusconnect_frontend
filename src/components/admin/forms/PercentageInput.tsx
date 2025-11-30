// src/components/admin/forms/PercentageInput.tsx
'use client';

import { useState, useEffect } from 'react';
import { Percent } from 'lucide-react';

interface PercentageInputProps {
    label: string;
    value: number | null | undefined;
    onChange: (value: number | null) => void;
    helpText?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    min?: number;
    max?: number;
    error?: string;
}

export function PercentageInput({
    label,
    value,
    onChange,
    helpText,
    placeholder = '0.00',
    disabled = false,
    required = false,
    min = 0,
    max = 100,
    error,
}: PercentageInputProps) {
    const [displayValue, setDisplayValue] = useState('');
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        if (value !== null && value !== undefined) {
            setDisplayValue(value.toString());
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;

        // Allow empty
        if (input === '') {
            setDisplayValue('');
            setValidationError('');
            onChange(null);
            return;
        }

        // Remove non-numeric characters except decimal point
        const numericValue = input.replace(/[^\d.]/g, '');

        // Parse as number
        const parsed = parseFloat(numericValue);

        if (!isNaN(parsed)) {
            setDisplayValue(numericValue);

            // Validate range
            if (parsed < min) {
                setValidationError(`Must be at least ${min}%`);
            } else if (parsed > max) {
                setValidationError(`Must be at most ${max}%`);
            } else {
                setValidationError('');
            }

            // Round to 2 decimal places
            onChange(Math.round(parsed * 100) / 100);
        }
    };

    const handleBlur = () => {
        if (value !== null && value !== undefined) {
            // Format to 2 decimal places on blur
            setDisplayValue(value.toFixed(2));
        }
    };

    const displayError = error || validationError;

    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <div className="relative">
                <input
                    type="text"
                    value={displayValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
            block w-full pr-10 pl-3 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${displayError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
          `}
                />

                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Percent className="h-5 w-5 text-gray-400" />
                </div>
            </div>

            {helpText && !displayError && (
                <p className="text-xs text-gray-500">{helpText}</p>
            )}

            {displayError && (
                <p className="text-xs text-red-600">{displayError}</p>
            )}
        </div>
    );
}