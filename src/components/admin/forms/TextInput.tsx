// src/components/admin/forms/TextInput.tsx
import React from 'react';

interface TextInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: 'text' | 'email' | 'url' | 'tel';
    required?: boolean;
    disabled?: boolean;
    helpText?: string;
    placeholder?: string;
    maxLength?: number;
}

export const TextInput: React.FC<TextInputProps> = ({
    label,
    value,
    onChange,
    type = 'text',
    required = false,
    disabled = false,
    helpText,
    placeholder,
    maxLength,
}) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                placeholder={placeholder}
                maxLength={maxLength}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {helpText && (
                <p className="text-xs text-gray-500 mt-1">{helpText}</p>
            )}
        </div>
    );
};