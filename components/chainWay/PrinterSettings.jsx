"use client";

import React, { useState, useCallback } from "react";
import { useRFIDSafe, usePrinterSettings, useLabelPresets } from "@/hooks";
import {
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
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(
            type === "number" ? parseFloat(e.target.value) || 0 : e.target.value
          )
        }
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 border rounded-lg bg-background text-foreground 
          focus:ring-2 focus:ring-primary focus:border-primary
          disabled:bg-default disabled:cursor-not-allowed"
      />
      {helpText && (
        <span className="text-xs text-foreground/60">{helpText}</span>
      )}
    </div>
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
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border rounded-lg bg-background text-foreground 
          focus:ring-2 focus:ring-primary focus:border-primary
          disabled:bg-default disabled:cursor-not-allowed"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helpText && (
        <span className="text-xs text-foreground/60">{helpText}</span>
      )}
    </div>
  );
}

function SettingsToggle({ label, checked, onChange, disabled, helpText }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {helpText && (
          <span className="text-xs text-foreground/60">{helpText}</span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${checked ? "bg-primary" : "bg-default"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}

function SettingsSection({ title, children, icon }) {
  return (
    <div className="border rounded-xl p-4 bg-background">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h4>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ActionButton({
  onClick,
  disabled,
  loading,
  variant = "default",
  children,
  icon,
}) {
  const variants = {
    default: "bg-default hover:bg-default/80 text-foreground",
    primary: "bg-primary hover:bg-primary/90 text-white",
    success: "bg-success hover:bg-success/90 text-white",
    warning: "bg-warning hover:bg-warning/90 text-white",
    danger: "bg-danger hover:bg-danger/90 text-white",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
    >
      {loading ? (
        <span className="animate-spin">⏳</span>
      ) : icon ? (
        <span>{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

function StatusIndicator({ status, message }) {
  const statusConfig = {
    connected: { color: "bg-success", text: "Connected" },
    disconnected: { color: "bg-danger", text: "Disconnected" },
    checking: { color: "bg-warning", text: "Checking..." },
    error: { color: "bg-danger", text: "Error" },
  };

  const config = statusConfig[status] || statusConfig.disconnected;

  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-3 h-3 rounded-full ${config.color} ${
          status === "connected" ? "animate-pulse" : ""
        }`}
      />
      <span className="text-sm font-medium">{message || config.text}</span>
    </div>
  );
}

export function PrinterSettings({
  onSave,
  showAdvanced = false,
  compact = false,
  className = "",
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

  const { settings, updateSetting, updateSettings, save, reset, saving } =
    usePrinterSettings();

  const { presets, selectPreset, isCustom } = useLabelPresets();

  const [actionLoading, setActionLoading] = useState(null);
  const [showAdvancedSettings, setShowAdvancedSettings] =
    useState(showAdvanced);
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
      return true;
    } catch (error) {
      console.error(`[PrinterSettings] ${actionName} failed:`, error);
      return false;
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
    } catch (error) {
      console.error("[PrinterSettings] Save failed:", error);
      setSaveStatus("error");
    }
  }, [save, onSave, settings]);

  const connectionStatus = printerLoading
    ? "checking"
    : isConnected
    ? "connected"
    : "disconnected";

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Printer Settings</h3>
        <StatusIndicator status={connectionStatus} />
      </div>

      {printerError && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
          ⚠️ {printerError}
        </div>
      )}

      <SettingsSection title="Connection" icon="🔌">
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
          <ActionButton
            onClick={() => handleAction("test", testConnection)}
            loading={actionLoading === "test"}
            variant="primary"
            icon="🔍"
          >
            Test Connection
          </ActionButton>
          <ActionButton
            onClick={() => handleAction("refresh", refreshPrinter)}
            loading={actionLoading === "refresh"}
            icon="🔄"
          >
            Refresh Status
          </ActionButton>
        </div>
      </SettingsSection>

      <SettingsSection title="Label Configuration" icon="🏷️">
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

      <SettingsSection title="EPC Configuration" icon="📡">
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

      <SettingsSection title="Printer Controls" icon="🎛️">
        <div className="flex flex-wrap gap-2">
          <ActionButton
            onClick={() => handleAction("calibrate", calibrate)}
            loading={actionLoading === "calibrate"}
            variant="primary"
            icon="📏"
          >
            Calibrate
          </ActionButton>
          <ActionButton
            onClick={() => handleAction("cancel", cancelAllJobs)}
            loading={actionLoading === "cancel"}
            variant="warning"
            icon="⏹️"
          >
            Cancel Jobs
          </ActionButton>
          <ActionButton
            onClick={() => handleAction("reset", resetPrinter)}
            loading={actionLoading === "reset"}
            icon="🔃"
          >
            Soft Reset
          </ActionButton>
          <ActionButton
            onClick={() => handleAction("fullReset", fullReset)}
            loading={actionLoading === "fullReset"}
            variant="danger"
            icon="⚡"
          >
            Full Reset
          </ActionButton>
        </div>
      </SettingsSection>

      <div className="border rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          className="w-full px-4 py-3 flex items-center justify-between bg-background hover:bg-default/50 transition-colors"
        >
          <span className="text-sm font-semibold flex items-center gap-2">
            ⚙️ Advanced Settings
          </span>
          <span
            className={`transition-transform ${
              showAdvancedSettings ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>

        {showAdvancedSettings && (
          <div className="p-4 border-t space-y-4">
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

            <div className="space-y-3">
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
        )}
      </div>

      {printerStatus && (
        <SettingsSection title="Printer Status" icon="📊">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-foreground/60">Online:</span>
              <span
                className={`ml-2 ${
                  printerStatus.online ? "text-success" : "text-danger"
                }`}
              >
                {printerStatus.online ? "Yes" : "No"}
              </span>
            </div>
            {printerStatus.parsed && (
              <>
                <div>
                  <span className="text-foreground/60">Paused:</span>
                  <span className="ml-2">
                    {printerStatus.parsed.isPaused ? "Yes" : "No"}
                  </span>
                </div>
                <div>
                  <span className="text-foreground/60">Paper:</span>
                  <span
                    className={`ml-2 ${
                      printerStatus.parsed.paperOut
                        ? "text-danger"
                        : "text-success"
                    }`}
                  >
                    {printerStatus.parsed.paperOut ? "Out" : "OK"}
                  </span>
                </div>
                <div>
                  <span className="text-foreground/60">Ribbon:</span>
                  <span
                    className={`ml-2 ${
                      printerStatus.parsed.ribbonOut
                        ? "text-danger"
                        : "text-success"
                    }`}
                  >
                    {printerStatus.parsed.ribbonOut ? "Out" : "OK"}
                  </span>
                </div>
              </>
            )}
          </div>
        </SettingsSection>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <ActionButton onClick={reset} variant="default" icon="↩️">
          Reset to Defaults
        </ActionButton>

        <div className="flex items-center gap-2">
          {saveStatus === "saved" && (
            <span className="text-sm text-success">✓ Saved</span>
          )}
          {saveStatus === "error" && (
            <span className="text-sm text-danger">✕ Save failed</span>
          )}
          {onSave && (
            <ActionButton
              onClick={handleSave}
              loading={saveStatus === "saving"}
              variant="primary"
              icon="💾"
            >
              Save Settings
            </ActionButton>
          )}
        </div>
      </div>
    </div>
  );
}

export function PrinterSettingsCompact(props) {
  return <PrinterSettings {...props} compact showAdvanced={false} />;
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
    <div className={`p-4 border rounded-xl ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <StatusIndicator status={connectionStatus} />
      </div>

      {printerError && (
        <div className="mb-4 p-2 bg-danger/10 text-danger text-sm rounded">
          {printerError}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="IP Address"
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
        />
        <input
          type="number"
          value={port}
          onChange={(e) => setPort(parseInt(e.target.value) || 9100)}
          placeholder="Port"
          className="w-20 px-3 py-2 border rounded-lg text-sm"
        />
        <ActionButton
          onClick={handleConnect}
          loading={printerLoading}
          variant="primary"
        >
          Connect
        </ActionButton>
      </div>
    </div>
  );
}

export default PrinterSettings;
