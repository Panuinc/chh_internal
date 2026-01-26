"use client";

import React, { useMemo, useCallback, useState } from "react";
import { DataTable, Loading } from "@/components";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Divider,
} from "@heroui/react";
import {
  Printer,
  RefreshCw,
  Settings,
  Tag,
  ChevronLeft,
  ChevronRight,
  Telescope,
  Package,
  Hash,
  DollarSign,
  Layers,
} from "lucide-react";
import { PrinterStatusBadge, PrinterSettings } from "@/components/chainWay";
import { PrintQuantityDialog } from "@/components/chainWay";
import { useRFIDSafe } from "@/hooks";
import { PRINT_TYPE_OPTIONS, STATUS_COLORS } from "@/lib/chainWay/config";
import { EPCService } from "@/lib/chainWay/epc";

const columns = [
  { name: "#", uid: "index", width: 60 },
  { name: "Item No.", uid: "number" },
  { name: "Display Name", uid: "displayName" },
  { name: "Category", uid: "inventoryPostingGroupCode" },
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

function RFIDLabelCard({
  itemNumber,
  displayName,
  sequenceNumber,
  totalQuantity,
  epc,
  isActive = false,
}) {
  const sequenceText = `${sequenceNumber}/${totalQuantity}`;

  return (
    <div
      className={`
        flex flex-col w-full bg-background rounded-xl border-2 
        transition-all duration-200
        ${isActive ? "border-primary shadow-lg scale-[1.02]" : "border-default"}
      `}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-default bg-default/30">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" />
          <span className="font-mono font-bold text-lg">{itemNumber}</span>
        </div>
        {totalQuantity > 1 && (
          <Chip
            size="sm"
            color={isActive ? "primary" : "default"}
            variant="flat"
          >
            {sequenceText}
          </Chip>
        )}
      </div>

      <div className="flex items-center justify-center px-4 py-4 min-h-[60px] border-b border-default">
        <p className="text-center text-base font-medium text-foreground/90 line-clamp-2">
          {displayName}
        </p>
      </div>

      <div className="flex flex-col px-4 py-3 bg-default/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-foreground/60">
            RFID EPC:
          </span>
        </div>
        <div className="font-mono text-xs text-foreground/70 break-all bg-default/50 rounded px-2 py-1">
          {epc}
        </div>
      </div>
    </div>
  );
}

function RFIDLabelPreviewModal({
  isOpen,
  onClose,
  item,
  quantity,
  printType,
  onConfirmPrint,
  printing = false,
}) {
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  const allLabels = useMemo(() => {
    if (!item || !quantity) return [];

    const labels = [];
    for (let seq = 1; seq <= quantity; seq++) {
      const epc = EPCService.generate(
        { number: item.number },
        { sequenceNumber: seq, totalQuantity: quantity, bits: 96 },
      );

      labels.push({
        itemNumber: item.number,
        displayName: item.displayName || item.description || item.number,
        sequenceNumber: seq,
        totalQuantity: quantity,
        epc,
        sequenceText: `${seq}/${quantity}`,
      });
    }
    return labels;
  }, [item, quantity]);

  const totalLabels = allLabels.length;
  const currentLabel = allLabels[currentPreviewIndex];

  const handlePrevious = () => {
    setCurrentPreviewIndex((prev) => (prev > 0 ? prev - 1 : totalLabels - 1));
  };

  const handleNext = () => {
    setCurrentPreviewIndex((prev) => (prev < totalLabels - 1 ? prev + 1 : 0));
  };

  const handleConfirm = () => {
    onConfirmPrint(item, quantity, { type: printType, labels: allLabels });
  };

  React.useEffect(() => {
    if (isOpen) {
      setCurrentPreviewIndex(0);
    }
  }, [isOpen]);

  if (!item) return null;

  const printTypeLabel =
    PRINT_TYPE_OPTIONS.find((opt) => opt.key === printType)?.label || printType;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            <span>ตัวอย่าง RFID Label</span>
          </div>
          <p className="text-sm font-normal text-foreground/60">
            ประเภท: {printTypeLabel} • จะพิมพ์ทั้งหมด {totalLabels} ใบ
          </p>
        </ModalHeader>

        <ModalBody className="gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/70">
                ตัวอย่างที่ {currentPreviewIndex + 1} / {totalLabels}
              </span>

              {totalLabels > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    onPress={handlePrevious}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    onPress={handleNext}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {currentLabel && (
              <RFIDLabelCard
                itemNumber={currentLabel.itemNumber}
                displayName={currentLabel.displayName}
                sequenceNumber={currentLabel.sequenceNumber}
                totalQuantity={currentLabel.totalQuantity}
                epc={currentLabel.epc}
                isActive={true}
              />
            )}
          </div>

          <Divider />

          <div className="flex flex-col gap-2 p-3 bg-default/30 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground/60">Item Number:</span>
              <span className="font-mono font-medium">{item.number}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground/60">Display Name:</span>
              <span className="font-medium truncate max-w-[60%]">
                {item.displayName}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground/60">Category:</span>
              <span>{item.inventoryPostingGroupCode || "-"}</span>
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">จำนวนที่พิมพ์</span>
              <Chip size="sm" color="success" variant="solid">
                {totalLabels} ใบ
              </Chip>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-3 bg-warning/10 rounded-lg border border-warning/30">
            <p className="text-sm text-warning-600 font-medium">
              ⚠️ ข้อควรทราบ
            </p>
            <ul className="text-xs text-warning-600/80 list-disc list-inside space-y-1">
              <li>
                Label แต่ละใบจะมี RFID EPC ไม่ซ้ำกัน (sequence 1/{totalLabels},
                2/{totalLabels}, ...)
              </li>
              <li>ตรวจสอบให้แน่ใจว่าเครื่องพิมพ์ RFID พร้อมใช้งาน</li>
              <li>EPC จะถูกเขียนลง RFID Tag อัตโนมัติ</li>
            </ul>
          </div>
        </ModalBody>

        <ModalFooter className="gap-2">
          <Button
            color="danger"
            variant="light"
            onPress={onClose}
            className="flex-1"
          >
            ยกเลิก
          </Button>
          <Button
            color="primary"
            variant="shadow"
            startContent={<Printer className="w-4 h-4" />}
            onPress={handleConfirm}
            isLoading={printing}
            isDisabled={totalLabels === 0}
            className="flex-1"
          >
            {printing ? "กำลังพิมพ์..." : `พิมพ์ ${totalLabels} ใบ`}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function ItemDetailModal({
  isOpen,
  onClose,
  item,
  onOpenPrintDialog,
  isConnected,
  printing,
}) {
  if (!item) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">Item Details</h3>
          <span className="text-sm text-foreground/60 font-mono">
            {item.number}
          </span>
        </ModalHeader>

        <ModalBody className="gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Hash className="text-foreground/50 mt-1 w-5 h-5" />
              <div className="flex flex-col">
                <p className="text-xs text-foreground/60">Item Number</p>
                <p className="font-mono font-medium">{item.number}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package className="text-foreground/50 mt-1 w-5 h-5" />
              <div className="flex flex-col">
                <p className="text-xs text-foreground/60">Display Name</p>
                <p className="font-medium">{item.displayName || "-"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Layers className="text-foreground/50 mt-1 w-5 h-5" />
              <div className="flex flex-col">
                <p className="text-xs text-foreground/60">Category</p>
                <p>{item.inventoryPostingGroupCode || "-"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Tag className="text-foreground/50 mt-1 w-5 h-5" />
              <div className="flex flex-col">
                <p className="text-xs text-foreground/60">Unit</p>
                <p>{item.unitOfMeasureCode || "-"}</p>
              </div>
            </div>
          </div>

          <Divider />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <DollarSign className="text-foreground/50 mt-1 w-5 h-5" />
              <div className="flex flex-col">
                <p className="text-xs text-foreground/60">Unit Price</p>
                <p className="font-medium text-lg">
                  {formatCurrency(item.unitPrice)} THB
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package className="text-foreground/50 mt-1 w-5 h-5" />
              <div className="flex flex-col">
                <p className="text-xs text-foreground/60">Inventory</p>
                <p
                  className={`font-medium text-lg ${item.inventory > 0 ? "text-success" : "text-foreground/50"}`}
                >
                  {item.inventory?.toLocaleString("th-TH") || "0"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-default/30 rounded-lg">
            <span className="text-sm text-foreground/60">Status:</span>
            <Chip
              size="sm"
              color={item.blocked ? "danger" : "success"}
              variant="flat"
            >
              {item.blocked ? "Blocked" : "Active"}
            </Chip>
          </div>

          {!isConnected && (
            <div className="flex flex-col gap-2 p-3 bg-danger/10 rounded-lg border border-danger/30">
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
            className="flex-1"
            onPress={onClose}
          >
            Close
          </Button>
          <Button
            color="primary"
            variant="shadow"
            size="md"
            radius="md"
            className="flex-1"
            startContent={<Printer className="w-4 h-4" />}
            isDisabled={!isConnected || printing}
            onPress={() => {
              onClose();
              onOpenPrintDialog(item, "thai-rfid");
            }}
          >
            Print RFID Label
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function UICatFinishedGoods({
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

  const {
    isOpen: isPreviewOpen,
    onOpen: openPreview,
    onClose: closePreview,
  } = useDisclosure();

  const {
    isOpen: isDetailOpen,
    onOpen: openDetail,
    onClose: closeDetail,
  } = useDisclosure();

  const { isConnected } = useRFIDSafe();

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedPrintType, setSelectedPrintType] = useState("thai-rfid");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

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
            _rawItem: item,
          }))
        : [],
    [items],
  );

  const handleViewItem = useCallback(
    (item) => {
      setSelectedItem(item);
      openDetail();
    },
    [openDetail],
  );

  const handleCloseDetail = useCallback(() => {
    closeDetail();
    setSelectedItem(null);
  }, [closeDetail]);

  const handleOpenPrintDialog = useCallback(
    (item, printType) => {
      setSelectedItem(item);
      setSelectedPrintType(printType);
      openPrintDialog();
    },
    [openPrintDialog],
  );

  const handleQuantityConfirm = useCallback(
    (item, quantity, options) => {
      setSelectedQuantity(quantity);
      closePrintDialog();
      openPreview();
    },
    [closePrintDialog, openPreview],
  );

  const handleConfirmPrint = useCallback(
    async (item, quantity, options) => {
      if (onPrintWithQuantity) {
        try {
          await onPrintWithQuantity(item, quantity, options);
          closePreview();
        } catch (error) {
          console.error("Print error:", error);
        }
      }
    },
    [onPrintWithQuantity, closePreview],
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
        <div className="flex items-center justify-center gap-2">
          <Button
            isIconOnly
            color="default"
            variant="shadow"
            size="md"
            radius="md"
            onPress={() => handleViewItem(item._rawItem)}
          >
            <Telescope className="w-4 h-4" />
          </Button>
        </div>
      );
    },
    [handleViewItem],
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

      <ItemDetailModal
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        item={selectedItem}
        onOpenPrintDialog={handleOpenPrintDialog}
        isConnected={isConnected}
        printing={printing}
      />

      <PrintQuantityDialog
        isOpen={isPrintDialogOpen}
        onClose={closePrintDialog}
        item={selectedItem}
        onPrint={handleQuantityConfirm}
        printing={false}
        printType={selectedPrintType}
      />

      <RFIDLabelPreviewModal
        isOpen={isPreviewOpen}
        onClose={closePreview}
        item={selectedItem}
        quantity={selectedQuantity}
        printType={selectedPrintType}
        onConfirmPrint={handleConfirmPrint}
        printing={printing}
      />
    </div>
  );
}