import { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  prefix?: string;
  suffix?: string;
  error?: string;
}

export function TextInput({
  label,
  prefix,
  suffix,
  error,
  id,
  className = '',
  ...props
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-neutral-charcoal">
          {label}
        </label>
      )}
      <div
        className={`flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-neutral-border focus-within:ring-2 focus-within:ring-primary ${error ? 'ring-red-500' : ''}`}
      >
        {prefix && (
          <span className="text-neutral-mid text-sm select-none">{prefix}</span>
        )}
        <input
          id={id}
          className={`flex-1 bg-transparent text-base text-neutral-charcoal placeholder:text-neutral-mid outline-none ${className}`}
          {...props}
        />
        {suffix && (
          <span className="text-neutral-mid text-sm select-none">{suffix}</span>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
