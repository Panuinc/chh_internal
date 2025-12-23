"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useRFID } from "./useRFID";

const RFIDContext = createContext(null);

export function RFIDProvider({ children, config = {} }) {
  const rfid = useRFID({
    autoConnect: true,
    pollInterval: 15000,
    ...config,
  });

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

  return <RFIDContext.Provider value={value}>{children}</RFIDContext.Provider>;
}

export function useRFIDContext() {
  const context = useContext(RFIDContext);
  if (!context) {
    throw new Error("useRFIDContext must be used within RFIDProvider");
  }
  return context;
}

export function useRFIDSafe(config = {}) {
  const context = useContext(RFIDContext);

  const directHook = useRFID(
    context
      ? { autoConnect: false }
      : { autoConnect: true, pollInterval: 15000, ...config }
  );

  return context || directHook;
}

export default {
  RFIDProvider,
  useRFIDContext,
  useRFIDSafe,
};
