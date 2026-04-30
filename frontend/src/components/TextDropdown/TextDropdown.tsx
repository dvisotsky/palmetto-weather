import { useRef, useState, useEffect, InputHTMLAttributes } from 'react';
import { TextInput } from '../TextInput/TextInput';

export interface DropdownOption {
  label: string;
  value: string;
}

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onSelect'> {
  label?: string;
  options: DropdownOption[];
  isLoading?: boolean;
  error?: string;
  onChange?: (value: string) => void;
  onSelect?: (option: DropdownOption) => void;
}

export function TextDropdown({
  label,
  options,
  isLoading = false,
  error,
  onChange,
  onSelect,
  value,
  ...props
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const showDropdown = open && (isLoading || options.length > 0);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setOpen(true);
    onChange?.(e.target.value);
  }

  function handleSelect(option: DropdownOption) {
    setOpen(false);
    onSelect?.(option);
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <TextInput
        label={label}
        value={value}
        error={error}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        {...props}
      />
      {showDropdown && (
        <ul
          role="listbox"
          className="absolute top-full left-0 right-0 z-10 mt-1 rounded-xl bg-white shadow-md ring-1 ring-neutral-border overflow-hidden"
        >
          {isLoading ? (
            <li className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-mid">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-border border-t-primary" />
              Loading…
            </li>
          ) : (
            options.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={false}
                onMouseDown={() => handleSelect(opt)}
                className="cursor-pointer px-4 py-3 text-sm text-neutral-charcoal hover:bg-neutral-cream"
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
