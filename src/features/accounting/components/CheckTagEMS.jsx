"use client";

import React, { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Loading } from "@/components";
import { Search, Package, Truck, CheckCircle, Clock, MapPin, AlertCircle } from "lucide-react";

const STATUS_COLORS = {
  101: "warning", // เตรียมการฝากส่ง
  102: "warning", // รับฝากผ่านตัวแทน
  103: "primary", // รับฝาก
  104: "default", // ผู้ฝากส่งขอถอนคืน
  201: "primary", // ออกจากที่ทำการ
  202: "primary", // ดำเนินพิธีการศุลกากร
  203: "danger",  // ส่งคืนต้นทาง
  204: "primary", // ถึงที่แลกเปลี่ยนขาออก
  205: "primary", // ถึงที่แลกเปลี่ยนขาเข้า
  206: "primary", // ถึงที่ทำการไปรษณีย์
  211: "primary", // รับเข้า ณ ศูนย์คัดแยก
  212: "primary", // ส่งมอบให้สายการบิน
  213: "primary", // สายการบินรับมอบ
  301: "warning", // อยู่ระหว่างการนำจ่าย
  302: "warning", // นำจ่าย ณ จุดรับสิ่งของ
  303: "warning", // เจ้าหน้าที่ติดต่อผู้รับ
  304: "warning", // เจ้าหน้าที่ติดต่อผู้รับไม่ได้
  401: "danger",  // นำจ่ายไม่สำเร็จ
  402: "danger",  // ปิดประกาศ
  501: "success", // นำจ่ายสำเร็จ
  901: "success", // โอนเงินให้ผู้ขาย
};

const STATUS_LABELS = {
  101: "เตรียมการฝากส่ง",
  102: "รับฝากผ่านตัวแทน",
  103: "รับฝาก",
  104: "ผู้ฝากส่งขอถอนคืน",
  201: "ออกจากที่ทำการ",
  202: "ดำเนินพิธีการศุลกากร",
  203: "ส่งคืนต้นทาง",
  204: "ถึงที่แลกเปลี่ยนขาออก",
  205: "ถึงที่แลกเปลี่ยนขาเข้า",
  206: "ถึงที่ทำการไปรษณีย์",
  211: "รับเข้า ณ ศูนย์คัดแยก",
  212: "ส่งมอบให้สายการบิน",
  213: "สายการบินรับมอบ",
  301: "อยู่ระหว่างการนำจ่าย",
  302: "นำจ่าย ณ จุดรับสิ่งของ",
  303: "เจ้าหน้าที่ติดต่อผู้รับ",
  304: "เจ้าหน้าที่ติดต่อผู้รับไม่ได้",
  401: "นำจ่ายไม่สำเร็จ",
  402: "ปิดประกาศ",
  501: "นำจ่ายสำเร็จ",
  901: "โอนเงินให้ผู้ขาย",
};

const getStatusIcon = (status) => {
  const statusNum = parseInt(status);
  switch (statusNum) {
    case 101:
    case 102:
    case 103:
      return <Package className="w-5 h-5" />;
    case 201:
    case 202:
    case 204:
    case 205:
    case 206:
    case 211:
    case 212:
    case 213:
      return <Truck className="w-5 h-5" />;
    case 301:
    case 302:
    case 303:
    case 304:
      return <Clock className="w-5 h-5" />;
    case 501:
    case 901:
      return <CheckCircle className="w-5 h-5" />;
    case 401:
    case 402:
    case 203:
      return <AlertCircle className="w-5 h-5" />;
    default:
      return <Clock className="w-5 h-5" />;
  }
};

export default function CheckTagEMS({ trackingData, loading, error, onSearch }) {
  const [barcode, setBarcode] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (barcode.trim()) {
      onSearch(barcode.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  // ฟังก์ชันแปลงวันที่จาก พ.ศ. เป็น ค.ศ. (2569 -> 2026)
  const parseThaiDate = (dateStr) => {
    if (!dateStr) return null;
    // รูปแบบ: "24/01/2569 15:36:38+07:00"
    const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/);
    if (!match) return null;
    
    const [_, day, month, buddhistYear, hour, minute, second] = match;
    const christianYear = parseInt(buddhistYear) - 543; // แปลง พ.ศ. -> ค.ศ.
    
    return new Date(`${christianYear}-${month}-${day}T${hour}:${minute}:${second}`);
  };

  // จัดเรียงข้อมูลตามเวลาล่าสุดก่อน
  const sortedItems = trackingData?.items
    ? [...trackingData.items].sort((a, b) => {
        const dateA = parseThaiDate(a.status_date);
        const dateB = parseThaiDate(b.status_date);
        return (dateB || 0) - (dateA || 0);
      })
    : [];

  const latestStatus = sortedItems[0];

  return (
    <div className="flex flex-col items-center justify-start w-full h-full gap-4 p-4 overflow-auto">
      {/* Header */}
      <div className="flex flex-col items-center justify-center w-full gap-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Truck className="w-8 h-8 text-primary" />
          Check Tag EMS
        </h1>
        <p className="text-default-500">ตรวจสอบสถานะพัสดุไปรษณีย์ EMS</p>
      </div>

      {/* Search Form */}
      <Card className="w-full max-w-2xl">
        <CardBody>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="กรอกหมายเลขพัสดุ EMS (เช่น EN123456789TH)"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={handleKeyDown}
              startContent={<Package className="w-5 h-5 text-default-400" />}
              className="flex-1"
              size="lg"
              isClearable
              onClear={() => setBarcode("")}
            />
            <Button
              type="submit"
              color="primary"
              size="lg"
              isLoading={loading}
              startContent={!loading && <Search className="w-5 h-5" />}
              isDisabled={!barcode.trim()}
            >
              ค้นหา
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="w-full max-w-2xl border-danger">
          <CardBody className="flex items-center gap-2 text-danger">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </CardBody>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Loading />
          <p className="text-default-500">กำลังค้นหาข้อมูล...</p>
        </div>
      )}

      {/* Results */}
      {!loading && trackingData && (
        <div className="flex flex-col w-full max-w-4xl gap-4">
          {/* Summary Card */}
          <Card className="w-full">
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-6 h-6 text-primary" />
                <span className="text-lg font-semibold">ข้อมูลพัสดุ</span>
              </div>
              {latestStatus && (
                <Chip
                  color={STATUS_COLORS[parseInt(latestStatus.status)] || "default"}
                  size="lg"
                  variant="flat"
                  startContent={getStatusIcon(latestStatus.status)}
                >
                  {latestStatus.status_description || STATUS_LABELS[parseInt(latestStatus.status)] || latestStatus.status}
                </Chip>
              )}
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-default-500">หมายเลขพัสดุ</p>
                  <p className="text-lg font-mono font-semibold">{trackingData.barcode}</p>
                </div>
                <div>
                  <p className="text-sm text-default-500">บริการ</p>
                  <p className="text-lg">{trackingData.productName || "EMS"}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Tracking History */}
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                <span className="text-lg font-semibold">ประวัติการติดตาม</span>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              {sortedItems.length === 0 ? (
                <p className="text-center text-default-500 py-4">ไม่พบข้อมูลการติดตาม</p>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-default-200" />
                  
                  <div className="space-y-4">
                    {sortedItems.map((item, index) => (
                      <div key={index} className="relative flex gap-4 pl-10">
                        {/* Timeline dot */}
                        <div className={`absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          index === 0 
                            ? "bg-primary border-primary" 
                            : "bg-default-100 border-default-300"
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            index === 0 ? "bg-white" : "bg-default-400"
                          }`} />
                        </div>

                        {/* Content */}
                        <div className={`flex-1 p-4 rounded-lg border ${
                          index === 0 
                            ? "bg-primary-50 border-primary-200" 
                            : "bg-default-50 border-default-200"
                        }`}>
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Chip
                                color={STATUS_COLORS[parseInt(item.status)] || "default"}
                                size="sm"
                                variant="flat"
                              >
                                {item.status_description || STATUS_LABELS[parseInt(item.status)] || item.status}
                              </Chip>
                              <span className="font-medium">{item.status_description || item.status}</span>
                            </div>
                            <span className="text-sm text-default-500 font-mono">
                              {(() => {
                                const date = parseThaiDate(item.status_date);
                                return date 
                                  ? date.toLocaleString("th-TH", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })
                                  : item.status_date;
                              })()}
                            </span>
                          </div>
                          
                          <div className="mt-2 flex items-start gap-2 text-sm text-default-600">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <p>{item.location || item.postcode_location || "-"}</p>
                              {item.receiver_name && (
                                <p className="text-success font-medium">
                                  ผู้รับ: {item.receiver_name}
                                  {item.signature && " (เซ็นรับแล้ว)"}
                                </p>
                              )}
                              {item.note && (
                                <p className="text-default-500">{item.note}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !trackingData && (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-default-400">
          <Package className="w-24 h-24" />
          <p className="text-lg">กรอกหมายเลขพัสดุ EMS เพื่อตรวจสอบสถานะ</p>
          <p className="text-sm">ตัวอย่าง: EN123456789TH, EK987654321TH</p>
        </div>
      )}
    </div>
  );
}
