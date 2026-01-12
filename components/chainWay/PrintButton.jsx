"use client";

import React, { useState, useEffect } from "react";
import { useRFIDSafe } from "@/hooks";
import { PRINT_TYPES, PRINT_TYPE_OPTIONS } from "@/lib/chainWay/config";

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
          isConnected
            ? "bg-success/20 text-success"
            : "bg-danger/20 text-danger"
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
                  disabled={actionLoading === "reconnect"}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-default disabled:opacity-50"
                >
                  🔄 Reconnect
                </button>
                <button
                  onClick={() => handleAction("cancel", cancelAllJobs)}
                  disabled={actionLoading === "cancel"}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-default disabled:opacity-50"
                >
                  ⏹️ Cancel Jobs
                </button>
                <button
                  onClick={() => handleAction("reset", fullReset)}
                  disabled={actionLoading === "reset"}
                  className="w-full px-3 py-2 text-left text-sm text-danger hover:bg-danger/10 disabled:opacity-50"
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

export function PrintButton({
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

  const selectedTypeConfig = PRINT_TYPES[labelType];
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

    try {
      if (!isConnected) {
        await reconnect();
      }

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-xl shadow-xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Print Label</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-default rounded-lg"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {(localError || printerError) && (
          <div className="mb-4 p-3 bg-danger/10 text-danger rounded-lg">
            <p className="text-sm">⚠️ {localError || printerError}</p>
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
            <div className="mb-4 p-3 bg-default/50 rounded-lg">
              <p className="text-sm font-medium">
                Items to print: {items.length}
              </p>
              {items.length <= 5 && (
                <ul className="mt-2 text-xs text-foreground/60">
                  {items.map((item, idx) => (
                    <li key={idx}>• {item.displayName || item.number}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Label Type
                </label>
                <select
                  value={labelType}
                  onChange={(e) => setLabelType(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {PRINT_TYPE_OPTIONS.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Quantity (each)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            {enableRFID && (
              <div className="mb-4 p-3 bg-primary/10 text-primary rounded-lg text-sm">
                📡 RFID Mode Enabled - Tags will be encoded
              </div>
            )}

            <div className="mb-4 text-center text-sm text-foreground/60">
              Total labels: {items.length * quantity}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-default rounded-lg hover:bg-default/80"
              >
                Cancel
              </button>
              <button
                onClick={handlePrint}
                disabled={printing || !items.length}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {printing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Printing...
                  </span>
                ) : (
                  `Print ${items.length * quantity} Labels`
                )}
              </button>
            </div>
          </>
        ) : (
          /* Result Display */
          <div className="text-center">
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl ${
                lastResult?.data?.summary?.failed === 0
                  ? "bg-success/20"
                  : "bg-warning/20"
              }`}
            >
              {lastResult?.data?.summary?.failed === 0 ? "✓" : "⚠️"}
            </div>

            <h4 className="text-lg font-semibold mb-2">
              {lastResult?.data?.summary?.failed === 0
                ? "Print Complete!"
                : "Print Completed with Errors"}
            </h4>

            {lastResult?.data?.summary && (
              <div className="mb-4 text-sm">
                <p className="text-success">
                  Success: {lastResult.data.summary.success}
                </p>
                {lastResult.data.summary.failed > 0 && (
                  <p className="text-danger">
                    Failed: {lastResult.data.summary.failed}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function EPCPreview({ epc, parsed }) {
  if (!epc) return null;

  return (
    <div className="bg-background border rounded-xl p-4">
      <h4 className="text-sm font-medium mb-2">EPC Preview</h4>
      <div className="font-mono text-lg bg-default p-3 rounded break-all">
        {epc}
      </div>
      <div className="mt-2 text-xs text-foreground/60 space-y-1">
        <p>Length: 96-bit ({epc.length} hex characters)</p>
        {parsed && (
          <>
            <p>Type: {parsed.type}</p>
            <p>URI: {parsed.uri}</p>
          </>
        )}
      </div>
    </div>
  );
}

export { PRINT_TYPES, PRINT_TYPE_OPTIONS };

export default {
  PrinterStatusBadge,
  PrintButton,
  RFIDPrintDialog,
  EPCPreview,
};
