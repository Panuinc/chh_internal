"use client";

import { useState, useCallback, useEffect } from "react";
import { CheckTagEMS, useCheckTagEMS, useEMSRecords } from "@/features/accounting";
import { useMenu } from "@/hooks";

export default function CheckTagEMSPage() {
  const { hasPermission } = useMenu();
  const { trackingData, loading, error, searchEMS, clearTrackingData } = useCheckTagEMS();
  const {
    records,
    loading: recordsLoading,
    saveOrUpdate,
    updateRecord,
    findByBarcode,
  } = useEMSRecords();

  const [savedRecord, setSavedRecord] = useState(null);

  // ค้นหา record ที่มีอยู่แล้วเมื่อ trackingData เปลี่ยน
  useEffect(() => {
    if (trackingData?.barcode) {
      const existing = records.find(
        (r) => r.emsBarcode === trackingData.barcode.toUpperCase()
      );
      setSavedRecord(existing || null);
    } else {
      setSavedRecord(null);
    }
  }, [trackingData, records]);

  const handleSearch = useCallback(
    async (barcode) => {
      await searchEMS(barcode);
    },
    [searchEMS]
  );

  const handleSaveRecord = useCallback(
    async (data) => {
      const result = await saveOrUpdate(
        data.barcode,
        data.lastTracking,
        {
          customerName: data.customerName,
          status: data.status,
          notes: data.notes,
        }
      );
      setSavedRecord(result);
      return result;
    },
    [saveOrUpdate]
  );

  const handleUpdateStatus = useCallback(
    async (id, updates) => {
      const result = await updateRecord(id, {
        status: updates.status,
        notes: updates.notes,
        callDate: updates.callDate,
      });
      // อัพเดท savedRecord ถ้าเป็น record เดียวกัน
      if (savedRecord && savedRecord.emsId === id) {
        setSavedRecord(result);
      }
      return result;
    },
    [updateRecord, savedRecord]
  );

  const handleViewRecord = useCallback(
    async (record) => {
      // โหลดข้อมูล tracking ของ record นี้
      await searchEMS(record.emsBarcode);
    },
    [searchEMS]
  );

  const handleClearSearch = useCallback(() => {
    clearTrackingData();
    setSavedRecord(null);
  }, [clearTrackingData]);

  if (!hasPermission("accounting.checkTagEMS.view")) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-danger">
          You do not have permission to access this page
        </p>
      </div>
    );
  }

  return (
    <CheckTagEMS
      trackingData={trackingData}
      loading={loading || recordsLoading}
      error={error}
      onSearch={handleSearch}
      onClearSearch={handleClearSearch}
      savedRecord={savedRecord}
      onSaveRecord={handleSaveRecord}
      onUpdateStatus={handleUpdateStatus}
      records={records}
      onViewRecord={handleViewRecord}
    />
  );
}
