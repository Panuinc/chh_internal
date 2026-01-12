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
import {
  API_ENDPOINTS,
  TIMEOUTS,
  STORAGE_KEYS,
  PRINTER_CONFIG,
  DEFAULT_LABEL_SIZE,
  EPC_CONFIG,
  LABEL_PRESETS,
  getDefaultLabelPreset,
} from "@/lib/chainWay/config";

// ============================================================================
// Utility Functions
// ============================================================================

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
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
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
      console.warn(`Attempt ${i + 1} failed:`, err.message);

      if (i < retries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

function loadFromStorage(key = STORAGE_KEYS.printerSettings) {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("[useSettings] Load error:", error);
    return null;
  }
}

function saveToStorage(config, key = STORAGE_KEYS.printerSettings) {
  if (typeof window === "undefined") return false;

  try {
    localStorage.setItem(key, JSON.stringify(config));
    return true;
  } catch (error) {
    console.error("[useSettings] Save error:", error);
    return false;
  }
}

const getDefaultSettings = () => ({
  host: PRINTER_CONFIG.host,
  port: PRINTER_CONFIG.port,
  timeout: PRINTER_CONFIG.timeout,
  retries: PRINTER_CONFIG.retries,

  labelWidth: DEFAULT_LABEL_SIZE.width,
  labelHeight: DEFAULT_LABEL_SIZE.height,
  labelPreset: getDefaultLabelPreset().name,

  epcMode: EPC_CONFIG.mode,
  epcPrefix: EPC_CONFIG.prefix,
  companyPrefix: EPC_CONFIG.companyPrefix,

  defaultQuantity: 1,
  printDelay: 100,
  autoCalibrate: false,

  enableRFIDByDefault: false,
  validateEPC: true,
  retryOnError: true,
});

// ============================================================================
// useRFIDPrint Hook
// ============================================================================

export function useRFIDPrint(defaultOptions = {}) {
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const abortRef = useRef(null);

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort(
        new DOMException("Print cancelled by user", "AbortError")
      );
      abortRef.current = null;
    }
    setPrinting(false);
  }, []);

  const healthCheck = useCallback(async () => {
    try {
      const result = await fetchAPI(API_ENDPOINTS.printer, {
        timeout: TIMEOUTS.healthCheck,
      });
      return result.success && result.data?.connection?.success;
    } catch (err) {
      console.error("Health check failed:", err);
      return false;
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
        if (!isHealthy) {
          throw new Error("Printer ไม่พร้อม กรุณาตรวจสอบการเชื่อมต่อ");
        }

        const result = await withRetry(async () => {
          if (abortRef.current?.signal?.aborted) {
            throw new DOMException("Print cancelled", "AbortError");
          }

          return await fetchAPI(API_ENDPOINTS.print, {
            method: "POST",
            body: JSON.stringify({
              items: Array.isArray(items) ? items : [items],
              options: { ...defaultOptions, ...options },
            }),
            signal: abortRef.current?.signal,
            timeout: TIMEOUTS.print,
          });
        });

        if (!result.success) {
          throw new Error(result.error || "Print failed");
        }

        setLastResult(result);
        return result;
      } catch (err) {
        if (err.name === "AbortError" || err.message?.includes("cancelled")) {
          console.log("Print cancelled");
          return null;
        }

        const errorMsg = err.message || "Unknown error";
        setError(errorMsg);
        throw err;
      } finally {
        setPrinting(false);
        abortRef.current = null;
      }
    },
    [defaultOptions, cancel, healthCheck]
  );

  const print = useCallback(
    async (item, options = {}) => {
      return printBatch([item], options);
    },
    [printBatch]
  );

  useEffect(() => cancel, [cancel]);

  return {
    print,
    printBatch,
    cancel,
    printing,
    error,
    lastResult,
    healthCheck,
    clearError: () => setError(null),
  };
}

// ============================================================================
// usePrinterStatus Hook
// ============================================================================

export function usePrinterStatus(config = {}) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(null);
  const mountedRef = useRef(true);
  const reconnectAttemptsRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return null;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (config.host) params.set("host", config.host);
      if (config.port) params.set("port", String(config.port));

      const url = `${API_ENDPOINTS.printer}${
        params.toString() ? `?${params}` : ""
      }`;
      const result = await fetchAPI(url, { timeout: TIMEOUTS.status });

      if (!mountedRef.current) return null;

      if (result.success) {
        setStatus(result.data);
        const connected = result.data?.connection?.success || false;
        setIsConnected(connected);
        setLastCheckTime(new Date());

        if (connected) {
          reconnectAttemptsRef.current = 0;
        }
      }

      return result;
    } catch (err) {
      if (!mountedRef.current) return null;
      setError(err.message);
      setIsConnected(false);
      return null;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [config.host, config.port]);

  const executeAction = useCallback(
    async (action) => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchAPI(API_ENDPOINTS.printer, {
          method: "POST",
          body: JSON.stringify({
            action,
            config: config.host ? config : undefined,
          }),
          timeout: TIMEOUTS.action,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        await refresh();

        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [config, refresh]
  );

  const reconnect = useCallback(async () => {
    console.log("Attempting to reconnect...");
    setError(null);

    try {
      await executeAction("cancel");
    } catch (e) {
      console.warn("Cancel failed:", e);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    return refresh();
  }, [executeAction, refresh]);

  const fullReset = useCallback(async () => {
    console.log("Performing full reset...");
    setLoading(true);
    setError(null);

    try {
      const result = await fetchAPI(API_ENDPOINTS.printer, {
        method: "POST",
        body: JSON.stringify({ action: "fullReset" }),
        timeout: TIMEOUTS.action,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
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

    if (config.autoConnect !== false) {
      refresh();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [config.autoConnect, refresh]);

  useEffect(() => {
    if (!config.pollInterval) return;

    const interval = setInterval(refresh, config.pollInterval);
    return () => clearInterval(interval);
  }, [config.pollInterval, refresh]);

  useEffect(() => {
    if (isConnected || !config.autoReconnect) return;

    const maxAttempts = 3;
    if (reconnectAttemptsRef.current >= maxAttempts) return;

    const timeout = setTimeout(() => {
      reconnectAttemptsRef.current++;
      console.log(
        `Auto reconnect attempt ${reconnectAttemptsRef.current}/${maxAttempts}`
      );
      refresh();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isConnected, config.autoReconnect, refresh]);

  return {
    status,
    loading,
    error,
    isConnected,
    lastCheckTime,
    refresh,
    reconnect,
    fullReset,
    testConnection: () => executeAction("test"),
    calibrate: () => executeAction("calibrate"),
    resetPrinter: () => executeAction("reset"),
    cancelAllJobs: () => executeAction("cancel"),
  };
}

// ============================================================================
// useRFIDPreview Hook
// ============================================================================

export function useRFIDPreview() {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPreview = useCallback(async (item, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ number: item.number });
      if (item.displayName) params.set("displayName", item.displayName);
      if (options.type) params.set("type", options.type);
      if (options.enableRFID) params.set("enableRFID", "true");

      const result = await fetchAPI(`${API_ENDPOINTS.print}?${params}`, {
        timeout: TIMEOUTS.status,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      setPreview(result.data);
      return result.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    preview,
    loading,
    error,
    getPreview,
    clearPreview: () => setPreview(null),
  };
}

// ============================================================================
// useRFID Hook (Combined)
// ============================================================================

export function useRFID(config = {}) {
  const printHook = useRFIDPrint(config.printOptions);
  const printerHook = usePrinterStatus({
    ...config.printerConfig,
    autoConnect: config.autoConnect,
    pollInterval: config.pollInterval,
    autoReconnect: config.autoReconnect ?? true,
  });
  const previewHook = useRFIDPreview();

  const safePrint = useCallback(
    async (item, options = {}) => {
      if (!printerHook.isConnected) {
        await printerHook.refresh();

        if (!printerHook.isConnected) {
          throw new Error("Printer ไม่ได้เชื่อมต่อ กรุณาตรวจสอบการเชื่อมต่อ");
        }
      }

      return printHook.print(item, options);
    },
    [printHook, printerHook]
  );

  const safePrintBatch = useCallback(
    async (items, options = {}) => {
      if (!printerHook.isConnected) {
        await printerHook.refresh();

        if (!printerHook.isConnected) {
          throw new Error("Printer ไม่ได้เชื่อมต่อ กรุณาตรวจสอบการเชื่อมต่อ");
        }
      }

      return printHook.printBatch(items, options);
    },
    [printHook, printerHook]
  );

  return {
    // Print functions
    print: safePrint,
    printBatch: safePrintBatch,
    cancelPrint: printHook.cancel,
    printing: printHook.printing,
    printError: printHook.error,
    lastResult: printHook.lastResult,
    clearPrintError: printHook.clearError,
    healthCheck: printHook.healthCheck,

    // Printer status & controls
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
    lastCheckTime: printerHook.lastCheckTime,

    // Preview
    getPreview: previewHook.getPreview,
    previewData: previewHook.preview,
    previewLoading: previewHook.loading,
    clearPreview: previewHook.clearPreview,
  };
}

// ============================================================================
// usePrinterSettings Hook
// ============================================================================

export function usePrinterSettings(options = {}) {
  const { autoLoad = true, storageKey = STORAGE_KEYS.printerSettings } =
    options;

  const [settings, setSettings] = useState(getDefaultSettings);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!autoLoad) return;

    const stored = loadFromStorage(storageKey);
    if (stored) {
      setSettings((prev) => ({ ...prev, ...stored }));
    }
    setLoaded(true);
  }, [autoLoad, storageKey]);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateSettings = useCallback((updates) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      const success = saveToStorage(settings, storageKey);
      if (!success) {
        throw new Error("Failed to save settings");
      }
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [settings, storageKey]);

  const reset = useCallback(() => {
    const defaults = getDefaultSettings();
    setSettings(defaults);
    saveToStorage(defaults, storageKey);
  }, [storageKey]);

  const getPrinterConfig = useCallback(
    () => ({
      host: settings.host,
      port: settings.port,
      timeout: settings.timeout,
      retries: settings.retries,
    }),
    [settings]
  );

  const getLabelSize = useCallback(
    () => ({
      width: settings.labelWidth,
      height: settings.labelHeight,
    }),
    [settings]
  );

  const getEPCConfig = useCallback(
    () => ({
      mode: settings.epcMode,
      prefix: settings.epcPrefix,
      companyPrefix: settings.companyPrefix,
    }),
    [settings]
  );

  const getPrintOptions = useCallback(
    () => ({
      quantity: settings.defaultQuantity,
      delay: settings.printDelay,
      enableRFID: settings.enableRFIDByDefault,
      labelSize: getLabelSize(),
      epcMode: settings.epcMode,
      epcPrefix: settings.epcPrefix,
    }),
    [settings, getLabelSize]
  );

  return {
    settings,
    loaded,
    saving,
    error,

    updateSetting,
    updateSettings,
    save,
    reset,

    getPrinterConfig,
    getLabelSize,
    getEPCConfig,
    getPrintOptions,
  };
}

// ============================================================================
// useLabelPresets Hook
// ============================================================================

export function useLabelPresets() {
  const [currentPreset, setCurrentPreset] = useState(
    () => LABEL_PRESETS.find((p) => p.isDefault) || LABEL_PRESETS[0]
  );

  const [customSize, setCustomSize] = useState({ width: 100, height: 30 });

  const selectPreset = useCallback((presetName) => {
    const preset = LABEL_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setCurrentPreset(preset);
      if (preset.width && preset.height) {
        setCustomSize({ width: preset.width, height: preset.height });
      }
    }
  }, []);

  const setCustomDimensions = useCallback((width, height) => {
    setCustomSize({ width, height });
    setCurrentPreset(LABEL_PRESETS.find((p) => p.name === "Custom"));
  }, []);

  const getCurrentSize = useCallback(() => {
    if (currentPreset.name === "Custom") {
      return customSize;
    }
    return { width: currentPreset.width, height: currentPreset.height };
  }, [currentPreset, customSize]);

  return {
    presets: LABEL_PRESETS,
    currentPreset,
    customSize,
    selectPreset,
    setCustomDimensions,
    getCurrentSize,
    isCustom: currentPreset.name === "Custom",
  };
}

// ============================================================================
// RFID Context & Provider
// ============================================================================

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

// ============================================================================
// Default Export
// ============================================================================

export default useRFID;