/**
 * RFID Context
 * Share RFID state across components to prevent multiple instances
 */

"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useRFID } from "./useRFID";

const RFIDContext = createContext(null);

/**
 * Provider สำหรับ share RFID state
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Object} props.config - RFID configuration
 */
export function RFIDProvider({ children, config = {} }) {
  const rfid = useRFID({
    autoConnect: true,
    pollInterval: 15000,
    ...config,
  });

  // Memoize value เพื่อป้องกัน unnecessary re-renders
  const value = useMemo(
    () => rfid,
    [
      rfid.printing,
      rfid.isConnected,
      rfid.printerLoading,
      rfid.lastResult,
      rfid.printError,
      rfid.printerError,
      rfid.printerStatus,
    ]
  );

  return (
    <RFIDContext.Provider value={value}>
      {children}
    </RFIDContext.Provider>
  );
}

/**
 * Hook สำหรับใช้ RFID context
 * ต้องใช้ภายใน RFIDProvider
 */
export function useRFIDContext() {
  const context = useContext(RFIDContext);
  if (!context) {
    throw new Error("useRFIDContext must be used within RFIDProvider");
  }
  return context;
}

/**
 * Hook ที่ใช้ได้ทั้งใน/นอก Provider
 * - ถ้าอยู่ใน Provider จะใช้ shared state
 * - ถ้าไม่อยู่ใน Provider จะสร้าง instance ใหม่
 */
export function useRFIDSafe(config = {}) {
  const context = useContext(RFIDContext);
  
  // ถ้าอยู่ใน Provider ใช้ context
  // ถ้าไม่อยู่ใน Provider สร้าง hook ใหม่
  const directHook = useRFID(
    context ? { autoConnect: false } : { autoConnect: true, pollInterval: 15000, ...config }
  );

  return context || directHook;
}

export default {
  RFIDProvider,
  useRFIDContext,
  useRFIDSafe,
};