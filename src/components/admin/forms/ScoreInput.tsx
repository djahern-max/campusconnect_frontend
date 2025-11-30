// src/components/admin/forms/ScoreInput.tsx
'use client';

import { useState, useEffect } from 'react';

interface ScoreInputProps {
    label: string;
    value: number | null | undefined;
    onChange: (value: number | null) => void;
    helpText?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    min: number;
    max: number;
    error?: string;
}

export function ScoreInput({
    label,
    value,
    onChange,
    helpText,
    placeholder,
    disabled = false,
    required = false,
    min,
    max,
    error,
}: ScoreInputProps) {
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

        // Only allow integers
        const numericValue = input.replace(/\D/g, '');

        if (numericValue === '') {
            setDisplayValue('');
            setValidationError('');
            onChange(null);
            return;
        }

        const parsed = parseInt(numericValue, 10);

        if (!isNaN(parsed)) {
            setDisplayValue(parsed.toString());

            // Validate range
            if (parsed < min) {
                setValidationError(`Must be at least ${min}`);
            } else if (parsed > max) {
                setValidationError(`Must be at most ${max}`);
            } else {
                setValidationError('');
            }

            onChange(parsed);
        }
    };

    const displayError = error || validationError;

    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <input
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                placeholder={placeholder || `${min}-${max}`}
                disabled={disabled}
                className={`
          block w-full px-3 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${displayError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
        `}
            />

            {helpText && !displayError && (
                <p className="text-xs text-gray-500">{helpText}</p>
            )}

            {displayError && (
                <p className="text-xs text-red-600">{displayError}</p>
            )}
        </div>
    );
}