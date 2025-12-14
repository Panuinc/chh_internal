import { z } from "zod";

// -------- Helper: Safe parse numeric --------
const parseNumeric = (val, parser) => {
  if (val === null || val === undefined || val === "") return undefined;
  const parsed = parser(val);
  return Number.isNaN(parsed) ? undefined : parsed;
};

// -------- Number / Integer / Float --------
export const preprocessInt = (msg = "Invalid integer") =>
  z.preprocess(
    (val) => parseNumeric(val, (v) => parseInt(v, 10)),
    z.number({ required_error: msg, invalid_type_error: msg }).int()
  );

export const preprocessIntOptional = (msg = "Invalid integer") =>
  z.preprocess(
    (val) => parseNumeric(val, (v) => parseInt(v, 10)),
    z.number().int().optional()
  );

export const preprocessDouble = (msg = "Invalid number") =>
  z.preprocess(
    (val) => parseNumeric(val, parseFloat),
    z.number({ required_error: msg, invalid_type_error: msg })
  );

export const preprocessDoubleOptional = (msg = "Invalid number") =>
  z.preprocess((val) => parseNumeric(val, parseFloat), z.number().optional());

// -------- String --------
export const preprocessString = (msg = "Invalid string") =>
  z.string({ required_error: msg, invalid_type_error: msg }).trim().min(1, msg);

export const preprocessStringOptional = (msg = "Invalid string") =>
  z.string().trim().min(1, msg).optional();

// -------- Boolean --------
export const preprocessBoolean = (msg = "Invalid boolean") =>
  z.preprocess((val) => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") {
      const lower = val.trim().toLowerCase();
      if (["true", "1", "yes"].includes(lower)) return true;
      if (["false", "0", "no"].includes(lower)) return false;
    }
    if (typeof val === "number") return val === 1;
    return undefined;
  }, z.boolean({ required_error: msg, invalid_type_error: msg }));

export const preprocessBooleanOptional = (msg = "Invalid boolean") =>
  z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    if (typeof val === "boolean") return val;
    if (typeof val === "string") {
      const lower = val.trim().toLowerCase();
      if (["true", "1", "yes"].includes(lower)) return true;
      if (["false", "0", "no"].includes(lower)) return false;
    }
    if (typeof val === "number") return val === 1;
    return undefined;
  }, z.boolean().optional());

// -------- Enum --------
export const preprocessEnum = (values, msg = "Invalid value") =>
  z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    if (typeof val === "string") {
      const trimmed = val.trim();
      const match = values.find(
        (v) => v.toLowerCase() === trimmed.toLowerCase()
      );
      return match || trimmed;
    }
    return val;
  }, z.enum(values, { required_error: msg, invalid_type_error: msg }));

export const preprocessEnumOptional = (values, msg = "Invalid value") =>
  z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    if (typeof val === "string") {
      const trimmed = val.trim();
      const match = values.find(
        (v) => v.toLowerCase() === trimmed.toLowerCase()
      );
      return match || trimmed;
    }
    return val;
  }, z.enum(values, { invalid_type_error: msg }).optional());

// -------- Date --------
export const preprocessDate = (msg = "Invalid date") =>
  z.preprocess((val) => {
    if (!val) return undefined;
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
  }, z.date({ required_error: msg, invalid_type_error: msg }));

export const preprocessDateOptional = (msg = "Invalid date") =>
  z.preprocess((val) => {
    if (!val) return undefined;
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
  }, z.date().optional());

// -------- File --------
export const preprocessFileFlexible = (msg = "Invalid input") =>
  z
    .union([z.string(), z.instanceof(File), z.undefined()])
    .refine(
      (val) =>
        val === undefined || typeof val === "string" || val instanceof File,
      { message: msg }
    );

// -------- Data Formatter --------
export const formatData = (
  items = [],
  dateFields = [],
  datetimeFields = []
) => {
  const formatDate = (val) => {
    const d = new Date(val);
    return isNaN(d) ? null : d.toISOString().split("T")[0];
  };
  const formatDateTime = (val) => {
    const d = new Date(val);
    return isNaN(d) ? null : d.toISOString();
  };

  const getNested = (obj, path) =>
    path.split(".").reduce((acc, k) => acc?.[k], obj);
  const setNested = (obj, path, value) => {
    const keys = path.split(".");
    const last = keys.pop();
    const target = keys.reduce((acc, k) => (acc[k] ??= {}), obj);
    target[last] = value;
  };

  return items.map((item) => {
    const clone = structuredClone(item);
    [...dateFields, ...datetimeFields].forEach((f) => {
      const val = getNested(clone, f);
      if (!val) return;
      setNested(
        clone,
        f,
        dateFields.includes(f) ? formatDate(val) : formatDateTime(val)
      );
    });
    return clone;
  });
};
