import { z } from "zod";

/* eslint-disable camelcase */

const parseNumeric = (val, parser) => {
  if (val === null || val === undefined || val === "") return undefined;
  const parsed = parser(val);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const preprocessString = (msg = "Invalid string") =>
  z.string({ required_error: msg, invalid_type_error: msg }).trim().min(1, msg);

export const preprocessStringOptional = (msg = "Invalid string") =>
  z.string().trim().min(1, msg).optional();

export const preprocessEmail = (msg = "Please provide a valid email address") =>
  z
    .string({ required_error: msg, invalid_type_error: msg })
    .trim()
    .toLowerCase()
    .min(1, msg)
    .email(msg);

export const preprocessEmailOptional = (
  msg = "Please provide a valid email address",
) => z.string().trim().toLowerCase().min(1, msg).email(msg).optional();

export const preprocessInt = (msg = "Invalid integer") =>
  z.preprocess(
    (val) => parseNumeric(val, (v) => parseInt(v, 10)),
    z.number({ required_error: msg, invalid_type_error: msg }).int(),
  );

export const preprocessIntOptional = (msg = "Invalid integer") =>
  z.preprocess(
    (val) => parseNumeric(val, (v) => parseInt(v, 10)),
    z.number().int().optional(),
  );

export const preprocessDouble = (msg = "Invalid number") =>
  z.preprocess(
    (val) => parseNumeric(val, parseFloat),
    z.number({ required_error: msg, invalid_type_error: msg }),
  );

export const preprocessDoubleOptional = (msg = "Invalid number") =>
  z.preprocess((val) => parseNumeric(val, parseFloat), z.number().optional());

export const preprocessBoolean = (msg = "Invalid boolean") =>
  z.preprocess(
    (val) => {
      if (typeof val === "boolean") return val;
      if (typeof val === "string") {
        const lower = val.trim().toLowerCase();
        if (["true", "1", "yes"].includes(lower)) return true;
        if (["false", "0", "no"].includes(lower)) return false;
      }
      if (typeof val === "number") return val === 1;
      return undefined;
    },
    z.boolean({ required_error: msg, invalid_type_error: msg }),
  );

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

export const preprocessEnum = (values, msg = "Invalid value") =>
  z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return undefined;
      if (typeof val === "string") {
        const trimmed = val.trim();
        const match = values.find(
          (v) => v.toLowerCase() === trimmed.toLowerCase(),
        );
        return match || trimmed;
      }
      return val;
    },
    z.enum(values, { required_error: msg, invalid_type_error: msg }),
  );

export const preprocessEnumOptional = (values, msg = "Invalid value") =>
  z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return undefined;
      if (typeof val === "string") {
        const trimmed = val.trim();
        const match = values.find(
          (v) => v.toLowerCase() === trimmed.toLowerCase(),
        );
        return match || trimmed;
      }
      return val;
    },
    z.enum(values, { invalid_type_error: msg }).optional(),
  );

export const preprocessDate = (msg = "Invalid date") =>
  z.preprocess(
    (val) => {
      if (!val) return undefined;
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d;
    },
    z.date({ required_error: msg, invalid_type_error: msg }),
  );

export const preprocessDateOptional = (msg = "Invalid date") =>
  z.preprocess((val) => {
    if (!val) return undefined;
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
  }, z.date().optional());

export const preprocessFileFlexible = (msg = "Invalid input") =>
  z
    .union([z.string(), z.instanceof(File), z.undefined()])
    .refine(
      (val) =>
        val === undefined || typeof val === "string" || val instanceof File,
      { message: msg },
    );

export const paginationSchema = z.object({
  page: preprocessIntOptional("Invalid page number").default(1),
  limit: preprocessIntOptional("Invalid limit").default(10),
});

export const idSchema = preprocessString("ID is required").refine(
  (val) => /^[a-z0-9-]{8,}$/i.test(val),
  { message: "Invalid ID format" }
);

export const STATUS_VALUES = {
  EMPLOYEE: ["Active", "Inactive"],
  ACCOUNT: ["Active", "Inactive"],
  PERMISSION: ["Active", "Inactive"],
  DEPARTMENT: ["Active", "Inactive"],
  VISITOR: ["CheckIn", "CheckOut"],
  VISITOR_REASON: [
    "Shipping",
    "BillingChequeCollection",
    "JobApplication",
    "ProductPresentation",
    "Meeting",
    "Other",
  ],
};
