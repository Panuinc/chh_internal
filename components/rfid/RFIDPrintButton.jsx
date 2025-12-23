/**
 * RFID Print Components
 * Components สำหรับ UI การพิมพ์ RFID
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRFID, usePrinterStatus } from "@/hooks/useRFID";

/**
 * Badge แสดงสถานะ Printer
 */
export function PrinterStatusBadge({ className = "" }) {
  const { isConnected, printerLoading, refreshPrinter } = useRFID({
    autoConnect: true,
    pollInterval: 30000,
  });

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
    </div>
  );
}

/**
 * ปุ่มพิมพ์ RFID
 */
export function RFIDPrintButton({
  items = [],
  options = {},
  onSuccess,
  onError,
  disabled = false,
  children,
  className = "",
}) {
  const { printBatch, printing, isConnected } = useRFID({ autoConnect: true });

  const handleClick = async () => {
    if (!items.length) {
      onError?.("ไม่มีรายการที่จะพิมพ์");
      return;
    }

    try {
      const result = await printBatch(items, options);
      onSuccess?.(result);
    } catch (err) {
      onError?.(err.message);
    }
  };

  const isDisabled = disabled || printing || !isConnected || items.length === 0;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg transition-colors
        bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed
        ${className}`}
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
        children || `พิมพ์ (${items.length})`
      )}
    </button>
  );
}

/**
 * Dialog สำหรับพิมพ์ RFID
 */
export function RFIDPrintDialog({
  isOpen,
  onClose,
  items = [],
  onSuccess,
  onError,
}) {
  const { printBatch, printing, lastResult, isConnected } = useRFID({
    autoConnect: true,
  });

  const [quantity, setQuantity] = useState(1);
  const [labelType, setLabelType] = useState("barcode");
  const [enableRFID, setEnableRFID] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // รีเซ็ตเมื่อเปิด/ปิด
  useEffect(() => {
    if (!isOpen) {
      setShowResult(false);
      setQuantity(1);
      setLabelType("barcode");
      setEnableRFID(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = async () => {
    try {
      const result = await printBatch(items, {
        type: labelType,
        enableRFID,
        quantity,
      });
      setShowResult(true);
      onSuccess?.(result);
    } catch (err) {
      onError?.(err.message);
    }
  };

  const handleClose = () => {
    setShowResult(false);
    onClose();
  };

  const labelTypes = [
    { value: "barcode", label: "Barcode" },
    { value: "qr", label: "QR Code" },
    { value: "thai", label: "ภาษาไทย + Barcode" },
    { value: "thai-qr", label: "ภาษาไทย + QR Code" },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">พิมพ์ Label</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Printer Status */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">สถานะ Printer:</span>
              <PrinterStatusBadge />
            </div>
          </div>

          {!showResult ? (
            <>
              {/* Items List */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  รายการ ({items.length})
                </label>
                <div className="max-h-32 overflow-y-auto border rounded-lg">
                  {items.map((item, i) => (
                    <div key={item.id || i} className="px-3 py-2 border-b last:border-0">
                      <div className="font-medium text-sm">{item.number}</div>
                      <div className="text-xs text-gray-500">{item.displayName}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ประเภท Label</label>
                  <select
                    value={labelType}
                    onChange={(e) => setLabelType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {labelTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">จำนวน/รายการ</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* RFID Option */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableRFID}
                    onChange={(e) => setEnableRFID(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">เปิดใช้งาน RFID Tag</span>
                </label>
                {enableRFID && (
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    จะเขียน EPC ลงใน RFID Tag พร้อมกับพิมพ์ label
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handlePrint}
                  disabled={!isConnected || printing || items.length === 0}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {printing ? "กำลังพิมพ์..." : `พิมพ์ (${items.length * quantity} ใบ)`}
                </button>
              </div>
            </>
          ) : (
            /* Result View */
            <div className="text-center">
              <div
                className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  lastResult?.data?.summary?.failed === 0 ? "bg-green-100" : "bg-yellow-100"
                }`}
              >
                <svg
                  className={`w-6 h-6 ${
                    lastResult?.data?.summary?.failed === 0 ? "text-green-600" : "text-yellow-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h4 className="text-lg font-semibold mb-4">
                {lastResult?.data?.summary?.failed === 0 ? "พิมพ์สำเร็จ!" : "พิมพ์บางส่วน"}
              </h4>

              {lastResult?.data?.summary && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold">{lastResult.data.summary.total}</div>
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

/**
 * หน้าตั้งค่า Printer
 */
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
  } = usePrinterStatus({
    ...savedConfig,
    autoConnect: !!savedConfig,
  });

  const [actionLoading, setActionLoading] = useState(null);

  // โหลด config จาก localStorage
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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">ตั้งค่า RFID Printer</h3>

      {/* Status */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">สถานะการเชื่อมต่อ</span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            <span
              className={`w-2 h-2 mr-1.5 rounded-full ${
                isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
              }`}
            />
            {loading ? "กำลังตรวจสอบ..." : isConnected ? "เชื่อมต่อแล้ว" : "ไม่ได้เชื่อมต่อ"}
          </span>
        </div>

        {status?.config && (
          <div className="text-sm text-gray-500">
            เชื่อมต่อที่: {status.config.host}:{status.config.port}
          </div>
        )}

        {error && <div className="mt-2 text-sm text-red-600">ข้อผิดพลาด: {error}</div>}
      </div>

      {/* Config Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
          <input
            type="text"
            value={config.host}
            onChange={(e) => setConfig({ ...config, host: e.target.value })}
            placeholder="192.168.1.100"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
          <input
            type="text"
            value={config.port}
            onChange={(e) => setConfig({ ...config, port: e.target.value })}
            placeholder="9100"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Actions */}
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

      {/* Printer Controls */}
      {isConnected && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">ควบคุม Printer</h4>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleAction("calibrate", calibrate)}
              disabled={!!actionLoading}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              {actionLoading === "calibrate" ? "กำลัง Calibrate..." : "Calibrate"}
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
              {actionLoading === "cancel" ? "กำลังยกเลิก..." : "ยกเลิกงานพิมพ์"}
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
        </div>
      )}

      {/* Help */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="text-sm font-medium text-blue-900 mb-2">คำแนะนำ</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• ตรวจสอบว่า Printer อยู่ใน network เดียวกับ Server</li>
          <li>• Port เริ่มต้นของ RFID Printer คือ 9100</li>
          <li>• หากเชื่อมต่อไม่ได้ ให้ตรวจสอบ Firewall</li>
          <li>• ใช้ Calibrate เมื่อเปลี่ยน label ใหม่</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Preview EPC
 */
export function EPCPreview({ epc, className = "" }) {
  if (!epc) return null;

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 mb-2">EPC Preview</h4>
      <div className="font-mono text-lg bg-gray-100 p-3 rounded break-all">{epc}</div>
      <div className="mt-2 text-xs text-gray-500">96-bit EPC (24 hex characters)</div>
    </div>
  );
}

export default {
  PrinterStatusBadge,
  RFIDPrintButton,
  RFIDPrintDialog,
  PrinterSettings,
  EPCPreview,
};
