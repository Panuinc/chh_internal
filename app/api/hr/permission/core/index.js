/**
 * Permission Core - Client Exports Only
 * ⚠️ ห้าม export server-side code (logger, prisma) ที่นี่
 * 
 * สำหรับ client components:
 *   import { usePermissions } from "@/app/api/hr/permission/core"
 * 
 * สำหรับ route.js (server):
 *   import { getAllPermission } from "@/app/api/hr/permission/core/permission.module"
 */

// Export เฉพาะ hooks สำหรับ client
export {
  usePermissions,
  usePermission,
  useSubmitPermission,
} from "../hooks/usePermission";