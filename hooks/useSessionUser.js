/**
 * Re-export useSessionUser จาก useMenu
 * เพื่อให้ import path เดิมใช้ได้: @/hooks/useSessionUser
 */

export { useSessionUser } from "./useMenu";
export { useSessionUser as default } from "./useMenu";