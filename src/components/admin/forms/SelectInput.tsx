// src/components/admin/forms/SelectInput.tsx
import React from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: SelectOption[];
    required?: boolean;
    disabled?: boolean;
    helpText?: string;
    placeholder?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
    label,
    value,
    onChange,
    options,
    required = false,
    disabled = false,
    helpText,
    placeholder = 'Select an option...',
}) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {helpText && (
                <p className="text-xs text-gray-500 mt-1">{helpText}</p>
            )}
        </div>
    );
};