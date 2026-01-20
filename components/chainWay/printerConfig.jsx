"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Switch,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Accordion,
  AccordionItem,
  Progress,
} from "@heroui/react";
import {
  Printer,
  RefreshCw,
  Wifi,
  AlertCircle,
  X,
  Settings,
  Search,
  Gauge,
  StopCircle,
  RotateCcw,
  Zap,
  Save,
  Undo,
  CheckCircle,
  Circle,
  FileText,
  Radio,
  Cpu,
  Activity,
} from "lucide-react";
import {
  useRFIDSafe,
  usePrinterSettings,
  useLabelPresets,
} from "@/app/api/chainWay/core";
import {
  PRINT_TYPES,
  PRINT_TYPE_OPTIONS,
  LABEL_PRESETS,
  EPC_MODES,
  PRINTER_CONFIG,
} from "@/lib/chainWay/config";

function ElevatedCard({ children, className = "", level = 1, hover = false }) {
  const shadows = {
    1: "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)]",
    2: "shadow-[0_2px_8px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.06)]",
    3: "shadow-[0_4px_12px_rgba(0,0,0,0.08),0_16px_48px_rgba(0,0,0,0.08)]",
  };

  return (
    <div
      className={`
        bg-white rounded-2xl border border-gray-100/80
        ${shadows[level]}
        ${hover ? "transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-0.5" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

function StatusBadge({ connected, loading }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-50 border border-amber-100">
        <RefreshCw size={14} className="text-amber-500 animate-spin" />
        <span className="text-sm font-medium text-amber-600">
          กำลังตรวจสอบ...
        </span>
      </div>
    );
  }

  return (
    <div
      className={`
        flex items-center gap-2.5 px-4 py-2 rounded-full transition-all duration-300
        ${
          connected
            ? "bg-emerald-50 border border-emerald-100"
            : "bg-gray-50 border border-gray-200"
        }
      `}
    >
      <span className="relative flex h-2.5 w-2.5">
        {connected && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full transition-colors ${
            connected ? "bg-emerald-500" : "bg-gray-300"
          }`}
        />
      </span>
      <span
        className={`text-sm font-medium ${connected ? "text-emerald-700" : "text-gray-500"}`}
      >
        {connected ? "เชื่อมต่อแล้ว" : "ไม่ได้เชื่อมต่อ"}
      </span>
    </div>
  );
}

function Section({ icon: Icon, title, children, action }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/60 flex items-center justify-center shadow-sm">
            <Icon size={18} className="text-gray-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FormInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  min,
  max,
  step,
  hint,
  icon: Icon,
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={16} />
          </div>
        )}
        <Input
          type={type}
          placeholder={placeholder}
          value={String(value)}
          onChange={(e) =>
            onChange(
              type === "number"
                ? parseFloat(e.target.value) || 0
                : e.target.value,
            )
          }
          isDisabled={disabled}
          min={min}
          max={max}
          step={step}
          variant="bordered"
          size="md"
          radius="lg"
          classNames={{
            inputWrapper: `
              bg-gray-50/50 border-gray-200 
              hover:bg-white hover:border-gray-300
              focus-within:bg-white focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50
              transition-all duration-200 shadow-sm
              ${Icon ? "pl-10" : ""}
            `,
            input:
              "text-gray-800 text-sm font-medium placeholder:text-gray-400",
          }}
        />
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
  disabled,
  hint,
  icon: Icon,
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <Select
        placeholder="เลือก..."
        selectedKeys={value ? [value] : []}
        onChange={(e) => onChange(e.target.value)}
        isDisabled={disabled}
        variant="bordered"
        size="md"
        radius="lg"
        startContent={Icon && <Icon size={16} className="text-gray-400" />}
        classNames={{
          trigger: `
            bg-gray-50/50 border-gray-200 
            hover:bg-white hover:border-gray-300
            data-[open=true]:bg-white data-[open=true]:border-blue-400 data-[open=true]:ring-4 data-[open=true]:ring-blue-50
            transition-all duration-200 shadow-sm
          `,
          value: "text-gray-800 text-sm font-medium",
          popoverContent:
            "bg-white border border-gray-200 shadow-xl shadow-gray-200/50 rounded-xl",
        }}
      >
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            classNames={{
              base: "rounded-lg data-[hover=true]:bg-gray-50 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700",
            }}
          >
            {opt.label}
          </SelectItem>
        ))}
      </Select>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function FormToggle({ label, checked, onChange, disabled, hint }) {
  return (
    <div
      className={`
        flex items-center justify-between p-4 rounded-xl
        bg-gradient-to-r from-gray-50/80 to-gray-50/40
        border border-gray-100
        transition-all duration-200
        ${!disabled && "hover:bg-gray-50 hover:border-gray-200"}
      `}
    >
      <div className="space-y-0.5">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
      <Switch
        isSelected={checked}
        onValueChange={onChange}
        isDisabled={disabled}
        size="md"
        classNames={{
          wrapper: `
            group-data-[selected=true]:bg-blue-500
            bg-gray-200
            shadow-inner
          `,
          thumb: "bg-white shadow-md",
        }}
      />
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
    primary:
      "bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20",
    secondary:
      "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm hover:shadow",
    danger:
      "bg-white hover:bg-red-50 text-red-600 border border-red-200 shadow-sm",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600",
  };

  return (
    <Button
      size="sm"
      radius="lg"
      isLoading={loading}
      spinner={<Spinner size="sm" color="current" />}
      startContent={!loading && Icon && <Icon size={15} />}
      className={`${variants[variant]} font-medium text-sm h-9 px-4 transition-all duration-200`}
      {...props}
    >
      {children}
    </Button>
  );
}

function AlertBox({ children, type = "error" }) {
  const styles = {
    error: {
      bg: "bg-gradient-to-r from-red-50 to-red-50/50",
      border: "border-red-100",
      icon: "text-red-500",
      text: "text-red-700",
    },
    warning: {
      bg: "bg-gradient-to-r from-amber-50 to-amber-50/50",
      border: "border-amber-100",
      icon: "text-amber-500",
      text: "text-amber-700",
    },
    success: {
      bg: "bg-gradient-to-r from-emerald-50 to-emerald-50/50",
      border: "border-emerald-100",
      icon: "text-emerald-500",
      text: "text-emerald-700",
    },
  };

  const s = styles[type];

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl ${s.bg} border ${s.border}`}
    >
      <AlertCircle size={18} className={`${s.icon} mt-0.5 flex-shrink-0`} />
      <span className={`text-sm ${s.text}`}>{children}</span>
    </div>
  );
}

function Divider() {
  return (
    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
  );
}

export function PrinterStatusBadge({ className = "" }) {
  const { isConnected, printerLoading, refreshPrinter, printerError } =
    useRFIDSafe();

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <StatusBadge connected={isConnected} loading={printerLoading} />
      <button
        onClick={refreshPrinter}
        disabled={printerLoading}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
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
      radius="xl"
      onPress={handleClick}
      isDisabled={disabled || printing || !items.length}
      isLoading={printing}
      spinner={<Spinner size="sm" color="white" />}
      startContent={!printing && <Printer size={20} />}
      className={`
        bg-gradient-to-r from-gray-900 to-gray-800 
        hover:from-gray-800 hover:to-gray-700
        text-white font-semibold
        shadow-xl shadow-gray-900/25
        transition-all duration-300
        hover:shadow-2xl hover:shadow-gray-900/30
        hover:-translate-y-0.5
        active:translate-y-0
        ${className}
      `}
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
      radius="2xl"
      backdrop="blur"
      classNames={{
        base: "bg-white",
        header: "border-b border-gray-100 pt-6 pb-4",
        body: "py-6",
        footer: "border-t border-gray-100 pt-4 pb-6",
        closeButton: "hover:bg-gray-100 text-gray-400 top-4 right-4",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center shadow-sm">
            <Printer size={22} className="text-gray-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">พิมพ์ฉลาก</h3>
            <p className="text-xs text-gray-400 font-normal mt-0.5">
              RFID Label Printer
            </p>
          </div>
        </ModalHeader>

        <ModalBody className="space-y-5">
          {(localError || printerError) && (
            <div className="space-y-3">
              <AlertBox type="error">{localError || printerError}</AlertBox>
              <div className="flex gap-2">
                <ActionBtn icon={RefreshCw} onPress={reconnect}>
                  เชื่อมต่อใหม่
                </ActionBtn>
                <ActionBtn icon={RotateCcw} onPress={fullReset}>
                  รีเซ็ต
                </ActionBtn>
                <ActionBtn icon={StopCircle} onPress={cancelAllJobs}>
                  ยกเลิก
                </ActionBtn>
              </div>
            </div>
          )}

          {!showResult ? (
            <>
              {/* Items Card */}
              <ElevatedCard className="p-4" level={1}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <FileText size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      รายการที่จะพิมพ์
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {items.length}
                  </span>
                </div>
                {items.length <= 5 && (
                  <div className="space-y-1.5 ml-6">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-gray-500"
                      >
                        <Circle
                          size={5}
                          className="fill-gray-300 text-gray-300"
                        />
                        {item.displayName || item.number}
                      </div>
                    ))}
                  </div>
                )}
              </ElevatedCard>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="ประเภทฉลาก"
                  value={labelType}
                  onChange={setLabelType}
                  options={PRINT_TYPE_OPTIONS.map((t) => ({
                    value: t.key,
                    label: t.label,
                  }))}
                />
                <FormInput
                  label="จำนวน"
                  type="number"
                  value={quantity}
                  onChange={(v) => setQuantity(Math.max(1, v))}
                  min={1}
                  max={100}
                />
              </div>

              {/* RFID Indicator */}
              {enableRFID && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
                      <Radio size={18} className="text-white" />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700">
                      RFID Encoding
                    </p>
                    <p className="text-xs text-blue-500">
                      เขียนข้อมูลลงแท็กอัตโนมัติ
                    </p>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="text-center py-4">
                <p className="text-xs text-gray-400 mb-1">จำนวนฉลากทั้งหมด</p>
                <p className="text-4xl font-bold text-gray-900">
                  {totalLabels}
                </p>
              </div>

              {/* Progress */}
              {printing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">กำลังพิมพ์...</span>
                    <span className="font-medium text-gray-700">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress
                    value={progress}
                    size="sm"
                    radius="full"
                    classNames={{
                      base: "max-w-full",
                      track: "bg-gray-100",
                      indicator: "bg-gradient-to-r from-blue-500 to-indigo-500",
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            /* Success */
            <div className="flex flex-col items-center py-8">
              <div
                className={`
                  w-20 h-20 rounded-2xl flex items-center justify-center mb-5
                  ${
                    lastResult?.data?.summary?.failed === 0
                      ? "bg-gradient-to-br from-emerald-100 to-emerald-50 border-2 border-emerald-200"
                      : "bg-gradient-to-br from-amber-100 to-amber-50 border-2 border-amber-200"
                  }
                  shadow-lg
                `}
              >
                {lastResult?.data?.summary?.failed === 0 ? (
                  <CheckCircle size={36} className="text-emerald-600" />
                ) : (
                  <AlertCircle size={36} className="text-amber-600" />
                )}
              </div>

              <h4 className="text-xl font-bold text-gray-900 mb-1">
                {lastResult?.data?.summary?.failed === 0
                  ? "พิมพ์สำเร็จ!"
                  : "เสร็จสิ้น (มีข้อผิดพลาด)"}
              </h4>

              {lastResult?.data?.summary && (
                <div className="flex gap-8 mt-5">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-emerald-600">
                      {lastResult.data.summary.success}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">สำเร็จ</p>
                  </div>
                  {lastResult.data.summary.failed > 0 && (
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">
                        {lastResult.data.summary.failed}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">ล้มเหลว</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter className="gap-3">
          {!showResult ? (
            <>
              <Button
                variant="light"
                radius="xl"
                onPress={onClose}
                className="text-gray-600 font-medium"
              >
                ยกเลิก
              </Button>
              <Button
                radius="xl"
                onPress={handlePrint}
                isDisabled={printing || !items.length}
                isLoading={printing}
                spinner={<Spinner size="sm" color="white" />}
                startContent={!printing && <Printer size={18} />}
                className="bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold shadow-lg shadow-gray-900/20 px-6"
              >
                {printing ? "กำลังพิมพ์..." : `พิมพ์ ${totalLabels} ฉลาก`}
              </Button>
            </>
          ) : (
            <Button
              radius="xl"
              onPress={onClose}
              fullWidth
              className="bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold"
            >
              เสร็จสิ้น
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function PrinterSettings({
  onSave,
  compact = false,
  className = "",
  showHeader = true,
  title = "ตั้งค่าเครื่องพิมพ์",
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

  const { settings, updateSetting, updateSettings, save, reset } =
    usePrinterSettings();
  const { presets, selectPreset, isCustom } = useLabelPresets();

  const [actionLoading, setActionLoading] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  const handlePresetChange = useCallback(
    (presetName) => {
      selectPreset(presetName);
      const preset = LABEL_PRESETS.find((p) => p.name === presetName);
      if (preset && preset.width !== null) {
        updateSettings({
          labelPreset: presetName,
          labelWidth: preset.width,
          labelHeight: preset.height,
        });
      } else {
        updateSetting("labelPreset", presetName);
      }
    },
    [selectPreset, updateSettings, updateSetting],
  );

  const handleAction = useCallback(async (actionName, actionFn) => {
    setActionLoading(actionName);
    try {
      await actionFn();
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    try {
      await save();
      await onSave?.(settings);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2500);
    } catch {
      setSaveStatus("error");
    }
  }, [save, onSave, settings]);

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-white border border-gray-200 flex items-center justify-center shadow-lg shadow-gray-200/50">
              <Printer size={28} className="text-gray-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <StatusBadge connected={isConnected} loading={printerLoading} />
        </div>
      )}

      {/* Error */}
      {printerError && (
        <div className="mb-6">
          <AlertBox type="error">{printerError}</AlertBox>
        </div>
      )}

      <div className="space-y-8">
        {/* Connection */}
        <ElevatedCard className="p-6" level={2} hover>
          <Section icon={Wifi} title="การเชื่อมต่อ">
            <div
              className={`grid gap-4 ${compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}
            >
              <FormInput
                label="IP Address"
                value={settings.host}
                onChange={(v) => updateSetting("host", v)}
                placeholder={PRINTER_CONFIG.host}
                icon={Wifi}
              />
              <FormInput
                label="Port"
                type="number"
                value={settings.port}
                onChange={(v) => updateSetting("port", v)}
                min={1}
                max={65535}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <ActionBtn
                variant="primary"
                icon={Search}
                loading={actionLoading === "test"}
                onPress={() => handleAction("test", testConnection)}
              >
                ทดสอบการเชื่อมต่อ
              </ActionBtn>
              <ActionBtn
                variant="ghost"
                icon={RefreshCw}
                loading={actionLoading === "refresh"}
                onPress={() => handleAction("refresh", refreshPrinter)}
              >
                รีเฟรช
              </ActionBtn>
            </div>
          </Section>
        </ElevatedCard>

        {/* Label Config */}
        <ElevatedCard className="p-6" level={2} hover>
          <Section icon={FileText} title="ตั้งค่าฉลาก">
            <FormSelect
              label="ขนาดสำเร็จรูป"
              value={settings.labelPreset}
              onChange={handlePresetChange}
              options={presets.map((p) => ({ value: p.name, label: p.name }))}
            />
            <div
              className={`grid gap-4 ${compact ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-3"}`}
            >
              <FormInput
                label="กว้าง (มม.)"
                type="number"
                value={settings.labelWidth}
                onChange={(v) => updateSetting("labelWidth", v)}
                min={10}
                max={200}
                disabled={!isCustom}
              />
              <FormInput
                label="สูง (มม.)"
                type="number"
                value={settings.labelHeight}
                onChange={(v) => updateSetting("labelHeight", v)}
                min={10}
                max={200}
                disabled={!isCustom}
              />
              <FormInput
                label="จำนวนเริ่มต้น"
                type="number"
                value={settings.defaultQuantity}
                onChange={(v) => updateSetting("defaultQuantity", v)}
                min={1}
                max={100}
              />
            </div>
          </Section>
        </ElevatedCard>

        {/* EPC */}
        <ElevatedCard className="p-6" level={2} hover>
          <Section icon={Cpu} title="EPC / RFID">
            <FormSelect
              label="โหมดสร้าง EPC"
              value={settings.epcMode}
              onChange={(v) => updateSetting("epcMode", v)}
              options={EPC_MODES.map((m) => ({
                value: m.value,
                label: m.label,
              }))}
              hint={
                EPC_MODES.find((m) => m.value === settings.epcMode)?.description
              }
              icon={Radio}
            />
            <div
              className={`grid gap-4 ${compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}
            >
              <FormInput
                label="EPC Prefix"
                value={settings.epcPrefix}
                onChange={(v) => updateSetting("epcPrefix", v)}
                placeholder="PK"
                hint="2-4 ตัวอักษร"
              />
              {settings.epcMode === "sgtin96" && (
                <FormInput
                  label="GS1 Company Prefix"
                  value={settings.companyPrefix}
                  onChange={(v) => updateSetting("companyPrefix", v)}
                  placeholder="0885000"
                  hint="7 หลัก"
                />
              )}
            </div>
            <FormToggle
              label="เปิด RFID เป็นค่าเริ่มต้น"
              checked={settings.enableRFIDByDefault}
              onChange={(v) => updateSetting("enableRFIDByDefault", v)}
              hint="เขียน RFID อัตโนมัติทุกครั้งที่พิมพ์"
            />
          </Section>
        </ElevatedCard>

        {/* Controls */}
        <ElevatedCard className="p-6" level={2} hover>
          <Section icon={Settings} title="ควบคุมเครื่องพิมพ์">
            <div className="flex flex-wrap gap-2">
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
          </Section>
        </ElevatedCard>

        {/* Advanced */}
        <ElevatedCard className="overflow-hidden" level={1}>
          <Accordion
            variant="light"
            className="px-0"
            itemClasses={{
              base: "py-0 w-full",
              title: "text-sm font-medium text-gray-700",
              trigger: "px-6 py-4 hover:bg-gray-50 transition-colors",
              content: "px-6 pb-6",
              indicator: "text-gray-400",
            }}
          >
            <AccordionItem
              key="advanced"
              title={
                <span className="flex items-center gap-2.5">
                  <Settings size={16} className="text-gray-500" />
                  ตั้งค่าขั้นสูง
                </span>
              }
            >
              <div className="space-y-4 pt-2">
                <div
                  className={`grid gap-4 ${compact ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-3"}`}
                >
                  <FormInput
                    label="Timeout (ms)"
                    type="number"
                    value={settings.timeout}
                    onChange={(v) => updateSetting("timeout", v)}
                    min={1000}
                    max={60000}
                    step={1000}
                  />
                  <FormInput
                    label="ลองใหม่ (ครั้ง)"
                    type="number"
                    value={settings.retries}
                    onChange={(v) => updateSetting("retries", v)}
                    min={0}
                    max={10}
                  />
                  <FormInput
                    label="หน่วงเวลา (ms)"
                    type="number"
                    value={settings.printDelay}
                    onChange={(v) => updateSetting("printDelay", v)}
                    min={0}
                    max={5000}
                    step={50}
                  />
                </div>
                <div className="space-y-2">
                  <FormToggle
                    label="ปรับเทียบอัตโนมัติ"
                    checked={settings.autoCalibrate}
                    onChange={(v) => updateSetting("autoCalibrate", v)}
                  />
                  <FormToggle
                    label="ตรวจสอบ EPC"
                    checked={settings.validateEPC}
                    onChange={(v) => updateSetting("validateEPC", v)}
                  />
                  <FormToggle
                    label="ลองใหม่เมื่อผิดพลาด"
                    checked={settings.retryOnError}
                    onChange={(v) => updateSetting("retryOnError", v)}
                  />
                </div>
              </div>
            </AccordionItem>
          </Accordion>
        </ElevatedCard>

        {/* Status */}
        {printerStatus && (
          <ElevatedCard className="p-6" level={1}>
            <Section icon={Activity} title="สถานะเครื่องพิมพ์">
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
            </Section>
          </ElevatedCard>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <ActionBtn variant="ghost" icon={Undo} onPress={reset}>
            รีเซ็ตค่าเริ่มต้น
          </ActionBtn>

          <div className="flex items-center gap-4">
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <CheckCircle size={16} />
                บันทึกแล้ว
              </span>
            )}
            {saveStatus === "error" && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-red-600">
                <X size={16} />
                บันทึกล้มเหลว
              </span>
            )}
            {onSave && (
              <Button
                radius="xl"
                startContent={saveStatus !== "saving" && <Save size={16} />}
                onPress={handleSave}
                isLoading={saveStatus === "saving"}
                spinner={<Spinner size="sm" color="white" />}
                className="bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold shadow-lg shadow-gray-900/20 px-6"
              >
                บันทึกการตั้งค่า
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusTile({ label, active }) {
  return (
    <div
      className={`
        p-3 rounded-xl border transition-all duration-300
        ${
          active
            ? "bg-gradient-to-br from-emerald-50 to-white border-emerald-200"
            : "bg-gradient-to-br from-red-50 to-white border-red-200"
        }
      `}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="relative flex h-2 w-2">
          {active && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${
              active ? "bg-emerald-500" : "bg-red-400"
            }`}
          />
        </span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p
        className={`text-sm font-semibold ${active ? "text-emerald-700" : "text-red-600"}`}
      >
        {active ? "พร้อม" : "ไม่พร้อม"}
      </p>
    </div>
  );
}

export function PrinterQuickConnect({ onConnect, className = "" }) {
  const {
    isConnected,
    printerLoading,
    refreshPrinter,
    testConnection,
    printerError,
  } = useRFIDSafe();

  const [host, setHost] = useState(PRINTER_CONFIG.host);
  const [port, setPort] = useState(PRINTER_CONFIG.port);

  const handleConnect = async () => {
    await testConnection({ host, port });
    await refreshPrinter();
    onConnect?.({ host, port, connected: isConnected });
  };

  return (
    <ElevatedCard className={`p-5 ${className}`} level={2} hover>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-white border border-gray-200 flex items-center justify-center shadow-sm">
            <Wifi size={20} className="text-gray-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              เชื่อมต่อเครื่องพิมพ์
            </h4>
            <p className="text-xs text-gray-400">Quick Connect</p>
          </div>
        </div>
        <StatusBadge connected={isConnected} loading={printerLoading} />
      </div>

      {printerError && (
        <div className="mb-4">
          <AlertBox type="error">{printerError}</AlertBox>
        </div>
      )}

      <div className="flex gap-3">
        <Input
          type="text"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="IP Address"
          variant="bordered"
          size="md"
          radius="lg"
          className="flex-1"
          startContent={<Wifi size={16} className="text-gray-400" />}
          classNames={{
            inputWrapper:
              "bg-gray-50/50 border-gray-200 hover:border-gray-300 shadow-sm",
            input: "text-sm",
          }}
        />
        <Input
          type="number"
          value={String(port)}
          onChange={(e) => setPort(parseInt(e.target.value) || 9100)}
          placeholder="Port"
          variant="bordered"
          size="md"
          radius="lg"
          className="w-24"
          classNames={{
            inputWrapper:
              "bg-gray-50/50 border-gray-200 hover:border-gray-300 shadow-sm",
            input: "text-sm",
          }}
        />
        <Button
          size="md"
          radius="lg"
          onPress={handleConnect}
          isLoading={printerLoading}
          spinner={<Spinner size="sm" color="white" />}
          className="bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold shadow-lg shadow-gray-900/20 min-w-[100px]"
        >
          {printerLoading ? "" : "เชื่อมต่อ"}
        </Button>
      </div>
    </ElevatedCard>
  );
}

export { PRINT_TYPES, PRINT_TYPE_OPTIONS };
