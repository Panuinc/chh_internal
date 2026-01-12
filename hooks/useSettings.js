"use client";

import { useState, useCallback, useEffect } from "react";
import {
  STORAGE_KEYS,
  PRINTER_CONFIG,
  DEFAULT_LABEL_SIZE,
  EPC_CONFIG,
  getDefaultLabelPreset,
} from "@/lib/chainWay/config";

const getDefaultSettings = () => ({
  host: PRINTER_CONFIG.host,
  port: PRINTER_CONFIG.port,
  timeout: PRINTER_CONFIG.timeout,
  retries: PRINTER_CONFIG.retries,

  labelWidth: DEFAULT_LABEL_SIZE.width,
  labelHeight: DEFAULT_LABEL_SIZE.height,
  labelPreset: getDefaultLabelPreset().name,

  epcMode: EPC_CONFIG.mode,
  epcPrefix: EPC_CONFIG.prefix,
  companyPrefix: EPC_CONFIG.companyPrefix,

  defaultQuantity: 1,
  printDelay: 100,
  autoCalibrate: false,

  enableRFIDByDefault: false,
  validateEPC: true,
  retryOnError: true,
});

function loadFromStorage(key = STORAGE_KEYS.printerSettings) {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("[useSettings] Load error:", error);
    return null;
  }
}

function saveToStorage(config, key = STORAGE_KEYS.printerSettings) {
  if (typeof window === "undefined") return false;

  try {
    localStorage.setItem(key, JSON.stringify(config));
    return true;
  } catch (error) {
    console.error("[useSettings] Save error:", error);
    return false;
  }
}

export function usePrinterSettings(options = {}) {
  const { autoLoad = true, storageKey = STORAGE_KEYS.printerSettings } =
    options;

  const [settings, setSettings] = useState(getDefaultSettings);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!autoLoad) return;

    const stored = loadFromStorage(storageKey);
    if (stored) {
      setSettings((prev) => ({ ...prev, ...stored }));
    }
    setLoaded(true);
  }, [autoLoad, storageKey]);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateSettings = useCallback((updates) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      const success = saveToStorage(settings, storageKey);
      if (!success) {
        throw new Error("Failed to save settings");
      }
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [settings, storageKey]);

  const reset = useCallback(() => {
    const defaults = getDefaultSettings();
    setSettings(defaults);
    saveToStorage(defaults, storageKey);
  }, [storageKey]);

  const getPrinterConfig = useCallback(
    () => ({
      host: settings.host,
      port: settings.port,
      timeout: settings.timeout,
      retries: settings.retries,
    }),
    [settings]
  );

  const getLabelSize = useCallback(
    () => ({
      width: settings.labelWidth,
      height: settings.labelHeight,
    }),
    [settings]
  );

  const getEPCConfig = useCallback(
    () => ({
      mode: settings.epcMode,
      prefix: settings.epcPrefix,
      companyPrefix: settings.companyPrefix,
    }),
    [settings]
  );

  const getPrintOptions = useCallback(
    () => ({
      quantity: settings.defaultQuantity,
      delay: settings.printDelay,
      enableRFID: settings.enableRFIDByDefault,
      labelSize: getLabelSize(),
      epcMode: settings.epcMode,
      epcPrefix: settings.epcPrefix,
    }),
    [settings, getLabelSize]
  );

  return {
    settings,
    loaded,
    saving,
    error,

    updateSetting,
    updateSettings,
    save,
    reset,

    getPrinterConfig,
    getLabelSize,
    getEPCConfig,
    getPrintOptions,
  };
}

export function useLabelPresets() {
  const { LABEL_PRESETS } = require("@/lib/chainWay/config");

  const [currentPreset, setCurrentPreset] = useState(
    () => LABEL_PRESETS.find((p) => p.isDefault) || LABEL_PRESETS[0]
  );

  const [customSize, setCustomSize] = useState({ width: 100, height: 30 });

  const selectPreset = useCallback((presetName) => {
    const preset = LABEL_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setCurrentPreset(preset);
      if (preset.width && preset.height) {
        setCustomSize({ width: preset.width, height: preset.height });
      }
    }
  }, []);

  const setCustomDimensions = useCallback((width, height) => {
    setCustomSize({ width, height });
    setCurrentPreset(LABEL_PRESETS.find((p) => p.name === "Custom"));
  }, []);

  const getCurrentSize = useCallback(() => {
    if (currentPreset.name === "Custom") {
      return customSize;
    }
    return { width: currentPreset.width, height: currentPreset.height };
  }, [currentPreset, customSize]);

  return {
    presets: LABEL_PRESETS,
    currentPreset,
    customSize,
    selectPreset,
    setCustomDimensions,
    getCurrentSize,
    isCustom: currentPreset.name === "Custom",
  };
}

export default {
  usePrinterSettings,
  useLabelPresets,
};
