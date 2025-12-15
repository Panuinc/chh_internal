import { ValidationError } from "./errors";
import { ERROR_MESSAGES } from "./constants";

export function validateSchema(schema, data) {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.flatten().fieldErrors,
  };
}

export function validateOrThrow(schema, data) {
  const result = validateSchema(schema, data);

  if (!result.success) {
    throw new ValidationError(ERROR_MESSAGES.INVALID_INPUT, result.errors);
  }

  return result.data;
}

export function normalizeString(value) {
  return value?.trim().toLowerCase() ?? "";
}

export function formatDateFields(items, dateFields = []) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (!item) return null;

      const formatted = { ...item };

      dateFields.forEach((field) => {
        if (formatted[field]) {
          formatted[field] = new Date(formatted[field]).toISOString();
        }
      });

      return formatted;
    })
    .filter(Boolean);
}
