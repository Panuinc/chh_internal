"use client";

import React, { useState, useEffect } from "react";
import { useRFID } from "@/hooks/useRFID";
import { useRFIDSafe as useRFIDSafeFromContext } from "@/hooks/RFIDContext";

const LABEL_TYPES = [
  { value: "thai-qr", label: "Thai + QR Code", hasRFID: false },
  { value: "thai", label: "Thai + Barcode", hasRFID: false },
  { value: "thai-rfid", label: "Thai + RFID", hasRFID: true },
];

function useRFIDSafe(config = {}) {
  try {
    return useRFIDSafeFromContext(config);
  } catch {
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
    printerError,
  } = useRFIDSafe();

  const [showDropdown, setShowDropdown] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const handleAction = async (action, fn) => {
    setActionLoading(action);
    try {
      await fn();
    } finally {
      setActionLoading(null);
      setShowDropdown(false);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isConnected ? "bg-success text-success" : "bg-default text-danger"
        }`}
      >
        <span
          className={`w-2 h-2 mr-1.5 rounded-full ${
            isConnected ? "bg-success animate-pulse" : "bg-danger"
          }`}
        />
        {printerLoading
          ? "Checking..."
          : isConnected
          ? "Connected"
          : "Disconnected"}
      </span>

      <button
        type="button"
        onClick={refreshPrinter}
        disabled={printerLoading}
        className="p-1 text-foreground/50 hover:text-foreground disabled:opacity-50"
        title="Refresh"
      >
        🔄
      </button>

      {showControls && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 text-foreground/50 hover:text-foreground"
            title="More actions"
          >
            ⋮
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-1 w-40 bg-background rounded-lg shadow-lg border z-20">
                <button
                  onClick={() => handleAction("reconnect", reconnect)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-default"
                >
                  🔄 Reconnect
                </button>
                <button
                  onClick={() => handleAction("cancel", cancelAllJobs)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-default"
                >
                  ⏹️ Cancel Jobs
                </button>
                <button
                  onClick={() => handleAction("reset", fullReset)}
                  className="w-full px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
                >
                  🔃 Full Reset
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {printerError && (
        <span className="text-xs text-danger" title={printerError}>
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
      onError?.("No items to print");
      return;
    }

    if (!isConnected) {
      try {
        await reconnect();
      } catch {
        onError?.("Unable to connect to printer");
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

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || printing || !items.length}
      className={`inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg
        ${
          isConnected
            ? "bg-primary text-white hover:bg-primary/90"
            : "bg-warning text-white hover:bg-warning/90"
        }
        disabled:bg-default disabled:cursor-not-allowed ${className}`}
    >
      {printing ? "Printing..." : children || `Print (${items.length})`}
    </button>
  );
}

export function RFIDPrintDialog({ isOpen, onClose, items = [], onSuccess }) {
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
      setQuantity(1);
      setLabelType("thai");
      setShowResult(false);
      setLocalError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = async () => {
    setLocalError(null);
    if (!isConnected) await reconnect();
    const result = await printBatch(items, {
      type: labelType,
      enableRFID,
      quantity,
    });
    setShowResult(true);
    onSuccess?.(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-xl shadow-xl max-w-lg w-full p-6">
        <h3 className="text-lg font-semibold mb-4">Print Label</h3>

        {(localError || printerError) && (
          <div className="mb-4 p-3 bg-danger/10 text-danger rounded-lg">
            ⚠️ {localError || printerError}
            <div className="flex gap-2 mt-2">
              <button
                onClick={reconnect}
                className="px-2 py-1 text-xs bg-warning text-white rounded"
              >
                Reconnect
              </button>
              <button
                onClick={fullReset}
                className="px-2 py-1 text-xs bg-danger text-white rounded"
              >
                Full Reset
              </button>
              <button
                onClick={cancelAllJobs}
                className="px-2 py-1 text-xs bg-default rounded"
              >
                Cancel Jobs
              </button>
            </div>
          </div>
        )}

        {!showResult ? (
          <>
            <div className="mb-4">
              <label className="text-sm font-medium">
                Items ({items.length})
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <select
                value={labelType}
                onChange={(e) => setLabelType(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                {LABEL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="border rounded-lg px-3 py-2"
              />
            </div>

            {enableRFID && (
              <div className="mb-4 p-3 bg-primary/10 text-primary rounded-lg">
                📡 RFID Mode Enabled
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-default rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handlePrint}
                disabled={printing}
                className="px-4 py-2 bg-primary text-white rounded-lg"
              >
                {printing ? "Printing..." : "Print"}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div
              className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                lastResult?.data?.summary?.failed === 0
                  ? "bg-success"
                  : "bg-warning"
              }`}
            >
              ✓
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function EPCPreview({ epc }) {
  if (!epc) return null;

  return (
    <div className="bg-background border rounded-xl p-4">
      <h4 className="text-sm font-medium mb-2">EPC Preview</h4>
      <div className="font-mono text-lg bg-default p-3 rounded break-all">
        {epc}
      </div>
      <div className="text-xs text-foreground/60 mt-1">
        96-bit EPC (24 hex characters)
      </div>
    </div>
  );
}

export { LABEL_TYPES };
