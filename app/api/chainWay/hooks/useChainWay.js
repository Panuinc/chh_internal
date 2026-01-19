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
  } catch {
    return null;
  }
}

function saveToStorage(config, key = STORAGE_KEYS.printerSettings) {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(key, JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}

function getErrorMessage(error) {
  if (typeof error === "string") return error;
  return error?.message || "Unknown error";
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
      if (!success) throw new Error("Failed to save settings");
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

  return {
    settings,
    loaded,
    saving,
    error,
    updateSetting,
    updateSettings,
    save,
    reset,
    getPrinterConfig: () => ({
      host: settings.host,
      port: settings.port,
      timeout: settings.timeout,
      retries: settings.retries,
    }),
    getLabelSize: () => ({
      width: settings.labelWidth,
      height: settings.labelHeight,
    }),
    getEPCConfig: () => ({
      mode: settings.epcMode,
      prefix: settings.epcPrefix,
      companyPrefix: settings.companyPrefix,
    }),
  };
}

export function useLabelPresets() {
  const [currentPreset, setCurrentPreset] = useState(
    () => LABEL_PRESETS.find((p) => p.isDefault) || LABEL_PRESETS[0],
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

  return {
    presets: LABEL_PRESETS,
    currentPreset,
    customSize,
    selectPreset,
    setCustomDimensions,
    getCurrentSize: () =>
      currentPreset.name === "Custom"
        ? customSize
        : { width: currentPreset.width, height: currentPreset.height },
    isCustom: currentPreset.name === "Custom",
  };
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

      if (!result.success) {
        throw new Error(result.error || "Send command failed");
      }

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
        if (!isHealthy) {
          throw new Error("Printer ไม่พร้อม กรุณาตรวจสอบการเชื่อมต่อ");
        }

        const result = await withRetry(async () => {
          if (abortRef.current?.signal?.aborted) {
            throw new DOMException("Print cancelled", "AbortError");
          }

          return await postApi("print", {
            items: Array.isArray(items) ? items : [items],
            options: { ...defaultOptions, ...options },
          });
        });

        if (!result.success) {
          throw new Error(result.error || "Print failed");
        }

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
      const result = await getApi("status", {
        host: config.host || "",
        port: config.port ? String(config.port) : "",
      });

      if (!mountedRef.current) return null;

      if (result.success) {
        setStatus(result.data);
        setIsConnected(result.data?.connection?.success || false);
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
  }, [config.host, config.port]);

  const executeAction = useCallback(
    async (action) => {
      setLoading(true);
      setError(null);

      try {
        const result = await postApi("printer", {
          printerAction: action,
          config: config.host ? config : undefined,
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
    [config, refresh],
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

export function useRFIDPreview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  const preview = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    setPreviewData(null);

    try {
      const response = await getApi("preview", {
        number: params.number,
        displayName: params.displayName || params.number,
        displayName2: params.displayName2 || "",
        type: params.type || "barcode",
        enableRFID: params.enableRFID ? "true" : "false",
      });

      setPreviewData(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { preview, loading, error, previewData };
}

export function useRFID(config = {}) {
  const printHook = useRFIDPrint(config.printOptions);
  const printerHook = usePrinterStatus({
    ...config.printerConfig,
    autoConnect: config.autoConnect,
    pollInterval: config.pollInterval,
  });

  const safePrint = useCallback(
    async (item, options = {}) => {
      if (!printerHook.isConnected) {
        await printerHook.refresh();
        if (!printerHook.isConnected) {
          throw new Error("Printer ไม่ได้เชื่อมต่อ");
        }
      }
      return printHook.print(item, options);
    },
    [printHook, printerHook],
  );

  const safePrintBatch = useCallback(
    async (items, options = {}) => {
      if (!printerHook.isConnected) {
        await printerHook.refresh();
        if (!printerHook.isConnected) {
          throw new Error("Printer ไม่ได้เชื่อมต่อ");
        }
      }
      return printHook.printBatch(items, options);
    },
    [printHook, printerHook],
  );

  const safeSendCommand = useCallback(
    async (command) => {
      if (!printerHook.isConnected) {
        await printerHook.refresh();
        if (!printerHook.isConnected) {
          throw new Error("Printer ไม่ได้เชื่อมต่อ");
        }
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
    ],
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
      : { autoConnect: true, pollInterval: 15000, ...config },
  );
  return context || directHook;
}

export function useChainWay() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return { success: true, data: result };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute };
}

export function useChainWayCommand() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const sendCommand = useCallback(async (command, options = {}) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await postApi("command", {
        command,
        host: options.host,
        port: options.port,
      });

      setResult(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { sendCommand, loading, error, result };
}

export function useChainWayPrint() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [printResult, setPrintResult] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  const printBatch = useCallback(async (items, options = {}) => {
    setLoading(true);
    setError(null);
    setPrintResult(null);

    try {
      const response = await postApi("print", { items, options });
      setPrintResult(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const preview = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    setPreviewData(null);

    try {
      const response = await getApi("preview", {
        number: params.number,
        displayName: params.displayName || params.number,
        displayName2: params.displayName2 || "",
        type: params.type || "barcode",
        enableRFID: params.enableRFID ? "true" : "false",
      });

      setPreviewData(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { printBatch, preview, loading, error, printResult, previewData };
}

export function useChainWayPrinter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [actionResult, setActionResult] = useState(null);

  const getStatus = useCallback(async (config = {}) => {
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const response = await getApi("status", {
        host: config.host || "",
        port: config.port || "",
      });

      setStatus(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const executeAction = useCallback(async (printerAction, config = {}) => {
    setLoading(true);
    setError(null);
    setActionResult(null);

    try {
      const response = await postApi("printer", { printerAction, config });
      setActionResult(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const testConnection = useCallback(
    (config) => executeAction("test", config),
    [executeAction],
  );
  const calibrate = useCallback(
    (config) => executeAction("calibrate", config),
    [executeAction],
  );
  const reset = useCallback(
    (config) => executeAction("reset", config),
    [executeAction],
  );
  const fullReset = useCallback(
    (config) => executeAction("fullReset", config),
    [executeAction],
  );
  const cancelAll = useCallback(
    (config) => executeAction("cancel", config),
    [executeAction],
  );
  const feedLabel = useCallback(
    (config) => executeAction("feed", config),
    [executeAction],
  );
  const pause = useCallback(
    (config) => executeAction("pause", config),
    [executeAction],
  );
  const resume = useCallback(
    (config) => executeAction("resume", config),
    [executeAction],
  );

  return {
    getStatus,
    executeAction,
    testConnection,
    calibrate,
    reset,
    fullReset,
    cancelAll,
    feedLabel,
    pause,
    resume,
    loading,
    error,
    status,
    actionResult,
  };
}

export function useChainWayPackingSlip() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [labels, setLabels] = useState([]);

  const generatePackingSlips = useCallback(async (order) => {
    setLoading(true);
    setError(null);
    setLabels([]);

    try {
      const response = await postApi("packingSlip", { order });
      setLabels(response.labels || []);
      return { success: true, labels: response.labels, count: response.count };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { generatePackingSlips, loading, error, labels };
}

export default useRFID;
