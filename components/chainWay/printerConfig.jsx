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
} from "@heroui/react";
import {
  Printer,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Circle,
  FileText,
  Radio,
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
    <Button
      size="lg"
      radius="md"
      onPress={handleClick}
      isDisabled={disabled || printing || !items.length}
      isLoading={printing}
      spinner={<Spinner size="sm" color="white" />}
      startContent={!printing && <Printer size={20} />}
      className={`bg-gray-900 text-white font-medium ${className}`}
    >
      {printing ? "กำลังพิมพ์..." : children || `พิมพ์ ${items.length} รายการ`}
    </Button>
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
  const [progress, setProgress] = useState(0);

  const selectedTypeConfig = PRINT_TYPES[labelType];
  const enableRFID = selectedTypeConfig?.hasRFID || false;
  const totalLabels = items.length * quantity;

  useEffect(() => {
    if (!isOpen) {
      setQuantity(1);
      setLabelType("thai");
      setShowResult(false);
      setLocalError(null);
      setProgress(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (printing) {
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 12, 90));
      }, 150);
      return () => clearInterval(interval);
    } else if (showResult) {
      setProgress(100);
    }
  }, [printing, showResult]);

  const handlePrint = async () => {
    setLocalError(null);
    setProgress(0);
    try {
      if (!isConnected) await reconnect();
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      radius="lg"
      backdrop="blur"
      classNames={{
        base: "bg-white",
        header: "border-b border-gray-200 py-4",
        body: "py-4",
        footer: "border-t border-gray-200 py-4",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          <Printer size={20} className="text-gray-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">พิมพ์ฉลาก</h3>
            <p className="text-xs text-gray-400 font-normal">
              RFID Label Printer
            </p>
          </div>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {(localError || printerError) && (
            <div className="space-y-2">
              <AlertBox type="error">{localError || printerError}</AlertBox>
              <div className="flex gap-2">
                <ActionBtn icon={RefreshCw} onPress={reconnect}>
                  เชื่อมต่อใหม่
                </ActionBtn>
                <ActionBtn icon={RefreshCw} onPress={fullReset}>
                  รีเซ็ต
                </ActionBtn>
                <ActionBtn icon={AlertCircle} onPress={cancelAllJobs}>
                  ยกเลิก
                </ActionBtn>
              </div>
            </div>
          )}

          {!showResult ? (
            <>
              <div className="p-3 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      รายการที่จะพิมพ์
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {items.length}
                  </span>
                </div>
                {items.length <= 5 && (
                  <div className="space-y-1 ml-6">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-gray-500"
                      >
                        <Circle
                          size={4}
                          className="fill-gray-300 text-gray-300"
                        />
                        {item.displayName || item.number}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-600">
                    ประเภทฉลาก
                  </label>
                  <select
                    value={labelType}
                    onChange={(e) => setLabelType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {PRINT_TYPE_OPTIONS.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-600">
                    จำนวน
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    min={1}
                    max={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {enableRFID && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <Radio size={18} className="text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-700">
                      RFID Encoding
                    </p>
                    <p className="text-xs text-blue-500">
                      เขียนข้อมูลลงแท็กอัตโนมัติ
                    </p>
                  </div>
                </div>
              )}

              <div className="text-center py-3">
                <p className="text-xs text-gray-400 mb-1">จำนวนฉลากทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalLabels}
                </p>
              </div>

              {printing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">กำลังพิมพ์...</span>
                    <span className="text-gray-700">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress value={progress} size="sm" radius="full" />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center py-6">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  lastResult?.data?.summary?.failed === 0
                    ? "bg-emerald-100"
                    : "bg-amber-100"
                }`}
              >
                {lastResult?.data?.summary?.failed === 0 ? (
                  <CheckCircle size={32} className="text-emerald-600" />
                ) : (
                  <AlertCircle size={32} className="text-amber-600" />
                )}
              </div>

              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                {lastResult?.data?.summary?.failed === 0
                  ? "พิมพ์สำเร็จ!"
                  : "เสร็จสิ้น (มีข้อผิดพลาด)"}
              </h4>

              {lastResult?.data?.summary && (
                <div className="flex gap-6 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">
                      {lastResult.data.summary.success}
                    </p>
                    <p className="text-xs text-gray-500">สำเร็จ</p>
                  </div>
                  {lastResult.data.summary.failed > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {lastResult.data.summary.failed}
                      </p>
                      <p className="text-xs text-gray-500">ล้มเหลว</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter className="gap-2">
          {!showResult ? (
            <>
              <Button
                variant="light"
                radius="md"
                onPress={onClose}
                className="text-gray-600"
              >
                ยกเลิก
              </Button>
              <Button
                radius="md"
                onPress={handlePrint}
                isDisabled={printing || !items.length}
                isLoading={printing}
                spinner={<Spinner size="sm" color="white" />}
                startContent={!printing && <Printer size={18} />}
                className="bg-gray-900 text-white font-medium"
              >
                {printing ? "กำลังพิมพ์..." : `พิมพ์ ${totalLabels} ฉลาก`}
              </Button>
            </>
          ) : (
            <Button
              radius="md"
              onPress={onClose}
              fullWidth
              className="bg-gray-900 text-white font-medium"
            >
              เสร็จสิ้น
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export { PRINT_TYPES, PRINT_TYPE_OPTIONS };
