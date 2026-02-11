"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Tooltip } from "@heroui/tooltip";
import { Chip } from "@heroui/chip";
import {
  Printer,
  RefreshCw,
  AlertCircle,
  Gauge,
  StopCircle,
  RotateCcw,
  Zap,
  Wifi,
  Activity,
  Radio,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useRFIDSafe } from "@/hooks";

function StatusDot({ connected, loading }) {
  if (loading) {
    return (
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-warning" />
      </span>
    );
  }
  return (
    <span
      className={`inline-flex h-2.5 w-2.5 rounded-full ${
        connected ? "bg-success" : "bg-default-300"
      }`}
    />
  );
}

export function PrinterStatusBadge({ className = "" }) {
  const { isConnected, printerLoading, refreshPrinter } = useRFIDSafe();

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2 p-2 rounded-md bg-default-50 border border-default">
        <StatusDot connected={isConnected} loading={printerLoading} />
        <span className="text-xs text-default-600">
          {printerLoading
            ? "Checking..."
            : isConnected
              ? "Printer Online"
              : "Printer Offline"}
        </span>
      </div>
      <Button
        isIconOnly
        size="sm"
        variant="light"
        onPress={refreshPrinter}
        isDisabled={printerLoading}
        className="text-default-400 w-7 h-7 min-w-7"
      >
        <RefreshCw
          className={`w-3.5 h-3.5 ${printerLoading ? "animate-spin" : ""}`}
        />
      </Button>
    </div>
  );
}

export function PrinterControls({ compact = false, className = "" }) {
  const {
    isConnected,
    printerLoading,
    printerError,
    testConnection,
    calibrate,
    resetPrinter,
    fullReset,
    cancelAllJobs,
  } = useRFIDSafe();

  const [actionLoading, setActionLoading] = useState(null);

  const handleAction = useCallback(async (actionName, actionFn) => {
    setActionLoading(actionName);
    try {
      await actionFn();
    } finally {
      setActionLoading(null);
    }
  }, []);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <PrinterStatusBadge />
        <div className="flex gap-2">
          <Tooltip content="Test Connection">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              isLoading={actionLoading === "test"}
              onPress={() => handleAction("test", testConnection)}
              className="w-7 h-7 min-w-7"
            >
              <Wifi className="w-3.5 h-3.5" />
            </Button>
          </Tooltip>
          <Tooltip content="Calibrate">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              isLoading={actionLoading === "calibrate"}
              onPress={() => handleAction("calibrate", calibrate)}
              className="w-7 h-7 min-w-7"
            >
              <Gauge className="w-3.5 h-3.5" />
            </Button>
          </Tooltip>
          <Tooltip content="Cancel Jobs">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              isLoading={actionLoading === "cancel"}
              onPress={() => handleAction("cancel", cancelAllJobs)}
              className="w-7 h-7 min-w-7"
            >
              <StopCircle className="w-3.5 h-3.5" />
            </Button>
          </Tooltip>
          <Tooltip content="Reset">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              isLoading={actionLoading === "reset"}
              onPress={() => handleAction("reset", resetPrinter)}
              className="w-7 h-7 min-w-7"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </Tooltip>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Printer className="w-4 h-4 text-default-500" />
          <span className="text-[13px] font-semibold text-foreground">
            Printer Controls
          </span>
        </div>
        <PrinterStatusBadge />
      </div>

      {printerError && (
        <div className="flex items-start gap-2 p-2 rounded-md bg-danger-50 border border-danger-200">
          <AlertCircle className="w-4 h-4 text-danger shrink-0" />
          <span className="text-xs text-danger">{printerError}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          radius="sm"
          isLoading={actionLoading === "test"}
          startContent={
            !actionLoading && <Wifi className="w-3.5 h-3.5" />
          }
          onPress={() => handleAction("test", testConnection)}
          className="bg-foreground text-background text-xs font-medium"
        >
          Test
        </Button>
        <Button
          size="sm"
          radius="sm"
          variant="bordered"
          isLoading={actionLoading === "calibrate"}
          startContent={
            !actionLoading && <Gauge className="w-3.5 h-3.5" />
          }
          onPress={() => handleAction("calibrate", calibrate)}
          className="border-default text-default-700 text-xs"
        >
          Calibrate
        </Button>
        <Button
          size="sm"
          radius="sm"
          variant="bordered"
          isLoading={actionLoading === "cancel"}
          startContent={
            !actionLoading && <StopCircle className="w-3.5 h-3.5" />
          }
          onPress={() => handleAction("cancel", cancelAllJobs)}
          className="border-default text-default-700 text-xs"
        >
          Cancel Jobs
        </Button>
        <Button
          size="sm"
          radius="sm"
          variant="light"
          isLoading={actionLoading === "reset"}
          startContent={
            !actionLoading && <RotateCcw className="w-3.5 h-3.5" />
          }
          onPress={() => handleAction("reset", resetPrinter)}
          className="text-default-500 text-xs"
        >
          Reset
        </Button>
        <Button
          size="sm"
          radius="sm"
          variant="bordered"
          isLoading={actionLoading === "fullReset"}
          startContent={
            !actionLoading && <Zap className="w-3.5 h-3.5" />
          }
          onPress={() => handleAction("fullReset", fullReset)}
          className="border-danger-200 text-danger text-xs"
        >
          Full Reset
        </Button>
      </div>
    </div>
  );
}

export function PrinterSettings({
  className = "",
  showHeader = true,
  title = "Printer Control",
  subtitle = "ChainWay RFID Printer",
}) {
  const {
    isConnected,
    printerLoading,
    printerError,
    refreshPrinter,
    testConnection,
    calibrate,
    resetPrinter,
    fullReset,
    cancelAllJobs,
  } = useRFIDSafe();

  const [actionLoading, setActionLoading] = useState(null);

  const handleAction = useCallback(async (actionName, actionFn) => {
    setActionLoading(actionName);
    try {
      await actionFn();
    } finally {
      setActionLoading(null);
    }
  }, []);

  const rfidCalibrate = useCallback(async () => {
    try {
      const response = await fetch("/api/chainWay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "command",
          command: "^XA^HR^XZ",
        }),
      });
      const result = await response.json();
      if (result.success) {
        alert("RFID Calibration started. Please wait 1-5 minutes...");
      } else {
        alert(`RFID Calibration failed: ${result.error}`);
      }
      return result;
    } catch (error) {
      alert(`RFID Calibration error: ${error.message}`);
      throw error;
    }
  }, []);

  const testRFIDWrite = useCallback(async () => {
    try {
      const response = await fetch("/api/chainWay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "command",
          command:
            "^XA^RS8^RFW,H,,,A^FD112233445566778899AABBCC^FS^FO50,50^A0N,30,30^FDTEST RFID^FS^PQ1^XZ",
        }),
      });
      const result = await response.json();
      alert(
        result.success
          ? "Sent successfully! Check the printer"
          : `Error: ${result.error}`,
      );
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  }, []);

  const actions = [
    {
      key: "test",
      label: "Test Connection",
      description: "Verify printer is reachable",
      icon: Wifi,
      fn: testConnection,
      color: "text-primary",
    },
    {
      key: "rfidTest",
      label: "Test RFID Write",
      description: "Send a test RFID tag write",
      icon: Radio,
      fn: testRFIDWrite,
      color: "text-warning",
    },
    {
      key: "rfidCalibrate",
      label: "RFID Calibrate",
      description: "Calibrate RFID antenna (1-5 min)",
      icon: Activity,
      fn: rfidCalibrate,
      color: "text-warning",
    },
    {
      key: "calibrate",
      label: "Calibrate",
      description: "Calibrate label sensor",
      icon: Gauge,
      fn: calibrate,
      color: "text-primary",
    },
    {
      key: "cancel",
      label: "Cancel Jobs",
      description: "Cancel all pending print jobs",
      icon: StopCircle,
      fn: cancelAllJobs,
      color: "text-default-500",
    },
    {
      key: "reset",
      label: "Soft Reset",
      description: "Reset printer without clearing config",
      icon: RotateCcw,
      fn: resetPrinter,
      color: "text-default-500",
    },
    {
      key: "fullReset",
      label: "Full Reset",
      description: "Factory reset all printer settings",
      icon: Zap,
      fn: fullReset,
      color: "text-danger",
      danger: true,
    },
  ];

  return (
    <div className={`max-w-2xl p-2 ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-default-100 flex items-center justify-center">
              <Printer className="w-4.5 h-4.5 text-default-600" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-default-400">{subtitle}</p>
              )}
            </div>
          </div>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={refreshPrinter}
            isDisabled={printerLoading}
            className="text-default-400"
          >
            <RefreshCw
              className={`w-4 h-4 ${printerLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      )}

      {printerError && (
        <div className="flex items-start gap-2 p-2 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-danger shrink-0" />
          <span className="text-[13px] text-danger">{printerError}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="rounded-lg border border-default">
          <div className="flex items-center gap-2 p-2 border-b border-default">
            <Wifi className="w-4 h-4 text-default-500" />
            <span className="text-[13px] font-semibold text-foreground">
              Connection
            </span>
          </div>
          <div className="p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isConnected
                      ? "bg-success/10"
                      : "bg-default-100"
                  }`}
                >
                  {printerLoading ? (
                    <Spinner size="sm" color="warning" />
                  ) : isConnected ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-default-400" />
                  )}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-foreground">
                    {printerLoading
                      ? "Checking connection..."
                      : isConnected
                        ? "Connected"
                        : "Disconnected"}
                  </p>
                  <p className="text-xs text-default-400">
                    {isConnected
                      ? "Printer is ready to receive commands"
                      : "Unable to reach the printer"}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                radius="sm"
                isLoading={actionLoading === "test"}
                startContent={
                  !(actionLoading === "test") && (
                    <Wifi className="w-3.5 h-3.5" />
                  )
                }
                onPress={() => handleAction("test", testConnection)}
                className="bg-foreground text-background text-xs font-medium"
              >
                Test
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-default">
          <div className="flex items-center gap-2 p-2 border-b border-default">
            <Activity className="w-4 h-4 text-default-500" />
            <span className="text-[13px] font-semibold text-foreground">
              Actions
            </span>
          </div>
          <div className="divide-y divide-default-100">
            {actions.map((action) => {
              const Icon = action.icon;
              const isLoading = actionLoading === action.key;
              return (
                <div
                  key={action.key}
                  className="flex items-center justify-between p-2 hover:bg-default-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-default-50 border border-default flex items-center justify-center">
                      <Icon className={`w-4 h-4 ${action.color}`} />
                    </div>
                    <div>
                      <p
                        className={`text-[13px] font-medium ${action.danger ? "text-danger" : "text-foreground"}`}
                      >
                        {action.label}
                      </p>
                      <p className="text-xs text-default-400">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    radius="sm"
                    variant={action.danger ? "bordered" : "bordered"}
                    isLoading={isLoading}
                    onPress={() => handleAction(action.key, action.fn)}
                    className={
                      action.danger
                        ? "border-danger-200 text-danger text-xs min-w-16"
                        : "border-default text-default-700 text-xs min-w-16"
                    }
                  >
                    Run
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
