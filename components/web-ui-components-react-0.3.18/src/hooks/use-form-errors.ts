import * as React from 'react';
import { z } from 'zod';

export function validateSchema<T>(
  schema: z.ZodSchema,
  data: T,
): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  try {
    schema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.errors.forEach(({ path, message }) => {
        const fieldName = path.join('.');
        fieldErrors[fieldName] = message;
      });
      return { isValid: false, errors: fieldErrors };
    }
    return { isValid: false, errors: {} };
  }
}

export function useFormErrors() {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const updateFieldError = React.useCallback((fieldName: string, error?: string) => {
    setErrors((prevErrors) => {
      if (!error) {
        if (!(fieldName in prevErrors)) return prevErrors;
        const newState = { ...prevErrors };
        delete newState[fieldName];
        return newState;
      }

      if (prevErrors[fieldName] === error) return prevErrors;
      return { ...prevErrors, [fieldName]: error };
    });
  }, []);

  const validateData = React.useCallback((schema: z.ZodSchema, data: unknown) => {
    const { isValid, errors: validationErrors } = validateSchema(schema, data);
    setErrors(validationErrors);
    return { isValid, errors: validationErrors };
  }, []);

  const clearAllErrors = React.useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = React.useMemo(() => Object.keys(errors).length > 0, [errors]);

  return {
    errors,
    hasErrors,
    updateFieldError,
    validateData,
    clearAllErrors,
  };
}
