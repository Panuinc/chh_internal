"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Checkbox,
  Divider,
} from "@heroui/react";
import { Printer, Package, Hash, AlertCircle } from "lucide-react";

export default function PrintQuantityDialog({
  isOpen,
  onClose,
  item,
  onPrint,
  printing = false,
  printType = "thai-rfid",
}) {
  const [quantity, setQuantity] = useState(1);
  const [useInventory, setUseInventory] = useState(false);

  useEffect(() => {
    if (item) {
      const inv = item.inventory || 1;
      setQuantity(inv > 0 ? inv : 1);
      setUseInventory(inv > 0);
    }
  }, [item]);

  const handleQuantityChange = useCallback((value) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0 && num <= 99) {
      setQuantity(num);
    }
  }, []);

  const handleUseInventoryChange = useCallback(
    (checked) => {
      setUseInventory(checked);
      if (checked && item?.inventory > 0) {
        setQuantity(item.inventory);
      }
    },
    [item],
  );

  const handlePrint = useCallback(() => {
    if (onPrint && item) {
      onPrint(item, quantity, {
        type: printType,
        enableRFID: printType === "thai-rfid",
      });
    }
  }, [onPrint, item, quantity, printType]);

  const isRFID = printType === "thai-rfid";
  const inventoryCount = item?.inventory || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Printer />
          <span>พิมพ์ฉลาก {isRFID ? "RFID" : ""}</span>
        </ModalHeader>

        <ModalBody className="gap-4">
          {item && (
            <div className="p-3 rounded-lg bg-default-100">
              <div className="flex items-center gap-2 mb-2">
                <Package className="text-foreground/60" />
                <span className="font-medium">{item.number}</span>
              </div>
              <p className="text-sm text-foreground/70 ml-6">
                {item.displayName || item.number}
              </p>
              {inventoryCount > 0 && (
                <p className="text-sm text-foreground/50 ml-6 mt-1">
                  สต๊อก: {inventoryCount} {item.unitOfMeasureCode || "ชิ้น"}
                </p>
              )}
            </div>
          )}

          <Divider />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Hash className="text-foreground/60" />
              <span className="font-medium">จำนวนที่ต้องการพิมพ์</span>
            </div>

            {inventoryCount > 0 && (
              <Checkbox
                isSelected={useInventory}
                onValueChange={handleUseInventoryChange}
                size="md"
              >
                ใช้จำนวนตามสต๊อก ({inventoryCount} ชิ้น)
              </Checkbox>
            )}

            <Input
              type="number"
              label="จำนวน"
              placeholder="ระบุจำนวน"
              min={1}
              max={99}
              value={quantity.toString()}
              onValueChange={handleQuantityChange}
              isDisabled={useInventory}
              startContent={
                <span className="text-foreground/50 text-sm">ใบ</span>
              }
              classNames={{
                input: "text-center text-lg font-medium",
              }}
            />

            <div className="flex gap-2">
              {[1, 3, 5, 10].map((num) => (
                <Button
                  key={num}
                  size="md"
                  variant={quantity === num ? "solid" : "bordered"}
                  onPress={() => {
                    setQuantity(num);
                    setUseInventory(false);
                  }}
                  className="flex-1"
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          {isRFID && quantity > 1 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-warning-50 border border-warning-200">
              <AlertCircle className="text-warning mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning-700">
                  RFID Sequential Labels
                </p>
                <p className="text-warning-600">
                  จะพิมพ์ {quantity} ใบ โดยแต่ละใบจะมี EPC แตกต่างกัน (1/
                  {quantity}, 2/{quantity}, ... {quantity}/{quantity})
                </p>
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            color="danger"
            variant="shadow"
            onPress={onClose}
            className="w-full text-background"
            isDisabled={printing}
          >
            ยกเลิก
          </Button>
          <Button
            color="primary"
            variant="shadow"
            onPress={handlePrint}
            isLoading={printing}
            startContent={!printing && <Printer />}
            className="w-full text-background"
          >
            พิมพ์ {quantity} ใบ
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
