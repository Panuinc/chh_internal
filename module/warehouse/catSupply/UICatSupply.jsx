"use client";

import React, { useMemo, useCallback, useState } from "react";
import { DataTable, Loading } from "@/components";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
} from "@heroui/react";
import { Printer, RefreshCw, Settings } from "lucide-react";
import {
  PrinterStatusBadge,
  PrinterSettings,
  PrintQuantityDialog,
} from "@/components/chainWay";
import { useRFIDSafe } from "@/hooks";
import { PRINT_TYPE_OPTIONS, STATUS_COLORS } from "@/lib/chainWay/config";

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

export default function UICatSupply({
  items = [],
  loading,
  onPrintWithQuantity,
  printing = false,
  onRefresh,
}) {
  const {
    isOpen: isSettingsOpen,
    onOpen: openSettings,
    onClose: closeSettings,
  } = useDisclosure();

  const {
    isOpen: isPrintDialogOpen,
    onOpen: openPrintDialog,
    onClose: closePrintDialog,
  } = useDisclosure();

  const { isConnected } = useRFIDSafe();

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedPrintType, setSelectedPrintType] = useState("thai-rfid");

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
            inventoryDisplay: item.inventory?.toLocaleString("th-TH") || "0",
          }))
        : [],
    [items],
  );

  const handleOpenPrintDialog = useCallback(
    (item, printType) => {
      setSelectedItem(item);
      setSelectedPrintType(printType);
      openPrintDialog();
    },
    [openPrintDialog],
  );

  const handlePrint = useCallback(
    async (item, quantity, options) => {
      if (onPrintWithQuantity) {
        try {
          await onPrintWithQuantity(item, quantity, options);
          closePrintDialog();
        } catch (error) {
          console.error("Print error:", error);
        }
      }
    },
    [onPrintWithQuantity, closePrintDialog],
  );

  const renderCustomCell = useCallback(
    (item, columnKey) => {
      if (columnKey === "inventory") {
        return (
          <span
            className={
              item.inventory > 0 ? "text-success" : "text-foreground/50"
            }
          >
            {item.inventoryDisplay}
          </span>
        );
      }

      if (columnKey !== "actions") return undefined;

      return (
        <div className="flex items-center justify-center gap-1">
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="light"
                size="md"
                isDisabled={printing || !isConnected}
              >
                <Printer
                  className={isConnected ? "text-success" : "text-danger"}
                />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Print options">
              {PRINT_TYPE_OPTIONS.map((opt) => (
                <DropdownItem
                  key={opt.key}
                  onPress={() => handleOpenPrintDialog(item, opt.key)}
                >
                  {opt.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      );
    },
    [handleOpenPrintDialog, isConnected, printing],
  );

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full overflow-hidden">
      <div className="xl:flex flex-col items-center justify-start w-full xl:w-[20%] h-full gap-2 border-1 border-default overflow-auto hidden">
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-2 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <span className="font-medium">Printer</span>
            <Button
              isIconOnly
              variant="light"
              size="md"
              onPress={openSettings}
              title="Printer Settings"
            >
              <Settings />
            </Button>
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <PrinterStatusBadge />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-2 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Total Items
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {total}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-2 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Active Items
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-green-600">
            {active}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-2 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Blocked Items
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-danger">
            {blocked}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-2 border-default">
          <Button
            variant="light"
            size="md"
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
              size="md"
              onPress={openSettings}
              title="Printer Settings"
            >
              <Settings />
            </Button>
            <Button
              isIconOnly
              variant="light"
              size="md"
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
            statusColorMap={STATUS_COLORS}
            searchPlaceholder="Search item number or name"
            emptyContent="No items found"
            itemName="items"
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
          <ModalBody className="py-6">
            <PrinterSettings
              onClose={closeSettings}
              showHeader={true}
              title="ควบคุมเครื่องพิมพ์"
              subtitle="ChainWay RFID Printer"
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <PrintQuantityDialog
        isOpen={isPrintDialogOpen}
        onClose={closePrintDialog}
        item={selectedItem}
        onPrint={handlePrint}
        printing={printing}
        printType={selectedPrintType}
      />
    </div>
  );
}
