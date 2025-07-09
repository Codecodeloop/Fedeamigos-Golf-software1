"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Check } from "lucide-react";

interface PlayerNameSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

const PlayerNameSelector = React.forwardRef<HTMLInputElement, PlayerNameSelectorProps>(
  ({ value, onChange, options, placeholder, className }, ref) => {
    const [inputValue, setInputValue] = React.useState(value);
    const [focused, setFocused] = React.useState(false);

    React.useEffect(() => {
      setInputValue(value);
    }, [value]);

    // Filter options based on inputValue (case insensitive)
    const filteredOptions = options.filter((option) =>
      option.toLowerCase().includes(inputValue.toLowerCase()) && option.toLowerCase() !== inputValue.toLowerCase()
    );

    const handleSelect = (val: string) => {
      onChange(val);
      setInputValue(val);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      onChange(e.target.value);
    };

    return (
      <div className={cn("relative w-full", className)}>
        <Input
          ref={ref}
          value={inputValue}
          onChange={onInputChange}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            // Delay hiding list to allow click
            setTimeout(() => setFocused(false), 150);
          }}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-expanded={focused}
          aria-haspopup="listbox"
          role="combobox"
        />
        {focused && filteredOptions.length > 0 && (
          <ul
            className="absolute z-10 w-full max-h-48 overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md mt-1"
            role="listbox"
            aria-label="Lista de jugadores"
          >
            {filteredOptions.map((option) => (
              <li
                key={option}
                onMouseDown={(e) => {
                  // Prevent blur before click
                  e.preventDefault();
                }}
                onClick={() => handleSelect(option)}
                className={cn(
                  "cursor-pointer select-none px-3 py-2 text-sm hover:bg-primary hover:text-primary-foreground flex items-center justify-between",
                  value === option ? "bg-primary text-primary-foreground font-semibold" : ""
                )}
                role="option"
                aria-selected={value === option}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(option);
                  }
                }}
              >
                {option}
                {value === option && <Check className="ml-2 h-4 w-4 text-primary-foreground" />}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

PlayerNameSelector.displayName = "PlayerNameSelector";

export default PlayerNameSelector;