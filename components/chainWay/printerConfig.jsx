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

function Section({ icon: Icon, title, children, action }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-gray-500" />
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
      <label className="block text-xs font-medium text-gray-600">{label}</label>
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
          radius="md"
          classNames={{
            inputWrapper: `bg-white border-gray-300 ${Icon ? "pl-10" : ""}`,
            input: "text-gray-800 text-sm",
          }}
        />
      </div>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
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
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      <Select
        placeholder="เลือก..."
        selectedKeys={value ? [value] : []}
        onChange={(e) => onChange(e.target.value)}
        isDisabled={disabled}
        variant="bordered"
        size="md"
        radius="md"
        startContent={Icon && <Icon size={16} className="text-gray-400" />}
        classNames={{
          trigger: "bg-white border-gray-300",
          value: "text-gray-800 text-sm",
          popoverContent: "bg-white border border-gray-200 rounded-lg",
        }}
      >
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </Select>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function FormToggle({ label, checked, onChange, disabled, hint }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
      <div>
        <span className="text-sm text-gray-700">{label}</span>
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
      <Switch
        isSelected={checked}
        onValueChange={onChange}
        isDisabled={disabled}
        size="sm"
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
        <div className="p-4 rounded-lg border border-gray-200">
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
        </div>

        <div className="p-4 rounded-lg border border-gray-200">
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
        </div>

        <div className="p-4 rounded-lg border border-gray-200">
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
        </div>

        <div className="p-4 rounded-lg border border-gray-200">
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
        </div>

        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Accordion variant="light" className="px-0">
            <AccordionItem
              key="advanced"
              title={
                <span className="flex items-center gap-2 text-sm text-gray-700">
                  <Settings size={16} className="text-gray-500" />
                  ตั้งค่าขั้นสูง
                </span>
              }
              classNames={{
                trigger: "px-4 py-3",
                content: "px-4 pb-4",
              }}
            >
              <div className="space-y-4">
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
        </div>

        {printerStatus && (
          <div className="p-4 rounded-lg border border-gray-200">
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
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <ActionBtn variant="ghost" icon={Undo} onPress={reset}>
            รีเซ็ตค่าเริ่มต้น
          </ActionBtn>

          <div className="flex items-center gap-3">
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1 text-sm text-emerald-600">
                <CheckCircle size={16} />
                บันทึกแล้ว
              </span>
            )}
            {saveStatus === "error" && (
              <span className="flex items-center gap-1 text-sm text-red-600">
                <X size={16} />
                บันทึกล้มเหลว
              </span>
            )}
            {onSave && (
              <Button
                radius="md"
                startContent={saveStatus !== "saving" && <Save size={16} />}
                onPress={handleSave}
                isLoading={saveStatus === "saving"}
                spinner={<Spinner size="sm" color="white" />}
                className="bg-gray-900 text-white font-medium"
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
    <div className={`p-4 rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wifi size={18} className="text-gray-500" />
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              เชื่อมต่อเครื่องพิมพ์
            </h4>
            <p className="text-xs text-gray-400">Quick Connect</p>
          </div>
        </div>
        <StatusBadge connected={isConnected} loading={printerLoading} />
      </div>

      {printerError && (
        <div className="mb-3">
          <AlertBox type="error">{printerError}</AlertBox>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          type="text"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="IP Address"
          variant="bordered"
          size="md"
          radius="md"
          className="flex-1"
          startContent={<Wifi size={16} className="text-gray-400" />}
          classNames={{
            inputWrapper: "bg-white border-gray-300",
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
          radius="md"
          className="w-24"
          classNames={{
            inputWrapper: "bg-white border-gray-300",
            input: "text-sm",
          }}
        />
        <Button
          size="md"
          radius="md"
          onPress={handleConnect}
          isLoading={printerLoading}
          spinner={<Spinner size="sm" color="white" />}
          className="bg-gray-900 text-white font-medium min-w-[90px]"
        >
          {printerLoading ? "" : "เชื่อมต่อ"}
        </Button>
      </div>
    </div>
  );
}

export { PRINT_TYPES, PRINT_TYPE_OPTIONS };
