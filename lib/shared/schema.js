/**
 * Shared Schema Helpers
 * Validation utilities ใช้ร่วมกันทุก entity
 */

import { ValidationError } from "./errors";
import { ERROR_MESSAGES } from "./constants";

/**
 * Validate data against Zod schema
 * @template T
 * @param {import('zod').ZodSchema<T>} schema 
 * @param {unknown} data 
 * @returns {{ success: true, data: T } | { success: false, errors: Record<string, string[]> }}
 */
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

/**
 * Validate and throw if invalid
 * @template T
 * @param {import('zod').ZodSchema<T>} schema 
 * @param {unknown} data 
 * @returns {T}
 */
export function validateOrThrow(schema, data) {
  const result = validateSchema(schema, data);
  
  if (!result.success) {
    throw new ValidationError(ERROR_MESSAGES.INVALID_INPUT, result.errors);
  }

  return result.data;
}

/**
 * Normalize string (trim + lowercase)
 * @param {string} value 
 * @returns {string}
 */
export function normalizeString(value) {
  return value?.trim().toLowerCase() ?? "";
}

/**
 * Format date fields in data array
 * @param {Array} items 
 * @param {string[]} dateFields 
 * @returns {Array}
 */
export function formatDateFields(items, dateFields = []) {
  if (!Array.isArray(items)) return [];
  
  return items.map(item => {
    if (!item) return null;
    
    const formatted = { ...item };
    
    dateFields.forEach(field => {
      if (formatted[field]) {
        formatted[field] = new Date(formatted[field]).toISOString();
      }
    });
    
    return formatted;
  }).filter(Boolean);
}