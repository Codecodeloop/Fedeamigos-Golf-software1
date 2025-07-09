"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Check, ChevronDown } from "lucide-react";

interface PlayerNameComboBoxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

const PlayerNameComboBox = React.forwardRef<HTMLInputElement, PlayerNameComboBoxProps>(
  ({ value, onChange, options, placeholder, className }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(value);

    // Sync inputValue with external value only if different and not focused
    React.useEffect(() => {
      if (value !== inputValue) {
        setInputValue(value);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    // Ref to input element to manage focus and selection
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    // Merge forwarded ref with local ref
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    // Filter options based on inputValue (case insensitive)
    const filteredOptions = options.filter((option) =>
      option.toLowerCase().includes(inputValue.toLowerCase())
    );

    // Handle selecting an option
    const handleSelect = (val: string) => {
      onChange(val);
      setInputValue(val);
      setOpen(false);
      // Focus input after selection
      setTimeout(() => {
        inputRef.current?.focus();
        // Move cursor to end
        const len = val.length;
        inputRef.current?.setSelectionRange(len, len);
      }, 0);
    };

    // Handle input change without losing cursor position
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      onChange(e.target.value);
      if (!open) setOpen(true);
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={onInputChange}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              className={cn("pr-8", className)}
              autoComplete="off"
              spellCheck={false}
              aria-autocomplete="list"
              aria-expanded={open}
              aria-haspopup="listbox"
              role="combobox"
            />
            <button
              type="button"
              aria-label="Toggle player list"
              onClick={() => setOpen((o) => !o)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded"
              tabIndex={-1}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-lg">
          {filteredOptions.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground select-none">
              No hay jugadores encontrados
            </div>
          ) : (
            <ul
              className="max-h-60 overflow-auto"
              role="listbox"
              aria-label="Lista de jugadores"
            >
              {filteredOptions.map((option) => (
                <li
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "cursor-pointer select-none px-3 py-2 text-sm hover:bg-primary hover:text-primary-foreground",
                    value === option ? "bg-primary text-primary-foreground font-semibold" : ""
                  )}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(option);
                    }
                  }}
                  role="option"
                  aria-selected={value === option}
                >
                  {option}
                  {value === option && (
                    <Check className="inline ml-2 h-4 w-4 text-primary-foreground" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </PopoverContent>
      </Popover>
    );
  }
);

PlayerNameComboBox.displayName = "PlayerNameComboBox";

export default PlayerNameComboBox;