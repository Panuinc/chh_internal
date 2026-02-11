"use client";

import React, { useMemo, useCallback, useState } from "react";
import { DataTable, Loading } from "@/components";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
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
  Plus,
  Minus,
} from "lucide-react";
import { PrinterStatusBadge, PrinterSettings } from "@/components/chainWay";
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
        flex flex-col w-full bg-background rounded-lg border-1
        transition-all duration-200
        ${isActive ? "border-default shadow-md scale-[1.02]" : "border-default"}
      `}
    >
      <div className="flex items-center justify-between p-2 border-b-1 border-default bg-default/30">
        <div className="flex items-center gap-2">
          <Tag className="text-foreground" />
          <span className="font-mono font-bold text-lg">{itemNumber}</span>
        </div>
        {totalQuantity > 1 && (
          <Chip
            size="md"
            color={isActive ? "primary" : "default"}
            variant="flat"
          >
            {sequenceText}
          </Chip>
        )}
      </div>

      <div className="flex items-center justify-center p-2 min-h-[60px] border-b-1 border-default">
        <p className="text-center text-base font-medium text-foreground line-clamp-2">
          {displayName}
        </p>
      </div>

      <div className="flex flex-col p-2 bg-default-50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-default-500">
            RFID EPC:
          </span>
        </div>
        <div className="font-mono text-xs text-default-500 break-all bg-default-100 rounded-lg p-2">
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
  onConfirmPrint,
  printing = false,
}) {
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const printType = "thai-rfid";

  const handleQuantityChange = useCallback((value) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1 && num <= 999) {
      setQuantity(num);
    }
  }, []);

  const handleIncrement = useCallback(() => {
    setQuantity((prev) => Math.min(prev + 1, 999));
  }, []);

  const handleDecrement = useCallback(() => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  }, []);

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
      setQuantity(1);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (currentPreviewIndex >= totalLabels && totalLabels > 0) {
      setCurrentPreviewIndex(totalLabels - 1);
    }
  }, [totalLabels, currentPreviewIndex]);

  if (!item) return null;

  const printTypeLabel =
    PRINT_TYPE_OPTIONS.find((opt) => opt.key === printType)?.label || printType;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Tag className="text-foreground" />
            <span>Print RFID Label</span>
          </div>
          <p className="text-sm font-normal text-default-500">
            {item.number} - {item.displayName}
          </p>
        </ModalHeader>

        <ModalBody className="gap-2">
          <div className="flex flex-col gap-2 p-2 bg-default-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                Print Quantity
              </span>
              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  size="md"
                  variant="flat"
                  onPress={handleDecrement}
                  isDisabled={quantity <= 1}
                >
                  <Minus />
                </Button>
                <Input
                  type="number"
                  value={quantity.toString()}
                  onValueChange={handleQuantityChange}
                  classNames={{
                    base: "w-20",
                    input: "text-center font-bold",
                  }}
                  min={1}
                  max={999}
                  size="md"
                />
                <Button
                  isIconOnly
                  size="md"
                  variant="flat"
                  onPress={handleIncrement}
                  isDisabled={quantity >= 999}
                >
                  <Plus />
                </Button>
              </div>
            </div>
            <p className="text-xs text-default-500">
              Type: {printTypeLabel} • Total to print: {totalLabels} labels
            </p>
          </div>

          <Divider />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-default-500">
                Preview {currentPreviewIndex + 1} / {totalLabels}
              </span>

              {totalLabels > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    isIconOnly
                    size="md"
                    variant="flat"
                    onPress={handlePrevious}
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    isIconOnly
                    size="md"
                    variant="flat"
                    onPress={handleNext}
                  >
                    <ChevronRight />
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

          <div className="flex flex-col gap-2 p-2 bg-default-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-default-500">Item Number:</span>
              <span className="font-mono font-medium">{item.number}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-default-500">Display Name:</span>
              <span className="font-medium truncate max-w-[60%]">
                {item.displayName}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-default-500">Category:</span>
              <span>{item.inventoryPostingGroupCode || "-"}</span>
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Print Count</span>
              <Chip size="md" color="success" variant="solid">
                {totalLabels} labels
              </Chip>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-warning-600 font-medium">
              Important Notes
            </p>
            <ul className="text-xs text-warning-600/80 list-disc list-inside space-y-1">
              <li>
                Each label will have a unique RFID EPC (sequence 1/{totalLabels},
                2/{totalLabels}, ...)
              </li>
              <li>Make sure the RFID printer is ready before printing</li>
              <li>EPC will be automatically written to the RFID Tag</li>
            </ul>
          </div>
        </ModalBody>

        <ModalFooter className="gap-2">
          <Button
            color="danger"
            variant="shadow"
            onPress={onClose}
            className="w-full text-white"
          >
            Cancel
          </Button>
          <Button
            color="primary"
            variant="shadow"
            startContent={<Printer />}
            onPress={handleConfirm}
            isLoading={printing}
            isDisabled={totalLabels === 0}
            className="w-full text-white"
          >
            {printing ? "Printing..." : `Print ${totalLabels} labels`}
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
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">Item Details</h3>
          <span className="text-sm text-default-500 font-mono">
            {item.number}
          </span>
        </ModalHeader>

        <ModalBody className="gap-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-start gap-2">
              <Hash className="text-default-400 w-5 h-5" />
              <div className="flex flex-col">
                <p className="text-xs text-default-500">Item Number</p>
                <p className="font-mono font-medium">{item.number}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Package className="text-default-400 w-5 h-5" />
              <div className="flex flex-col">
                <p className="text-xs text-default-500">Display Name</p>
                <p className="font-medium">{item.displayName || "-"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Layers className="text-default-400 w-5 h-5" />
              <div className="flex flex-col">
                <p className="text-xs text-default-500">Category</p>
                <p>{item.inventoryPostingGroupCode || "-"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Tag className="text-default-400 w-5 h-5" />
              <div className="flex flex-col">
                <p className="text-xs text-default-500">Unit</p>
                <p>{item.unitOfMeasureCode || "-"}</p>
              </div>
            </div>
          </div>

          <Divider />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-start gap-2">
              <DollarSign className="text-default-400 w-5 h-5" />
              <div className="flex flex-col">
                <p className="text-xs text-default-500">Unit Price</p>
                <p className="font-medium text-lg">
                  {formatCurrency(item.unitPrice)} THB
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Package className="text-default-400 w-5 h-5" />
              <div className="flex flex-col">
                <p className="text-xs text-default-500">Inventory</p>
                <p
                  className={`font-medium text-lg ${item.inventory > 0 ? "text-success" : "text-default-400"}`}
                >
                  {item.inventory?.toLocaleString("th-TH") || "0"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-default-50 rounded-lg">
            <span className="text-sm text-default-500">Status:</span>
            <Chip
              size="md"
              color={item.blocked ? "danger" : "success"}
              variant="flat"
            >
              {item.blocked ? "Blocked" : "Active"}
            </Chip>
          </div>

          {!isConnected && (
            <div className="flex flex-col gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-danger font-medium">
                ⚠️ Printer Not Connected
              </p>
              <p className="text-xs text-danger/80">
                Please connect the RFID printer before printing
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
            className="w-full text-white"
            onPress={onClose}
          >
            Close
          </Button>
          <Button
            color="primary"
            variant="shadow"
            size="md"
            radius="md"
            className="w-full text-white"
            startContent={<Printer />}
            isDisabled={!isConnected || printing}
            onPress={() => {
              onClose();
              onOpenPrintDialog(item);
            }}
          >
            Print RFID Label
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function UIRawMaterial({
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
    (item) => {
      setSelectedItem(item);
      openPreview();
    },
    [openPreview],
  );

  const handleConfirmPrint = useCallback(
    async (item, quantity, options) => {
      if (onPrintWithQuantity) {
        try {
          await onPrintWithQuantity(item, quantity, options);
          closePreview();
        } catch (error) {

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
              item.inventory > 0 ? "text-success" : "text-default-400"
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
            type="button"
            size="md"
            radius="md"
            onPress={() => handleViewItem(item._rawItem)}
          >
            <Telescope />
          </Button>
        </div>
      );
    },
    [handleViewItem],
  );

  return (
    <div className="flex flex-col w-full h-full overflow-hidden p-2 gap-2">
      <div className="hidden xl:flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-default-500">Total Items</span>
          <span className="text-xs font-semibold text-foreground bg-default-100 p-2 rounded">{total}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-default-500">Active</span>
          <span className="text-xs font-semibold text-green-700 bg-green-50 p-2 rounded">{active}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-default-500">Blocked</span>
          <span className="text-xs font-semibold text-red-700 bg-red-50 p-2 rounded">{blocked}</span>
        </div>
        <div className="flex items-center gap-2">
          <PrinterStatusBadge />
          <Button isIconOnly variant="light" size="sm" onPress={openSettings} title="Printer Settings">
            <Settings className="w-4 h-4" />
          </Button>
          <Button isIconOnly variant="light" size="sm" onPress={onRefresh} isDisabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="flex xl:hidden items-center justify-between w-full shrink-0">
        <PrinterStatusBadge />
        <div className="flex gap-2">
          <Button isIconOnly variant="light" size="sm" onPress={openSettings} title="Printer Settings">
            <Settings className="w-4 h-4" />
          </Button>
          <Button isIconOnly variant="light" size="sm" onPress={onRefresh} isDisabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center w-full h-full">
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
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalBody className="p-2">
            <PrinterSettings
              onClose={closeSettings}
              showHeader={true}
              title="Printer Control"
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

      <RFIDLabelPreviewModal
        isOpen={isPreviewOpen}
        onClose={closePreview}
        item={selectedItem}
        onConfirmPrint={handleConfirmPrint}
        printing={printing}
      />
    </div>
  );
}
