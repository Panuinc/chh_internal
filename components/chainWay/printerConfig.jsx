"use client";

import React, { useState, useCallback } from "react";
import { Button, Spinner, Tooltip } from "@heroui/react";
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
} from "lucide-react";
import { useRFIDSafe } from "@/hooks";

function StatusBadge({ connected, loading }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-xl bg-warning/10 border-2 border-warning/30">
        <RefreshCw className="text-warning animate-spin" />
        <span className="text-sm text-warning">กำลังตรวจสอบ...</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-xl border-2 ${
        connected
          ? "bg-success/10 border-success/30"
          : "bg-default border-default"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-xl ${
          connected ? "bg-success" : "bg-foreground/30"
        }`}
      />
      <span
        className={`text-sm ${connected ? "text-success" : "text-foreground/50"}`}
      >
        {connected ? "เชื่อมต่อแล้ว" : "ไม่ได้เชื่อมต่อ"}
      </span>
    </div>
  );
}

function AlertBox({ children, type = "error" }) {
  const styles = {
    error: {
      bg: "bg-danger/10",
      border: "border-danger/30",
      text: "text-danger",
    },
    warning: {
      bg: "bg-warning/10",
      border: "border-warning/30",
      text: "text-warning",
    },
    success: {
      bg: "bg-success/10",
      border: "border-success/30",
      text: "text-success",
    },
  };

  const s = styles[type];

  return (
    <div
      className={`flex items-start gap-2 p-2 rounded-xl ${s.bg} border-2 ${s.border}`}
    >
      <AlertCircle className={`${s.text} mt-0.5 flex-shrink-0`} />
      <span className={`text-sm ${s.text}`}>{children}</span>
    </div>
  );
}

function ActionBtn({
  children,
  icon: Icon,
  variant = "secondary",
  loading,
  ...props
}) {
  const variants = {
    primary: "bg-primary text-background",
    secondary: "bg-background text-foreground/70 border-2 border-default",
    danger: "bg-background text-danger border-2 border-danger/30",
    ghost: "bg-transparent text-foreground/60",
  };

  return (
    <Button
      size="md"
      isLoading={loading}
      spinner={<Spinner size="md" color="current" />}
      startContent={!loading && Icon && <Icon />}
      className={`${variants[variant]} text-sm h-9 p-2`}
      {...props}
    >
      {children}
    </Button>
  );
}

function StatusTile({ label, active }) {
  return (
    <div
      className={`p-2 rounded-xl border-2 ${
        active
          ? "bg-success/10 border-success/30"
          : "bg-danger/10 border-danger/30"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`w-2 h-2 rounded-xl ${active ? "bg-success" : "bg-danger/70"}`}
        />
        <span className="text-xs text-foreground/50">{label}</span>
      </div>
      <p
        className={`text-sm font-medium ${active ? "text-success" : "text-danger"}`}
      >
        {active ? "พร้อม" : "ไม่พร้อม"}
      </p>
    </div>
  );
}

export function PrinterStatusBadge({ className = "" }) {
  const { isConnected, printerLoading, refreshPrinter } = useRFIDSafe();

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <StatusBadge connected={isConnected} loading={printerLoading} />
      <button
        onClick={refreshPrinter}
        disabled={printerLoading}
        className="p-2 hover:bg-default text-foreground/40 disabled:opacity-50 rounded-xl"
      >
        <RefreshCw className={printerLoading ? "animate-spin" : ""} />
      </button>
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
        <StatusBadge connected={isConnected} loading={printerLoading} />
        <div className="flex gap-2">
          <Tooltip content="ทดสอบการเชื่อมต่อ">
            <Button
              isIconOnly
              size="md"
              variant="light"
              isLoading={actionLoading === "test"}
              onPress={() => handleAction("test", testConnection)}
            >
              <Wifi />
            </Button>
          </Tooltip>
          <Tooltip content="ปรับเทียบ">
            <Button
              isIconOnly
              size="md"
              variant="light"
              isLoading={actionLoading === "calibrate"}
              onPress={() => handleAction("calibrate", calibrate)}
            >
              <Gauge />
            </Button>
          </Tooltip>
          <Tooltip content="ยกเลิกงานพิมพ์">
            <Button
              isIconOnly
              size="md"
              variant="light"
              isLoading={actionLoading === "cancel"}
              onPress={() => handleAction("cancel", cancelAllJobs)}
            >
              <StopCircle />
            </Button>
          </Tooltip>
          <Tooltip content="รีเซ็ต">
            <Button
              isIconOnly
              size="md"
              variant="light"
              isLoading={actionLoading === "reset"}
              onPress={() => handleAction("reset", resetPrinter)}
            >
              <RotateCcw />
            </Button>
          </Tooltip>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Printer className="text-foreground/50" />
          <span className="font-medium text-foreground/80">
            Printer Controls
          </span>
        </div>
        <StatusBadge connected={isConnected} loading={printerLoading} />
      </div>

      {printerError && <AlertBox type="error">{printerError}</AlertBox>}

      <div className="flex flex-wrap gap-2">
        <ActionBtn
          variant="primary"
          icon={Wifi}
          loading={actionLoading === "test"}
          onPress={() => handleAction("test", testConnection)}
        >
          ทดสอบ
        </ActionBtn>
        <ActionBtn
          icon={Gauge}
          loading={actionLoading === "calibrate"}
          onPress={() => handleAction("calibrate", calibrate)}
        >
          ปรับเทียบ
        </ActionBtn>
        <ActionBtn
          icon={StopCircle}
          loading={actionLoading === "cancel"}
          onPress={() => handleAction("cancel", cancelAllJobs)}
        >
          ยกเลิกงาน
        </ActionBtn>
        <ActionBtn
          variant="ghost"
          icon={RotateCcw}
          loading={actionLoading === "reset"}
          onPress={() => handleAction("reset", resetPrinter)}
        >
          Soft Reset
        </ActionBtn>
        <ActionBtn
          variant="danger"
          icon={Zap}
          loading={actionLoading === "fullReset"}
          onPress={() => handleAction("fullReset", fullReset)}
        >
          Full Reset
        </ActionBtn>
      </div>
    </div>
  );
}

export function PrinterSettings({
  className = "",
  showHeader = true,
  title = "ควบคุมเครื่องพิมพ์",
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
          command: "^XA^HR^XZ", // RFID Tag Calibration command
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

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {showHeader && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <Printer className="text-foreground/60" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-sm text-foreground/50">{subtitle}</p>
              )}
            </div>
          </div>
          <StatusBadge connected={isConnected} loading={printerLoading} />
        </div>
      )}

      {printerError && (
        <div className="mb-4">
          <AlertBox type="error">{printerError}</AlertBox>
        </div>
      )}

      <div className="space-y-6">
        <div className="p-2 rounded-xl border-2 border-default">
          <div className="flex items-center gap-2 mb-4">
            <Wifi className="text-foreground/50" />
            <h3 className="text-sm font-semibold text-foreground/80">
              สถานะการเชื่อมต่อ
            </h3>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-default">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-xl ${isConnected ? "bg-success" : "bg-foreground/30"}`}
              />
              <div>
                <p className="font-medium text-foreground/80">
                  {isConnected ? "เชื่อมต่อสำเร็จ" : "ไม่ได้เชื่อมต่อ"}
                </p>
              </div>
            </div>
            <ActionBtn
              variant="primary"
              icon={Wifi}
              loading={actionLoading === "test"}
              onPress={() => handleAction("test", testConnection)}
            >
              ทดสอบ
            </ActionBtn>
          </div>
        </div>

        <div className="p-2 rounded-xl border-2 border-default">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-foreground/50" />
            <h3 className="text-sm font-semibold text-foreground/80">
              ควบคุมเครื่องพิมพ์
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              variant="bordered"
              className="flex flex-col h-20 gap-2 border-warning/30"
              onPress={async () => {
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
                      ? "ส่งสำเร็จ! ดูที่เครื่องพิมพ์"
                      : `Error: ${result.error}`,
                  );
                } catch (err) {
                  alert(`Error: ${err.message}`);
                }
              }}
            >
              <Activity className="text-warning" />
              <span className="text-xs">Test RFID</span>
            </Button>
            <Button
              variant="bordered"
              className="flex flex-col h-20 gap-2"
              isLoading={actionLoading === "rfidCalibrate"}
              onPress={() => handleAction("rfidCalibrate", rfidCalibrate)}
            >
              <Activity className="text-warning" />
              <span className="text-xs">RFID Calibrate</span>
            </Button>

            <Button
              variant="bordered"
              className="flex flex-col h-20 gap-2"
              isLoading={actionLoading === "calibrate"}
              onPress={() => handleAction("calibrate", calibrate)}
            >
              <Gauge className="text-primary" />
              <span className="text-xs">ปรับเทียบ</span>
            </Button>

            <Button
              variant="bordered"
              className="flex flex-col h-20 gap-2"
              isLoading={actionLoading === "cancel"}
              onPress={() => handleAction("cancel", cancelAllJobs)}
            >
              <StopCircle className="text-secondary" />
              <span className="text-xs">ยกเลิกงาน</span>
            </Button>

            <Button
              variant="bordered"
              className="flex flex-col h-20 gap-2"
              isLoading={actionLoading === "reset"}
              onPress={() => handleAction("reset", resetPrinter)}
            >
              <RotateCcw className="text-foreground/60" />
              <span className="text-xs">Soft Reset</span>
            </Button>

            <Button
              variant="bordered"
              className="flex flex-col h-20 gap-2 border-danger/30"
              isLoading={actionLoading === "fullReset"}
              onPress={() => handleAction("fullReset", fullReset)}
            >
              <Zap className="text-danger" />
              <span className="text-xs text-danger">Full Reset</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
