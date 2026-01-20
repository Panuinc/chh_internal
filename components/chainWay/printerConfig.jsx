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
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
        <RefreshCw size={14} className="text-amber-500 animate-spin" />
        <span className="text-sm text-amber-600">กำลังตรวจสอบ...</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
        connected
          ? "bg-emerald-50 border-emerald-200"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          connected ? "bg-emerald-500" : "bg-gray-400"
        }`}
      />
      <span
        className={`text-sm ${connected ? "text-emerald-700" : "text-gray-500"}`}
      >
        {connected ? "เชื่อมต่อแล้ว" : "ไม่ได้เชื่อมต่อ"}
      </span>
    </div>
  );
}

function AlertBox({ children, type = "error" }) {
  const styles = {
    error: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
    },
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
    },
  };

  const s = styles[type];

  return (
    <div
      className={`flex items-start gap-2 px-3 py-2 rounded-lg ${s.bg} border ${s.border}`}
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
    primary: "bg-gray-900 text-white",
    secondary: "bg-white text-gray-700 border border-gray-300",
    danger: "bg-white text-red-600 border border-red-300",
    ghost: "bg-transparent text-gray-600",
  };

  return (
    <Button
      size="sm"
      radius="md"
      isLoading={loading}
      spinner={<Spinner size="sm" color="current" />}
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
      className={`p-3 rounded-lg border ${
        active ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`w-2 h-2 rounded-full ${active ? "bg-emerald-500" : "bg-red-400"}`}
        />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p
        className={`text-sm font-medium ${active ? "text-emerald-700" : "text-red-600"}`}
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
        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-50"
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
              size="sm"
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
              size="sm"
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
              size="sm"
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
              size="sm"
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
          <Printer size={18} className="text-gray-500" />
          <span className="font-medium text-gray-800">Printer Controls</span>
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
            <Printer size={24} className="text-gray-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
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
        {/* Connection Status */}
        <div className="p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Wifi size={18} className="text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-800">
              สถานะการเชื่อมต่อ
            </h3>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${isConnected ? "bg-emerald-500" : "bg-gray-400"}`}
              />
              <div>
                <p className="font-medium text-gray-800">
                  {isConnected ? "เชื่อมต่อสำเร็จ" : "ไม่ได้เชื่อมต่อ"}
                </p>
                <p className="text-xs text-gray-500">
                  ตั้งค่า IP/Port ผ่านไฟล์ .env
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

        {/* Printer Controls */}
        <div className="p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-800">
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
              <Gauge size={20} className="text-blue-600" />
              <span className="text-xs">ปรับเทียบ</span>
            </Button>

            <Button
              variant="bordered"
              className="flex flex-col h-20 gap-1"
              isLoading={actionLoading === "cancel"}
              onPress={() => handleAction("cancel", cancelAllJobs)}
            >
              <StopCircle size={20} className="text-orange-600" />
              <span className="text-xs">ยกเลิกงาน</span>
            </Button>

            <Button
              variant="bordered"
              className="flex flex-col h-20 gap-1"
              isLoading={actionLoading === "reset"}
              onPress={() => handleAction("reset", resetPrinter)}
            >
              <RotateCcw size={20} className="text-gray-600" />
              <span className="text-xs">Soft Reset</span>
            </Button>

            <Button
              variant="bordered"
              className="flex flex-col h-20 gap-1 border-red-200"
              isLoading={actionLoading === "fullReset"}
              onPress={() => handleAction("fullReset", fullReset)}
            >
              <Zap size={20} className="text-red-600" />
              <span className="text-xs text-red-600">Full Reset</span>
            </Button>
          </div>
        </div>

        {/* Printer Status */}
        {printerStatus && (
          <div className="p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-800">
                  สถานะเครื่องพิมพ์
                </h3>
              </div>
              <Button
                size="sm"
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
