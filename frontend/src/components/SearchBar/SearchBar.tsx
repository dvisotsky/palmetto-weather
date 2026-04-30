import { FormEvent, useEffect, useRef, useState } from "react";
import { TextDropdown, DropdownOption } from "../TextDropdown/TextDropdown";
import { Button } from "../Button/Button";
import { fetchLocations } from "@/services/weatherApi";
import { SpinnerIcon } from "../icons/SpinnerIcon";
import { EnterIcon } from "../icons/EnterIcon";

interface Props {
  onSearch: (location: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading = false }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [validationError, setValidationError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceDelay = 500; // 0.5 second

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = inputValue.trim();
    if (!trimmed) {
      setOptions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsFetching(true);
      try {
        const locations = await fetchLocations(trimmed);
        setOptions(
          locations.map((loc) => ({
            label: [loc.name, loc.state, loc.country]
              .filter(Boolean)
              .join(", "),
            value: `${loc.lat},${loc.lon}`,
          })),
        );
      } catch {
        setOptions([]);
      } finally {
        setIsFetching(false);
      }
    }, debounceDelay);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue]);

  function handleSelect(option: DropdownOption) {
    setInputValue(option.label);
    setOptions([]);
    setValidationError("");
    onSearch(option.value);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setValidationError("Please enter a location.");
      return;
    }
    setValidationError("");
    onSearch(trimmed);
  }

  return (
    <form className="flex gap-2 items-start" onSubmit={handleSubmit}>
      <div className="flex-1">
        <TextDropdown
          value={inputValue}
          options={options}
          isLoading={isFetching}
          error={validationError}
          placeholder="Enter city or location"
          aria-label="Location"
          onChange={setInputValue}
          onSelect={handleSelect}
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? <SpinnerIcon /> : <EnterIcon />}
      </Button>
    </form>
  );
}
