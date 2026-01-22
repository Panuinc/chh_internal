"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Image,
  useDisclosure,
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
} from "lucide-react";
import Barcode from "react-barcode";

import { DataTable, Loading } from "@/components";
import { PrinterStatusBadge, PrinterSettings } from "@/components/chainWay";
import { useRFIDSafe } from "@/hooks";

const COMPANY_INFO = {
  name: "บริษัท ชื้ออะฮวด อุตสาหกรรม จำกัด",
  address: "9/1 หมู่ 2 ถนนบางเลน-ลาดหลุมแก้ว",
  district: "ต.ขุนศรี อ.ไทรน้อย จ.นนทบุรี 11150",
  phone: "02-921-9979",
};

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

function getItemLines(lines) {
  return lines?.filter((l) => l.lineType === "Item") || [];
}

function getCommentLines(lines) {
  return lines?.filter((l) => l.lineType === "Comment") || [];
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
  const itemLines = getItemLines(lines);
  const commentLines = getCommentLines(lines);

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
  const lineCount = getItemLines(lines).length;

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
            isDisabled={printing || !isConnected || lineCount === 0}
            onPress={() => {
              onClose();
              onOpenPreview(order);
            }}
          >
            พิมพ์ใบปะหน้า
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
  if (!order) return null;

  const itemLines = getItemLines(order.salesOrderLines);
  const totalPieces = itemLines.reduce((sum, l) => sum + (l.quantity || 0), 0);

  const firstItem = itemLines[0];
  const previewBarcodeValue = firstItem
    ? generateBarcodeValue(
        firstItem.itemNumber || firstItem.number,
        1,
        totalPieces,
      )
    : "NO-ITEM";

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
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            จะพิมพ์ทั้งหมด {totalPieces} ใบ (ตามจำนวนสินค้า)
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
                    <span>{COMPANY_INFO.address}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold w-16">โทร:</span>
                    <span>{COMPANY_INFO.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center w-[15%] p-2 border-l-2 border-default text-xl font-bold">
                  1/{totalPieces}
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
                    {order?.shipToName || order?.customerName}
                  </span>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="font-semibold w-12">ที่อยู่:</span>
                  <div className="flex flex-col">
                    <span>{order?.shipToAddressLine1}</span>
                    {order?.shipToAddressLine2 && (
                      <span>{order?.shipToAddressLine2}</span>
                    )}
                    {(order?.shipToCity || order?.shipToPostCode) && (
                      <span>
                        {order?.shipToCity} {order?.shipToPostCode}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="font-semibold w-12">โทร:</span>
                  <span>{order?.phoneNumber || "-"}</span>
                </div>
              </div>

              <div className="flex px-3 py-2 bg-default text-xs font-semibold">
                <span className="w-10 text-center">#</span>
                <span className="flex-1">รายการสินค้า</span>
                <span className="w-16 text-right">จำนวน</span>
              </div>

              <div className="flex flex-col h-52 overflow-auto">
                {itemLines.slice(0, 14).map((line, index) => (
                  <div
                    key={line.id || index}
                    className="flex px-3 py-2 text-xs border-b-1 border-default hover:bg-default"
                  >
                    <span className="w-10 text-center">{index + 1}</span>
                    <span className="flex-1 whitespace-pre-wrap break-words">
                      {line.description}
                    </span>
                    <span className="w-16 text-right font-medium">
                      {line.quantity}
                    </span>
                  </div>
                ))}
                {itemLines.length > 14 && (
                  <div className="px-3 py-2 text-xs text-foreground italic">
                    ... และอีก {itemLines.length - 14} รายการ
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
        </ModalBody>

        <ModalFooter className="flex flex-row items-center justify-start w-full h-fit p-2 gap-2">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <Button
              color="danger"
              variant="shadow"
              size="md"
              radius="md"
              className="w-full text-background"
              onPress={onClose}
            >
              ยกเลิก
            </Button>
          </div>

          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <Button
              color="primary"
              variant="shadow"
              size="md"
              radius="md"
              className="w-full text-background"
              startContent={<Printer />}
              onPress={() => onPrint(order)}
              isLoading={printing}
              isDisabled={totalPieces === 0}
            >
              {printing ? "Printing..." : `Print ${totalPieces}`}
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
