"use client";

import React, { useState, useEffect } from "react";
import { useRFID } from "@/hooks/useRFID";
import { useRFIDSafe as useRFIDSafeFromContext } from "@/hooks/RFIDContext";

const LABEL_TYPES = [
  { value: "thai-qr", label: "ภาษาไทย + QR Code", hasRFID: false },
  { value: "thai", label: "ภาษาไทย + Barcode", hasRFID: false },
  { value: "thai-rfid", label: "ภาษาไทย + RFID", hasRFID: true },
];

function useRFIDSafe(config = {}) {
  try {
    return useRFIDSafeFromContext(config);
  } catch (e) {
    return useRFID({ autoConnect: true, pollInterval: 30000, ...config });
  }
}

export function PrinterStatusBadge({ className = "", showControls = false }) {
  const {
    isConnected,
    printerLoading,
    refreshPrinter,
    reconnect,
    fullReset,
    cancelAllJobs,
    lastCheckTime,
    printerError,
  } = useRFIDSafe();

  const [showDropdown, setShowDropdown] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const handleAction = async (action, fn) => {
    setActionLoading(action);
    try {
      await fn();
    } catch (e) {
      console.error(`${action} failed:`, e);
    } finally {
      setActionLoading(null);
      setShowDropdown(false);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isConnected
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        <span
          className={`w-2 h-2 mr-1.5 rounded-full ${
            isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
          }`}
        />
        {printerLoading
          ? "กำลังตรวจสอบ..."
          : isConnected
          ? "เชื่อมต่อแล้ว"
          : "ไม่ได้เชื่อมต่อ"}
      </span>

      <button
        type="button"
        onClick={refreshPrinter}
        disabled={printerLoading}
        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        title="รีเฟรช"
      >
        <svg
          className={`w-4 h-4 ${printerLoading ? "animate-spin" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      {showControls && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="เพิ่มเติม"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border z-20">
                <button
                  onClick={() => handleAction("reconnect", reconnect)}
                  disabled={!!actionLoading}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  {actionLoading === "reconnect"
                    ? "กำลัง Reconnect..."
                    : "🔄 Reconnect"}
                </button>
                <button
                  onClick={() => handleAction("cancel", cancelAllJobs)}
                  disabled={!!actionLoading}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  {actionLoading === "cancel"
                    ? "กำลังยกเลิก..."
                    : "⏹️ ยกเลิกงานพิมพ์"}
                </button>
                <button
                  onClick={() => handleAction("reset", fullReset)}
                  disabled={!!actionLoading}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {actionLoading === "reset"
                    ? "กำลัง Reset..."
                    : "🔃 Full Reset"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {printerError && (
        <span className="text-xs text-red-500" title={printerError}>
          ⚠️
        </span>
      )}
    </div>
  );
}

export function RFIDPrintButton({
  items = [],
  options = {},
  onSuccess,
  onError,
  disabled = false,
  children,
  className = "",
}) {
  const { printBatch, printing, isConnected, reconnect } = useRFIDSafe();

  const handleClick = async () => {
    if (!items.length) {
      onError?.("ไม่มีรายการที่จะพิมพ์");
      return;
    }

    if (!isConnected) {
      try {
        await reconnect();
      } catch (e) {
        onError?.("ไม่สามารถเชื่อมต่อ Printer ได้");
        return;
      }
    }

    try {
      const result = await printBatch(items, options);
      onSuccess?.(result);
    } catch (err) {
      onError?.(err.message);
    }
  };

  const isDisabled = disabled || printing || items.length === 0;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg transition-colors
        ${
          isConnected
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-yellow-500 text-white hover:bg-yellow-600"
        }
        disabled:bg-gray-300 disabled:cursor-not-allowed
        ${className}`}
      title={!isConnected ? "Printer ไม่ได้เชื่อมต่อ - คลิกเพื่อลองพิมพ์" : ""}
    >
      {printing ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          กำลังพิมพ์...
        </>
      ) : (
        <>
          {!isConnected && <span className="mr-1">⚠️</span>}
          {children || `พิมพ์ (${items.length})`}
        </>
      )}
    </button>
  );
}

export function RFIDPrintDialog({
  isOpen,
  onClose,
  items = [],
  onSuccess,
  onError,
}) {
  const {
    printBatch,
    printing,
    lastResult,
    isConnected,
    reconnect,
    fullReset,
    cancelAllJobs,
    printerError,
  } = useRFIDSafe();

  const [quantity, setQuantity] = useState(1);
  const [labelType, setLabelType] = useState("thai");
  const [showResult, setShowResult] = useState(false);
  const [localError, setLocalError] = useState(null);

  const selectedTypeConfig = LABEL_TYPES.find((t) => t.value === labelType);
  const enableRFID = selectedTypeConfig?.hasRFID || false;

  useEffect(() => {
    if (!isOpen) {
      setShowResult(false);
      setQuantity(1);
      setLabelType("thai");
      setLocalError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = async () => {
    setLocalError(null);

    if (!isConnected) {
      try {
        await reconnect();
      } catch (e) {
        setLocalError("ไม่สามารถเชื่อมต่อ Printer ได้");
        return;
      }
    }

    try {
      const result = await printBatch(items, {
        type: labelType,
        enableRFID,
        quantity,
      });
      setShowResult(true);
      onSuccess?.(result);
    } catch (err) {
      setLocalError(err.message);
      onError?.(err.message);
    }
  };

  const handleReconnect = async () => {
    setLocalError(null);
    try {
      await reconnect();
    } catch (e) {
      setLocalError("Reconnect ไม่สำเร็จ");
    }
  };

  const handleFullReset = async () => {
    setLocalError(null);
    try {
      await fullReset();
    } catch (e) {
      setLocalError("Reset ไม่สำเร็จ");
    }
  };

  const handleClose = () => {
    setShowResult(false);
    setLocalError(null);
    onClose();
  };

  const displayError = localError || printerError;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">พิมพ์ Label</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">สถานะ Printer:</span>
              <PrinterStatusBadge showControls={true} />
            </div>
          </div>

          {displayError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-red-500">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm text-red-700">{displayError}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleReconnect}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Reconnect
                    </button>
                    <button
                      onClick={handleFullReset}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Full Reset
                    </button>
                    <button
                      onClick={cancelAllJobs}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      ยกเลิกงาน
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isConnected && !displayError && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span className="text-sm text-yellow-700">
                  Printer ไม่ได้เชื่อมต่อ - จะลอง reconnect
                  อัตโนมัติเมื่อกดพิมพ์
                </span>
              </div>
            </div>
          )}

          {!showResult ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  รายการ ({items.length})
                </label>
                <div className="max-h-32 overflow-y-auto border rounded-lg">
                  {items.map((item, i) => (
                    <div
                      key={item.id || i}
                      className="px-3 py-2 border-b last:border-0"
                    >
                      <div className="font-medium text-sm">{item.number}</div>
                      <div className="text-xs text-gray-500">
                        {item.displayName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ประเภท Label
                  </label>
                  <select
                    value={labelType}
                    onChange={(e) => setLabelType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {LABEL_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    จำนวน/รายการ
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* แสดง RFID indicator เมื่อเลือก thai-rfid */}
              {enableRFID && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">📡</span>
                    <span className="text-sm text-blue-700">
                      RFID Mode: จะเขียน EPC ลงใน RFID Tag พร้อมกับพิมพ์ label
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handlePrint}
                  disabled={printing || items.length === 0}
                  className={`px-4 py-2 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed
                    ${
                      isConnected
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-yellow-500 hover:bg-yellow-600"
                    }`}
                >
                  {printing
                    ? "กำลังพิมพ์..."
                    : `พิมพ์ (${items.length * quantity} ใบ)`}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div
                className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  lastResult?.data?.summary?.failed === 0
                    ? "bg-green-100"
                    : "bg-yellow-100"
                }`}
              >
                <svg
                  className={`w-6 h-6 ${
                    lastResult?.data?.summary?.failed === 0
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h4 className="text-lg font-semibold mb-4">
                {lastResult?.data?.summary?.failed === 0
                  ? "พิมพ์สำเร็จ!"
                  : "พิมพ์บางส่วน"}
              </h4>

              {lastResult?.data?.summary && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold">
                      {lastResult.data.summary.total}
                    </div>
                    <div className="text-xs text-gray-500">ทั้งหมด</div>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {lastResult.data.summary.success}
                    </div>
                    <div className="text-xs text-gray-500">สำเร็จ</div>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {lastResult.data.summary.failed}
                    </div>
                    <div className="text-xs text-gray-500">ล้มเหลว</div>
                  </div>
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                ปิด
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PrinterSettings({ onConfigChange, className = "" }) {
  const [config, setConfig] = useState({
    host: "",
    port: "9100",
  });
  const [savedConfig, setSavedConfig] = useState(null);

  const {
    status,
    loading,
    error,
    isConnected,
    refresh,
    testConnection,
    calibrate,
    resetPrinter,
    cancelAllJobs,
    reconnect,
    fullReset,
  } = useRFIDSafe();

  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("rfidPrinterConfig");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
        setSavedConfig(parsed);
      } catch (e) {
        console.error("Failed to parse saved config:", e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("rfidPrinterConfig", JSON.stringify(config));
    setSavedConfig(config);
    onConfigChange?.(config);
  };

  const handleTest = async () => {
    setSavedConfig(config);
    await testConnection();
  };

  const handleAction = async (action, fn) => {
    setActionLoading(action);
    try {
      await fn();
    } catch (e) {
      console.error(`${action} failed:`, e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        ตั้งค่า RFID Printer
      </h3>

      <div className="mb-6 p-4 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            สถานะการเชื่อมต่อ
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isConnected
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <span
              className={`w-2 h-2 mr-1.5 rounded-full ${
                isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
              }`}
            />
            {loading
              ? "กำลังตรวจสอบ..."
              : isConnected
              ? "เชื่อมต่อแล้ว"
              : "ไม่ได้เชื่อมต่อ"}
          </span>
        </div>

        {status?.config && (
          <div className="text-sm text-gray-500">
            เชื่อมต่อที่: {status.config.host}:{status.config.port}
          </div>
        )}

        {error && (
          <div className="mt-2 text-sm text-red-600">ข้อผิดพลาด: {error}</div>
        )}
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            IP Address
          </label>
          <input
            type="text"
            value={config.host}
            onChange={(e) => setConfig({ ...config, host: e.target.value })}
            placeholder="192.168.1.100"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Port
          </label>
          <input
            type="text"
            value={config.port}
            onChange={(e) => setConfig({ ...config, port: e.target.value })}
            placeholder="9100"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={handleTest}
          disabled={loading || !config.host}
          className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-50"
        >
          {loading ? "กำลังทดสอบ..." : "ทดสอบการเชื่อมต่อ"}
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={!config.host}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          บันทึกการตั้งค่า
        </button>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Quick Actions
        </h4>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleAction("reconnect", reconnect)}
            disabled={!!actionLoading}
            className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-50"
          >
            {actionLoading === "reconnect" ? "กำลัง..." : "🔄 Reconnect"}
          </button>

          <button
            type="button"
            onClick={() => handleAction("fullReset", fullReset)}
            disabled={!!actionLoading}
            className="px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50"
          >
            {actionLoading === "fullReset" ? "กำลัง..." : "🔃 Full Reset"}
          </button>
        </div>

        {isConnected && (
          <>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              ควบคุม Printer
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleAction("calibrate", calibrate)}
                disabled={!!actionLoading}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                {actionLoading === "calibrate"
                  ? "กำลัง Calibrate..."
                  : "Calibrate"}
              </button>

              <button
                type="button"
                onClick={refresh}
                disabled={!!actionLoading}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                รีเฟรชสถานะ
              </button>

              <button
                type="button"
                onClick={() => handleAction("cancel", cancelAllJobs)}
                disabled={!!actionLoading}
                className="px-3 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 disabled:opacity-50"
              >
                {actionLoading === "cancel"
                  ? "กำลังยกเลิก..."
                  : "ยกเลิกงานพิมพ์"}
              </button>

              <button
                type="button"
                onClick={() => handleAction("reset", resetPrinter)}
                disabled={!!actionLoading}
                className="px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50"
              >
                {actionLoading === "reset" ? "กำลัง Reset..." : "Reset Printer"}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="text-sm font-medium text-blue-900 mb-2">คำแนะนำ</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• ตรวจสอบว่า Printer อยู่ใน network เดียวกับ Server</li>
          <li>• Port เริ่มต้นของ RFID Printer คือ 9100</li>
          <li>• หากเชื่อมต่อไม่ได้ ให้ตรวจสอบ Firewall</li>
          <li>• ใช้ Calibrate เมื่อเปลี่ยน label ใหม่</li>
          <li className="text-red-600">
            • หากพิมพ์ไม่ออก ให้กด "Full Reset" หรือปิด/เปิดเครื่องใหม่
          </li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h5 className="text-sm font-medium text-gray-900 mb-2">
          ประเภท Label ที่รองรับ
        </h5>
        <ul className="text-sm text-gray-700 space-y-1">
          {LABEL_TYPES.map((type) => (
            <li key={type.value} className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  type.hasRFID ? "bg-blue-500" : "bg-gray-400"
                }`}
              />
              <span>{type.label}</span>
              {type.hasRFID && (
                <span className="text-xs text-blue-600">(RFID)</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function EPCPreview({ epc, className = "" }) {
  if (!epc) return null;

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 mb-2">EPC Preview</h4>
      <div className="font-mono text-lg bg-gray-100 p-3 rounded break-all">
        {epc}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        96-bit EPC (24 hex characters)
      </div>
    </div>
  );
}

export { LABEL_TYPES };

export default {
  PrinterStatusBadge,
  RFIDPrintButton,
  RFIDPrintDialog,
  PrinterSettings,
  EPCPreview,
  LABEL_TYPES,
};