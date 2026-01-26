"use client";

import React, { useState, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Image,
  useDisclosure,
  Progress,
  Checkbox,
  Input,
} from "@heroui/react";
import {
  Printer,
  RefreshCw,
  Telescope,
  Package,
  User,
  Calendar,
  MapPin,
  Settings,
  ChevronLeft,
  ChevronRight,
  Edit3,
} from "lucide-react";
import Barcode from "react-barcode";

import { DataTable, Loading, showToast } from "@/components";
import { PrinterStatusBadge, PrinterSettings } from "@/components/chainWay";
import { useRFIDSafe } from "@/hooks";
import { COMPANY_INFO } from "@/lib/chainWay/config";
import { getItemLines, getCommentLines } from "@/lib/chainWay/utils";

const TABLE_COLUMNS = [
  { name: "#", uid: "index", width: 60 },
  { name: "SO Number", uid: "number" },
  { name: "Customer", uid: "customerName" },
  { name: "Order Date", uid: "orderDateFormatted" },
  { name: "Delivery Date", uid: "deliveryDateFormatted" },
  { name: "Items", uid: "lineCount", width: 80 },
  { name: "Qty", uid: "totalQuantity", width: 80 },
  { name: "Total", uid: "totalFormatted" },
  { name: "Actions", uid: "actions", width: 120 },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function generateBarcodeValue(itemNumber, pieceNumber, total) {
  return `${itemNumber}-${pieceNumber}/${total}`;
}

function expandItemsByQuantity(items) {
  const expanded = [];
  for (const item of items) {
    const qty = item.quantity || 1;
    for (let i = 1; i <= qty; i++) {
      expanded.push({
        item,
        pieceIndexOfItem: i,
        totalPiecesOfItem: qty,
      });
    }
  }
  return expanded;
}

const ORDER_LINES_COLUMNS = [
  { name: "#", uid: "index", width: 50 },
  { name: "Item No.", uid: "itemNumber" },
  { name: "Description", uid: "description" },
  { name: "Unit", uid: "unitOfMeasureCode", width: 80 },
  { name: "Qty", uid: "quantity", width: 80 },
  { name: "Unit Price", uid: "unitPriceFormatted", width: 120 },
  { name: "Amount", uid: "amountFormatted", width: 120 },
  { name: "Ship Date", uid: "shipmentDate", width: 120 },
];

function OrderLinesTable({ lines }) {
  const itemLines = getItemLines({ salesOrderLines: lines });
  const commentLines = getCommentLines({ salesOrderLines: lines });

  const normalizedLines = itemLines.map((line, index) => ({
    ...line,
    id: line.id || index,
    index: index + 1,
    unitPriceFormatted: formatCurrency(line.unitPrice),
    amountFormatted: formatCurrency(line.amountIncludingTax),
  }));

  const renderCustomCell = (item, columnKey) => {
    switch (columnKey) {
      case "itemNumber":
        return <span className="font-mono text-xs">{item.itemNumber}</span>;

      case "description":
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

      case "quantity":
        return <span className="text-right">{item.quantity}</span>;

      case "unitPriceFormatted":
      case "amountFormatted":
        return <span className="text-right">{item[columnKey]}</span>;

      default:
        return undefined;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="max-h-80 overflow-hidden">
        <DataTable
          columns={ORDER_LINES_COLUMNS}
          data={normalizedLines}
          emptyContent="No items"
          itemName="items"
          renderCustomCell={renderCustomCell}
        />
      </div>

      {commentLines.length > 0 && (
        <div className="flex flex-col pt-3">
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

function OrderSummaryPanel({
  total,
  totalItems,
  totalAmount,
  loading,
  onRefresh,
  onOpenSettings,
}) {
  return (
    <div className="xl:flex flex-col items-center justify-start w-full xl:w-[20%] h-full gap-2 border-1 border-default overflow-auto hidden">
      <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-2 border-default">
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          <span className="font-medium">Printer</span>
          <Button isIconOnly variant="light" size="md" onPress={onOpenSettings}>
            <Settings />
          </Button>
        </div>
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          <PrinterStatusBadge />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-2 border-default">
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          Total Orders
        </div>
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          {total}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-2 border-default">
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          Total Items
        </div>
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          {totalItems}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-2 border-default">
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          Total Amount
        </div>
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          {formatCurrency(totalAmount)}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-2 border-default">
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          <Button
            variant="light"
            size="md"
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
  );
}

function OrderDetailModal({
  isOpen,
  onClose,
  order,
  onOpenPreview,
  isConnected,
  printing,
}) {
  if (!order) return null;

  const lines = order.salesOrderLines || [];
  const lineCount = getItemLines(order).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">Sales Order: {order.number}</h3>
          {order.externalDocumentNumber && (
            <span className="text-sm text-foreground/60">
              Ref: {order.externalDocumentNumber}
            </span>
          )}
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
                <p className="text-sm">Order: {order.orderDate}</p>
                <p className="text-sm">
                  Delivery: {order.requestedDeliveryDate}
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

          <div className="flex flex-col border-t border-default pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="text-foreground/50" />
              <span className="font-medium">
                Order Lines ({lineCount} items)
              </span>
            </div>
            <OrderLinesTable lines={lines} />
          </div>

          <div className="flex justify-end border-t border-default pt-4">
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
          <Button
            color="danger"
            variant="shadow"
            size="md"
            radius="md"
            className="w-2/12 text-background"
            onPress={onClose}
          >
            Close
          </Button>
          <Button
            color="primary"
            variant="shadow"
            size="md"
            radius="md"
            className="w-2/12 text-background"
            startContent={<Printer />}
            isDisabled={lineCount === 0}
            onPress={() => {
              onClose();
              onOpenPreview(order);
            }}
          >
            ใบปะหน้า
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function SlipPreviewModal({
  isOpen,
  onClose,
  order,
  onPrint,
  printing = false,
}) {
  const [previewIndex, setPreviewIndex] = useState(0);

  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState({
    shipToName: "",
    shipToAddressLine1: "",
    shipToAddressLine2: "",
    shipToCity: "",
    shipToPostCode: "",
    phoneNumber: "",
  });

  React.useEffect(() => {
    if (order) {
      setCustomAddress({
        shipToName: order.shipToName || order.customerName || "",
        shipToAddressLine1: order.shipToAddressLine1 || "",
        shipToAddressLine2: order.shipToAddressLine2 || "",
        shipToCity: order.shipToCity || "",
        shipToPostCode: order.shipToPostCode || "",
        phoneNumber: order.phoneNumber || "",
      });
      setUseCustomAddress(false);
    }
  }, [order?.number]);

  React.useEffect(() => {
    setPreviewIndex(0);
  }, [order?.number]);

  const { expandedItems, totalPieces, itemLines } = useMemo(() => {
    if (!order) return { expandedItems: [], totalPieces: 0, itemLines: [] };

    const items = getItemLines(order);
    const total = items.reduce((sum, l) => sum + (l.quantity || 0), 0);
    const expanded = expandItemsByQuantity(items);

    return {
      itemLines: items,
      totalPieces: total,
      expandedItems: expanded,
    };
  }, [order]);

  const displayAddress = useMemo(() => {
    if (useCustomAddress) {
      return customAddress;
    }
    return {
      shipToName: order?.shipToName || order?.customerName || "",
      shipToAddressLine1: order?.shipToAddressLine1 || "",
      shipToAddressLine2: order?.shipToAddressLine2 || "",
      shipToCity: order?.shipToCity || "",
      shipToPostCode: order?.shipToPostCode || "",
      phoneNumber: order?.phoneNumber || "",
    };
  }, [useCustomAddress, customAddress, order]);

  if (!order) return null;

  const currentPiece = previewIndex + 1;
  const currentExpandedItem = expandedItems[previewIndex];
  const currentItem = currentExpandedItem?.item;

  const previewBarcodeValue = currentItem
    ? generateBarcodeValue(
        currentItem.itemNumber || currentItem.number,
        currentPiece,
        totalPieces,
      )
    : "NO-ITEM";

  const handlePrev = () => {
    setPreviewIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setPreviewIndex((prev) => Math.min(totalPieces - 1, prev + 1));
  };

  const handleAddressChange = (field, value) => {
    setCustomAddress((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      className="flex flex-col items-center justify-center w-full h-full gap-2"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col items-center justify-start w-full h-fit p-2 gap-2">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            ตัวอย่างใบปะหน้า - {order.number}
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-sm text-foreground/70">
            ทั้งหมด {totalPieces} ใบ (1 ใบ = 1 สินค้า)
          </div>
          <div className="flex items-center justify-center w-full gap-4">
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              onPress={handlePrev}
              isDisabled={previewIndex === 0}
            >
              <ChevronLeft size={20} />
            </Button>
            <span className="text-sm font-medium">
              ดูตัวอย่างใบที่ {currentPiece} / {totalPieces}
            </span>
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              onPress={handleNext}
              isDisabled={previewIndex >= totalPieces - 1}
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        </ModalHeader>

        <ModalBody className="flex flex-col items-center justify-start w-full h-fit p-2">
          <div className="flex flex-col w-full bg-default rounded-xl p-2 gap-2">
            <div className="flex flex-col w-full bg-background rounded-xl overflow-hidden">
              <div className="flex flex-row items-stretch border-b-2 border-default">
                <div className="flex items-center justify-center w-[15%] p-2 border-r-2 border-default">
                  <Image
                    src="/logo/logo-09.png"
                    alt="Logo"
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>

                <div className="flex flex-col justify-center flex-1 p-2 text-sm">
                  <div className="flex gap-2">
                    <span className="font-semibold w-16">ผู้ส่ง:</span>
                    <span>{COMPANY_INFO.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold w-16">ที่อยู่:</span>
                    <span>{COMPANY_INFO.address1}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold w-16">โทร:</span>
                    <span>{COMPANY_INFO.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center w-[15%] p-2 border-l-2 border-default text-xl font-bold">
                  {currentPiece}/{totalPieces}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center w-full py-3 px-4 border-b-2 border-default bg-white">
                <Barcode
                  value={previewBarcodeValue}
                  format="CODE128"
                  width={1}
                  height={50}
                  displayValue={true}
                  fontSize={12}
                  fontOptions="bold"
                  textAlign="center"
                  textMargin={5}
                  margin={5}
                  background="#ffffff"
                  lineColor="#000000"
                />
              </div>

              <div className="flex flex-col p-2 border-b-2 border-default gap-2">
                <div className="flex gap-2">
                  <span className="font-semibold w-12 text-sm">ผู้รับ:</span>
                  <span className="font-bold text-base">
                    {displayAddress.shipToName}
                  </span>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="font-semibold w-12">ที่อยู่:</span>
                  <div className="flex flex-col">
                    <span>{displayAddress.shipToAddressLine1}</span>
                    {displayAddress.shipToAddressLine2 && (
                      <span>{displayAddress.shipToAddressLine2}</span>
                    )}
                    {(displayAddress.shipToCity ||
                      displayAddress.shipToPostCode) && (
                      <span>
                        {displayAddress.shipToCity}{" "}
                        {displayAddress.shipToPostCode}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="font-semibold w-12">โทร:</span>
                  <span>{displayAddress.phoneNumber || "-"}</span>
                </div>
              </div>

              <div className="flex px-3 py-2 bg-default text-xs font-semibold">
                <span className="w-10 text-center">#</span>
                <span className="flex-1">รายการสินค้า</span>
                <span className="w-16 text-right">จำนวน</span>
              </div>

              <div className="flex flex-col h-52 overflow-auto">
                {currentItem ? (
                  <div className="flex px-3 py-4 text-sm border-b-1 border-default bg-primary/5">
                    <span className="w-10 text-center font-bold">1</span>
                    <div className="flex-1 flex flex-col">
                      <span className="whitespace-pre-wrap break-words font-medium">
                        {currentItem.description}
                      </span>
                      {currentItem.description2 && (
                        <span className="text-xs text-foreground/60 mt-1">
                          {currentItem.description2}
                        </span>
                      )}
                      <span className="text-xs text-foreground/50 mt-1">
                        Item: {currentItem.itemNumber}
                      </span>
                    </div>
                    <span className="w-16 text-right font-bold text-lg">1</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-foreground/50">
                    ไม่มีสินค้า
                  </div>
                )}
              </div>

              <div className="flex border-t-2 border-default">
                <div className="flex flex-col flex-1 p-2 text-2xl text-danger gap-2">
                  <p className="font-bold">
                    ❗กรุณาถ่ายวิดีโอขณะแกะพัสดุ
                    เพื่อใช้เป็นหลักฐานการเคลมสินค้า ไม่มีหลักฐานงดเคลมทุกกรณี
                  </p>
                </div>

                <div className="flex items-center justify-center p-2">
                  <div className="flex flex-col items-center justify-center w-20 h-20 rounded-xl bg-default">
                    <Image
                      src="/qrcode/lineEvergreen.png"
                      alt="Logo"
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full mt-4 p-3 bg-default/50 rounded-lg">
            <p className="text-sm font-semibold mb-2">
              สรุปรายการทั้งหมด ({itemLines.length} รายการ, {totalPieces} ใบ):
            </p>
            <div className="flex flex-col gap-1 text-xs max-h-32 overflow-auto">
              {itemLines.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate flex-1">{item.description}</span>
                  <span className="ml-2 font-medium">x{item.quantity} ใบ</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col w-full mt-4 p-3 bg-default/25 border-2 border-default rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Checkbox
                isSelected={useCustomAddress}
                onValueChange={setUseCustomAddress}
                size="sm"
                color="warning"
              >
                <span className="text-sm font-semibold flex items-center gap-1">
                  <Edit3 size={14} />
                  แก้ไขที่อยู่จัดส่ง
                </span>
              </Checkbox>
            </div>

            {useCustomAddress && (
              <div className="flex flex-col gap-3">
                <Input
                  label="ชื่อผู้รับ"
                  size="sm"
                  value={customAddress.shipToName}
                  onValueChange={(v) => handleAddressChange("shipToName", v)}
                />
                <Input
                  label="ที่อยู่ บรรทัด 1"
                  size="sm"
                  value={customAddress.shipToAddressLine1}
                  onValueChange={(v) =>
                    handleAddressChange("shipToAddressLine1", v)
                  }
                />
                <Input
                  label="ที่อยู่ บรรทัด 2"
                  size="sm"
                  value={customAddress.shipToAddressLine2}
                  onValueChange={(v) =>
                    handleAddressChange("shipToAddressLine2", v)
                  }
                />
                <div className="flex gap-2">
                  <Input
                    label="อำเภอ/เขต จังหวัด"
                    size="sm"
                    className="flex-1"
                    value={customAddress.shipToCity}
                    onValueChange={(v) => handleAddressChange("shipToCity", v)}
                  />
                  <Input
                    label="รหัสไปรษณีย์"
                    size="sm"
                    className="w-28"
                    value={customAddress.shipToPostCode}
                    onValueChange={(v) =>
                      handleAddressChange("shipToPostCode", v)
                    }
                  />
                </div>
                <Input
                  label="เบอร์โทรศัพท์"
                  size="sm"
                  value={customAddress.phoneNumber}
                  onValueChange={(v) => handleAddressChange("phoneNumber", v)}
                />
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter className="flex flex-col items-center justify-start w-full h-fit p-2 gap-2">
          <div className="flex items-center justify-center w-full h-full gap-2">
            <Button
              color="danger"
              variant="shadow"
              size="md"
              radius="md"
              className="flex-1 text-background"
              onPress={onClose}
            >
              ปิด
            </Button>
            <Button
              color="primary"
              variant="shadow"
              size="md"
              radius="md"
              className="flex-1 text-background"
              startContent={<Printer />}
              onPress={() => onPrint(order)}
              isLoading={printing}
              isDisabled={totalPieces === 0}
            >
              {printing ? "Printing..." : `Print (ChainWay)`}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function PrinterSettingsModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalBody className="py-6">
          <PrinterSettings
            showHeader={true}
            title="ควบคุมเครื่องพิมพ์"
            subtitle="ChainWay RFID Printer"
          />
        </ModalBody>
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
    isOpen: isDetailOpen,
    onOpen: openDetail,
    onClose: closeDetail,
  } = useDisclosure();

  const {
    isOpen: isPreviewOpen,
    onOpen: openPreview,
    onClose: closePreview,
  } = useDisclosure();

  const {
    isOpen: isSettingsOpen,
    onOpen: openSettings,
    onClose: closeSettings,
  } = useDisclosure();

  const { isConnected } = useRFIDSafe();

  const total = orders.length;
  const totalAmount = orders.reduce(
    (sum, o) => sum + (o.totalAmountIncludingTax || 0),
    0,
  );
  const totalItems = orders.reduce((sum, o) => sum + (o.lineCount || 0), 0);

  const normalizedOrders = Array.isArray(orders)
    ? orders.map((order, i) => ({
        ...order,
        index: i + 1,
        totalFormatted: formatCurrency(order.totalAmountIncludingTax),
        orderDateFormatted: order.orderDate,
        deliveryDateFormatted: order.requestedDeliveryDate,
        _rawOrder: order,
      }))
    : [];

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    openDetail();
  };

  const handleCloseDetail = () => {
    closeDetail();
    setSelectedOrder(null);
  };

  const handleOpenPreview = (order) => {
    setPreviewOrder(order);
    openPreview();
  };

  const handleClosePreview = () => {
    closePreview();
    setPreviewOrder(null);
  };

  const handlePrintPackingSlip = (order) => {
    closePreview();
    onPrintSingle(order, { type: "packingSlip", enableRFID: false });
  };

  const renderCustomCell = (item, columnKey) => {
    switch (columnKey) {
      case "actions":
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              isIconOnly
              color="default"
              variant="shadow"
              size="md"
              radius="md"
              className="w-2/12 text-foreground"
              onPress={() => handleViewOrder(item._rawOrder)}
            >
              <Telescope />
            </Button>
          </div>
        );

      case "customerName":
        return (
          <div className="flex flex-col">
            <span className="truncate max-w-[200px]">{item.customerName}</span>
            <span className="text-xs text-foreground/60">
              {item.customerNumber}
            </span>
          </div>
        );

      default:
        return undefined;
    }
  };

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full overflow-hidden">
      <OrderSummaryPanel
        total={total}
        totalItems={totalItems}
        totalAmount={totalAmount}
        loading={loading}
        onRefresh={onRefresh}
        onOpenSettings={openSettings}
      />

      <div className="flex flex-col items-center justify-start w-full xl:w-[80%] h-full gap-2 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center w-full h-full gap-2">
            <Loading />
          </div>
        ) : (
          <DataTable
            columns={TABLE_COLUMNS}
            data={normalizedOrders}
            searchPlaceholder="Search SO number or customer"
            emptyContent="No orders found"
            itemName="orders"
            renderCustomCell={renderCustomCell}
          />
        )}
      </div>

      <OrderDetailModal
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        order={selectedOrder}
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

      <PrinterSettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
    </div>
  );
}
