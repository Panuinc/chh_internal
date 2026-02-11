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
  101: "Preparing for Shipment",
  102: "Received via Agent",
  103: "Received",
  104: "Sender Requested Withdrawal",
  201: "Departed from Post Office",
  202: "Customs Processing",
  203: "Returned to Origin",
  204: "Arrived at Outbound Exchange",
  205: "Arrived at Inbound Exchange",
  206: "Arrived at Post Office",
  211: "Received at Sorting Center",
  212: "Handed to Airline",
  213: "Airline Received",
  301: "Out for Delivery",
  302: "Delivered at Collection Point",
  303: "Officer Contacting Recipient",
  304: "Officer Unable to Contact Recipient",
  401: "Delivery Unsuccessful",
  402: "Notice Posted",
  501: "Delivered Successfully",
  901: "Payment Transferred to Seller",
};

const EMS_STATUS_OPTIONS = [
  { value: "NOT_CALLED", label: "Not Called", color: "default" },
  { value: "CALLED_NOT_RECEIVED", label: "Called - Not Received", color: "danger" },
  { value: "CALLED_RECEIVED", label: "Called - Received", color: "success" },
  { value: "CANNOT_CONTACT", label: "Cannot Contact", color: "warning" },
];

const getStatusIcon = (status) => {
  const statusNum = parseInt(status);
  switch (statusNum) {
    case 101:
    case 102:
    case 103:
      return <Package className="w-4 h-4" />;
    case 201:
    case 202:
    case 204:
    case 205:
    case 206:
    case 211:
    case 212:
    case 213:
      return <Truck className="w-4 h-4" />;
    case 301:
    case 302:
    case 303:
    case 304:
      return <Clock className="w-4 h-4" />;
    case 501:
    case 901:
      return <CheckCircle className="w-4 h-4" />;
    case 401:
    case 402:
    case 203:
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
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

  const parseThaiDate = (dateStr) => {
    if (!dateStr) return null;
    const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/);
    if (!match) return null;

    const [_, day, month, buddhistYear, hour, minute, second] = match;
    const christianYear = parseInt(buddhistYear) - 543;

    return new Date(`${christianYear}-${month}-${day}T${hour}:${minute}:${second}`);
  };

  const sortedItems = trackingData?.items
    ? [...trackingData.items].sort((a, b) => {
        const dateA = parseThaiDate(a.status_date);
        const dateB = parseThaiDate(b.status_date);
        return (dateB || 0) - (dateA || 0);
      })
    : [];

  const latestStatus = sortedItems[0];

  return (
    <div className="flex flex-col w-full h-full overflow-auto">
      <div className="w-full h-full p-2 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Truck className="w-5 h-5 text-default-500" />
            Check Tag EMS
          </h1>
          <p className="text-[13px] text-default-400">Check EMS parcel delivery status and record customer contact</p>
        </div>

        {/* Search Form */}
        <div className="bg-background rounded-lg border border-default p-2 sticky top-2 z-10">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter EMS tracking number (e.g. EN123456789TH)"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={handleKeyDown}
              startContent={<Package className="w-4 h-4 text-default-400" />}
              className="flex-1"
              size="sm"
              radius="sm"
              variant="bordered"
              isClearable
              onClear={() => setBarcode("")}
              classNames={{
                inputWrapper: "border-default hover:border-default shadow-none h-9",
                input: "text-[13px]",
              }}
            />
            <Button
              type="submit"
              size="sm"
              radius="sm"
              isLoading={loading}
              startContent={!loading && <Search className="w-4 h-4" />}
              isDisabled={!barcode.trim()}
              className="bg-foreground text-background font-medium hover:bg-foreground"
            >
              Search
            </Button>
          </form>
        </div>

        {/* View All Records Button */}
        <div className="flex justify-end">
          <Button
            variant="bordered"
            size="sm"
            radius="sm"
            startContent={<List className="w-4 h-4" />}
            className="border-default text-default-700 hover:bg-default-50"
            onClick={() => setShowRecordsModal(true)}
          >
            View All Records
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[13px]">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-2 p-2">
            <Loading />
            <p className="text-[13px] text-default-400">Searching...</p>
          </div>
        )}

        {/* Results */}
        {!loading && trackingData && (
          <div className="space-y-4">
            {/* Summary Card */}
            <div className="bg-background rounded-lg border border-default">
              <div className="flex items-center justify-between p-2 border-b border-default">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-default-500" />
                  <span className="text-[13px] font-semibold text-foreground">Parcel Information</span>
                </div>
                <div className="flex items-center gap-2">
                  {latestStatus && (
                    <Chip
                      color={STATUS_COLORS[parseInt(latestStatus.status)] || "default"}
                      size="sm"
                      variant="flat"
                      startContent={getStatusIcon(latestStatus.status)}
                    >
                      {latestStatus.status_description || STATUS_LABELS[parseInt(latestStatus.status)] || latestStatus.status}
                    </Chip>
                  )}
                  <Button
                    size="sm"
                    radius="sm"
                    variant="bordered"
                    startContent={<Search className="w-3.5 h-3.5" />}
                    onClick={handleNewSearch}
                    className="border-default text-default-700 text-xs"
                  >
                    New Search
                  </Button>
                </div>
              </div>
              <div className="p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-default-500">Tracking Number</p>
                    <p className="text-[13px] font-mono font-semibold text-foreground">{trackingData.barcode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-default-500">Service</p>
                    <p className="text-[13px] text-foreground">{trackingData.productName || "EMS"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Status Card */}
            <div className="bg-background rounded-lg border border-default">
              <div className="flex items-center gap-2 p-2 border-b border-default">
                <Phone className="w-4 h-4 text-default-500" />
                <span className="text-[13px] font-semibold text-foreground">Customer Contact Record</span>
                {savedRecord && (
                  <Chip
                    color={getEMSStatusColor(savedRecord.emsStatus)}
                    size="sm"
                    variant="flat"
                    className=""
                    startContent={getEMSStatusIcon(savedRecord.emsStatus)}
                  >
                    {getEMSStatusLabel(savedRecord.emsStatus)}
                  </Chip>
                )}
              </div>
              <div className="p-2 space-y-4">
                {savedRecord?.emsCallDate && (
                  <div className="flex items-center gap-2 text-xs text-default-500 bg-default-50 p-2 rounded-md">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Last Contact: {new Date(savedRecord.emsCallDate).toLocaleString("en-US")}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    label="Customer Name"
                    placeholder="Contact customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    startContent={<User className="w-4 h-4 text-default-400" />}
                    variant="bordered"
                    size="sm"
                    radius="sm"
                    classNames={{
                      inputWrapper: "border-default hover:border-default shadow-none",
                      input: "text-[13px]",
                      label: "text-default-600 text-xs font-medium",
                    }}
                  />
                  <Select
                    label="Contact Status"
                    selectedKeys={[contactStatus]}
                    onSelectionChange={(keys) => setContactStatus(Array.from(keys)[0])}
                    startContent={getEMSStatusIcon(contactStatus)}
                    variant="bordered"
                    size="sm"
                    radius="sm"
                    classNames={{
                      trigger: "border-default hover:border-default shadow-none",
                      label: "text-default-600 text-xs font-medium",
                    }}
                  >
                    {EMS_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-default-600">Additional Notes</label>
                  <textarea
                    className="w-full p-2 border border-default rounded-md bg-background text-[13px] focus:outline-none focus:ring-1 focus:ring-default-300 focus:border-default min-h-[80px] placeholder:text-default-400"
                    placeholder="Record details of conversation with customer..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    radius="sm"
                    onClick={handleSave}
                    isLoading={isSaving}
                    startContent={!isSaving && <Save className="w-4 h-4" />}
                    className="bg-foreground text-background font-medium hover:bg-foreground"
                  >
                    {savedRecord ? "Update Record" : "Save EMS Record"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Tracking History */}
            <div className="bg-background rounded-lg border border-default">
              <div className="flex items-center gap-2 p-2 border-b border-default">
                <Clock className="w-4 h-4 text-default-500" />
                <span className="text-[13px] font-semibold text-foreground">Tracking History</span>
              </div>
              <div className="p-2">
                {sortedItems.length === 0 ? (
                  <p className="text-center text-[13px] text-default-400 p-2">No tracking information found</p>
                ) : (
                  <div className="relative">
                    <div className="absolute left-[9px] top-2 botto w-px bg-default-200" />

                    <div className="space-y-3">
                      {sortedItems.map((item, index) => (
                        <div key={index} className="relative flex gap-2 pl-7">
                          <div
                            className={`absolute left-0 top-2 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                              index === 0 ? "bg-foreground border-foreground" : "bg-background border-default"
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${index === 0 ? "bg-background" : "bg-default-300"}`} />
                          </div>

                          <div
                            className={`flex-1 p-2 rounded-md border ${
                              index === 0 ? "bg-default-50 border-default" : "bg-background border-default"
                            }`}
                          >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Chip
                                  color={STATUS_COLORS[parseInt(item.status)] || "default"}
                                  size="sm"
                                  variant="flat"
                                  className="text-xs"
                                >
                                  {item.status_description || STATUS_LABELS[parseInt(item.status)] || item.status}
                                </Chip>
                              </div>
                              <span className="text-xs text-default-400 font-mono">
                                {(() => {
                                  const date = parseThaiDate(item.status_date);
                                  return date
                                    ? date.toLocaleString("en-US", {
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

                            <div className="flex items-start gap-2 text-xs text-default-500">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              <div>
                                <p>{item.location || item.postcode_location || "-"}</p>
                                {item.receiver_name && (
                                  <p className="text-green-600 font-medium">
                                    Recipient: {item.receiver_name}
                                    {item.signature && " (Signed)"}
                                  </p>
                                )}
                                {item.note && <p className="text-default-400">{item.note}</p>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !trackingData && (
          <div className="flex flex-col items-center justify-center gap-2 p-2">
            <Package className="w-16 h-16 text-default-300" />
            <p className="text-[13px] text-default-400">Enter an EMS tracking number to check its status</p>
            <p className="text-xs text-default-400">Example: EN123456789TH, EK987654321TH</p>
          </div>
        )}
      </div>

      {/* Records List Modal */}
      <Modal
        isOpen={showRecordsModal}
        onClose={() => setShowRecordsModal(false)}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <History className="w-4 h-4" />
              Saved EMS Records
            </div>
          </ModalHeader>
          <ModalBody>
            {records?.length === 0 ? (
              <div className="text-center p-2">
                <Package className="w-12 h-12 text-default-300" />
                <p className="text-[13px] text-default-400">No saved EMS records yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {records?.map((record) => (
                  <div key={record.emsId} className="bg-background rounded-md border border-default p-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-default-400" />
                          <span className="font-mono font-semibold text-sm text-foreground">{record.emsBarcode}</span>
                          <Chip
                            color={getEMSStatusColor(record.emsStatus)}
                            size="sm"
                            variant="flat"
                            startContent={getEMSStatusIcon(record.emsStatus)}
                            className="text-xs"
                          >
                            {getEMSStatusLabel(record.emsStatus)}
                          </Chip>
                        </div>
                        {record.emsCustomerName && (
                          <div className="flex items-center gap-2 text-xs text-default-500">
                            <User className="w-3 h-3" />
                            <span>{record.emsCustomerName}</span>
                          </div>
                        )}
                        {record.emsCallDate && (
                          <div className="flex items-center gap-2 text-xs text-default-400">
                            <Calendar className="w-3 h-3" />
                            <span>Last Call: {new Date(record.emsCallDate).toLocaleString("en-US")}</span>
                          </div>
                        )}
                        {record.emsNotes && (
                          <p className="text-xs text-default-500 bg-default-50 p-2 rounded">
                            {record.emsNotes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          radius="sm"
                          variant="bordered"
                          startContent={<Eye className="w-3.5 h-3.5" />}
                          className="border-default text-default-700 text-xs"
                          onClick={() => {
                            onViewRecord?.(record);
                            setShowRecordsModal(false);
                          }}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          radius="sm"
                          variant="bordered"
                          startContent={<Edit3 className="w-3.5 h-3.5" />}
                          className="border-default text-default-700 text-xs"
                          onClick={() => openUpdateModal(record)}
                        >
                          Update Status
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="bordered"
              size="sm"
              radius="sm"
              className="border-default text-default-700"
              onClick={() => setShowRecordsModal(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Update Status Modal */}
      <Modal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)} size="md">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <Edit3 className="w-4 h-4" />
              Update Contact Status
            </div>
          </ModalHeader>
          <ModalBody className="gap-2">
            {selectedRecord && (
              <>
                <div className="bg-default-50 p-2 rounded-md">
                  <p className="text-xs text-default-500">Tracking Number</p>
                  <p className="font-mono font-semibold text-sm text-foreground">{selectedRecord.emsBarcode}</p>
                  {selectedRecord.emsCustomerName && (
                    <p className="text-xs text-default-500">{selectedRecord.emsCustomerName}</p>
                  )}
                </div>

                <Select
                  label="Contact Status"
                  selectedKeys={[contactStatus]}
                  onSelectionChange={(keys) => setContactStatus(Array.from(keys)[0])}
                  startContent={getEMSStatusIcon(contactStatus)}
                  variant="bordered"
                  size="sm"
                  radius="sm"
                  classNames={{
                    trigger: "border-default hover:border-default shadow-none",
                    label: "text-default-600 text-xs font-medium",
                  }}
                >
                  {EMS_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-default-600">Additional Notes</label>
                  <textarea
                    className="w-full p-2 border border-default rounded-md bg-background text-[13px] focus:outline-none focus:ring-1 focus:ring-default-300 focus:border-default min-h-[80px] placeholder:text-default-400"
                    placeholder="Record details of conversation..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="bordered"
              size="sm"
              radius="sm"
              className="border-default text-default-700"
              onClick={() => setShowUpdateModal(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              radius="sm"
              className="bg-foreground text-background font-medium hover:bg-foreground"
              onClick={handleUpdateStatus}
              isLoading={isSaving}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
