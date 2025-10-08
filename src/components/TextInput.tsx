
import React from 'react';

interface TextInputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  Icon?: React.ElementType;
  min?: string;
  max?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, name, type = 'text', value, onChange, placeholder, required = false, Icon, min, max }) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-brand-text-light mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        )}
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          className={`w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-brand-text bg-white ${Icon ? 'pl-10' : ''}`}
        />
      </div>
    </div>
  );
};

export default TextInput;
