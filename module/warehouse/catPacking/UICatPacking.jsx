"use client";

/**
 * UICatPacking - Option C
 * ใช้ PrinterSettings (Modal) - กดปุ่ม Settings เปิด Modal ควบคุมเครื่องพิมพ์
 * ไม่มี multi-select
 */

import React, { useMemo, useCallback } from "react";
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
import { PrinterStatusBadge, PrinterSettings } from "@/components/chainWay";
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

export default function UICatPacking({
  items = [],
  loading,
  onPrintSingle,
  printing = false,
  onRefresh,
}) {
  const {
    isOpen: isSettingsOpen,
    onOpen: openSettings,
    onClose: closeSettings,
  } = useDisclosure();

  const { isConnected } = useRFIDSafe();

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
    [items],
  );

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
                  onPress={() =>
                    onPrintSingle(item, {
                      type: opt.key,
                      enableRFID: opt.hasRFID,
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
    [onPrintSingle, isConnected, printing],
  );

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full gap-2 overflow-hidden">
      {/* Sidebar */}
      <div className="hidden xl:flex flex-col items-center justify-start w-full xl:w-[20%] h-full gap-2 overflow-auto">
        {/* Printer Status + Settings Button */}
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
              <Settings />
            </Button>
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <PrinterStatusBadge />
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

      {/* Main Content */}
      <div className="flex flex-col items-center justify-start w-full xl:w-[80%] h-full gap-2 overflow-hidden">
        {/* Mobile Header */}
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
            statusColorMap={STATUS_COLORS}
            searchPlaceholder="Search item number or name"
            emptyContent="No items found"
            itemName="items"
            renderCustomCell={renderCustomCell}
          />
        )}
      </div>

      {/* Settings Modal */}
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
    </div>
  );
}