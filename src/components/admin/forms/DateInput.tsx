/**
 * DateInput Component
 * 
 * Specialized input for date fields
 * Handles ISO date strings from API (YYYY-MM-DD)
 */

import React from 'react';

interface DateInputProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  helpText?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  minDate?: string; // Optional min date in YYYY-MM-DD format
  maxDate?: string; // Optional max date in YYYY-MM-DD format
}

export const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  helpText,
  placeholder,
  disabled = false,
  required = false,
  error,
  minDate,
  maxDate
}) => {
  // Convert ISO string (YYYY-MM-DD) to display format
  const formatDateForDisplay = (isoDate: string | null): string => {
    if (!isoDate) return '';
    // Date input expects YYYY-MM-DD format
    return isoDate.split('T')[0];
  };

  const [localValue, setLocalValue] = React.useState<string>(
    formatDateForDisplay(value)
  );

  React.useEffect(() => {
    setLocalValue(formatDateForDisplay(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setLocalValue(inputValue);

    // If empty, set to null
    if (inputValue === '') {
      onChange(null);
      return;
    }

    // HTML date input gives us YYYY-MM-DD format
    // Store as ISO string for API
    onChange(inputValue);
  };

  const formatDisplayLabel = (date: string | null): string => {
    if (!date) return '';
    try {
      const dateObj = new Date(date + 'T00:00:00');
      return dateObj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return date;
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="date"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        min={minDate}
        max={maxDate}
        className={`
          w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2
          ${error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-gray-300 focus:ring-purple-500'
          }
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
        `}
      />
      {value && (
        <p className="text-xs text-gray-600">
          Selected: {formatDisplayLabel(value)}
        </p>
      )}
      {helpText && !error && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};
