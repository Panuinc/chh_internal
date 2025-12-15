/**
 * Shared Module - Client-Safe Exports
 * ⚠️ ห้าม export server-only code (logger, NextResponse) ที่นี่
 * 
 * สำหรับ server-only imports ใช้:
 *   import { createLogger } from "@/lib/shared/server"
 */

// Constants (client-safe)
export {
  HTTP_STATUS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  PAGINATION,
} from "./constants";

// Errors (client-safe)
export {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  BadRequestError,
  UnauthorizedError,
  normalizeError,
} from "./errors";

// React Hooks (client-only)
export {
  useFetch,
  createUseList,
  createUseItem,
  createUseSubmit,
} from "./hooks";