"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
  Image,
} from "@heroui/react";
import { Printer, Package } from "lucide-react";

// Company info (same as packingSlip route)
const COMPANY_INFO = {
  name: "บริษัท ชื้ออะฮวด อุตสาหกรรม จำกัด",
  address: "9/1 หมู่ 2 ถนนบางเลน-ลาดหลุมแก้ว",
  district: "ต.ขุนศรี อ.ไทรน้อย จ.นนทบุรี 11150",
  phone: "02-921-9979",
};

/**
 * Label Preview Component
 * Layout based on 100mm x 150mm label
 * Matches ZPL output:
 * - Header (Logo + ผู้ส่ง + 1/X): 20mm (80px)
 * - Recipient (ผู้รับ): 20mm (80px)
 * - Table Header: 5mm (20px)
 * - Table Body: 75mm (300px)
 * - Footer: 25mm (100px)
 */
function LabelPreview({ order, currentPiece, totalPieces }) {
  const itemLines = (order?.salesOrderLines || []).filter(
    (l) => l.lineType === "Item"
  );

  return (
    <div
      className="bg-white border-2 border-black mx-auto overflow-hidden"
      style={{
        width: "400px",
        height: "600px",
        fontFamily: "sans-serif",
      }}
    >
      {/* ============================================ */}
      {/* HEADER SECTION - 20mm (80px) */}
      {/* Logo + ผู้ส่ง + 1/X (top right) */}
      {/* ============================================ */}
      <div
        className="flex border-b-2 border-black relative"
        style={{ height: "80px" }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-center p-1"
          style={{ width: "72px" }}
        >
          <Image
            src="/logo/logo-09.png"
            alt="Logo"
            width={64}
            height={64}
            className="object-contain"
            fallback={
              <div className="w-16 h-16 border border-gray-400 flex items-center justify-center text-sm font-bold">
                LOGO
              </div>
            }
          />
        </div>

        {/* Sender Info - aligned columns */}
        <div className="flex-1 py-1 text-xs">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="font-semibold whitespace-nowrap pr-1 align-top" style={{ width: "45px" }}>
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
                <td className="font-semibold whitespace-nowrap pr-1">โทร:</td>
                <td>{COMPANY_INFO.phone}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Piece Count - Top Right Corner - EXTRA LARGE */}
        <div className="absolute top-1 right-2">
          <span className="text-3xl font-bold">
            {currentPiece}/{totalPieces}
          </span>
        </div>
      </div>

      {/* ============================================ */}
      {/* RECIPIENT SECTION - 20mm (80px) */}
      {/* ============================================ */}
      <div
        className="px-2 py-1 border-b-2 border-black"
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
              <td className="font-semibold whitespace-nowrap pr-1">โทร:</td>
              <td>{order?.phoneNumber || "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ============================================ */}
      {/* TABLE HEADER - 5mm (20px) */}
      {/* ============================================ */}
      <div
        className="flex items-center px-2 text-xs font-semibold border-b border-gray-400"
        style={{ height: "20px" }}
      >
        <span style={{ width: "40px" }}>Item</span>
        <span className="flex-1">รายการสินค้า</span>
        <span style={{ width: "50px" }} className="text-right">
          จำนวน
        </span>
      </div>

      {/* ============================================ */}
      {/* TABLE BODY - 75mm (300px) */}
      {/* ============================================ */}
      <div className="overflow-auto" style={{ height: "300px" }}>
        <table className="w-full text-xs">
          <tbody>
            {itemLines.slice(0, 14).map((line, index) => (
              <tr key={line.id || index} className="border-b border-gray-200">
                <td className="py-1 px-2 align-top" style={{ width: "40px" }}>
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

      {/* ============================================ */}
      {/* FOOTER SECTION - 25mm (100px) */}
      {/* ============================================ */}
      <div className="border-t-2 border-black flex" style={{ height: "100px" }}>
        {/* Warning Note (left side) */}
        <div className="flex-1 p-2 text-xs text-red-600">
          <p className="font-bold">
            ❗ กรุณาถ่ายวิดีโอขณะแกะพัสดุ เพื่อใช้เป็นหลัก
          </p>
          <p className="ml-4">ฐานการเคลมสินค้า ไม่มีหลักฐานงดเคลมทุกกรณี</p>
        </div>

        {/* QR Code (bottom right corner) */}
        <div className="flex items-end justify-end p-2">
          <div
            className="border border-gray-300 flex items-center justify-center bg-gray-50"
            style={{ width: "70px", height: "70px" }}
          >
            <div className="text-center text-xs text-gray-400">
              <div>QR</div>
              <div>Code</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PackingSlipPreviewModal({
  isOpen,
  onClose,
  order,
  onPrint,
  printing = false,
}) {
  if (!order) return null;

  const itemLines = (order.salesOrderLines || []).filter(
    (l) => l.lineType === "Item"
  );
  const totalPieces = itemLines.reduce((sum, l) => sum + (l.quantity || 0), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
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
            <LabelPreview
              order={order}
              currentPiece={1}
              totalPieces={totalPieces}
            />
          </div>

          <Divider className="my-4" />

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Package  />
              รายการสินค้าทั้งหมด ({itemLines.length} รายการ, {totalPieces} ชิ้น)
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
            startContent={<Printer  />}
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