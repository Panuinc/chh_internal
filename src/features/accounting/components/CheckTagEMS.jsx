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
  101: "warning", // รับเข้าระบบ
  102: "primary", // ศูนย์คัดแยก
  103: "primary", // ศูนย์แจกจ่าย
  104: "success", // นำจ่ายสำเร็จ
  105: "danger",  // นำจ่ายไม่สำเร็จ
};

const STATUS_LABELS = {
  101: "รับเข้าระบบ",
  102: "ศูนย์คัดแยก",
  103: "ศูนย์แจกจ่าย",
  104: "นำจ่ายสำเร็จ",
  105: "นำจ่ายไม่สำเร็จ",
};

const getStatusIcon = (status) => {
  switch (status) {
    case 101:
      return <Package className="w-5 h-5" />;
    case 102:
    case 103:
      return <Truck className="w-5 h-5" />;
    case 104:
      return <CheckCircle className="w-5 h-5" />;
    case 105:
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

  // จัดเรียงข้อมูลตามเวลาล่าสุดก่อน
  const sortedItems = trackingData?.items
    ? [...trackingData.items].sort((a, b) => 
        new Date(b.delivery_datetime || b.operation_date + "T" + b.operation_time) - 
        new Date(a.delivery_datetime || a.operation_date + "T" + a.operation_time)
      )
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
                  color={STATUS_COLORS[latestStatus.delivery_status] || "default"}
                  size="lg"
                  variant="flat"
                  startContent={getStatusIcon(latestStatus.delivery_status)}
                >
                  {STATUS_LABELS[latestStatus.delivery_status] || latestStatus.delivery_status}
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
                                color={STATUS_COLORS[item.delivery_status] || "default"}
                                size="sm"
                                variant="flat"
                              >
                                {STATUS_LABELS[item.delivery_status] || item.delivery_status}
                              </Chip>
                              <span className="font-medium">{item.status_description || item.status}</span>
                            </div>
                            <span className="text-sm text-default-500 font-mono">
                              {item.delivery_datetime 
                                ? new Date(item.delivery_datetime).toLocaleString("th-TH")
                                : `${item.operation_date} ${item.operation_time}`
                              }
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
