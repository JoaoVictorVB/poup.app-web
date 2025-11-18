import { AlertCircle, XCircle } from 'lucide-react';
import React from 'react';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
  type?: 'error' | 'warning';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose, type = 'error' }) => {
  const bgColor = type === 'error' ? 'bg-red-50' : 'bg-yellow-50';
  const borderColor = type === 'error' ? 'border-red-200' : 'border-yellow-200';
  const textColor = type === 'error' ? 'text-red-800' : 'text-yellow-800';
  const iconColor = type === 'error' ? 'text-red-500' : 'text-yellow-500';

  return (
    <div
      className={`${bgColor} ${borderColor} ${textColor} px-4 py-3 rounded-lg border flex items-start justify-between gap-3 mb-4`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className={`${iconColor} flex-shrink-0 mt-0.5`} size={20} />
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`${iconColor} hover:opacity-70 transition-opacity`}
          aria-label="Fechar"
        >
          <XCircle size={18} />
        </button>
      )}
    </div>
  );
};

interface FieldErrorProps {
  message?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ message }) => {
  if (!message) return null;

  return <p className="text-red-500 text-xs italic mt-1">{message}</p>;
};

interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  min?: string | number;
  step?: string;
  children?: React.ReactNode; // Para select options
  as?: 'input' | 'select';
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder,
  min,
  step,
  children,
  as = 'input',
}) => {
  const baseClasses = `shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 ${
    error ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
  } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`;

  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {as === 'select' ? (
        <select
          className={baseClasses}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
        >
          {children}
        </select>
      ) : (
        <input
          className={baseClasses}
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          min={min}
          step={step}
        />
      )}
      <FieldError message={error} />
    </div>
  );
};
