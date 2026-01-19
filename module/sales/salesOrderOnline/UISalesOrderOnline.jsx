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
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
} from "@heroui/react";
import {
  Printer,
  RefreshCw,
  Settings,
  Eye,
  Package,
  User,
  Calendar,
  MapPin,
} from "lucide-react";
import { PrinterStatusBadge, PrinterSettings } from "@/components/chainWay";
import { useRFIDSafe, usePrinterSettings } from "@/hooks";
import { PRINT_TYPE_OPTIONS, STATUS_COLORS } from "@/lib/chainWay/config";
import { FileText } from "lucide-react";
import PackingSlipPreviewModal from "./PackingSlipPreviewModal";

const PRINT_OPTIONS = [
  { key: "packingSlip", label: "ใบปะหน้า (Packing Slip)", icon: FileText },
  ...PRINT_TYPE_OPTIONS,
];

const columns = [
  { name: "#", uid: "index", width: 60 },
  { name: "SO Number", uid: "number" },
  { name: "Customer", uid: "customerName" },
  { name: "Order Date", uid: "orderDateFormatted" },
  { name: "Delivery Date", uid: "deliveryDateFormatted" },
  { name: "Items", uid: "lineCount", width: 80 },
  { name: "Qty", uid: "totalQuantity", width: 80 },
  { name: "Total", uid: "totalFormatted" },
  { name: "Status", uid: "status" },
  { name: "Actions", uid: "actions", width: 120 },
];

const statusOptions = [
  { name: "Draft", uid: "Draft" },
  { name: "Open", uid: "Open" },
  { name: "Released", uid: "Released" },
  { name: "Pending Approval", uid: "Pending Approval" },
];

const statusColorMap = {
  Draft: "default",
  Open: "primary",
  Released: "success",
  "Pending Approval": "warning",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatDate(dateStr) {
  if (!dateStr || dateStr === "0001-01-01") return "-";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const orderLineColumns = [
  { name: "#", uid: "index", width: 50 },
  { name: "Item No.", uid: "itemNumber" },
  { name: "Description", uid: "description" },
  { name: "Unit", uid: "unitOfMeasureCode", width: 80 },
  { name: "Qty", uid: "quantity", width: 80 },
  { name: "Unit Price", uid: "unitPriceFormatted", width: 120 },
  { name: "Amount", uid: "amountFormatted", width: 120 },
  { name: "Ship Date", uid: "shipDateFormatted", width: 120 },
];

function OrderLinesTable({ lines }) {
  const itemLines = lines?.filter((l) => l.lineType === "Item") || [];
  const commentLines = lines?.filter((l) => l.lineType === "Comment") || [];

  const normalizedLines = useMemo(
    () =>
      itemLines.map((line, i) => ({
        ...line,
        index: i + 1,
        unitPriceFormatted: formatCurrency(line.unitPrice),
        amountFormatted: formatCurrency(line.amountIncludingTax),
        shipDateFormatted: formatDate(line.shipmentDate),
      })),
    [itemLines]
  );

  const renderLineCell = useCallback((item, columnKey) => {
    if (columnKey === "itemNumber") {
      return <span className="font-mono text-sm">{item.itemNumber}</span>;
    }

    if (columnKey === "description") {
      return (
        <div className="flex flex-col">
          <span>{item.description}</span>
          {item.description2 && (
            <span className="text-xs text-foreground/60">
              {item.description2}
            </span>
          )}
        </div>
      );
    }

    return undefined;
  }, []);

  return (
    <div className="space-y-4">
      <DataTable
        columns={orderLineColumns}
        data={normalizedLines}
        searchPlaceholder="Search item..."
        emptyContent="No items"
        itemName="items"
        renderCustomCell={renderLineCell}
      />

      {commentLines.length > 0 && (
        <div className="border-t pt-3">
          <p className="text-sm font-medium mb-2">หมายเหตุ:</p>
          {commentLines.map((line) => (
            <p key={line.id} className="text-sm text-foreground/70">
              {line.description} {line.description2}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderDetailModal({ isOpen, onClose, order, onPrint, onOpenPreview, isConnected, printing }) {
  if (!order) return null;

  const lines = order.salesOrderLines || [];
  const lineCount = lines.filter((l) => l.lineType === "Item").length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">
            Sales Order: {order.number}
          </h3>
          <div className="flex items-center gap-2">
            <Chip
              color={statusColorMap[order.status] || "default"}
              size="sm"
              variant="flat"
            >
              {order.status}
            </Chip>
            {order.externalDocumentNumber && (
              <span className="text-sm text-foreground/60">
                Ref: {order.externalDocumentNumber}
              </span>
            )}
          </div>
        </ModalHeader>

        <ModalBody className="gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <User className="text-foreground/50 mt-1"  />
              <div>
                <p className="text-xs text-foreground/60">Customer</p>
                <p className="font-medium">{order.customerName}</p>
                <p className="text-sm text-foreground/70">
                  {order.customerNumber}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="text-foreground/50 mt-1"  />
              <div>
                <p className="text-xs text-foreground/60">Dates</p>
                <p className="text-sm">
                  Order: {formatDate(order.orderDate)}
                </p>
                <p className="text-sm">
                  Delivery: {formatDate(order.requestedDeliveryDate)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="text-foreground/50 mt-1"  />
              <div>
                <p className="text-xs text-foreground/60">Ship To</p>
                <p className="text-sm">{order.shipToName}</p>
                <p className="text-sm text-foreground/70">
                  {order.shipToAddressLine1}
                </p>
                {order.shipToCity && (
                  <p className="text-sm text-foreground/70">
                    {order.shipToCity} {order.shipToPostCode}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Package  className="text-foreground/50" />
              <span className="font-medium">
                Order Lines ({lineCount} items)
              </span>
            </div>
            <OrderLinesTable lines={lines} />
          </div>

          <div className="flex justify-end border-t pt-4">
            <div className="text-right space-y-1">
              <p className="text-sm">
                Subtotal:{" "}
                <span className="font-medium">
                  {formatCurrency(order.totalAmountExcludingTax)}
                </span>
              </p>
              <p className="text-sm">
                VAT:{" "}
                <span className="font-medium">
                  {formatCurrency(order.totalTaxAmount)}
                </span>
              </p>
              <p className="text-lg font-bold text-primary">
                Total: {formatCurrency(order.totalAmountIncludingTax)}{" "}
                {order.currencyCode}
              </p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Close
          </Button>
          <Dropdown>
            <DropdownTrigger>
              <Button
                color="primary"
                startContent={<Printer  />}
                isDisabled={printing || !isConnected || lineCount === 0}
              >
                Print Labels
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Print options">
              {PRINT_OPTIONS.map((opt) => (
                <DropdownItem
                  key={opt.key}
                  onPress={() => {
                    if (opt.key === "packingSlip") {
                      onClose();
                      onOpenPreview(order);
                    } else {
                      onPrint(order, {
                        type: opt.key,
                        enableRFID: opt.hasRFID || false,
                      });
                    }
                  }}
                >
                  {opt.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function UISalesOrderOnline({
  orders = [],
  loading,
  onPrintSingle,
  onPrintMultiple,
  printerConnected = false,
  printing = false,
  onRefresh,
}) {
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [selectedOrder, setSelectedOrder] = useState(null);

  const {
    isOpen: isSettingsOpen,
    onOpen: openSettings,
    onClose: closeSettings,
  } = useDisclosure();

  const {
    isOpen: isDetailOpen,
    onOpen: openDetail,
    onClose: closeDetail,
  } = useDisclosure();

  const {
    isOpen: isPreviewOpen,
    onOpen: openPreview,
    onClose: closePreview,
  } = useDisclosure();

  const [previewOrder, setPreviewOrder] = useState(null);

  const { isConnected } = useRFIDSafe();
  const { save: saveSettings } = usePrinterSettings();

  const total = orders.length;
  const draft = orders.filter((o) => o.status === "Draft").length;
  const open = orders.filter((o) => o.status === "Open").length;
  const released = orders.filter((o) => o.status === "Released").length;

  const totalAmount = orders.reduce(
    (sum, o) => sum + (o.totalAmountIncludingTax || 0),
    0
  );
  const totalItems = orders.reduce((sum, o) => sum + (o.lineCount || 0), 0);

  const normalized = useMemo(
    () =>
      Array.isArray(orders)
        ? orders.map((order, i) => ({
            ...order,
            index: i + 1,
            totalFormatted: formatCurrency(order.totalAmountIncludingTax),
            orderDateFormatted: formatDate(order.orderDate),
            deliveryDateFormatted: formatDate(order.requestedDeliveryDate),
            _rawOrder: order,
          }))
        : [],
    [orders]
  );

  const getSelectedOrders = useCallback(() => {
    if (selectedKeys === "all") return orders;
    return orders.filter((o) => selectedKeys.has(o.id));
  }, [selectedKeys, orders]);

  const handlePrintSelected = useCallback(() => {
    const selected = getSelectedOrders();
    if (selected.length > 0) onPrintMultiple?.(selected);
  }, [getSelectedOrders, onPrintMultiple]);

  const handleSaveSettings = useCallback(async () => {
    await saveSettings();
    closeSettings();
  }, [saveSettings, closeSettings]);

  const handleViewOrder = useCallback(
    (order) => {
      setSelectedOrder(order);
      openDetail();
    },
    [openDetail]
  );

  const handleCloseDetail = useCallback(() => {
    closeDetail();
    setSelectedOrder(null);
  }, [closeDetail]);

  const handleOpenPreview = useCallback(
    (order) => {
      setPreviewOrder(order);
      openPreview();
    },
    [openPreview]
  );

  const handleClosePreview = useCallback(() => {
    closePreview();
    setPreviewOrder(null);
  }, [closePreview]);

  const handlePrintPackingSlip = useCallback(
    (order) => {
      closePreview();
      onPrintSingle(order, { type: "packingSlip", enableRFID: false });
    },
    [closePreview, onPrintSingle]
  );

  const renderCustomCell = useCallback(
    (item, columnKey) => {
      if (columnKey === "actions") {
        return (
          <div className="flex items-center justify-center gap-1">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={() => handleViewOrder(item._rawOrder)}
              title="View Details"
            >
              <Eye  />
            </Button>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  isDisabled={printing || !isConnected || item.lineCount === 0}
                >
                  <Printer
                    
                    className={isConnected ? "text-success" : "text-danger"}
                  />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Print options">
                {PRINT_OPTIONS.map((opt) => (
                  <DropdownItem
                    key={opt.key}
                    onPress={() => {
                      if (opt.key === "packingSlip") {
                        handleOpenPreview(item._rawOrder);
                      } else {
                        onPrintSingle(item._rawOrder, {
                          type: opt.key,
                          enableRFID: opt.hasRFID || false,
                        });
                      }
                    }}
                  >
                    {opt.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      }

      if (columnKey === "status") {
        return (
          <Chip
            color={statusColorMap[item.status] || "default"}
            size="sm"
            variant="flat"
          >
            {item.status}
          </Chip>
        );
      }

      if (columnKey === "customerName") {
        return (
          <div className="flex flex-col">
            <span className="truncate max-w-[200px]">{item.customerName}</span>
            <span className="text-xs text-foreground/60">
              {item.customerNumber}
            </span>
          </div>
        );
      }

      return undefined;
    },
    [onPrintSingle, handleViewOrder, handleOpenPreview, isConnected, printing]
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
              <Settings  />
            </Button>
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <PrinterStatusBadge showControls />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="text-sm text-foreground/60">Total Orders</div>
          <div className="text-2xl font-bold">{total}</div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="text-sm text-foreground/60">Total Items</div>
          <div className="text-2xl font-bold text-primary">{totalItems}</div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="text-sm text-foreground/60">Total Amount</div>
          <div className="text-lg font-bold text-success">
            {formatCurrency(totalAmount)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 w-full">
          <div className="flex flex-col items-center p-2 border-1 rounded-xl">
            <div className="text-xs text-foreground/60">Draft</div>
            <div className="font-bold">{draft}</div>
          </div>
          <div className="flex flex-col items-center p-2 border-1 rounded-xl">
            <div className="text-xs text-foreground/60">Open</div>
            <div className="font-bold text-primary">{open}</div>
          </div>
          <div className="flex flex-col items-center p-2 border-1 rounded-xl">
            <div className="text-xs text-foreground/60">Released</div>
            <div className="font-bold text-success">{released}</div>
          </div>
        </div>

        {selectedKeys !== "all" && selectedKeys.size > 0 && (
          <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
            <div className="text-sm">Selected ({selectedKeys.size})</div>
            <Button
              size="sm"
              color="primary"
              className="w-full"
              isDisabled={!isConnected || printing}
              onPress={handlePrintSelected}
            >
              {printing ? "กำลังพิมพ์..." : "พิมพ์ที่เลือก"}
            </Button>
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
            searchPlaceholder="Search SO number or customer"
            emptyContent="No orders found"
            itemName="orders"
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
            <PrinterSettings onSave={handleSaveSettings} showAdvanced={false} />
          </ModalBody>
        </ModalContent>
      </Modal>

      <OrderDetailModal
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        order={selectedOrder}
        onPrint={onPrintSingle}
        onOpenPreview={handleOpenPreview}
        isConnected={isConnected}
        printing={printing}
      />

      <PackingSlipPreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        order={previewOrder}
        onPrint={handlePrintPackingSlip}
        printing={printing}
      />
    </div>
  );
}"use client";

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
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
} from "@heroui/react";
import {
  Printer,
  RefreshCw,
  Settings,
  Eye,
  Package,
  User,
  Calendar,
  MapPin,
} from "lucide-react";
import { PrinterStatusBadge, PrinterSettings } from "@/components/chainWay";
import { useRFIDSafe, usePrinterSettings } from "@/hooks";
import { PRINT_TYPE_OPTIONS, STATUS_COLORS } from "@/lib/chainWay/config";
import { FileText } from "lucide-react";
import PackingSlipPreviewModal from "./PackingSlipPreviewModal";

const PRINT_OPTIONS = [
  { key: "packingSlip", label: "ใบปะหน้า (Packing Slip)", icon: FileText },
  ...PRINT_TYPE_OPTIONS,
];

const columns = [
  { name: "#", uid: "index", width: 60 },
  { name: "SO Number", uid: "number" },
  { name: "Customer", uid: "customerName" },
  { name: "Order Date", uid: "orderDateFormatted" },
  { name: "Delivery Date", uid: "deliveryDateFormatted" },
  { name: "Items", uid: "lineCount", width: 80 },
  { name: "Qty", uid: "totalQuantity", width: 80 },
  { name: "Total", uid: "totalFormatted" },
  { name: "Status", uid: "status" },
  { name: "Actions", uid: "actions", width: 120 },
];

const statusOptions = [
  { name: "Draft", uid: "Draft" },
  { name: "Open", uid: "Open" },
  { name: "Released", uid: "Released" },
  { name: "Pending Approval", uid: "Pending Approval" },
];

const statusColorMap = {
  Draft: "default",
  Open: "primary",
  Released: "success",
  "Pending Approval": "warning",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatDate(dateStr) {
  if (!dateStr || dateStr === "0001-01-01") return "-";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const orderLineColumns = [
  { name: "#", uid: "index", width: 50 },
  { name: "Item No.", uid: "itemNumber" },
  { name: "Description", uid: "description" },
  { name: "Unit", uid: "unitOfMeasureCode", width: 80 },
  { name: "Qty", uid: "quantity", width: 80 },
  { name: "Unit Price", uid: "unitPriceFormatted", width: 120 },
  { name: "Amount", uid: "amountFormatted", width: 120 },
  { name: "Ship Date", uid: "shipDateFormatted", width: 120 },
];

function OrderLinesTable({ lines }) {
  const itemLines = lines?.filter((l) => l.lineType === "Item") || [];
  const commentLines = lines?.filter((l) => l.lineType === "Comment") || [];

  const normalizedLines = useMemo(
    () =>
      itemLines.map((line, i) => ({
        ...line,
        index: i + 1,
        unitPriceFormatted: formatCurrency(line.unitPrice),
        amountFormatted: formatCurrency(line.amountIncludingTax),
        shipDateFormatted: formatDate(line.shipmentDate),
      })),
    [itemLines]
  );

  const renderLineCell = useCallback((item, columnKey) => {
    if (columnKey === "itemNumber") {
      return <span className="font-mono text-sm">{item.itemNumber}</span>;
    }

    if (columnKey === "description") {
      return (
        <div className="flex flex-col">
          <span>{item.description}</span>
          {item.description2 && (
            <span className="text-xs text-foreground/60">
              {item.description2}
            </span>
          )}
        </div>
      );
    }

    return undefined;
  }, []);

  return (
    <div className="space-y-4">
      <DataTable
        columns={orderLineColumns}
        data={normalizedLines}
        searchPlaceholder="Search item..."
        emptyContent="No items"
        itemName="items"
        renderCustomCell={renderLineCell}
      />

      {commentLines.length > 0 && (
        <div className="border-t pt-3">
          <p className="text-sm font-medium mb-2">หมายเหตุ:</p>
          {commentLines.map((line) => (
            <p key={line.id} className="text-sm text-foreground/70">
              {line.description} {line.description2}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderDetailModal({ isOpen, onClose, order, onPrint, onOpenPreview, isConnected, printing }) {
  if (!order) return null;

  const lines = order.salesOrderLines || [];
  const lineCount = lines.filter((l) => l.lineType === "Item").length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">
            Sales Order: {order.number}
          </h3>
          <div className="flex items-center gap-2">
            <Chip
              color={statusColorMap[order.status] || "default"}
              size="sm"
              variant="flat"
            >
              {order.status}
            </Chip>
            {order.externalDocumentNumber && (
              <span className="text-sm text-foreground/60">
                Ref: {order.externalDocumentNumber}
              </span>
            )}
          </div>
        </ModalHeader>

        <ModalBody className="gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <User className="text-foreground/50 mt-1"  />
              <div>
                <p className="text-xs text-foreground/60">Customer</p>
                <p className="font-medium">{order.customerName}</p>
                <p className="text-sm text-foreground/70">
                  {order.customerNumber}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="text-foreground/50 mt-1"  />
              <div>
                <p className="text-xs text-foreground/60">Dates</p>
                <p className="text-sm">
                  Order: {formatDate(order.orderDate)}
                </p>
                <p className="text-sm">
                  Delivery: {formatDate(order.requestedDeliveryDate)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="text-foreground/50 mt-1"  />
              <div>
                <p className="text-xs text-foreground/60">Ship To</p>
                <p className="text-sm">{order.shipToName}</p>
                <p className="text-sm text-foreground/70">
                  {order.shipToAddressLine1}
                </p>
                {order.shipToCity && (
                  <p className="text-sm text-foreground/70">
                    {order.shipToCity} {order.shipToPostCode}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Package  className="text-foreground/50" />
              <span className="font-medium">
                Order Lines ({lineCount} items)
              </span>
            </div>
            <OrderLinesTable lines={lines} />
          </div>

          <div className="flex justify-end border-t pt-4">
            <div className="text-right space-y-1">
              <p className="text-sm">
                Subtotal:{" "}
                <span className="font-medium">
                  {formatCurrency(order.totalAmountExcludingTax)}
                </span>
              </p>
              <p className="text-sm">
                VAT:{" "}
                <span className="font-medium">
                  {formatCurrency(order.totalTaxAmount)}
                </span>
              </p>
              <p className="text-lg font-bold text-primary">
                Total: {formatCurrency(order.totalAmountIncludingTax)}{" "}
                {order.currencyCode}
              </p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Close
          </Button>
          <Dropdown>
            <DropdownTrigger>
              <Button
                color="primary"
                startContent={<Printer  />}
                isDisabled={printing || !isConnected || lineCount === 0}
              >
                Print Labels
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Print options">
              {PRINT_OPTIONS.map((opt) => (
                <DropdownItem
                  key={opt.key}
                  onPress={() => {
                    if (opt.key === "packingSlip") {
                      onClose();
                      onOpenPreview(order);
                    } else {
                      onPrint(order, {
                        type: opt.key,
                        enableRFID: opt.hasRFID || false,
                      });
                    }
                  }}
                >
                  {opt.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function UISalesOrderOnline({
  orders = [],
  loading,
  onPrintSingle,
  onPrintMultiple,
  printerConnected = false,
  printing = false,
  onRefresh,
}) {
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [selectedOrder, setSelectedOrder] = useState(null);

  const {
    isOpen: isSettingsOpen,
    onOpen: openSettings,
    onClose: closeSettings,
  } = useDisclosure();

  const {
    isOpen: isDetailOpen,
    onOpen: openDetail,
    onClose: closeDetail,
  } = useDisclosure();

  const {
    isOpen: isPreviewOpen,
    onOpen: openPreview,
    onClose: closePreview,
  } = useDisclosure();

  const [previewOrder, setPreviewOrder] = useState(null);

  const { isConnected } = useRFIDSafe();
  const { save: saveSettings } = usePrinterSettings();

  const total = orders.length;
  const draft = orders.filter((o) => o.status === "Draft").length;
  const open = orders.filter((o) => o.status === "Open").length;
  const released = orders.filter((o) => o.status === "Released").length;

  const totalAmount = orders.reduce(
    (sum, o) => sum + (o.totalAmountIncludingTax || 0),
    0
  );
  const totalItems = orders.reduce((sum, o) => sum + (o.lineCount || 0), 0);

  const normalized = useMemo(
    () =>
      Array.isArray(orders)
        ? orders.map((order, i) => ({
            ...order,
            index: i + 1,
            totalFormatted: formatCurrency(order.totalAmountIncludingTax),
            orderDateFormatted: formatDate(order.orderDate),
            deliveryDateFormatted: formatDate(order.requestedDeliveryDate),
            _rawOrder: order,
          }))
        : [],
    [orders]
  );

  const getSelectedOrders = useCallback(() => {
    if (selectedKeys === "all") return orders;
    return orders.filter((o) => selectedKeys.has(o.id));
  }, [selectedKeys, orders]);

  const handlePrintSelected = useCallback(() => {
    const selected = getSelectedOrders();
    if (selected.length > 0) onPrintMultiple?.(selected);
  }, [getSelectedOrders, onPrintMultiple]);

  const handleSaveSettings = useCallback(async () => {
    await saveSettings();
    closeSettings();
  }, [saveSettings, closeSettings]);

  const handleViewOrder = useCallback(
    (order) => {
      setSelectedOrder(order);
      openDetail();
    },
    [openDetail]
  );

  const handleCloseDetail = useCallback(() => {
    closeDetail();
    setSelectedOrder(null);
  }, [closeDetail]);

  const handleOpenPreview = useCallback(
    (order) => {
      setPreviewOrder(order);
      openPreview();
    },
    [openPreview]
  );

  const handleClosePreview = useCallback(() => {
    closePreview();
    setPreviewOrder(null);
  }, [closePreview]);

  const handlePrintPackingSlip = useCallback(
    (order) => {
      closePreview();
      onPrintSingle(order, { type: "packingSlip", enableRFID: false });
    },
    [closePreview, onPrintSingle]
  );

  const renderCustomCell = useCallback(
    (item, columnKey) => {
      if (columnKey === "actions") {
        return (
          <div className="flex items-center justify-center gap-1">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={() => handleViewOrder(item._rawOrder)}
              title="View Details"
            >
              <Eye  />
            </Button>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  isDisabled={printing || !isConnected || item.lineCount === 0}
                >
                  <Printer
                    
                    className={isConnected ? "text-success" : "text-danger"}
                  />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Print options">
                {PRINT_OPTIONS.map((opt) => (
                  <DropdownItem
                    key={opt.key}
                    onPress={() => {
                      if (opt.key === "packingSlip") {
                        handleOpenPreview(item._rawOrder);
                      } else {
                        onPrintSingle(item._rawOrder, {
                          type: opt.key,
                          enableRFID: opt.hasRFID || false,
                        });
                      }
                    }}
                  >
                    {opt.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      }

      if (columnKey === "status") {
        return (
          <Chip
            color={statusColorMap[item.status] || "default"}
            size="sm"
            variant="flat"
          >
            {item.status}
          </Chip>
        );
      }

      if (columnKey === "customerName") {
        return (
          <div className="flex flex-col">
            <span className="truncate max-w-[200px]">{item.customerName}</span>
            <span className="text-xs text-foreground/60">
              {item.customerNumber}
            </span>
          </div>
        );
      }

      return undefined;
    },
    [onPrintSingle, handleViewOrder, handleOpenPreview, isConnected, printing]
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
              <Settings  />
            </Button>
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <PrinterStatusBadge showControls />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="text-sm text-foreground/60">Total Orders</div>
          <div className="text-2xl font-bold">{total}</div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="text-sm text-foreground/60">Total Items</div>
          <div className="text-2xl font-bold text-primary">{totalItems}</div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="text-sm text-foreground/60">Total Amount</div>
          <div className="text-lg font-bold text-success">
            {formatCurrency(totalAmount)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 w-full">
          <div className="flex flex-col items-center p-2 border-1 rounded-xl">
            <div className="text-xs text-foreground/60">Draft</div>
            <div className="font-bold">{draft}</div>
          </div>
          <div className="flex flex-col items-center p-2 border-1 rounded-xl">
            <div className="text-xs text-foreground/60">Open</div>
            <div className="font-bold text-primary">{open}</div>
          </div>
          <div className="flex flex-col items-center p-2 border-1 rounded-xl">
            <div className="text-xs text-foreground/60">Released</div>
            <div className="font-bold text-success">{released}</div>
          </div>
        </div>

        {selectedKeys !== "all" && selectedKeys.size > 0 && (
          <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
            <div className="text-sm">Selected ({selectedKeys.size})</div>
            <Button
              size="sm"
              color="primary"
              className="w-full"
              isDisabled={!isConnected || printing}
              onPress={handlePrintSelected}
            >
              {printing ? "กำลังพิมพ์..." : "พิมพ์ที่เลือก"}
            </Button>
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
            searchPlaceholder="Search SO number or customer"
            emptyContent="No orders found"
            itemName="orders"
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
            <PrinterSettings onSave={handleSaveSettings} showAdvanced={false} />
          </ModalBody>
        </ModalContent>
      </Modal>

      <OrderDetailModal
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        order={selectedOrder}
        onPrint={onPrintSingle}
        onOpenPreview={handleOpenPreview}
        isConnected={isConnected}
        printing={printing}
      />

      <PackingSlipPreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        order={previewOrder}
        onPrint={handlePrintPackingSlip}
        printing={printing}
      />
    </div>
  );
}