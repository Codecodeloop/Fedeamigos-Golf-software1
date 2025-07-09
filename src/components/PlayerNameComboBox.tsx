"use client";

import * as React from "react";
import { Command } from "cmdk";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
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

    React.useEffect(() => {
      setInputValue(value);
    }, [value]);

    // Filter options based on inputValue (case insensitive)
    const filteredOptions = options.filter((option) =>
      option.toLowerCase().includes(inputValue.toLowerCase())
    );

    // Handle selection from dropdown
    const handleSelect = (val: string) => {
      onChange(val);
      setInputValue(val);
      setOpen(false);
    };

    return (
      <div className="relative w-full">
        <Input
          ref={ref}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={cn("pr-8", className)}
          autoComplete="off"
        />
        <button
          type="button"
          aria-label="Toggle player list"
          onClick={() => setOpen((o) => !o)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded"
        >
          <ChevronDown className="h-4 w-4" />
        </button>

        {open && (
          <Command
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-lg"
            onSelect={(event) => {
              const customEvent = event as unknown as CustomEvent<{ value: string }>;
              handleSelect(customEvent.detail.value);
            }}
          >
            <Command.Input
              className="hidden"
              value={inputValue}
              onValueChange={(val) => {
                setInputValue(val);
                onChange(val);
              }}
            />
            <Command.List>
              {filteredOptions.length === 0 && (
                <div className="p-2 text-sm text-muted-foreground select-none">
                  No hay jugadores encontrados
                </div>
              )}
              {filteredOptions.map((option) => (
                <Command.Item
                  key={option}
                  value={option}
                  className="cursor-pointer select-none rounded px-3 py-2 text-sm outline-none data-[selected]:bg-primary data-[selected]:text-primary-foreground"
                >
                  {option}
                  {value === option && (
                    <Check className="ml-auto h-4 w-4 text-primary-foreground" />
                  )}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        )}
      </div>
    );
  }
);

PlayerNameComboBox.displayName = "PlayerNameComboBox";

export default PlayerNameComboBox;