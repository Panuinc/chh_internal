/**
 * RFID Print Components
 * Components สำหรับ RFID printing UI
 */

"use client";

import React, { useState } from "react";
import { useRFID } from "@/hooks/useRFID";

// ============================================
// Print Button
// ============================================

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
      onError?.("No items to print");
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
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          กำลังพิมพ์...
        </>
      ) : (
        children || `พิมพ์ (${items.length})`
      )}
    </button>
  );
}

// ============================================
// Printer Status Badge
// ============================================

export function PrinterStatusBadge({ className = "" }) {
  const { isConnected, printerLoading, refreshPrinter } = useRFID({
    autoConnect: true,
    pollInterval: 30000,
  });

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
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
        {printerLoading ? "ตรวจสอบ..." : isConnected ? "เชื่อมต่อแล้ว" : "ไม่ได้เชื่อมต่อ"}
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

// ============================================
// Print Dialog
// ============================================

export function RFIDPrintDialog({ isOpen, onClose, items = [], onSuccess, onError }) {
  const { printBatch, printing, lastResult, isConnected, printerStatus } = useRFID({ autoConnect: true });
  const [quantity, setQuantity] = useState(1);
  const [labelType, setLabelType] = useState("barcode");
  const [enableRFID, setEnableRFID] = useState(false);
  const [showResult, setShowResult] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">พิมพ์ Label</h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-500">
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
              {/* Items */}
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
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="barcode">Barcode</option>
                    <option value="qr">QR Code</option>
                    <option value="thai">Thai Label</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">จำนวน</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableRFID}
                    onChange={(e) => setEnableRFID(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">เปิดใช้ RFID</span>
                </label>
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
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {printing ? "กำลังพิมพ์..." : `พิมพ์ (${items.length * quantity} ใบ)`}
                </button>
              </div>
            </>
          ) : (
            /* Result */
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
                    <div className="text-2xl font-bold text-green-600">{lastResult.data.summary.success}</div>
                    <div className="text-xs text-gray-500">สำเร็จ</div>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{lastResult.data.summary.failed}</div>
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

// ============================================
// Printer Settings
// ============================================

export function PrinterSettings({ className = "" }) {
  const [config, setConfig] = useState({ host: "", port: "9100" });
  const {
    isConnected,
    printerLoading,
    printerStatus,
    printerError,
    testConnection,
    calibrate,
    resetPrinter,
    cancelAllJobs,
  } = useRFID({ autoConnect: false });

  const [actionLoading, setActionLoading] = useState(null);

  const handleAction = async (action, fn) => {
    setActionLoading(action);
    try {
      await fn();
    } finally {
      setActionLoading(null);
    }
  };

  const handleSave = () => {
    localStorage.setItem("rfidPrinterConfig", JSON.stringify(config));
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">ตั้งค่า RFID Printer</h3>

      {/* Status */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">สถานะ</span>
          <PrinterStatusBadge />
        </div>
        {printerError && <div className="mt-2 text-sm text-red-600">{printerError}</div>}
      </div>

      {/* Config */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">IP Address</label>
          <input
            type="text"
            value={config.host}
            onChange={(e) => setConfig({ ...config, host: e.target.value })}
            placeholder="192.168.1.100"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Port</label>
          <input
            type="text"
            value={config.port}
            onChange={(e) => setConfig({ ...config, port: e.target.value })}
            placeholder="9100"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={testConnection}
          disabled={printerLoading || !config.host}
          className="px-4 py-2 text-sm text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-50"
        >
          {printerLoading ? "ทดสอบ..." : "ทดสอบการเชื่อมต่อ"}
        </button>
        <button
          onClick={handleSave}
          disabled={!config.host}
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          บันทึก
        </button>
      </div>

      {/* Printer Controls */}
      {isConnected && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">ควบคุม Printer</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAction("calibrate", calibrate)}
              disabled={!!actionLoading}
              className="px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              {actionLoading === "calibrate" ? "..." : "Calibrate"}
            </button>
            <button
              onClick={() => handleAction("cancel", cancelAllJobs)}
              disabled={!!actionLoading}
              className="px-3 py-2 text-sm text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 disabled:opacity-50"
            >
              {actionLoading === "cancel" ? "..." : "ยกเลิกงาน"}
            </button>
            <button
              onClick={() => handleAction("reset", resetPrinter)}
              disabled={!!actionLoading}
              className="px-3 py-2 text-sm text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50"
            >
              {actionLoading === "reset" ? "..." : "Reset"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Export
// ============================================

export default {
  RFIDPrintButton,
  PrinterStatusBadge,
  RFIDPrintDialog,
  PrinterSettings,
};