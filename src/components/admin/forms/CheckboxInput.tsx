

/**
 * CheckboxInput Component
 * 
 * Specialized checkbox for boolean fields
 * Used for fields like "is_renewable"
 */

import React from 'react';

interface CheckboxInputProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helpText?: string;
  disabled?: boolean;
  error?: string;
}

export const CheckboxInput: React.FC<CheckboxInputProps> = ({
  label,
  checked,
  onChange,
  helpText,
  disabled = false,
  error
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className={`
              w-4 h-4 rounded border-gray-300
              text-purple-600 focus:ring-purple-500
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              ${error ? 'border-red-300' : ''}
            `}
          />
        </div>
        <div className="ml-3">
          <label className="text-sm font-medium text-gray-700 cursor-pointer">
            {label}
          </label>
          {helpText && !error && (
            <p className="text-xs text-gray-500 mt-1">{helpText}</p>
          )}
          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};
