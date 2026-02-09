"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Select, SelectItem } from "@heroui/select";
// Textarea component not available in @heroui, using native textarea with styling
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Loading } from "@/components";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  AlertCircle,
  Save,
  Phone,
  PhoneOff,
  PhoneCall,
  User,
  Calendar,
  Edit3,
  History,
  List,
  Eye,
} from "lucide-react";

const STATUS_COLORS = {
  101: "warning",
  102: "warning",
  103: "primary",
  104: "default",
  201: "primary",
  202: "primary",
  203: "danger",
  204: "primary",
  205: "primary",
  206: "primary",
  211: "primary",
  212: "primary",
  213: "primary",
  301: "warning",
  302: "warning",
  303: "warning",
  304: "warning",
  401: "danger",
  402: "danger",
  501: "success",
  901: "success",
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

const EMS_STATUS_OPTIONS = [
  { value: "NOT_CALLED", label: "ยังไม่ได้โทรถาม", color: "default" },
  { value: "CALLED_NOT_RECEIVED", label: "โทรแล้ว - ยังไม่ได้รับ", color: "danger" },
  { value: "CALLED_RECEIVED", label: "โทรแล้ว - ได้รับแล้ว", color: "success" },
  { value: "CANNOT_CONTACT", label: "ติดต่อไม่ได้", color: "warning" },
];

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

const getEMSStatusIcon = (status) => {
  switch (status) {
    case "NOT_CALLED":
      return <Phone className="w-4 h-4" />;
    case "CALLED_NOT_RECEIVED":
      return <PhoneOff className="w-4 h-4" />;
    case "CALLED_RECEIVED":
      return <PhoneCall className="w-4 h-4" />;
    case "CANNOT_CONTACT":
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Phone className="w-4 h-4" />;
  }
};

const getEMSStatusColor = (status) => {
  const option = EMS_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.color || "default";
};

const getEMSStatusLabel = (status) => {
  const option = EMS_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.label || status;
};

export default function CheckTagEMS({
  trackingData,
  loading,
  error,
  onSearch,
  onClearSearch,
  savedRecord,
  onSaveRecord,
  onUpdateStatus,
  records,
  onViewRecord,
}) {
  const [barcode, setBarcode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [contactStatus, setContactStatus] = useState("NOT_CALLED");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // โหลดข้อมูลที่บันทึกไว้เมื่อมี barcode ที่ค้นหา
  useEffect(() => {
    if (savedRecord) {
      setCustomerName(savedRecord.emsCustomerName || "");
      setContactStatus(savedRecord.emsStatus || "NOT_CALLED");
      setNotes(savedRecord.emsNotes || "");
    } else {
      setCustomerName("");
      setContactStatus("NOT_CALLED");
      setNotes("");
    }
  }, [savedRecord, trackingData]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (barcode.trim()) {
      onSearch(barcode.trim());
    }
  };

  const handleNewSearch = () => {
    setBarcode("");
    setCustomerName("");
    setContactStatus("NOT_CALLED");
    setNotes("");
    onClearSearch?.();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  const handleSave = async () => {
    if (!trackingData?.barcode) return;

    setIsSaving(true);
    try {
      await onSaveRecord({
        barcode: trackingData.barcode,
        customerName,
        status: contactStatus,
        notes,
        lastTracking: trackingData,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedRecord) return;

    setIsSaving(true);
    try {
      await onUpdateStatus(selectedRecord.emsId, {
        status: contactStatus,
        notes,
        callDate: new Date().toISOString(),
      });
      setShowUpdateModal(false);
      setSelectedRecord(null);
    } finally {
      setIsSaving(false);
    }
  };

  const openUpdateModal = (record) => {
    setSelectedRecord(record);
    setContactStatus(record.emsStatus);
    setNotes(record.emsNotes || "");
    setShowUpdateModal(true);
  };

  const openViewModal = (record) => {
    setSelectedRecord(record);
    onViewRecord?.(record);
  };

  // ฟังก์ชันแปลงวันที่จาก พ.ศ. เป็น ค.ศ. (2569 -> 2026)
  const parseThaiDate = (dateStr) => {
    if (!dateStr) return null;
    const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/);
    if (!match) return null;

    const [_, day, month, buddhistYear, hour, minute, second] = match;
    const christianYear = parseInt(buddhistYear) - 543;

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
        <p className="text-default-500">ตรวจสอบสถานะพัสดุไปรษณีย์ EMS พร้อมบันทึกการติดต่อลูกค้า</p>
      </div>

      {/* Search Form - Sticky */}
      <Card className="w-full max-w-2xl sticky top-4 z-10 shadow-lg border-2 border-primary">
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

      {/* View All Records Button */}
      <div className="w-full max-w-2xl flex justify-end">
        <Button
          variant="flat"
          color="secondary"
          startContent={<List className="w-4 h-4" />}
          onClick={() => setShowRecordsModal(true)}
        >
          ดูรายการทั้งหมด
        </Button>
      </div>

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
              <div className="flex items-center gap-2">
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
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  startContent={<Search className="w-4 h-4" />}
                  onClick={handleNewSearch}
                >
                  ค้นหาใหม่
                </Button>
              </div>
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

          {/* Contact Status Card - บันทึกสถานะการติดต่อ */}
          <Card className="w-full border-2 border-primary-200">
            <CardHeader className="flex items-center gap-2 bg-primary-50">
              <Phone className="w-6 h-6 text-primary" />
              <span className="text-lg font-semibold">บันทึกการติดต่อลูกค้า</span>
              {savedRecord && (
                <Chip
                  color={getEMSStatusColor(savedRecord.emsStatus)}
                  size="sm"
                  variant="flat"
                  className="ml-auto"
                  startContent={getEMSStatusIcon(savedRecord.emsStatus)}
                >
                  {getEMSStatusLabel(savedRecord.emsStatus)}
                </Chip>
              )}
            </CardHeader>
            <Divider />
            <CardBody className="gap-4">
              {savedRecord?.emsCallDate && (
                <div className="flex items-center gap-2 text-sm text-default-600 bg-default-100 p-2 rounded">
                  <Calendar className="w-4 h-4" />
                  <span>
                    โทรติดต่อล่าสุด: {new Date(savedRecord.emsCallDate).toLocaleString("th-TH")}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="ชื่อลูกค้า"
                  placeholder="ชื่อลูกค้าที่ติดต่อ"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  startContent={<User className="w-4 h-4 text-default-400" />}
                />
                <Select
                  label="สถานะการติดต่อ"
                  selectedKeys={[contactStatus]}
                  onSelectionChange={(keys) => setContactStatus(Array.from(keys)[0])}
                  startContent={getEMSStatusIcon(contactStatus)}
                >
                  {EMS_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">บันทึกเพิ่มเติม</label>
                <textarea
                  className="w-full px-3 py-2 border border-default-200 rounded-lg bg-white dark:bg-default-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[80px]"
                  placeholder="บันทึกรายละเอียดการสนทนากับลูกค้า..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  color="primary"
                  onClick={handleSave}
                  isLoading={isSaving}
                  startContent={!isSaving && <Save className="w-4 h-4" />}
                >
                  {savedRecord ? "อัพเดทข้อมูล" : "บันทึกเลข EMS"}
                </Button>
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
                        <div
                          className={`absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            index === 0 ? "bg-primary border-primary" : "bg-default-100 border-default-300"
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${index === 0 ? "bg-white" : "bg-default-400"}`} />
                        </div>

                        {/* Content */}
                        <div
                          className={`flex-1 p-4 rounded-lg border ${
                            index === 0 ? "bg-primary-50 border-primary-200" : "bg-default-50 border-default-200"
                          }`}
                        >
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
                                      minute: "2-digit",
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
                              {item.note && <p className="text-default-500">{item.note}</p>}
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

      {/* Records List Modal */}
      <Modal
        isOpen={showRecordsModal}
        onClose={() => setShowRecordsModal(false)}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5" />
              รายการ EMS ที่บันทึกไว้
            </div>
          </ModalHeader>
          <ModalBody>
            {records?.length === 0 ? (
              <div className="text-center py-8 text-default-500">
                <Package className="w-16 h-16 mx-auto mb-4" />
                <p>ยังไม่มีรายการ EMS ที่บันทึกไว้</p>
              </div>
            ) : (
              <div className="space-y-2">
                {records?.map((record) => (
                  <Card key={record.emsId} className="w-full">
                    <CardBody>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="w-4 h-4 text-primary" />
                            <span className="font-mono font-semibold">{record.emsBarcode}</span>
                            <Chip
                              color={getEMSStatusColor(record.emsStatus)}
                              size="sm"
                              variant="flat"
                              startContent={getEMSStatusIcon(record.emsStatus)}
                            >
                              {getEMSStatusLabel(record.emsStatus)}
                            </Chip>
                          </div>
                          {record.emsCustomerName && (
                            <div className="flex items-center gap-2 text-sm text-default-600">
                              <User className="w-3 h-3" />
                              <span>{record.emsCustomerName}</span>
                            </div>
                          )}
                          {record.emsCallDate && (
                            <div className="flex items-center gap-2 text-sm text-default-500">
                              <Calendar className="w-3 h-3" />
                              <span>โทรล่าสุด: {new Date(record.emsCallDate).toLocaleString("th-TH")}</span>
                            </div>
                          )}
                          {record.emsNotes && (
                            <p className="text-sm text-default-600 mt-1 bg-default-100 p-2 rounded">
                              {record.emsNotes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            startContent={<Eye className="w-4 h-4" />}
                            onClick={() => {
                              onViewRecord?.(record);
                              setShowRecordsModal(false);
                            }}
                          >
                            ดูข้อมูล
                          </Button>
                          <Button
                            size="sm"
                            variant="flat"
                            color="secondary"
                            startContent={<Edit3 className="w-4 h-4" />}
                            onClick={() => openUpdateModal(record)}
                          >
                            อัพเดทสถานะ
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={() => setShowRecordsModal(false)}>
              ปิด
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Update Status Modal */}
      <Modal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)} size="md">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              อัพเดทสถานะการติดต่อ
            </div>
          </ModalHeader>
          <ModalBody className="gap-4">
            {selectedRecord && (
              <>
                <div className="bg-default-100 p-3 rounded">
                  <p className="text-sm text-default-500">เลขพัสดุ</p>
                  <p className="font-mono font-semibold">{selectedRecord.emsBarcode}</p>
                  {selectedRecord.emsCustomerName && (
                    <p className="text-sm text-default-600">{selectedRecord.emsCustomerName}</p>
                  )}
                </div>

                <Select
                  label="สถานะการติดต่อ"
                  selectedKeys={[contactStatus]}
                  onSelectionChange={(keys) => setContactStatus(Array.from(keys)[0])}
                  startContent={getEMSStatusIcon(contactStatus)}
                >
                  {EMS_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">บันทึกเพิ่มเติม</label>
                  <textarea
                    className="w-full px-3 py-2 border border-default-200 rounded-lg bg-white dark:bg-default-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[80px]"
                    placeholder="บันทึกรายละเอียดการสนทนา..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={() => setShowUpdateModal(false)}>
              ยกเลิก
            </Button>
            <Button color="primary" onClick={handleUpdateStatus} isLoading={isSaving}>
              บันทึก
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
