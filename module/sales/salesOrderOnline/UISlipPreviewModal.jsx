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
import { Printer, Package } from "lucide-react";

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
          <div className="flex flex-col items-center gap-4 py-4 bg-default rounded-xl">
            <p className="text-sm text-foreground/60">
              ตัวอย่างใบที่ 1 จาก {totalPieces} ใบ (ขนาด 100mm x 150mm)
            </p>

            <div
              className="flex flex-col bg-background border-2 border-foreground mx-auto overflow-hidden"
              style={{
                width: "400px",
                height: "600px",
                fontFamily: "sans-serif",
              }}
            >
              <div
                className="flex border-b-2 border-foreground relative"
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
                      <div className="flex items-center justify-center w-16 h-16 border border-default text-sm font-bold">
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
                className="flex flex-col px-2 py-1 border-b-2 border-foreground"
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
                className="flex items-center px-2 text-xs font-semibold border-b border-default"
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
                        className="border-b border-default"
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
                        <td
                          colSpan={3}
                          className="py-1 px-2 text-foreground/50"
                        >
                          ... และอีก {itemLines.length - 14} รายการ
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div
                className="flex border-t-2 border-foreground"
                style={{ height: "100px" }}
              >
                <div className="flex flex-col flex-1 p-2 text-xs text-danger">
                  <p className="font-bold">
                    ❗ กรุณาถ่ายวิดีโอขณะแกะพัสดุ เพื่อใช้เป็นหลัก
                  </p>
                  <p className="ml-4">
                    ฐานการเคลมสินค้า ไม่มีหลักฐานงดเคลมทุกกรณี
                  </p>
                </div>
                <div className="flex items-end justify-end p-2">
                  <div
                    className="flex items-center justify-center border border-default bg-default"
                    style={{ width: "70px", height: "70px" }}
                  >
                    <div className="flex flex-col items-center text-xs text-foreground/40">
                      <div>QR</div>
                      <div>Code</div>
                    </div>
                  </div>
                </div>
              </div>
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
