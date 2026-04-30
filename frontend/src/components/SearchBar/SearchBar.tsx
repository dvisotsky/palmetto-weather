import { FormEvent, useState } from 'react';

interface Props {
  onSearch: (location: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading = false }: Props) {
  const [value, setValue] = useState('');
  const [validationError, setValidationError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setValidationError('Please enter a location.');
      return;
    }
    setValidationError('');
    onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter city or location"
        aria-label="Location"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading…' : 'Search'}
      </button>
      {validationError && <p role="alert">{validationError}</p>}
    </form>
  );
}
