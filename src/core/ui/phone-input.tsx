"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { getExampleNumber, parsePhoneNumberFromString } from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";

import { Button } from "@core/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@core/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import { resolveFieldStyle } from "@core/ui/input";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";

import en from "react-phone-number-input/locale/en.json";
import ar from "react-phone-number-input/locale/ar.json";

export interface PhoneInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> {
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  defaultCountry?: RPNInput.Country;
}

/**
 * Detect user's default country code based on their browser language and timezone.
 * Returns a fallback country code if detection fails.
 */
function detectUserCountry(): RPNInput.Country {
  if (typeof navigator !== "undefined" && navigator.languages) {
    for (const lang of navigator.languages) {
      const parts = lang.split("-");
      if (parts.length === 2 && parts[1].length === 2) {
        return parts[1].toUpperCase() as RPNInput.Country;
      }
    }
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      const tzLower = tz.toLowerCase();
      if (tzLower.includes("cairo") || tzLower.includes("egypt")) return "EG";
      if (tzLower.includes("riyadh") || tzLower.includes("saudi")) return "SA";
      if (tzLower.includes("dubai") || tzLower.includes("uae")) return "AE";
      if (tzLower.includes("london") || tzLower.includes("europe/london")) return "GB";
      if (tzLower.includes("paris")) return "FR";
      if (tzLower.includes("berlin")) return "DE";
      if (tzLower.includes("tokyo")) return "JP";
      if (tzLower.includes("sydney")) return "AU";
      if (tzLower.includes("casablanca")) return "MA";
      if (tzLower.includes("tunis")) return "TN";
      if (
        tzLower.includes("new_york") ||
        tzLower.includes("los_angeles") ||
        tzLower.includes("chicago") ||
        tzLower.includes("america")
      ) {
        return "US";
      }
    }
  } catch {
    /* ignore */
  }

  return "US";
}

/**
 * Formats a mobile number placeholder dynamically based on the active country.
 */
function getPlaceholderForCountry(country?: RPNInput.Country, fallback?: string): string {
  if (!country) return fallback || "Enter phone number";
  try {
    const example = getExampleNumber(country, examples);
    if (example) {
      return example.formatInternational();
    }
  } catch {
    /* ignore */
  }
  return fallback || "Enter phone number";
}

/**
 * Gets the expected national phone number length for a country.
 */
function getExpectedLengthForCountry(country?: RPNInput.Country): number {
  if (!country) return 10;
  try {
    const example = getExampleNumber(country, examples);
    if (example) {
      return example.nationalNumber.length;
    }
  } catch {
    /* ignore */
  }
  return 10;
}

/**
 * Computes the length of the currently entered national number digits.
 */
function getEnteredLength(value: string, country?: RPNInput.Country): number {
  if (!value) return 0;
  try {
    const phoneNumber = parsePhoneNumberFromString(value, country);
    if (phoneNumber) {
      return phoneNumber.nationalNumber.length;
    }
  } catch {
    /* ignore */
  }

  // Fallback to manual digits parsing
  const digits = value.replace(/\D/g, "");
  if (country) {
    try {
      const callingCode = RPNInput.getCountryCallingCode(country);
      if (digits.startsWith(callingCode)) {
        return digits.length - callingCode.length;
      }
    } catch {
      /* ignore */
    }
  }
  return digits.length;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onChange, value = "", error, defaultCountry, ...props }, ref) => {
    const { language, direction, t } = useI18n();
    const settings = useSettings();
    const isRTL = direction === "rtl";
    const labels = language === "ar" ? ar : en;

    const handleValueChange = React.useCallback(
      (val?: string) => {
        onChange?.(val || "");
      },
      [onChange]
    );

    const detectedDefaultCountry = React.useMemo(() => {
      return defaultCountry || detectUserCountry();
    }, [defaultCountry]);

    const [activeCountry, setActiveCountry] = React.useState<RPNInput.Country | undefined>(
      detectedDefaultCountry
    );

    // Sync state when defaultCountry changes
    React.useEffect(() => {
      if (defaultCountry) {
        setActiveCountry(defaultCountry);
      }
    }, [defaultCountry]);

    // Sync activeCountry when value changes (e.g. paste or typing international code)
    React.useEffect(() => {
      if (!value) return;
      try {
        const parsed = RPNInput.parsePhoneNumber(value);
        if (parsed?.country) {
          setActiveCountry(parsed.country);
        }
      } catch {
        /* ignore */
      }
    }, [value]);

    // The Settings inputStyle values, mapped onto the same token-backed
    // treatments as the Wave-A Input recipe (legacy stored values fall back
    // to default through resolveFieldStyle).
    const getContainerRoundedClass = React.useCallback(() => {
      const style = resolveFieldStyle(settings.inputStyle);
      if (style === "underlined") {
        return "rounded-none border-0 border-b border-nx-line px-0";
      }
      if (style === "rounded") {
        return "rounded-full px-1";
      }
      if (style === "filled") {
        return "rounded-nx-control border-transparent bg-nx-raised";
      }
      return "rounded-nx-control";
    }, [settings.inputStyle]);

    // Focus lights the edge — the composite field carries the Input recipe on
    // focus-within: border to accent plus the --nx-focus inset line/wash ring.
    const getFocusClasses = React.useCallback(() => {
      const style = resolveFieldStyle(settings.inputStyle);
      if (style === "underlined") {
        return "focus-within:border-nx-accent";
      }
      return "focus-within:border-nx-accent focus-within:shadow-nx-focus";
    }, [settings.inputStyle]);

    // The select's outer corners are always the field's start side; logical
    // classes resolve them per direction, so no isRTL fork is needed here.
    const getSelectRoundedClass = React.useCallback(() => {
      const style = resolveFieldStyle(settings.inputStyle);
      if (style === "underlined") {
        return "rounded-none";
      }
      if (style === "rounded") {
        return "rounded-s-full";
      }
      if (style === "filled") {
        return "rounded-s-nx-control";
      }
      return "rounded-s-nx-control";
    }, [settings.inputStyle]);

    // The number input is remount-sensitive (a new component identity drops
    // focus mid-typing), so it is memoised with EMPTY deps. aria-invalid
    // therefore rides down as a prop on RPNInput below — the library forwards
    // unknown props to this component — instead of being closed over here.
    const PhoneInputComponent = React.useMemo(() => {
      return React.forwardRef<HTMLInputElement, any>(
        function PhoneInputComponent(inputProps, inputRef) {
          return (
            <input
              {...inputProps}
              ref={inputRef}
              className={cn(
                // the composite frame owns the surface; the input contributes
                // only type and ink — inert ink comes from the token, never
                // from a half-transparent value
                "h-full w-full flex-1 bg-transparent px-3 py-2 text-base tabular-nums placeholder:text-nx-ink-3 focus:outline-none disabled:cursor-not-allowed disabled:text-nx-ink-3 md:text-sm",
                inputProps.className
              )}
            />
          );
        }
      );
    }, []);

    const CountrySelectComponent = React.useMemo(() => {
      return function CountrySelectComponent({
        value: countryVal,
        onChange: onCountryChange,
        options,
      }: any) {
        return (
          <CountrySelect
            value={countryVal}
            onChange={(newCountry) => {
              onCountryChange(newCountry);
              setActiveCountry(newCountry);
            }}
            options={options}
            disabled={props.disabled}
            labels={labels}
            roundedClass={getSelectRoundedClass()}
            isRTL={isRTL}
          />
        );
      };
    }, [props.disabled, labels, getSelectRoundedClass, isRTL]);

    const placeholder = React.useMemo(() => {
      return (
        props.placeholder ||
        getPlaceholderForCountry(activeCountry, t("components.phoneInput.placeholder"))
      );
    }, [props.placeholder, activeCountry, t]);

    const expectedLength = React.useMemo(() => {
      return getExpectedLengthForCountry(activeCountry);
    }, [activeCountry]);

    const enteredLength = React.useMemo(() => {
      return getEnteredLength(value, activeCountry);
    }, [value, activeCountry]);

    return (
      <div className="w-full">
        <RPNInput.default
          ref={ref as any}
          className={cn(
            // The shared field surface: sunken ground behind a hairline, the
            // same hover lift and inert slab Input wears — a composite field
            // must not read as a different control from a plain one.
            "flex items-center border border-nx-line bg-nx-ground text-sm text-nx-ink transition-[border-color,background-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
            "hover:border-nx-line-hi",
            "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:border-nx-line has-[input:disabled]:bg-nx-raised has-[input:disabled]:shadow-none",
            getContainerRoundedClass(),
            getFocusClasses(),
            // Error re-hues the lit edge to the measured danger token — same
            // geometry as --nx-focus, different hue, so the field reads wrong
            // without shouting.
            error &&
              "border-nx-danger focus-within:border-nx-danger focus-within:shadow-[inset_0_0_0_1px_var(--nx-danger),0_0_0_3px_color-mix(in_srgb,var(--nx-danger)_18%,transparent)] hover:border-nx-danger",
            className
          )}
          dir={direction}
          style={{
            background: props.style?.background,
            borderColor: error ? undefined : props.style?.borderColor,
            color: props.style?.color,
          }}
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelectComponent}
          inputComponent={PhoneInputComponent}
          value={value}
          onChange={handleValueChange}
          defaultCountry={detectedDefaultCountry}
          labels={labels}
          placeholder={placeholder}
          // forwarded to the inner input by the library, so the number field
          // announces itself as invalid the moment the frame turns danger
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {/* Hint row: instruction on the start edge, live digit count on the
            end. Tabular figures so the counter does not shuffle as it fills,
            and it goes success-ink only at the exact expected length. */}
        {activeCountry && (
          <div
            className="mt-1.5 flex items-center justify-between gap-3 px-1 text-xs text-nx-ink-3"
            dir={direction}
          >
            <span>{t("components.phoneInput.enterNational")}</span>
            <span
              className={cn(
                "shrink-0 font-mono tabular-nums transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                enteredLength === expectedLength && "font-semibold text-nx-success"
              )}
            >
              {enteredLength}/{expectedLength} {t("components.phoneInput.digits")}
            </span>
          </div>
        )}
      </div>
    );
  }
);
PhoneInput.displayName = "PhoneInput";

type CountrySelectOption = { label: string; value: RPNInput.Country };

interface CountrySelectProps {
  disabled?: boolean;
  value: RPNInput.Country;
  onChange: (value: RPNInput.Country) => void;
  options: CountrySelectOption[];
  labels: Record<string, string>;
  roundedClass: string;
  isRTL: boolean;
}

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
  labels,
  roundedClass,
  isRTL,
}: CountrySelectProps) => {
  const [open, setOpen] = React.useState(false);
  const { t } = useI18n();

  const handleSelect = React.useCallback(
    (country: RPNInput.Country) => {
      onChange(country);
      setOpen(false);
    },
    [onChange]
  );

  const triggerOption = options.find((option) => option.value === value);
  const countryName = triggerOption ? labels[triggerOption.value] || triggerOption.label : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            // Rides Button's own focus treatment (the --nx-focus lit edge);
            // z-raised keeps the lit trigger above the field's hairline.
            "flex h-full shrink-0 items-center gap-2 rounded-none border-0 bg-transparent px-3 text-nx-ink hover:bg-nx-hover focus-visible:z-raised disabled:text-nx-ink-3",
            roundedClass,
            "border-e border-nx-line"
          )}
          disabled={disabled}
          aria-label={countryName || t("components.phoneInput.searchPlaceholder")}
        >
          <FlagComponent country={value} countryName={countryName} />
          {value && (
            <span className="text-sm font-medium tabular-nums">
              +{RPNInput.getCountryCallingCode(value)}
            </span>
          )}
          <ChevronsUpDown
            className={cn("h-4 w-4 shrink-0 text-nx-ink-3", disabled && "hidden")}
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align={isRTL ? "end" : "start"}>
        <Command>
          <CommandInput placeholder={t("components.phoneInput.searchPlaceholder")} />
          <CommandList>
            <CommandEmpty>{t("components.phoneInput.emptyState")}</CommandEmpty>
            <CommandGroup>
              {options
                .filter((x) => x.value)
                .map((option) => {
                  const name = labels[option.value] || option.label;
                  return (
                    <CommandItem
                      className="flex cursor-pointer items-center gap-2"
                      key={option.value}
                      onSelect={() => handleSelect(option.value)}
                    >
                      <FlagComponent country={option.value} countryName={name} />
                      <span className="flex-1 truncate text-sm">{name}</span>
                      {/* dial codes are a column of digits — tabular figures
                          keep them aligned down the list */}
                      <span className="shrink-0 font-mono text-sm tabular-nums text-nx-ink-3">
                        +{RPNInput.getCountryCallingCode(option.value)}
                      </span>
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0 text-nx-accent",
                          option.value === value ? "visible" : "invisible"
                        )}
                        aria-hidden="true"
                      />
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  // No flag art for a country renders the neutral raised swatch alone —
  // never an emoji placeholder, which rendered as tofu on several platforms.
  return (
    <span className="flex h-4 w-6 shrink-0 items-center justify-center overflow-hidden rounded-nx-sm border border-nx-line bg-nx-raised-2">
      {Flag ? <Flag title={countryName} /> : null}
    </span>
  );
};
FlagComponent.displayName = "FlagComponent";

export { PhoneInput };
export { isValidPhoneNumber } from "react-phone-number-input";
export type { Country } from "react-phone-number-input";
