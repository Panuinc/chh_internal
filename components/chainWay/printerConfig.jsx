"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
  Chip,
  Tooltip,
} from "@heroui/react";
import {
  Printer,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Circle,
  FileText,
  Radio,
  Gauge,
  StopCircle,
  RotateCcw,
  Zap,
  Wifi,
  Activity,
} from "lucide-react";
import { useRFIDSafe } from "@/hooks";
import { PRINT_TYPES, PRINT_TYPE_OPTIONS } from "@/lib/chainWay/config";

function StatusBadge({ connected, loading }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-warning/10 border-2 border-warning/30">
        <RefreshCw size={14} className="text-warning animate-spin" />
        <span className="text-sm text-warning">กำลังตรวจสอบ...</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 ${
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
      className={`flex items-start gap-2 px-3 py-2 rounded-xl ${s.bg} border-2 ${s.border}`}
    >
      <AlertCircle size={16} className={`${s.text} mt-0.5 flex-shrink-0`} />
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
      startContent={!loading && Icon && <Icon size={15} />}
      className={`${variants[variant]} text-sm h-9 px-3`}
      {...props}
    >
      {children}
    </Button>
  );
}

function StatusTile({ label, active }) {
  return (
    <div
      className={`p-3 rounded-xl border-2 ${
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
        className="p-1.5 rounded hover:bg-default text-foreground/40 disabled:opacity-50"
      >
        <RefreshCw size={16} className={printerLoading ? "animate-spin" : ""} />
      </button>
    </div>
  );
}

export function PrinterControls({ compact = false, className = "" }) {
  const {
    isConnected,
    printerLoading,
    printerStatus,
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

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <StatusBadge connected={isConnected} loading={printerLoading} />
        <div className="flex gap-1">
          <Tooltip content="ทดสอบการเชื่อมต่อ">
            <Button
              isIconOnly
              size="md"
              variant="light"
              isLoading={actionLoading === "test"}
              onPress={() => handleAction("test", testConnection)}
            >
              <Wifi size={16} />
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
              <Gauge size={16} />
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
              <StopCircle size={16} />
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
              <RotateCcw size={16} />
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
          <Printer size={18} className="text-foreground/50" />
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

      {printerStatus && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          <StatusTile label="ออนไลน์" active={printerStatus.online} />
          {printerStatus.parsed && (
            <>
              <StatusTile
                label="พร้อมทำงาน"
                active={!printerStatus.parsed.isPaused}
              />
              <StatusTile
                label="กระดาษ"
                active={!printerStatus.parsed.paperOut}
              />
              <StatusTile
                label="ริบบอน"
                active={!printerStatus.parsed.ribbonOut}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function PrinterSettings({
  onClose,
  compact = false,
  className = "",
  showHeader = true,
  title = "ควบคุมเครื่องพิมพ์",
  subtitle = "ChainWay RFID Printer",
}) {
  const {
    isConnected,
    printerLoading,
    printerStatus,
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

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {showHeader && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Printer size={24} className="text-foreground/60" />
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
        <div className="p-4 rounded-xl border-2 border-default">
          <div className="flex items-center gap-2 mb-4">
            <Wifi size={18} className="text-foreground/50" />
            <h3 className="text-sm font-semibold text-foreground/80">
              สถานะการเชื่อมต่อ
            </h3>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-default">
            <div className="flex items-center gap-3">
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

        <div className="p-4 rounded-xl border-2 border-default">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-foreground/50" />
            <h3 className="text-sm font-semibold text-foreground/80">
              ควบคุมเครื่องพิมพ์
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              variant="bordered"
              className="flex flex-col h-20 gap-1"
              isLoading={actionLoading === "calibrate"}
              onPress={() => handleAction("calibrate", calibrate)}
            >
              <Gauge size={20} className="text-primary" />
              <span className="text-xs">ปรับเทียบ</span>
            </Button>

            <Button
              variant="bordered"
              className="flex flex-col h-20 gap-1"
              isLoading={actionLoading === "cancel"}
              onPress={() => handleAction("cancel", cancelAllJobs)}
            >
              <StopCircle size={20} className="text-secondary" />
              <span className="text-xs">ยกเลิกงาน</span>
            </Button>

            <Button
              variant="bordered"
              className="flex flex-col h-20 gap-1"
              isLoading={actionLoading === "reset"}
              onPress={() => handleAction("reset", resetPrinter)}
            >
              <RotateCcw size={20} className="text-foreground/60" />
              <span className="text-xs">Soft Reset</span>
            </Button>

            <Button
              variant="bordered"
              className="flex flex-col h-20 gap-1 border-danger/30"
              isLoading={actionLoading === "fullReset"}
              onPress={() => handleAction("fullReset", fullReset)}
            >
              <Zap size={20} className="text-danger" />
              <span className="text-xs text-danger">Full Reset</span>
            </Button>
          </div>
        </div>

        {printerStatus && (
          <div className="p-4 rounded-xl border-2 border-default">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-foreground/50" />
                <h3 className="text-sm font-semibold text-foreground/80">
                  สถานะเครื่องพิมพ์
                </h3>
              </div>
              <Button
                size="md"
                variant="light"
                isLoading={printerLoading}
                onPress={refreshPrinter}
                startContent={!printerLoading && <RefreshCw size={14} />}
              >
                รีเฟรช
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatusTile label="ออนไลน์" active={printerStatus.online} />
              {printerStatus.parsed && (
                <>
                  <StatusTile
                    label="พร้อมทำงาน"
                    active={!printerStatus.parsed.isPaused}
                  />
                  <StatusTile
                    label="กระดาษ"
                    active={!printerStatus.parsed.paperOut}
                  />
                  <StatusTile
                    label="ริบบอน"
                    active={!printerStatus.parsed.ribbonOut}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { PRINT_TYPES, PRINT_TYPE_OPTIONS };
