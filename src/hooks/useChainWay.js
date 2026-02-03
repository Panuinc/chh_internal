"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { TIMEOUTS } from "@/lib/chainWay/config";

const API_URL = "/api/chainWay";

async function fetchAPI(url, options = {}) {
  const timeout = options.timeout || TIMEOUTS.print;
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort(new DOMException("Request timeout", "TimeoutError"));
  }, timeout);

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...options.headers },
      signal: options.signal || controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Request failed: ${response.status}`);
    }

    return data;
  } catch (err) {
    if (err.name === "AbortError" || err.name === "TimeoutError") {
      throw new Error("Request timeout - กรุณาลองใหม่อีกครั้ง");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function withRetry(fn, retries = 2, delay = 1000) {
  let lastError;

  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

async function postApi(action, payload = {}) {
  return fetchAPI(API_URL, {
    method: "POST",
    body: JSON.stringify({ action, ...payload }),
  });
}

async function getApi(action, params = {}) {
  const searchParams = new URLSearchParams({ action, ...params });
  return fetchAPI(`${API_URL}?${searchParams.toString()}`);
}

export function useRFIDPrint(defaultOptions = {}) {
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const abortRef = useRef(null);

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setPrinting(false);
  }, []);

  const healthCheck = useCallback(async () => {
    try {
      const result = await getApi("status");
      return result.success && result.data?.connection?.success;
    } catch {
      return false;
    }
  }, []);

  const sendCommand = useCallback(async (command) => {
    setPrinting(true);
    setError(null);

    try {
      const result = await postApi("command", { command });
      if (!result.success)
        throw new Error(result.error || "Send command failed");
      setLastResult(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setPrinting(false);
    }
  }, []);

  const printBatch = useCallback(
    async (items, options = {}) => {
      cancel();
      setPrinting(true);
      setError(null);
      abortRef.current = new AbortController();

      try {
        const isHealthy = await healthCheck();
        if (!isHealthy)
          throw new Error("Printer ไม่พร้อม กรุณาตรวจสอบการเชื่อมต่อ");

        const result = await withRetry(async () => {
          if (abortRef.current?.signal?.aborted) {
            throw new DOMException("Print cancelled", "AbortError");
          }

          return await postApi("print", {
            items: Array.isArray(items) ? items : [items],
            options: {
              ...defaultOptions,
              ...options,
              quantity: options.quantity || 1,
            },
          });
        });

        if (!result.success) throw new Error(result.error || "Print failed");
        setLastResult(result);
        return result;
      } catch (err) {
        if (err.name === "AbortError") return null;
        setError(err.message);
        throw err;
      } finally {
        setPrinting(false);
        abortRef.current = null;
      }
    },
    [defaultOptions, cancel, healthCheck],
  );

  useEffect(() => cancel, [cancel]);

  return {
    print: (item, options) => printBatch([item], options),
    printBatch,
    sendCommand,
    cancel,
    printing,
    error,
    lastResult,
    healthCheck,
    clearError: () => setError(null),
  };
}

export function usePrinterStatus(config = {}) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return null;
    setLoading(true);
    setError(null);

    try {
      const result = await getApi("status");

      if (!mountedRef.current) return null;

      if (result.success) {
        const { connection, status: printerStatusData } = result.data || {};
        const isOnline = connection?.success || false;

        setStatus({
          online: isOnline,
          raw: printerStatusData?.raw,
          parsed: printerStatusData?.parsed || null,
          connection,
        });
        setIsConnected(isOnline);
      }
      return result;
    } catch (err) {
      if (!mountedRef.current) return null;
      setError(err.message);
      setIsConnected(false);
      return null;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const executeAction = useCallback(
    async (action) => {
      setLoading(true);
      setError(null);

      try {
        const result = await postApi("printer", {
          printerAction: action,
        });

        if (!result.success) throw new Error(result.error);

        await new Promise((r) => setTimeout(r, 1000));
        await refresh();
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refresh],
  );

  const reconnect = useCallback(async () => {
    setError(null);
    try {
      await executeAction("cancel");
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
    return refresh();
  }, [executeAction, refresh]);

  const fullReset = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await postApi("printer", { printerAction: "fullReset" });
      await new Promise((r) => setTimeout(r, 1000));
      return await refresh();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  useEffect(() => {
    mountedRef.current = true;
    if (config.autoConnect !== false) refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [config.autoConnect, refresh]);

  useEffect(() => {
    if (!config.pollInterval) return;
    const interval = setInterval(refresh, config.pollInterval);
    return () => clearInterval(interval);
  }, [config.pollInterval, refresh]);

  return {
    status,
    loading,
    error,
    isConnected,
    refresh,
    reconnect,
    fullReset,
    testConnection: () => executeAction("test"),
    calibrate: () => executeAction("calibrate"),
    resetPrinter: () => executeAction("reset"),
    cancelAllJobs: () => executeAction("cancel"),
  };
}

export function useRFID(config = {}) {
  const printHook = useRFIDPrint(config.printOptions);
  const printerHook = usePrinterStatus({
    autoConnect: config.autoConnect,
    pollInterval: config.pollInterval,
  });

  const safePrint = useCallback(
    async (item, options = {}) => {
      if (!printerHook.isConnected) {
        await printerHook.refresh();
        if (!printerHook.isConnected)
          throw new Error("Printer ไม่ได้เชื่อมต่อ");
      }
      return printHook.print(item, options);
    },
    [printHook, printerHook],
  );

  const safePrintBatch = useCallback(
    async (items, options = {}) => {
      if (!printerHook.isConnected) {
        await printerHook.refresh();
        if (!printerHook.isConnected)
          throw new Error("Printer ไม่ได้เชื่อมต่อ");
      }
      return printHook.printBatch(items, options);
    },
    [printHook, printerHook],
  );

  const safeSendCommand = useCallback(
    async (command) => {
      if (!printerHook.isConnected) {
        await printerHook.refresh();
        if (!printerHook.isConnected)
          throw new Error("Printer ไม่ได้เชื่อมต่อ");
      }
      return printHook.sendCommand(command);
    },
    [printHook, printerHook],
  );

  return {
    print: safePrint,
    printBatch: safePrintBatch,
    sendCommand: safeSendCommand,
    cancelPrint: printHook.cancel,
    printing: printHook.printing,
    printError: printHook.error,
    lastResult: printHook.lastResult,
    clearPrintError: printHook.clearError,
    healthCheck: printHook.healthCheck,

    refreshPrinter: printerHook.refresh,
    reconnect: printerHook.reconnect,
    fullReset: printerHook.fullReset,
    testConnection: printerHook.testConnection,
    calibrate: printerHook.calibrate,
    resetPrinter: printerHook.resetPrinter,
    cancelAllJobs: printerHook.cancelAllJobs,
    printerStatus: printerHook.status,
    printerLoading: printerHook.loading,
    printerError: printerHook.error,
    isConnected: printerHook.isConnected,
  };
}

const RFIDContext = createContext(null);

export function RFIDProvider({ children, config = {} }) {
  const rfid = useRFID({ autoConnect: true, pollInterval: 15000, ...config });

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
    ],
  );

  return <RFIDContext.Provider value={value}>{children}</RFIDContext.Provider>;
}

export function useRFIDContext() {
  const context = useContext(RFIDContext);
  if (!context)
    throw new Error("useRFIDContext must be used within RFIDProvider");
  return context;
}

export function useRFIDSafe(config = {}) {
  const context = useContext(RFIDContext);
  const directHook = useRFID(
    context
      ? { autoConnect: false }
      : { autoConnect: true, pollInterval: 15000, ...config },
  );
  return context || directHook;
}

export default useRFID;
