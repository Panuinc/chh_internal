"use client";

import React, { useMemo, useCallback, useState } from "react";
import { DataTable, Loading } from "@/components";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Divider,
  Image,
  Chip,
  useDisclosure,
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
  FileText,
} from "lucide-react";
import { PrinterStatusBadge, PrinterSettings } from "@/components/chainWay";
import { useRFIDSafe, usePrinterSettings } from "@/hooks";
import { PRINT_TYPE_OPTIONS } from "@/lib/chainWay";

const COMPANY_INFO = {
  name: "บริษัท ชื้ออะฮวด อุตสาหกรรม จำกัด",
  address: "9/1 หมู่ 2 ถนนบางเลน-ลาดหลุมแก้ว",
  district: "ต.ขุนศรี อ.ไทรน้อย จ.นนทบุรี 11150",
  phone: "02-921-9979",
};

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

function SlipPreviewModal({
  isOpen,
  onClose,
  order,
  onPrint,
  printing = false,
}) {
  if (!order) return null;

  const itemLines = (order.salesOrderLines || []).filter(
    (l) => l.lineType === "Item",
  );
  const totalPieces = itemLines.reduce((sum, l) => sum + (l.quantity || 0), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">
            ตัวอย่างใบปะหน้า - {order.number}
          </h3>
          <p className="text-sm text-foreground/60">
            จะพิมพ์ทั้งหมด {totalPieces} ใบ (ตามจำนวนสินค้า)
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center gap-4 py-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              ตัวอย่างใบที่ 1 จาก {totalPieces} ใบ (ขนาด 100mm x 150mm)
            </p>

            <div
              className="flex flex-col bg-white border-2 border-black mx-auto overflow-hidden"
              style={{
                width: "400px",
                height: "600px",
                fontFamily: "sans-serif",
              }}
            >
              <div
                className="flex border-b-2 border-black relative"
                style={{ height: "80px" }}
              >
                <div
                  className="flex items-center justify-center p-2"
                  style={{ width: "72px" }}
                >
                  <Image
                    src="/logo/logo-09.png"
                    alt="Logo"
                    width={64}
                    height={64}
                    className="object-contain"
                    fallback={
                      <div className="flex items-center justify-center w-16 h-16 border border-gray-400 text-sm font-bold">
                        LOGO
                      </div>
                    }
                  />
                </div>
                <div className="flex flex-col flex-1 py-1 text-xs">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td
                          className="font-semibold whitespace-nowrap pr-1 align-top"
                          style={{ width: "45px" }}
                        >
                          ผู้ส่ง:
                        </td>
                        <td className="align-top">{COMPANY_INFO.name}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold whitespace-nowrap pr-1 align-top">
                          ที่อยู่:
                        </td>
                        <td className="align-top">{COMPANY_INFO.address}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>{COMPANY_INFO.district}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold whitespace-nowrap pr-1">
                          โทร:
                        </td>
                        <td>{COMPANY_INFO.phone}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="text-3xl font-bold">1/{totalPieces}</span>
                </div>
              </div>

              <div
                className="flex flex-col px-2 py-1 border-b-2 border-black"
                style={{ height: "80px" }}
              >
                <table className="w-full text-xs">
                  <tbody>
                    <tr>
                      <td
                        className="font-semibold whitespace-nowrap pr-1 align-top text-sm"
                        style={{ width: "45px" }}
                      >
                        ผู้รับ:
                      </td>
                      <td className="font-bold text-sm align-top">
                        {order?.shipToName || order?.customerName}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold whitespace-nowrap pr-1 align-top">
                        ที่อยู่:
                      </td>
                      <td className="align-top">
                        <div>{order?.shipToAddressLine1}</div>
                        {order?.shipToAddressLine2 && (
                          <div>{order?.shipToAddressLine2}</div>
                        )}
                        {(order?.shipToCity || order?.shipToPostCode) && (
                          <div>
                            {order?.shipToCity} {order?.shipToPostCode}
                          </div>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold whitespace-nowrap pr-1">
                        โทร:
                      </td>
                      <td>{order?.phoneNumber || "-"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div
                className="flex items-center px-2 text-xs font-semibold border-b border-gray-400"
                style={{ height: "20px" }}
              >
                <span style={{ width: "40px" }}>Item</span>
                <span className="flex-1">รายการสินค้า</span>
                <span className="text-right" style={{ width: "50px" }}>
                  จำนวน
                </span>
              </div>

              <div className="overflow-auto" style={{ height: "300px" }}>
                <table className="w-full text-xs">
                  <tbody>
                    {itemLines.slice(0, 14).map((line, index) => (
                      <tr
                        key={line.id || index}
                        className="border-b border-gray-200"
                      >
                        <td
                          className="py-1 px-2 align-top"
                          style={{ width: "40px" }}
                        >
                          {index + 1}
                        </td>
                        <td className="py-1 align-top">
                          <div className="whitespace-pre-wrap break-words">
                            {line.description}
                          </div>
                        </td>
                        <td
                          className="py-1 px-2 text-right align-top"
                          style={{ width: "50px" }}
                        >
                          {line.quantity}
                        </td>
                      </tr>
                    ))}
                    {itemLines.length > 14 && (
                      <tr>
                        <td colSpan={3} className="py-1 px-2 text-gray-500">
                          ... และอีก {itemLines.length - 14} รายการ
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div
                className="flex border-t-2 border-black"
                style={{ height: "100px" }}
              >
                <div className="flex flex-col flex-1 p-2 text-xs text-red-600">
                  <p className="font-bold">
                    ❗ กรุณาถ่ายวิดีโอขณะแกะพัสดุ เพื่อใช้เป็นหลัก
                  </p>
                  <p className="ml-4">
                    ฐานการเคลมสินค้า ไม่มีหลักฐานงดเคลมทุกกรณี
                  </p>
                </div>
                <div className="flex items-end justify-end p-2">
                  <div
                    className="flex items-center justify-center border border-gray-300 bg-gray-50"
                    style={{ width: "70px", height: "70px" }}
                  >
                    <div className="flex flex-col items-center text-xs text-gray-400">
                      <div>QR</div>
                      <div>Code</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Divider className="my-4" />

          <div className="flex flex-col gap-2">
            <h4 className="flex items-center gap-2 font-medium">
              <Package />
              รายการสินค้าทั้งหมด ({itemLines.length} รายการ, {totalPieces}{" "}
              ชิ้น)
            </h4>
            <div className="max-h-40 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-2">#</th>
                    <th className="text-left p-2">รหัสสินค้า</th>
                    <th className="text-left p-2">รายการ</th>
                    <th className="text-right p-2">จำนวน</th>
                  </tr>
                </thead>
                <tbody>
                  {itemLines.map((line, index) => (
                    <tr key={line.id} className="border-b">
                      <td className="p-2">{index + 1}</td>
                      <td className="p-2 font-mono text-xs">
                        {line.itemNumber}
                      </td>
                      <td className="p-2">{line.description}</td>
                      <td className="p-2 text-right font-bold">
                        {line.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            ยกเลิก
          </Button>
          <Button
            color="primary"
            startContent={<Printer />}
            onPress={() => onPrint(order)}
            isLoading={printing}
            isDisabled={totalPieces === 0}
          >
            {printing ? "กำลังพิมพ์..." : `พิมพ์ ${totalPieces} ใบ`}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function OrderLinesTable({ lines }) {
  const itemLines = lines?.filter((l) => l.lineType === "Item") || [];
  const commentLines = lines?.filter((l) => l.lineType === "Comment") || [];

  return (
    <div className="flex flex-col gap-4">
      <div className="max-h-80 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="text-left p-2 w-12">#</th>
              <th className="text-left p-2">Item No.</th>
              <th className="text-left p-2">Description</th>
              <th className="text-left p-2 w-20">Unit</th>
              <th className="text-right p-2 w-20">Qty</th>
              <th className="text-right p-2 w-28">Unit Price</th>
              <th className="text-right p-2 w-28">Amount</th>
              <th className="text-left p-2 w-28">Ship Date</th>
            </tr>
          </thead>
          <tbody>
            {itemLines.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-foreground/60">
                  No items
                </td>
              </tr>
            ) : (
              itemLines.map((line, index) => (
                <tr key={line.id || index} className="border-b">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2 font-mono text-xs">{line.itemNumber}</td>
                  <td className="p-2">
                    <div className="flex flex-col">
                      <span>{line.description}</span>
                      {line.description2 && (
                        <span className="text-xs text-foreground/60">
                          {line.description2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-2">{line.unitOfMeasureCode}</td>
                  <td className="p-2 text-right">{line.quantity}</td>
                  <td className="p-2 text-right">
                    {formatCurrency(line.unitPrice)}
                  </td>
                  <td className="p-2 text-right">
                    {formatCurrency(line.amountIncludingTax)}
                  </td>
                  <td className="p-2">{formatDate(line.shipmentDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {commentLines.length > 0 && (
        <div className="flex flex-col border-t pt-3">
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

function OrderDetailModal({
  isOpen,
  onClose,
  order,
  onPrint,
  onOpenPreview,
  isConnected,
  printing,
}) {
  if (!order) return null;

  const lines = order.salesOrderLines || [];
  const lineCount = lines.filter((l) => l.lineType === "Item").length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">Sales Order: {order.number}</h3>
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
              <User className="text-foreground/50 mt-1" />
              <div className="flex flex-col">
                <p className="text-xs text-foreground/60">Customer</p>
                <p className="font-medium">{order.customerName}</p>
                <p className="text-sm text-foreground/70">
                  {order.customerNumber}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="text-foreground/50 mt-1" />
              <div className="flex flex-col">
                <p className="text-xs text-foreground/60">Dates</p>
                <p className="text-sm">Order: {formatDate(order.orderDate)}</p>
                <p className="text-sm">
                  Delivery: {formatDate(order.requestedDeliveryDate)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="text-foreground/50 mt-1" />
              <div className="flex flex-col">
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

          <div className="flex flex-col border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="text-foreground/50" />
              <span className="font-medium">
                Order Lines ({lineCount} items)
              </span>
            </div>
            <OrderLinesTable lines={lines} />
          </div>

          <div className="flex justify-end border-t pt-4">
            <div className="flex flex-col items-end gap-2">
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
                startContent={<Printer />}
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
  printing = false,
  onRefresh,
}) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [previewOrder, setPreviewOrder] = useState(null);

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

  const { isConnected } = useRFIDSafe();
  const { save: saveSettings } = usePrinterSettings();

  const total = orders.length;
  const totalAmount = orders.reduce(
    (sum, o) => sum + (o.totalAmountIncludingTax || 0),
    0,
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
    [orders],
  );

  const handleSaveSettings = useCallback(async () => {
    await saveSettings();
    closeSettings();
  }, [saveSettings, closeSettings]);

  const handleViewOrder = useCallback(
    (order) => {
      setSelectedOrder(order);
      openDetail();
    },
    [openDetail],
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
    [openPreview],
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
    [closePreview, onPrintSingle],
  );

  const renderCustomCell = useCallback(
    (item, columnKey) => {
      if (columnKey === "actions") {
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={() => handleViewOrder(item._rawOrder)}
              title="View Details"
            >
              <Eye />
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
    [onPrintSingle, handleViewOrder, handleOpenPreview, isConnected, printing],
  );

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full gap-2 overflow-hidden">
      <div className="hidden xl:flex flex-col items-center justify-start w-full xl:w-[20%] h-full gap-2 overflow-auto">
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-between w-full h-full p-2 gap-2">
            Printer
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
            Total Orders
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {total}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Total Items
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {totalItems}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Total Amount
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {formatCurrency(totalAmount)}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <Button
              variant="light"
              size="sm"
              onPress={onRefresh}
              isDisabled={loading}
              className="w-full"
            >
              <RefreshCw className={loading ? "animate-spin" : ""} />
              <span className="ml-2">Refresh Data</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-start w-full xl:w-[80%] h-full gap-2 overflow-hidden">
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
            renderCustomCell={renderCustomCell}
          />
        )}
      </div>

      <Modal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalBody className="py-6">
            <PrinterSettings
              onSave={handleSaveSettings}
              showAdvanced={false}
              showHeader={true}
              title="Printer Settings"
              subtitle="Configure printer connection and label settings"
            />
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

      <SlipPreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        order={previewOrder}
        onPrint={handlePrintPackingSlip}
        printing={printing}
      />
    </div>
  );
}
