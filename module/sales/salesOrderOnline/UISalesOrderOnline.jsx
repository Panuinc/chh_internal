"use client";

import React, { useMemo, useCallback, useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Image,
  useDisclosure,
  Checkbox,
  Input,
  Divider,
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
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";
import Barcode from "react-barcode";

import { DataTable, Loading } from "@/components";
import { PrinterStatusBadge, PrinterSettings } from "@/components/chainWay";
import { useRFIDSafe } from "@/hooks";
import { COMPANY_INFO } from "@/lib/chainWay/config";
import { getItemLines, getCommentLines } from "@/lib/chainWay/utils";

const columns = [
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

const orderLinesColumns = [
  { name: "#", uid: "index", width: 50 },
  { name: "Item No.", uid: "itemNumber" },
  { name: "Description", uid: "description" },
  { name: "Unit", uid: "unitOfMeasureCode", width: 80 },
  { name: "Qty", uid: "quantity", width: 80 },
  { name: "Unit Price", uid: "unitPriceFormatted", width: 120 },
  { name: "Amount", uid: "amountFormatted", width: 120 },
  { name: "Ship Date", uid: "shipmentDate", width: 120 },
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

function expandItemsByQuantity(items, selectedQuantities = null) {
  const expanded = [];
  for (const item of items) {
    const originalQty = item.quantity || 1;
    const qty = selectedQuantities
      ? (selectedQuantities[item.itemNumber] ?? originalQty)
      : originalQty;

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

function OrderLinesTable({ lines }) {
  const itemLines = getItemLines({ salesOrderLines: lines });
  const commentLines = getCommentLines({ salesOrderLines: lines });

  const normalizedLines = useMemo(
    () =>
      itemLines.map((line, index) => ({
        ...line,
        id: line.id || index,
        index: index + 1,
        unitPriceFormatted: formatCurrency(line.unitPrice),
        amountFormatted: formatCurrency(line.amountIncludingTax),
      })),
    [itemLines],
  );

  const renderCustomCell = useCallback((item, columnKey) => {
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
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="max-h-80 overflow-hidden">
        <DataTable
          columns={orderLinesColumns}
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
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">Sales Order: {order.number}</h3>
          {order.externalDocumentNumber && (
            <span className="text-sm text-foreground/60">
              Ref: {order.externalDocumentNumber}
            </span>
          )}
        </ModalHeader>

        <ModalBody className="gap-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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

          <Divider />

          <div className="flex flex-col">
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

          {!isConnected && (
            <div className="flex flex-col gap-2 p-2 bg-danger/10 rounded-xl border border-danger/30">
              <p className="text-sm text-danger font-medium">
                ⚠️ Printer Not Connected
              </p>
              <p className="text-xs text-danger/80">
                กรุณาเชื่อมต่อเครื่องพิมพ์ RFID ก่อนทำการพิมพ์
              </p>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            color="danger"
            variant="shadow"
            size="md"
            radius="md"
            className="w-full text-background"
            onPress={onClose}
          >
            Close
          </Button>
          <Button
            color="primary"
            variant="shadow"
            size="md"
            radius="md"
            className="w-full text-background"
            startContent={<Printer />}
            isDisabled={!isConnected || printing || lineCount === 0}
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

function ItemQuantitySelector({
  items,
  selectedItems,
  quantities,
  onToggleItem,
  onQuantityChange,
  onReset,
}) {
  return (
    <div className="flex flex-col w-full p-3 bg-default/25 border-1 border-default rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="text-foreground/60" />
          <span className="text-sm font-semibold">เลือกสินค้าที่จะพิมพ์</span>
        </div>
        <Button
          size="md"
          color="default"
          variant="shadow"
          startContent={<RotateCcw />}
          onPress={onReset}
        >
          รีเซ็ต
        </Button>
      </div>

      <div className="flex flex-col gap-2 max-h-60 overflow-auto">
        {items.map((item, idx) => {
          const isSelected = selectedItems[item.itemNumber] !== false;
          const currentQty = quantities[item.itemNumber] ?? item.quantity;
          const maxQty = item.quantity;

          return (
            <div
              key={item.itemNumber || idx}
              className={`flex items-center gap-3 p-2 rounded-lg border ${
                isSelected
                  ? "bg-primary/5 border-primary/30"
                  : "bg-default/50 border-default"
              }`}
            >
              <Checkbox
                isSelected={isSelected}
                onValueChange={(checked) =>
                  onToggleItem(item.itemNumber, checked)
                }
                size="md"
                color="primary"
                className="text-background"
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.description}
                </p>
                <p className="text-xs text-foreground/60">{item.itemNumber}</p>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  isIconOnly
                  size="md"
                  variant="flat"
                  isDisabled={!isSelected || currentQty <= 1}
                  onPress={() =>
                    onQuantityChange(item.itemNumber, currentQty - 1)
                  }
                >
                  <Minus />
                </Button>

                <Input
                  type="number"
                  size="md"
                  className="w-16 text-center"
                  value={String(currentQty)}
                  min={1}
                  max={maxQty}
                  isDisabled={!isSelected}
                  onValueChange={(val) => {
                    const num = parseInt(val, 10);
                    if (!isNaN(num) && num >= 1 && num <= maxQty) {
                      onQuantityChange(item.itemNumber, num);
                    }
                  }}
                  classNames={{
                    input: "text-center",
                    inputWrapper: "h-8",
                  }}
                />

                <Button
                  isIconOnly
                  size="md"
                  variant="flat"
                  isDisabled={!isSelected || currentQty >= maxQty}
                  onPress={() =>
                    onQuantityChange(item.itemNumber, currentQty + 1)
                  }
                >
                  <Plus />
                </Button>

                <span className="text-xs text-foreground/50 w-12 text-right">
                  / {maxQty}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
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

  const [selectedItems, setSelectedItems] = useState({});
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (order) {
      console.log("[SlipPreview] Initializing for order:", order.number);

      setCustomAddress({
        shipToName: order.shipToName || order.customerName || "",
        shipToAddressLine1: order.shipToAddressLine1 || "",
        shipToAddressLine2: order.shipToAddressLine2 || "",
        shipToCity: order.shipToCity || "",
        shipToPostCode: order.shipToPostCode || "",
        phoneNumber: order.phoneNumber || "",
      });
      setUseCustomAddress(false);

      const items = getItemLines(order);
      console.log(
        "[SlipPreview] Found items:",
        items.length,
        items.map((i) => ({ itemNumber: i.itemNumber, qty: i.quantity })),
      );

      const initialSelected = {};
      const initialQuantities = {};
      items.forEach((item) => {
        initialSelected[item.itemNumber] = true;
        initialQuantities[item.itemNumber] = item.quantity || 1;
      });
      setSelectedItems(initialSelected);
      setQuantities(initialQuantities);
      setPreviewIndex(0);

      console.log("[SlipPreview] State initialized:", {
        selectedItems: initialSelected,
        quantities: initialQuantities,
      });
    }
  }, [order?.number]);

  const { itemLines, filteredItems, expandedItems, totalPieces } =
    useMemo(() => {
      if (!order)
        return {
          itemLines: [],
          filteredItems: [],
          expandedItems: [],
          totalPieces: 0,
        };

      const items = getItemLines(order);

      const filtered = items.filter(
        (item) => selectedItems[item.itemNumber] !== false,
      );

      const itemsWithSelectedQty = filtered.map((item) => ({
        ...item,
        quantity: quantities[item.itemNumber] ?? item.quantity,
      }));

      const total = itemsWithSelectedQty.reduce(
        (sum, l) => sum + (l.quantity || 0),
        0,
      );
      const expanded = expandItemsByQuantity(itemsWithSelectedQty);

      return {
        itemLines: items,
        filteredItems: itemsWithSelectedQty,
        totalPieces: total,
        expandedItems: expanded,
      };
    }, [order, selectedItems, quantities]);

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

  const handlePrev = useCallback(() => {
    setPreviewIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setPreviewIndex((prev) => Math.min(totalPieces - 1, prev + 1));
  }, [totalPieces]);

  const handleAddressChange = useCallback((field, value) => {
    setCustomAddress((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleToggleItem = useCallback((itemNumber, checked) => {
    setSelectedItems((prev) => ({ ...prev, [itemNumber]: checked }));
  }, []);

  const handleQuantityChange = useCallback((itemNumber, qty) => {
    setQuantities((prev) => ({ ...prev, [itemNumber]: qty }));
    setPreviewIndex(0);
  }, []);

  const handleResetSelection = useCallback(() => {
    if (!order) return;
    const items = getItemLines(order);
    const initialSelected = {};
    const initialQuantities = {};
    items.forEach((item) => {
      initialSelected[item.itemNumber] = true;
      initialQuantities[item.itemNumber] = item.quantity || 1;
    });
    setSelectedItems(initialSelected);
    setQuantities(initialQuantities);
    setPreviewIndex(0);
  }, [order]);

  const handlePrint = useCallback(() => {
    if (!order) {
      console.error("[SlipPreview] No order to print");
      return;
    }

    const originalLines = order.salesOrderLines || [];

    const modifiedLines = originalLines
      .map((line) => {
        if (line.lineType !== "Item") return line;

        const isSelected = selectedItems[line.itemNumber] !== false;
        if (!isSelected) return null;

        return {
          ...line,
          quantity: quantities[line.itemNumber] ?? line.quantity,
        };
      })
      .filter(Boolean);

    const modifiedOrder = {
      ...order,
      ...(useCustomAddress && {
        shipToName: customAddress.shipToName,
        shipToAddressLine1: customAddress.shipToAddressLine1,
        shipToAddressLine2: customAddress.shipToAddressLine2,
        shipToCity: customAddress.shipToCity,
        shipToPostCode: customAddress.shipToPostCode,
        phoneNumber: customAddress.phoneNumber,
      }),
      salesOrderLines: modifiedLines,
    };

    const itemCount = modifiedLines.filter((l) => l.lineType === "Item").length;
    const totalQty = modifiedLines
      .filter((l) => l.lineType === "Item")
      .reduce((sum, l) => sum + (l.quantity || 0), 0);

    console.log("[SlipPreview] Printing order:", {
      orderNumber: modifiedOrder.number,
      itemCount,
      totalQty,
      useCustomAddress,
      shipToName: modifiedOrder.shipToName,
    });

    if (totalQty === 0) {
      console.error("[SlipPreview] No items selected to print");
      return;
    }

    onPrint(modifiedOrder);
  }, [
    order,
    useCustomAddress,
    customAddress,
    selectedItems,
    quantities,
    onPrint,
  ]);

  useEffect(() => {
    if (previewIndex >= totalPieces && totalPieces > 0) {
      setPreviewIndex(totalPieces - 1);
    }
  }, [totalPieces, previewIndex]);

  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      className="flex flex-col items-center justify-center w-full h-full gap-2"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col items-center justify-start w-full h-fit p-2 gap-2">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            ใบปะหน้า - {order.number}
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-sm text-foreground/70">
            จะพิมพ์ทั้งหมด {totalPieces} ใบ (1 ใบ = 1 ชิ้น)
          </div>
          {totalPieces > 0 && (
            <div className="flex items-center justify-center w-full gap-2">
              <Button
                isIconOnly
                variant="flat"
                size="md"
                onPress={handlePrev}
                isDisabled={previewIndex === 0}
              >
                <ChevronLeft />
              </Button>
              <span className="text-sm font-medium">
                ดูตัวอย่างใบที่ {currentPiece} / {totalPieces}
              </span>
              <Button
                isIconOnly
                variant="flat"
                size="md"
                onPress={handleNext}
                isDisabled={previewIndex >= totalPieces - 1}
              >
                <ChevronRight />
              </Button>
            </div>
          )}
        </ModalHeader>

        <ModalBody className="flex flex-col items-center justify-start w-full h-fit p-2 gap-4">
          <ItemQuantitySelector
            items={itemLines}
            selectedItems={selectedItems}
            quantities={quantities}
            onToggleItem={handleToggleItem}
            onQuantityChange={handleQuantityChange}
            onReset={handleResetSelection}
          />

          {totalPieces > 0 ? (
            <div className="flex flex-col w-full bg-default rounded-xl p-2 gap-2">
              <div className="flex flex-col w-full bg-background rounded-xl overflow-hidden">
                <div className="flex flex-row items-stretch border-b-1 border-default">
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

                <div className="flex flex-col items-center justify-center w-full p-2 border-b-1 border-default bg-white">
                  <Barcode
                    value={previewBarcodeValue}
                    format="CODE128"
                    width={1}
                    height={50}
                    displayValue={true}
                    fontOptions="bold"
                    textAlign="center"
                    textMargin={5}
                    margin={5}
                    background="#ffffff"
                    lineColor="#000000"
                  />
                </div>

                <div className="flex flex-col p-2 border-b-1 border-default gap-2">
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

                <div className="flex p-2 bg-default text-xs font-semibold">
                  <span className="w-10 text-center">#</span>
                  <span className="flex-1">รายการสินค้า</span>
                  <span className="w-16 text-right">จำนวน</span>
                </div>

                <div className="flex flex-col h-40 overflow-auto">
                  {currentItem ? (
                    <div className="flex p-2 text-sm border-b-1 border-default bg-primary/5">
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
                      <span className="w-16 text-right font-bold text-lg">
                        1
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-foreground/50">
                      ไม่มีสินค้า
                    </div>
                  )}
                </div>

                <div className="flex border-t-1 border-default">
                  <div className="flex flex-col flex-1 p-2 text-lg text-danger gap-2">
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
          ) : (
            <div className="flex items-center justify-center w-full h-40 bg-default/50 rounded-xl">
              <p className="text-foreground/50">
                กรุณาเลือกสินค้าอย่างน้อย 1 รายการ
              </p>
            </div>
          )}

          <div className="flex flex-col w-full p-2 bg-default/50 rounded-xl">
            <p className="text-sm font-semibold mb-2">
              สรุปรายการที่จะพิมพ์ ({filteredItems.length} รายการ, {totalPieces}{" "}
              ใบ):
            </p>
            <div className="flex flex-col gap-2 text-xs max-h-32 overflow-auto">
              {filteredItems.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate flex-1">{item.description}</span>
                  <span className="ml-2 font-medium">x{item.quantity} ใบ</span>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <p className="text-foreground/50">ไม่มีรายการที่เลือก</p>
              )}
            </div>
          </div>

          <div className="flex flex-col w-full p-3 bg-default/25 border-1 border-default rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Checkbox
                isSelected={useCustomAddress}
                onValueChange={setUseCustomAddress}
                size="md"
                color="secondary"
                className="text-background"
              >
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Edit3 />
                  แก้ไขที่อยู่จัดส่ง
                </span>
              </Checkbox>
            </div>

            {useCustomAddress && (
              <div className="flex flex-col gap-2">
                <Input
                  label="ชื่อผู้รับ"
                  size="md"
                  value={customAddress.shipToName}
                  onValueChange={(v) => handleAddressChange("shipToName", v)}
                />
                <Input
                  label="ที่อยู่ บรรทัด 1"
                  size="md"
                  value={customAddress.shipToAddressLine1}
                  onValueChange={(v) =>
                    handleAddressChange("shipToAddressLine1", v)
                  }
                />
                <Input
                  label="เบอร์โทรศัพท์"
                  size="md"
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
              onPress={handlePrint}
              isLoading={printing}
              isDisabled={totalPieces === 0}
            >
              {printing ? "กำลังพิมพ์..." : `พิมพ์ ${totalPieces} ใบ`}
            </Button>
          </div>
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

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [previewOrder, setPreviewOrder] = useState(null);

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
            orderDateFormatted: order.orderDate,
            deliveryDateFormatted: order.requestedDeliveryDate,
            _rawOrder: order,
          }))
        : [],
    [orders],
  );

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
    (modifiedOrder) => {
      const itemLines = (modifiedOrder.salesOrderLines || []).filter(
        (l) => l.lineType === "Item",
      );
      const totalPieces = itemLines.reduce(
        (sum, l) => sum + (l.quantity || 0),
        0,
      );

      console.log("[UISalesOrderOnline] handlePrintPackingSlip called:", {
        orderNumber: modifiedOrder?.number,
        itemCount: itemLines.length,
        totalPieces,
        shipToName: modifiedOrder?.shipToName,
        salesOrderLinesCount: modifiedOrder?.salesOrderLines?.length,
      });

      if (totalPieces === 0) {
        console.error("[UISalesOrderOnline] No items to print!");
        return;
      }

      closePreview();
      onPrintSingle(modifiedOrder, { type: "packingSlip", enableRFID: false });
    },
    [closePreview, onPrintSingle],
  );

  const renderCustomCell = useCallback(
    (item, columnKey) => {
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
                onPress={() => handleViewOrder(item._rawOrder)}
              >
                <Telescope />
              </Button>
            </div>
          );

        case "customerName":
          return (
            <div className="flex flex-col">
              <span className="truncate max-w-[200px]">
                {item.customerName}
              </span>
              <span className="text-xs text-foreground/60">
                {item.customerNumber}
              </span>
            </div>
          );

        default:
          return undefined;
      }
    },
    [handleViewOrder],
  );

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full overflow-hidden">
      <div className="xl:flex flex-col items-center justify-start w-full xl:w-[20%] h-full gap-2 border-1 border-default overflow-auto hidden">
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-1 border-default">
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

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-1 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Total Orders
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {total}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-1 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Total Items
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {totalItems}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-1 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Total Amount
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {formatCurrency(totalAmount)}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-1 border-default">
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
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalBody className="p-2">
            <PrinterSettings
              onClose={closeSettings}
              showHeader={true}
              title="ควบคุมเครื่องพิมพ์"
              subtitle="ChainWay RFID Printer"
            />
          </ModalBody>
        </ModalContent>
      </Modal>

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
    </div>
  );
}
