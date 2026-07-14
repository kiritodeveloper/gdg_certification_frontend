import { useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface FieldProps {
  label?: string;
  error?: string;
  helperText?: string;
}

type InputProps = FieldProps & InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

function fieldClasses(error?: string) {
  return `w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors
    focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
    placeholder:text-slate-400
    ${error ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}`;
}

export function Input({ label, error, helperText, id, className = '', ...props }: InputProps) {
  const inputId = id || (label || '').toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input id={inputId} className={fieldClasses(error)} {...props} />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-slate-400">{helperText}</p>
      )}
    </div>
  );
}

export function Textarea({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}: TextareaProps) {
  const inputId = id || (label || '').toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`${fieldClasses(error)} min-h-[80px] resize-y`}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-slate-400">{helperText}</p>
      )}
    </div>
  );
}

export function Select({
  label,
  error,
  options,
  className = '',
  ...props
}: FieldProps & { options: { value: string; label: string }[] } & InputHTMLAttributes<HTMLSelectElement>) {
  const inputId = props.id || (label || '').toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select id={inputId} className={fieldClasses(error)} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}