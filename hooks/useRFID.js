/**
 * RFID Hooks
 * React hooks สำหรับ RFID printing
 * 
 * การใช้งาน:
 * const { print, isConnected, printing } = useRFID({ autoConnect: true });
 * await print({ number: 'PK001', displayName: 'Item 1' });
 */

"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

const PRINT_API = '/api/warehouse/rfid/print';
const PRINTER_API = '/api/warehouse/rfid/printer';

// ============================================
// Helper
// ============================================

async function fetchAPI(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Failed: ${response.status}`);
  return data;
}

// ============================================
// useRFIDPrint - พิมพ์ Label
// ============================================

export function useRFIDPrint(options = {}) {
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const abortRef = useRef(null);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPrinting(false);
  }, []);

  const print = useCallback(async (item, printOptions = {}) => {
    return printBatch([item], printOptions);
  }, []);

  const printBatch = useCallback(async (items, printOptions = {}) => {
    cancel();
    setPrinting(true);
    setError(null);
    abortRef.current = new AbortController();

    try {
      const result = await fetchAPI(PRINT_API, {
        method: 'POST',
        body: JSON.stringify({ items, options: { ...options, ...printOptions } }),
        signal: abortRef.current.signal,
      });

      if (!result.success) throw new Error(result.error || 'Print failed');
      setLastResult(result);
      return result;
    } catch (err) {
      if (err.name === 'AbortError') return null;
      setError(err.message);
      throw err;
    } finally {
      setPrinting(false);
      abortRef.current = null;
    }
  }, [options, cancel]);

  useEffect(() => cancel, [cancel]);

  return { print, printBatch, cancel, printing, error, lastResult, clearError: () => setError(null) };
}

// ============================================
// usePrinterStatus - สถานะ Printer
// ============================================

export function usePrinterStatus(config = {}) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (config.host) params.set('host', config.host);
      if (config.port) params.set('port', String(config.port));
      
      const url = `${PRINTER_API}${params.toString() ? `?${params}` : ''}`;
      const result = await fetchAPI(url);

      if (result.success) {
        setStatus(result.data);
        setIsConnected(result.data?.connection?.success || false);
      }
      return result;
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [config.host, config.port]);

  const executeAction = useCallback(async (action) => {
    setLoading(true);
    try {
      const result = await fetchAPI(PRINTER_API, {
        method: 'POST',
        body: JSON.stringify({ action, config: config.host ? config : undefined }),
      });
      if (!result.success) throw new Error(result.error);
      await refresh();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [config, refresh]);

  useEffect(() => {
    if (config.autoConnect !== false) refresh();
  }, [config.autoConnect, refresh]);

  useEffect(() => {
    if (!config.pollInterval) return;
    const interval = setInterval(refresh, config.pollInterval);
    return () => clearInterval(interval);
  }, [config.pollInterval, refresh]);

  return {
    status, loading, error, isConnected, refresh,
    testConnection: () => executeAction('test'),
    calibrate: () => executeAction('calibrate'),
    resetPrinter: () => executeAction('reset'),
    cancelAllJobs: () => executeAction('cancel'),
  };
}

// ============================================
// useRFIDPreview - Preview ZPL
// ============================================

export function useRFIDPreview() {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPreview = useCallback(async (item, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ number: item.number });
      if (item.displayName) params.set('displayName', item.displayName);
      if (options.type) params.set('type', options.type);

      const result = await fetchAPI(`${PRINT_API}?${params}`);
      if (!result.success) throw new Error(result.error);
      setPreview(result.data);
      return result.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { preview, loading, error, getPreview, clearPreview: () => setPreview(null) };
}

// ============================================
// useRFID - Combined Hook (แนะนำ)
// ============================================

export function useRFID(config = {}) {
  const printHook = useRFIDPrint(config.printOptions);
  const printerHook = usePrinterStatus({
    ...config.printerConfig,
    autoConnect: config.autoConnect,
    pollInterval: config.pollInterval,
  });
  const previewHook = useRFIDPreview();

  return {
    // Print
    print: printHook.print,
    printBatch: printHook.printBatch,
    cancelPrint: printHook.cancel,
    printing: printHook.printing,
    printError: printHook.error,
    lastResult: printHook.lastResult,

    // Printer
    refreshPrinter: printerHook.refresh,
    testConnection: printerHook.testConnection,
    calibrate: printerHook.calibrate,
    resetPrinter: printerHook.resetPrinter,
    cancelAllJobs: printerHook.cancelAllJobs,
    printerStatus: printerHook.status,
    printerLoading: printerHook.loading,
    printerError: printerHook.error,
    isConnected: printerHook.isConnected,

    // Preview
    getPreview: previewHook.getPreview,
    previewData: previewHook.preview,
    previewLoading: previewHook.loading,
  };
}

// ============================================
// Export
// ============================================

export default { useRFIDPrint, usePrinterStatus, useRFIDPreview, useRFID };