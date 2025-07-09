"use client";

import * as React from "react";
import * as Combobox from "@radix-ui/react-combobox";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
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

    return (
      <Combobox.Root
        value={value}
        onValueChange={(val) => {
          onChange(val);
          setInputValue(val);
        }}
        onOpenChange={setOpen}
      >
        <div className="relative w-full">
          <Combobox.Input
            ref={ref}
            className={cn(
              "w-full rounded border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            placeholder={placeholder}
            onChange={(e) => {
              setInputValue(e.target.value);
              onChange(e.target.value);
            }}
            value={inputValue}
            autoComplete="off"
          />
          <Combobox.Trigger
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Toggle player list"
          >
            <ChevronDown className="h-4 w-4" />
          </Combobox.Trigger>

          {open && (
            <Combobox.Portal>
              <Combobox.Content
                className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg focus:outline-none"
                position="popper"
                sideOffset={5}
              >
                {filteredOptions.length === 0 && (
                  <div className="relative cursor-default select-none py-2 px-3 text-muted-foreground">
                    No hay jugadores encontrados
                  </div>
                )}
                {filteredOptions.map((option) => (
                  <Combobox.Item
                    key={option}
                    value={option}
                    className="relative flex cursor-default select-none items-center rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground"
                  >
                    <Combobox.ItemText>{option}</Combobox.ItemText>
                    <Combobox.ItemIndicator className="absolute left-1 inline-flex items-center">
                      <Check className="h-4 w-4" />
                    </Combobox.ItemIndicator>
                  </Combobox.Item>
                ))}
              </Combobox.Content>
            </Combobox.Portal>
          )}
        </div>
      </Combobox.Root>
    );
  }
);

PlayerNameComboBox.displayName = "PlayerNameComboBox";

export default PlayerNameComboBox;