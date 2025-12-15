/**
 * Shared Module - Server-Only Exports
 * ใช้ใน route.js, module.js (server-side only)
 * 
 * ⚠️ ห้าม import ใน client components
 */

// Re-export client-safe code
export * from "./index";

// Schema Helpers (uses Zod, safe for server)
export {
  validateSchema,
  validateOrThrow,
  normalizeString,
  formatDateFields,
} from "./schema";

// Controller Helpers (uses NextResponse - server only)
export {
  successResponse,
  errorResponse,
  getPaginationParams,
  calculateSkip,
  createBaseController,
} from "./controller";

// Logger Helpers (uses fs - server only)
export {
  createLogger,
  handlePrismaUniqueError,
} from "./logger";