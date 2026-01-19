"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Switch,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Divider,
  Accordion,
  AccordionItem,
} from "@heroui/react";
import {
  Printer,
  RefreshCw,
  MoreVertical,
  Wifi,
  WifiOff,
  AlertTriangle,
  Check,
  X,
  Plug,
  Tag,
  Radio,
  SlidersHorizontal,
  Settings,
  Search,
  Gauge,
  StopCircle,
  RotateCcw,
  Zap,
  Save,
  Undo,
  CheckCircle,
  XCircle,
  Activity,
  Pause,
  FileText,
  Ribbon,
  Hash,
} from "lucide-react";
import { useRFIDSafe, usePrinterSettings, useLabelPresets } from "@/app/api/chainWay/core";
import {
  PRINT_TYPES,
  PRINT_TYPE_OPTIONS,
  LABEL_PRESETS,
  EPC_MODES,
  PRINTER_CONFIG,
} from "@/lib/chainWay/config";

function SettingsInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  min,
  max,
  step,
  helpText,
}) {
  return (
    <Input
      type={type}
      label={label}
      labelPlacement="outside"
      placeholder={placeholder}
      description={helpText}
      value={String(value)}
      onChange={(e) =>
        onChange(
          type === "number" ? parseFloat(e.target.value) || 0 : e.target.value
        )
      }
      isDisabled={disabled}
      min={min}
      max={max}
      step={step}
      variant="bordered"
      size="md"
      radius="sm"
      classNames={{ base: "w-full", inputWrapper: "bg-background" }}
    />
  );
}

function SettingsSelect({
  label,
  value,
  onChange,
  options,
  disabled,
  helpText,
}) {
  return (
    <Select
      label={label}
      labelPlacement="outside"
      placeholder="เลือก..."
      description={helpText}
      selectedKeys={value ? [value] : []}
      onChange={(e) => onChange(e.target.value)}
      isDisabled={disabled}
      variant="bordered"
      size="md"
      radius="sm"
      classNames={{ base: "w-full", trigger: "bg-background" }}
    >
      {options.map((opt) => (
        <SelectItem key={opt.value} value={opt.value}>
          {opt.label}
        </SelectItem>
      ))}
    </Select>
  );
}

function SettingsToggle({ label, checked, onChange, disabled, helpText }) {
  return (
    <div className="flex items-center justify-between w-full py-2">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">{label}</span>
        {helpText && (
          <span className="text-xs text-foreground/60">{helpText}</span>
        )}
      </div>
      <Switch
        isSelected={checked}
        onValueChange={onChange}
        isDisabled={disabled}
        size="md"
        color="success"
      />
    </div>
  );
}

function SettingsSection({ title, children, icon }) {
  return (
    <Card className="w-full" shadow="sm" radius="lg">
      <CardHeader className="flex items-center gap-2 pb-0">
        {icon && <span className="text-foreground/70">{icon}</span>}
        <h4 className="text-sm font-semibold">{title}</h4>
      </CardHeader>
      <CardBody className="gap-4">{children}</CardBody>
    </Card>
  );
}

function StatusIndicator({ status }) {
  const statusConfig = {
    connected: { color: "success", text: "Connected", icon: Wifi },
    disconnected: { color: "danger", text: "Disconnected", icon: WifiOff },
    checking: { color: "warning", text: "Checking...", icon: RefreshCw },
    error: { color: "danger", text: "Error", icon: AlertTriangle },
  };

  const config = statusConfig[status] || statusConfig.disconnected;
  const IconComponent = config.icon;

  return (
    <Chip
      color={config.color}
      variant="flat"
      size="sm"
      startContent={
        <IconComponent
          
          className={
            status === "connected"
              ? "animate-pulse"
              : status === "checking"
              ? "animate-spin"
              : ""
          }
        />
      }
    >
      {config.text}
    </Chip>
  );
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

  const [actionLoading, setActionLoading] = useState(null);

  const handleAction = async (action, fn) => {
    setActionLoading(action);
    try {
      await fn();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Chip
        color={isConnected ? "success" : "danger"}
        variant="flat"
        size="sm"
        startContent={
          isConnected ? (
            <Wifi className="animate-pulse" />
          ) : (
            <WifiOff />
          )
        }
      >
        {printerLoading
          ? "Checking..."
          : isConnected
          ? "Connected"
          : "Disconnected"}
      </Chip>

      <Button
        isIconOnly
        size="sm"
        variant="light"
        onPress={refreshPrinter}
        isDisabled={printerLoading}
      >
        <RefreshCw  className={printerLoading ? "animate-spin" : ""} />
      </Button>

      {showControls && (
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly size="sm" variant="light">
              <MoreVertical  />
            </Button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem
              key="reconnect"
              startContent={<RefreshCw  />}
              onPress={() => handleAction("reconnect", reconnect)}
              isDisabled={actionLoading === "reconnect"}
            >
              Reconnect
            </DropdownItem>
            <DropdownItem
              key="cancel"
              startContent={<StopCircle  />}
              onPress={() => handleAction("cancel", cancelAllJobs)}
              isDisabled={actionLoading === "cancel"}
            >
              Cancel Jobs
            </DropdownItem>
            <DropdownItem
              key="reset"
              startContent={<RotateCcw  />}
              color="danger"
              className="text-danger"
              onPress={() => handleAction("reset", fullReset)}
              isDisabled={actionLoading === "reset"}
            >
              Full Reset
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )}

      {printerError && (
        <Chip color="danger" variant="flat" size="sm">
          <AlertTriangle  />
        </Chip>
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
    <Button
      color={isConnected ? "primary" : "warning"}
      variant="shadow"
      size="md"
      radius="sm"
      onPress={handleClick}
      isDisabled={disabled || printing || !items.length}
      isLoading={printing}
      spinner={<Spinner size="sm" color="current" />}
      startContent={!printing && <Printer  />}
      className={className}
    >
      {printing ? "Printing..." : children || `Print (${items.length})`}
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

  const handlePrint = async () => {
    setLocalError(null);

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
    <Modal isOpen={isOpen} onClose={onClose} size="lg" radius="lg">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Printer  />
          Print Label
        </ModalHeader>
        <ModalBody>
          {(localError || printerError) && (
            <Card className="bg-danger/10 border-danger/20" shadow="none">
              <CardBody className="gap-2">
                <p className="text-sm text-danger flex items-center gap-2">
                  <AlertTriangle  />
                  {localError || printerError}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    color="warning"
                    variant="flat"
                    onPress={reconnect}
                    startContent={<RefreshCw  />}
                  >
                    Reconnect
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    onPress={fullReset}
                    startContent={<RotateCcw  />}
                  >
                    Full Reset
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={cancelAllJobs}
                    startContent={<StopCircle  />}
                  >
                    Cancel Jobs
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {!showResult ? (
            <>
              <Card className="bg-default/50" shadow="none">
                <CardBody>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <FileText  />
                    Items to print: {items.length}
                  </p>
                  {items.length <= 5 && (
                    <ul className="mt-2 text-xs text-foreground/60">
                      {items.map((item, idx) => (
                        <li key={idx}>• {item.displayName || item.number}</li>
                      ))}
                    </ul>
                  )}
                </CardBody>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Label Type"
                  labelPlacement="outside"
                  selectedKeys={[labelType]}
                  onChange={(e) => setLabelType(e.target.value)}
                  variant="bordered"
                  size="md"
                  radius="sm"
                  startContent={<Tag  />}
                >
                  {PRINT_TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t.key} value={t.key}>
                      {t.label}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  type="number"
                  label="Quantity (each)"
                  labelPlacement="outside"
                  min={1}
                  max={100}
                  value={String(quantity)}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  variant="bordered"
                  size="md"
                  radius="sm"
                  startContent={<Hash  />}
                />
              </div>

              {enableRFID && (
                <Card className="bg-primary/10" shadow="none">
                  <CardBody>
                    <p className="text-sm text-primary flex items-center gap-2">
                      <Radio  />
                      RFID Mode Enabled - Tags will be encoded
                    </p>
                  </CardBody>
                </Card>
              )}

              <p className="text-center text-sm text-foreground/60">
                Total labels: {items.length * quantity}
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <div
                className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center ${
                  lastResult?.data?.summary?.failed === 0
                    ? "bg-success/20 text-success"
                    : "bg-warning/20 text-warning"
                }`}
              >
                {lastResult?.data?.summary?.failed === 0 ? (
                  <CheckCircle  />
                ) : (
                  <AlertTriangle  />
                )}
              </div>

              <h4 className="text-lg font-semibold mb-2">
                {lastResult?.data?.summary?.failed === 0
                  ? "Print Complete!"
                  : "Print Completed with Errors"}
              </h4>

              {lastResult?.data?.summary && (
                <div className="text-sm space-y-1">
                  <p className="text-success flex items-center gap-1 justify-center">
                    <Check  />
                    Success: {lastResult.data.summary.success}
                  </p>
                  {lastResult.data.summary.failed > 0 && (
                    <p className="text-danger flex items-center gap-1 justify-center">
                      <X  />
                      Failed: {lastResult.data.summary.failed}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {!showResult ? (
            <>
              <Button
                variant="flat"
                onPress={onClose}
                startContent={<X  />}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                variant="shadow"
                onPress={handlePrint}
                isDisabled={printing || !items.length}
                isLoading={printing}
                spinner={<Spinner size="sm" color="current" />}
                startContent={!printing && <Printer  />}
              >
                {printing
                  ? "Printing..."
                  : `Print ${items.length * quantity} Labels`}
              </Button>
            </>
          ) : (
            <Button
              color="primary"
              variant="shadow"
              onPress={onClose}
              fullWidth
              startContent={<Check  />}
            >
              Close
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function PrinterSettings({ onSave, compact = false, className = "" }) {
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

  const { settings, updateSetting, updateSettings, save, reset, saving } =
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
    [selectPreset, updateSettings, updateSetting]
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
      setTimeout(() => setSaveStatus(null), 2000);
    } catch {
      setSaveStatus("error");
    }
  }, [save, onSave, settings]);

  const connectionStatus = printerLoading
    ? "checking"
    : isConnected
    ? "connected"
    : "disconnected";

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Printer Settings</h3>
        <StatusIndicator status={connectionStatus} />
      </div>

      {printerError && (
        <Card className="bg-danger/10 border-danger/20" shadow="none">
          <CardBody>
            <p className="text-sm text-danger flex items-center gap-2">
              <AlertTriangle  />
              {printerError}
            </p>
          </CardBody>
        </Card>
      )}

      <SettingsSection title="Connection" icon={<Plug  />}>
        <div
          className={`grid gap-4 ${
            compact ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          <SettingsInput
            label="Printer IP Address"
            value={settings.host}
            onChange={(v) => updateSetting("host", v)}
            placeholder={PRINTER_CONFIG.host}
            helpText="IP address of the RFID printer"
          />
          <SettingsInput
            label="Port"
            type="number"
            value={settings.port}
            onChange={(v) => updateSetting("port", v)}
            min={1}
            max={65535}
            helpText="Default: 9100"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            color="primary"
            variant="flat"
            size="sm"
            startContent={actionLoading !== "test" && <Search  />}
            onPress={() => handleAction("test", testConnection)}
            isLoading={actionLoading === "test"}
            spinner={<Spinner size="sm" color="current" />}
          >
            Test Connection
          </Button>
          <Button
            variant="flat"
            size="sm"
            startContent={
              actionLoading !== "refresh" && <RefreshCw  />
            }
            onPress={() => handleAction("refresh", refreshPrinter)}
            isLoading={actionLoading === "refresh"}
            spinner={<Spinner size="sm" color="current" />}
          >
            Refresh Status
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection title="Label Configuration" icon={<Tag  />}>
        <SettingsSelect
          label="Label Size Preset"
          value={settings.labelPreset}
          onChange={handlePresetChange}
          options={presets.map((p) => ({ value: p.name, label: p.name }))}
        />

        <div
          className={`grid gap-4 ${
            compact ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          <SettingsInput
            label="Width (mm)"
            type="number"
            value={settings.labelWidth}
            onChange={(v) => updateSetting("labelWidth", v)}
            min={10}
            max={200}
            disabled={!isCustom}
          />
          <SettingsInput
            label="Height (mm)"
            type="number"
            value={settings.labelHeight}
            onChange={(v) => updateSetting("labelHeight", v)}
            min={10}
            max={200}
            disabled={!isCustom}
          />
        </div>

        <SettingsInput
          label="Default Print Quantity"
          type="number"
          value={settings.defaultQuantity}
          onChange={(v) => updateSetting("defaultQuantity", v)}
          min={1}
          max={100}
        />
      </SettingsSection>

      <SettingsSection title="EPC Configuration" icon={<Radio  />}>
        <SettingsSelect
          label="EPC Generation Mode"
          value={settings.epcMode}
          onChange={(v) => updateSetting("epcMode", v)}
          options={EPC_MODES.map((m) => ({ value: m.value, label: m.label }))}
          helpText={
            EPC_MODES.find((m) => m.value === settings.epcMode)?.description
          }
        />

        <div
          className={`grid gap-4 ${
            compact ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          <SettingsInput
            label="EPC Prefix"
            value={settings.epcPrefix}
            onChange={(v) => updateSetting("epcPrefix", v)}
            placeholder="PK"
            helpText="2-4 character prefix"
          />
          {settings.epcMode === "sgtin96" && (
            <SettingsInput
              label="GS1 Company Prefix"
              value={settings.companyPrefix}
              onChange={(v) => updateSetting("companyPrefix", v)}
              placeholder="0885000"
              helpText="7-digit company prefix"
            />
          )}
        </div>

        <SettingsToggle
          label="Enable RFID by Default"
          checked={settings.enableRFIDByDefault}
          onChange={(v) => updateSetting("enableRFIDByDefault", v)}
          helpText="Automatically enable RFID encoding for all prints"
        />
      </SettingsSection>

      <SettingsSection
        title="Printer Controls"
        icon={<SlidersHorizontal  />}
      >
        <div className="flex flex-wrap gap-2">
          <Button
            color="primary"
            variant="flat"
            size="sm"
            startContent={actionLoading !== "calibrate" && <Gauge  />}
            onPress={() => handleAction("calibrate", calibrate)}
            isLoading={actionLoading === "calibrate"}
            spinner={<Spinner size="sm" color="current" />}
          >
            Calibrate
          </Button>
          <Button
            color="warning"
            variant="flat"
            size="sm"
            startContent={
              actionLoading !== "cancel" && <StopCircle  />
            }
            onPress={() => handleAction("cancel", cancelAllJobs)}
            isLoading={actionLoading === "cancel"}
            spinner={<Spinner size="sm" color="current" />}
          >
            Cancel Jobs
          </Button>
          <Button
            variant="flat"
            size="sm"
            startContent={actionLoading !== "reset" && <RotateCcw  />}
            onPress={() => handleAction("reset", resetPrinter)}
            isLoading={actionLoading === "reset"}
            spinner={<Spinner size="sm" color="current" />}
          >
            Soft Reset
          </Button>
          <Button
            color="danger"
            variant="flat"
            size="sm"
            startContent={actionLoading !== "fullReset" && <Zap  />}
            onPress={() => handleAction("fullReset", fullReset)}
            isLoading={actionLoading === "fullReset"}
            spinner={<Spinner size="sm" color="current" />}
          >
            Full Reset
          </Button>
        </div>
      </SettingsSection>

      <Accordion variant="bordered" className="px-0">
        <AccordionItem
          key="advanced"
          title={
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Settings  />
              Advanced Settings
            </span>
          }
        >
          <div className="flex flex-col gap-4 pb-2">
            <div
              className={`grid gap-4 ${
                compact ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2"
              }`}
            >
              <SettingsInput
                label="Connection Timeout (ms)"
                type="number"
                value={settings.timeout}
                onChange={(v) => updateSetting("timeout", v)}
                min={1000}
                max={60000}
                step={1000}
              />
              <SettingsInput
                label="Retry Attempts"
                type="number"
                value={settings.retries}
                onChange={(v) => updateSetting("retries", v)}
                min={0}
                max={10}
              />
              <SettingsInput
                label="Print Delay (ms)"
                type="number"
                value={settings.printDelay}
                onChange={(v) => updateSetting("printDelay", v)}
                min={0}
                max={5000}
                step={50}
                helpText="Delay between batch prints"
              />
            </div>

            <Divider />

            <div className="flex flex-col gap-2">
              <SettingsToggle
                label="Auto Calibrate"
                checked={settings.autoCalibrate}
                onChange={(v) => updateSetting("autoCalibrate", v)}
                helpText="Calibrate printer before first print"
              />
              <SettingsToggle
                label="Validate EPC"
                checked={settings.validateEPC}
                onChange={(v) => updateSetting("validateEPC", v)}
                helpText="Validate EPC format before writing"
              />
              <SettingsToggle
                label="Retry on Error"
                checked={settings.retryOnError}
                onChange={(v) => updateSetting("retryOnError", v)}
                helpText="Automatically retry failed prints"
              />
            </div>
          </div>
        </AccordionItem>
      </Accordion>

      {printerStatus && (
        <SettingsSection title="Printer Status" icon={<Activity  />}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Wifi  className="text-foreground/60" />
              <span className="text-foreground/60">Online:</span>
              <Chip
                size="sm"
                color={printerStatus.online ? "success" : "danger"}
                variant="flat"
                startContent={
                  printerStatus.online ? (
                    <CheckCircle  />
                  ) : (
                    <XCircle  />
                  )
                }
              >
                {printerStatus.online ? "Yes" : "No"}
              </Chip>
            </div>
            {printerStatus.parsed && (
              <>
                <div className="flex items-center gap-2">
                  <Pause  className="text-foreground/60" />
                  <span className="text-foreground/60">Paused:</span>
                  <Chip size="sm" variant="flat">
                    {printerStatus.parsed.isPaused ? "Yes" : "No"}
                  </Chip>
                </div>
                <div className="flex items-center gap-2">
                  <FileText  className="text-foreground/60" />
                  <span className="text-foreground/60">Paper:</span>
                  <Chip
                    size="sm"
                    color={printerStatus.parsed.paperOut ? "danger" : "success"}
                    variant="flat"
                    startContent={
                      printerStatus.parsed.paperOut ? (
                        <XCircle  />
                      ) : (
                        <CheckCircle  />
                      )
                    }
                  >
                    {printerStatus.parsed.paperOut ? "Out" : "OK"}
                  </Chip>
                </div>
                <div className="flex items-center gap-2">
                  <Ribbon  className="text-foreground/60" />
                  <span className="text-foreground/60">Ribbon:</span>
                  <Chip
                    size="sm"
                    color={
                      printerStatus.parsed.ribbonOut ? "danger" : "success"
                    }
                    variant="flat"
                    startContent={
                      printerStatus.parsed.ribbonOut ? (
                        <XCircle  />
                      ) : (
                        <CheckCircle  />
                      )
                    }
                  >
                    {printerStatus.parsed.ribbonOut ? "Out" : "OK"}
                  </Chip>
                </div>
              </>
            )}
          </div>
        </SettingsSection>
      )}

      <Divider />
      <div className="flex items-center justify-between">
        <Button
          variant="flat"
          size="md"
          startContent={<Undo  />}
          onPress={reset}
        >
          Reset to Defaults
        </Button>

        <div className="flex items-center gap-2">
          {saveStatus === "saved" && (
            <Chip
              color="success"
              size="sm"
              variant="flat"
              startContent={<Check  />}
            >
              Saved
            </Chip>
          )}
          {saveStatus === "error" && (
            <Chip
              color="danger"
              size="sm"
              variant="flat"
              startContent={<X  />}
            >
              Save failed
            </Chip>
          )}
          {onSave && (
            <Button
              color="primary"
              variant="shadow"
              size="md"
              startContent={saveStatus !== "saving" && <Save  />}
              onPress={handleSave}
              isLoading={saveStatus === "saving"}
              spinner={<Spinner size="sm" color="current" />}
            >
              Save Settings
            </Button>
          )}
        </div>
      </div>
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

  const connectionStatus = printerLoading
    ? "checking"
    : isConnected
    ? "connected"
    : "disconnected";

  return (
    <Card className={className} shadow="sm" radius="lg">
      <CardBody className="gap-4">
        <div className="flex items-center gap-4">
          <StatusIndicator status={connectionStatus} />
        </div>

        {printerError && (
          <Card className="bg-danger/10" shadow="none">
            <CardBody>
              <p className="text-sm text-danger flex items-center gap-2">
                <AlertTriangle  />
                {printerError}
              </p>
            </CardBody>
          </Card>
        )}

        <div className="flex gap-2">
          <Input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="IP Address"
            variant="bordered"
            size="md"
            radius="sm"
            className="flex-1"
            startContent={<Wifi  className="text-foreground/50" />}
          />
          <Input
            type="number"
            value={String(port)}
            onChange={(e) => setPort(parseInt(e.target.value) || 9100)}
            placeholder="Port"
            variant="bordered"
            size="md"
            radius="sm"
            className="w-28"
            startContent={<Hash  className="text-foreground/50" />}
          />
          <Button
            color="primary"
            variant="shadow"
            size="md"
            onPress={handleConnect}
            isLoading={printerLoading}
            spinner={<Spinner size="sm" color="current" />}
            startContent={!printerLoading && <Plug  />}
          >
            Connect
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

export { PRINT_TYPES, PRINT_TYPE_OPTIONS };
