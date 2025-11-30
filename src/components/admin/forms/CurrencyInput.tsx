// src/components/admin/forms/CurrencyInput.tsx
'use client';

import { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';

interface CurrencyInputProps {
    label: string;
    value: number | null | undefined;
    onChange: (value: number | null) => void;
    helpText?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
}

export function CurrencyInput({
    label,
    value,
    onChange,
    helpText,
    placeholder = '0.00',
    disabled = false,
    required = false,
    error,
}: CurrencyInputProps) {
    // Display value (formatted with commas)
    const [displayValue, setDisplayValue] = useState('');

    // Initialize display value from prop
    useEffect(() => {
        if (value !== null && value !== undefined) {
            setDisplayValue(value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }));
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;

        // Remove all non-numeric characters except decimal point
        const numericValue = input.replace(/[^\d.]/g, '');

        // Update display with formatted value
        if (numericValue === '') {
            setDisplayValue('');
            onChange(null);
            return;
        }

        // Parse as number
        const parsed = parseFloat(numericValue);

        if (!isNaN(parsed)) {
            // Format for display
            const formatted = Math.round(parsed).toLocaleString('en-US');
            setDisplayValue(formatted);
            onChange(Math.round(parsed));
        } else {
            setDisplayValue('');
            onChange(null);
        }
    };

    const handleBlur = () => {
        // Reformat on blur to ensure consistency
        if (value !== null && value !== undefined) {
            setDisplayValue(value.toLocaleString('en-US'));
        }
    };

    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                </div>

                <input
                    type="text"
                    value={displayValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
            block w-full pl-10 pr-3 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
          `}
                />
            </div>

            {helpText && !error && (
                <p className="text-xs text-gray-500">{helpText}</p>
            )}

            {error && (
                <p className="text-xs text-red-600">{error}</p>
            )}
        </div>
    );
}