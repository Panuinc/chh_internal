import { z } from "zod";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CUID_REGEX = /^[a-z0-9]{24,}$/i;

export function isValidUUID(id) {
  if (typeof id !== "string") return false;
  return UUID_REGEX.test(id);
}

export function isValidCUID(id) {
  if (typeof id !== "string") return false;
  return CUID_REGEX.test(id);
}

export function isValidId(id) {
  return isValidUUID(id) || isValidCUID(id);
}

export const uuidSchema = z.string().regex(UUID_REGEX, "Invalid UUID format");

export const cuidSchema = z.string().regex(CUID_REGEX, "Invalid CUID format");

export const idSchema = z.string().refine(
  (val) => isValidId(val),
  { message: "Invalid ID format. Must be a valid UUID or CUID" }
);

export function validateId(id, fieldName = "ID") {
  if (!isValidId(id)) {
    throw new Error(`Invalid ${fieldName} format`);
  }
  return id;
}

export function validateUUID(id, fieldName = "UUID") {
  if (!isValidUUID(id)) {
    throw new Error(`Invalid ${fieldName} format`);
  }
  return id;
}
