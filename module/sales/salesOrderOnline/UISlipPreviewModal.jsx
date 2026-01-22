"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Image,
} from "@heroui/react";
import { Printer } from "lucide-react";

const COMPANY_INFO = {
  name: "บริษัท ชื้ออะฮวด อุตสาหกรรม จำกัด",
  address: "9/1 หมู่ 2 ถนนบางเลน-ลาดหลุมแก้ว",
  district: "ต.ขุนศรี อ.ไทรน้อย จ.นนทบุรี 11150",
  phone: "02-921-9979",
};

export default function UISlipPreviewModal({
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
              <div className="flex items-center justify-center w-full h-20 p-2 gap-2 border-2">
                Barcode 
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
                  <div className="flex flex-col items-center justify-center w-20 h-20 ded-xl bg-default">
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
