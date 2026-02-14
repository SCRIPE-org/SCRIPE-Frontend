/**
 * Validation Hook
 *
 * Provides a convenient hook for form validation using the validation utilities.
 * Handles validation state, error messages, and form submission validation.
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { validateForm, ValidationRule, isFormValid, getFormErrors } from "@core/common/validation";

export interface UseValidationOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialValues?: Record<string, any>;
  validationRules?: Record<string, ValidationRule[]>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UseValidationReturn<T extends Record<string, any>> {
  values: T;
  errors: Record<string, string>;
  isValid: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  clearErrors: () => void;
  validate: (field?: keyof T) => boolean;
  validateAll: () => boolean;
  reset: () => void;
  getFieldError: (field: keyof T) => string | undefined;
  hasError: (field: keyof T) => boolean;
}

/**
 * Hook for form validation
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useValidation<T extends Record<string, any>>(
  options: UseValidationOptions = {}
): UseValidationReturn<T> {
  const {
    initialValues = {} as T,
    validationRules = {},
    validateOnChange = false,
    // validateOnBlur = true,
  } = options;

  const [values, setValuesState] = useState<T>(initialValues as T);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate a specific field
  const validateField = useCallback(
    (field: keyof T): boolean => {
      if (!validationRules[field as string]) {
        return true;
      }

      const validationResults = validateForm(
        { [field]: values[field] },
        { [field]: validationRules[field as string] }
      );

      const result = validationResults[field as string];
      if (!result.isValid) {
        setErrors((prev) => ({ ...prev, [field]: result.message || "" }));
        return false;
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
        return true;
      }
    },
    [values, validationRules]
  );

  // Validate all fields
  const validateAll = useCallback((): boolean => {
    if (Object.keys(validationRules).length === 0) {
      return true;
    }

    const validationResults = validateForm(values, validationRules);
    const formErrors = getFormErrors(validationResults);

    setErrors(formErrors);
    return isFormValid(validationResults);
  }, [values, validationRules]);

  // Set a single field value
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setValue = useCallback(
    (field: keyof T, value: any) => {
      setValuesState((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field as string]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }

      // Validate on change if enabled
      if (validateOnChange) {
        setTimeout(() => validateField(field), 0);
      }
    },
    [errors, validateOnChange, validateField]
  );

  // Set multiple field values
  const setValues = useCallback(
    (newValues: Partial<T>) => {
      setValuesState((prev) => ({ ...prev, ...newValues }));

      // Clear errors for changed fields
      const fieldsToClear = Object.keys(newValues);
      setErrors((prev) => {
        const newErrors = { ...prev };
        fieldsToClear.forEach((field) => {
          delete newErrors[field];
        });
        return newErrors;
      });

      // Validate changed fields if validate on change is enabled
      if (validateOnChange) {
        setTimeout(() => {
          fieldsToClear.forEach((field) => {
            if (validationRules[field]) {
              validateField(field as keyof T);
            }
          });
        }, 0);
      }
    },
    [validateOnChange, validateField, validationRules]
  );

  // Set a specific error
  const setError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  // Clear a specific error
  const clearError = useCallback((field: keyof T) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Validate a specific field or all fields
  const validate = useCallback(
    (field?: keyof T): boolean => {
      if (field) {
        return validateField(field);
      }
      return validateAll();
    },
    [validateField, validateAll]
  );

  // Reset form to initial values
  const reset = useCallback(() => {
    setValuesState(initialValues as T);
    setErrors({});
  }, [initialValues]);

  // Get error for a specific field
  const getFieldError = useCallback(
    (field: keyof T): string | undefined => {
      return errors[field as string];
    },
    [errors]
  );

  // Check if a field has an error
  const hasError = useCallback(
    (field: keyof T): boolean => {
      return !!errors[field as string];
    },
    [errors]
  );

  // Check if form is valid
  const isValid = useMemo(() => {
    if (Object.keys(validationRules).length === 0) {
      return true;
    }
    const validationResults = validateForm(values, validationRules);
    return isFormValid(validationResults);
  }, [values, validationRules]);

  return {
    values,
    errors,
    isValid,
    setValue,
    setValues,
    setError,
    clearError,
    clearErrors,
    validate,
    validateAll,
    reset,
    getFieldError,
    hasError,
  };
}

/**
 * Hook for field-level validation
 */
export function useFieldValidation<T>(
  initialValue: T,
  rules: ValidationRule[] = [],
  options: { validateOnChange?: boolean; validateOnBlur?: boolean } = {}
) {
  const { validateOnChange = false, validateOnBlur = true } = options;

  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<string>("");
  const [touched, setTouched] = useState(false);

  const validate = useCallback((): boolean => {
    if (rules.length === 0) {
      return true;
    }

    const validationResults = validateForm({ value }, { value: rules });
    const result = validationResults.value;

    if (!result.isValid) {
      setError(result.message || "");
      return false;
    } else {
      setError("");
      return true;
    }
  }, [value, rules]);

  const handleChange = useCallback(
    (newValue: T) => {
      setValue(newValue);
      setTouched(true);

      // Clear error when user starts typing
      if (error) {
        setError("");
      }

      // Validate on change if enabled
      if (validateOnChange) {
        setTimeout(() => validate(), 0);
      }
    },
    [error, validateOnChange, validate]
  );

  const handleBlur = useCallback(() => {
    setTouched(true);

    // Validate on blur if enabled
    if (validateOnBlur) {
      validate();
    }
  }, [validateOnBlur, validate]);

  const isValid = useMemo(() => {
    if (rules.length === 0) {
      return true;
    }
    const validationResults = validateForm({ value }, { value: rules });
    return validationResults.value.isValid;
  }, [value, rules]);

  return {
    value,
    error,
    touched,
    isValid,
    setValue: handleChange,
    handleBlur,
    validate,
    clearError: () => setError(""),
    reset: () => {
      setValue(initialValue);
      setError("");
      setTouched(false);
    },
  };
}

/**
 * Hook for debouncing a value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
