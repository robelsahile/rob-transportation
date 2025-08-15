
import React from 'react';

interface DateTimePickerProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ label, name, value, onChange, required = false }) => {
  // Get current date and time in YYYY-MM-DDTHH:mm format for min attribute
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for local timezone
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-brand-text-light mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="datetime-local"
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required={required}
        min={minDateTime} // Prevent selecting past dates/times
        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-brand-text bg-white"
      />
    </div>
  );
};

export default DateTimePicker;