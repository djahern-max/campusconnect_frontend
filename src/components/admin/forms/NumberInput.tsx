// src/components/admin/forms/NumberInput.tsx
import React from 'react';

interface NumberInputProps {
    label: string;
    value: number | null;
    onChange: (value: number | null) => void;
    min?: number;
    max?: number;
    step?: number;
    required?: boolean;
    disabled?: boolean;
    helpText?: string;
    placeholder?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    required = false,
    disabled = false,
    helpText,
    placeholder,
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') {
            onChange(null);
        } else {
            const numVal = parseFloat(val);
            if (!isNaN(numVal)) {
                onChange(numVal);
            }
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                type="number"
                value={value ?? ''}
                onChange={handleChange}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                required={required}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {helpText && (
                <p className="text-xs text-gray-500 mt-1">{helpText}</p>
            )}
        </div>
    );
};