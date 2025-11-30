/**
 * GpaInput Component
 * 
 * Specialized input for GPA values with validation
 * Range: 0.0 - 4.0
 * Format: 2 decimal places
 */

import React from 'react';

interface GpaInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  helpText?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export const GpaInput: React.FC<GpaInputProps> = ({
  label,
  value,
  onChange,
  helpText,
  placeholder = '0.00',
  disabled = false,
  required = false,
  error
}) => {
  const [localValue, setLocalValue] = React.useState<string>(
    value !== null ? value.toFixed(2) : ''
  );
  const [localError, setLocalError] = React.useState<string>('');

  React.useEffect(() => {
    if (value !== null) {
      setLocalValue(value.toFixed(2));
    } else {
      setLocalValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setLocalValue(inputValue);

    // Allow empty input
    if (inputValue === '') {
      setLocalError('');
      onChange(null);
      return;
    }

    // Allow typing decimal point
    if (inputValue === '.' || inputValue === '0.') {
      setLocalError('');
      return;
    }

    // Parse and validate
    const numValue = parseFloat(inputValue);

    if (isNaN(numValue)) {
      setLocalError('Please enter a valid number');
      return;
    }

    if (numValue < 0) {
      setLocalError('GPA cannot be negative');
      return;
    }

    if (numValue > 4.0) {
      setLocalError('GPA cannot exceed 4.0');
      return;
    }

    // Valid GPA
    setLocalError('');
    onChange(numValue);
  };

  const handleBlur = () => {
    if (localValue && !isNaN(parseFloat(localValue))) {
      const numValue = parseFloat(localValue);
      if (numValue >= 0 && numValue <= 4.0) {
        setLocalValue(numValue.toFixed(2));
      }
    }
  };

  const displayError = error || localError;

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type="number"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          step="0.01"
          min="0"
          max="4.0"
          className={`
            w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2
            ${displayError
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-purple-500'
            }
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
          `}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-gray-500 text-sm">/ 4.0</span>
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
};
