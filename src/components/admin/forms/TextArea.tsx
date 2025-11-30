// src/components/admin/forms/TextAreaInput.tsx
import React from 'react';

interface TextAreaInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    rows?: number;
    required?: boolean;
    disabled?: boolean;
    helpText?: string;
    placeholder?: string;
    maxLength?: number;
}

export const TextAreaInput: React.FC<TextAreaInputProps> = ({
    label,
    value,
    onChange,
    rows = 4,
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
            <textarea
                value={value}
                onChange={onChange}
                rows={rows}
                disabled={disabled}
                required={required}
                placeholder={placeholder}
                maxLength={maxLength}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical"
            />
            {helpText && (
                <p className="text-xs text-gray-500 mt-1">{helpText}</p>
            )}
            {maxLength && (
                <p className="text-xs text-gray-400 mt-1 text-right">
                    {value.length} / {maxLength}
                </p>
            )}
        </div>
    );
};