"use client";
import React, { useMemo, useCallback, useState } from "react";
import { DataTable } from "@/components";
import { Loading } from "@/components";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@heroui/react";
import { Printer, RefreshCw, Settings } from "lucide-react";
import { PrinterStatusBadge, PrinterSettings } from "@/components/rfid";

const columns = [
  { name: "#", uid: "index", width: 60 },
  { name: "Item No.", uid: "number" },
  { name: "Display Name", uid: "displayName" },
  { name: "Category", uid: "itemCategoryCode" },
  { name: "Unit", uid: "unitOfMeasureCode" },
  { name: "Unit Price", uid: "unitPrice" },
  { name: "Inventory", uid: "inventory" },
  { name: "Status", uid: "status" },
  { name: "Actions", uid: "actions", width: 100 },
];

const statusOptions = [
  { name: "Active", uid: "Active" },
  { name: "Blocked", uid: "Blocked" },
];

const statusColorMap = {
  Active: "success",
  Blocked: "danger",
};

const printOptions = [
  {
    key: "thai-qr",
    label: "1. ภาษาไทย + QR Code",
    type: "thai-qr",
    enableRFID: false,
  },
  {
    key: "thai-barcode",
    label: "2. ภาษาไทย + Barcode",
    type: "thai",
    enableRFID: false,
  },
  {
    key: "thai-rfid",
    label: "3. ภาษาไทย + RFID",
    type: "thai-rfid",
    enableRFID: true,
  },
];

const SETTINGS_STORAGE_KEY = "rfid-printer-settings";

function loadSettings() {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveSettings(config) {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}

export default function UICatPacking({
  items = [],
  loading,
  onPrintSingle,
  onPrintMultiple,
  printerConnected = false,
  printing = false,
  onRefresh,
}) {
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));

  const {
    isOpen: isSettingsOpen,
    onOpen: openSettings,
    onClose: closeSettings,
  } = useDisclosure();

  const total = items.length;
  const active = items.filter((i) => !i.blocked).length;
  const blocked = items.filter((i) => i.blocked).length;

  const normalized = useMemo(
    () =>
      Array.isArray(items)
        ? items.map((item, i) => ({
            ...item,
            id: item.id,
            index: i + 1,
            status: item.blocked ? "Blocked" : "Active",
            unitPrice:
              item.unitPrice?.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00",
            inventory: item.inventory?.toLocaleString("th-TH") || "0",
          }))
        : [],
    [items]
  );

  const getSelectedItems = useCallback(() => {
    if (selectedKeys === "all") return normalized;
    return normalized.filter((i) => selectedKeys.has(i.id));
  }, [selectedKeys, normalized]);

  const handlePrintSelected = useCallback(() => {
    const selected = getSelectedItems();
    if (selected.length > 0) onPrintMultiple?.(selected);
  }, [getSelectedItems, onPrintMultiple]);

  const handleSaveSettings = useCallback(async (config) => {
    const success = saveSettings(config);
    if (!success) throw new Error("Failed to save settings");
    return success;
  }, []);

  const renderCustomCell = useCallback(
    (item, columnKey) => {
      if (columnKey !== "actions") return undefined;
      return (
        <div className="flex items-center justify-center gap-1">
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                isDisabled={printing || !printerConnected}
              >
                <Printer
                  size={18}
                  className={printerConnected ? "text-success" : "text-danger"}
                />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Print options">
              {printOptions.map((opt) => (
                <DropdownItem
                  key={opt.key}
                  onPress={() =>
                    onPrintSingle(item, {
                      type: opt.type,
                      enableRFID: opt.enableRFID,
                    })
                  }
                >
                  {opt.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      );
    },
    [onPrintSingle, printerConnected, printing]
  );

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full gap-2 overflow-hidden">
      <div className="xl:flex flex-col items-center justify-start w-full xl:w-[20%] h-full gap-2 overflow-auto hidden">
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-between w-full px-2">
            <span className="font-medium">Printer</span>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={openSettings}
              title="Printer Settings"
            >
              <Settings size={16} />
            </Button>
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <PrinterStatusBadge showControls />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Total Items
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {total}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Active Items
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-green-600">
            {active}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Blocked Items
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-danger">
            {blocked}
          </div>
        </div>

        {selectedKeys !== "all" && selectedKeys.size > 0 && (
          <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
            <div className="flex items-center justify-center w-full h-full p-2 gap-2">
              Selected ({selectedKeys.size})
            </div>
            <div className="flex items-center justify-center w-full h-full p-2 gap-2">
              <Button
                size="sm"
                color="primary"
                className="w-full"
                isDisabled={!printerConnected || printing}
                onPress={handlePrintSelected}
              >
                {printing ? "กำลังพิมพ์..." : "พิมพ์ที่เลือก"}
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <Button
            variant="light"
            size="sm"
            onPress={onRefresh}
            isDisabled={loading}
            className="w-full"
          >
            <RefreshCw className={loading ? "animate-spin" : ""} />
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-start w-full xl:w-[80%] h-full gap-2 overflow-hidden">
        <div className="flex xl:hidden items-center justify-between w-full p-2">
          <PrinterStatusBadge />
          <div className="flex gap-2">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={openSettings}
              title="Printer Settings"
            >
              <Settings />
            </Button>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={onRefresh}
              isDisabled={loading}
            >
              <RefreshCw className={loading ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center w-full h-full gap-2">
            <Loading />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={normalized}
            statusOptions={statusOptions}
            statusColorMap={statusColorMap}
            searchPlaceholder="Search item number or name"
            emptyContent="No items found"
            itemName="items"
            selectionMode="multiple"
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            renderCustomCell={renderCustomCell}
          />
        )}
      </div>

      <Modal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col items-center justify-center w-full h-full p-2 gap-2">
            <h3 className="text-lg font-semibold">Printer Settings</h3>
            <p className="text-sm text-foreground/60">
              Configure printer connection and label settings
            </p>
          </ModalHeader>
          <ModalBody className="pb-6">
            <PrinterSettings
              initialConfig={loadSettings()}
              onSave={handleSaveSettings}
              showAdvanced={false}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
