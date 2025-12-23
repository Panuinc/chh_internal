/**
 * UICatPacking Component
 * แสดงตาราง Category Packing Items พร้อมปุ่มพิมพ์
 */

"use client";

import React, { useMemo, useCallback, useState } from "react";
import { DataTable, Loading } from "@/components";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Printer, MoreVertical, RefreshCw } from "lucide-react";
import { PrinterStatusBadge } from "@/components/rfid/RFIDPrintButton";

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

  // คำนวณ stats
  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((item) => !item.blocked).length;
    const blocked = items.filter((item) => item.blocked).length;
    return { total, active, blocked };
  }, [items]);

  // Normalize data
  const normalized = useMemo(() => {
    return Array.isArray(items)
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
      : [];
  }, [items]);

  // Get selected items
  const getSelectedItems = useCallback(() => {
    if (selectedKeys === "all") return normalized;
    return normalized.filter((item) => selectedKeys.has(item.id));
  }, [selectedKeys, normalized]);

  // Render cell
  const renderCustomCell = useCallback(
    (item, columnKey) => {
      if (columnKey === "actions") {
        return (
          <div className="flex items-center justify-center gap-1">
            {onPrintSingle && printerConnected && (
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly variant="light" size="sm" isDisabled={printing}>
                    <Printer size={18} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Print options">
                  <DropdownItem
                    key="barcode"
                    onPress={() => onPrintSingle(item, { type: "barcode" })}
                  >
                    พิมพ์ Barcode
                  </DropdownItem>
                  <DropdownItem
                    key="barcode-rfid"
                    onPress={() => onPrintSingle(item, { type: "barcode", enableRFID: true })}
                  >
                    พิมพ์ Barcode + RFID
                  </DropdownItem>
                  <DropdownItem
                    key="qr"
                    onPress={() => onPrintSingle(item, { type: "qr" })}
                  >
                    พิมพ์ QR Code
                  </DropdownItem>
                  <DropdownItem
                    key="qr-rfid"
                    onPress={() => onPrintSingle(item, { type: "qr", enableRFID: true })}
                  >
                    พิมพ์ QR Code + RFID
                  </DropdownItem>
                  <DropdownItem
                    key="thai"
                    onPress={() => onPrintSingle(item, { type: "thai" })}
                  >
                    พิมพ์ภาษาไทย
                  </DropdownItem>
                  <DropdownItem
                    key="thai-rfid"
                    onPress={() => onPrintSingle(item, { type: "thai", enableRFID: true })}
                  >
                    พิมพ์ภาษาไทย + RFID
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}
          </div>
        );
      }
      return undefined;
    },
    [onPrintSingle, printerConnected, printing]
  );

  // Handle print selected
  const handlePrintSelected = () => {
    const selected = getSelectedItems();
    if (selected.length > 0) {
      onPrintMultiple?.(selected);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row items-start justify-center w-full h-full gap-4 overflow-hidden p-4">
      {/* Sidebar */}
      <div className="hidden xl:flex flex-col w-[280px] gap-4">
        {/* Printer Status */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="text-sm font-semibold mb-3">RFID Printer</h3>
          <PrinterStatusBadge />
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
          <h3 className="text-sm font-semibold">สถิติ</h3>
          <div className="flex justify-between">
            <span className="text-gray-600">ทั้งหมด</span>
            <span className="font-semibold">{stats.total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Active</span>
            <span className="font-semibold text-green-600">{stats.active}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Blocked</span>
            <span className="font-semibold text-red-600">{stats.blocked}</span>
          </div>
        </div>

        {/* Selected Actions */}
        {selectedKeys !== "all" && selectedKeys.size > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="text-sm font-semibold mb-3">
              เลือก {selectedKeys.size} รายการ
            </h3>
            <Button
              color="primary"
              size="sm"
              className="w-full"
              isDisabled={!printerConnected || printing}
              onPress={handlePrintSelected}
            >
              <Printer size={16} className="mr-2" />
              พิมพ์ที่เลือก
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Category Packing Items</h1>
          <Button
            variant="light"
            size="sm"
            onPress={onRefresh}
            isDisabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loading />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={normalized}
            statusOptions={statusOptions}
            statusColorMap={statusColorMap}
            searchPlaceholder="ค้นหา Item number หรือชื่อ..."
            emptyContent="ไม่พบรายการ"
            itemName="items"
            renderCustomCell={renderCustomCell}
            selectionMode="multiple"
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
          />
        )}
      </div>
    </div>
  );
}