// Service for client-side, using console instead of node logger
const logDebug = (message, meta) => console.log(`[EMSRecordService] ${message}`, meta || "");
const logError = (message, meta) => console.error(`[EMSRecordService] ${message}`, meta || "");

/**
 * ดึงรายการ EMS records ทั้งหมด
 * @param {Object} filters - ตัวกรอง { status, search }
 * @returns {Promise<Array>} รายการ EMS records
 */
export async function getEMSRecords(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== "ALL") {
      params.append("status", filters.status);
    }
    if (filters.search) {
      params.append("search", filters.search);
    }

    const url = `/api/accounting/ems/records${params.toString() ? `?${params.toString()}` : ""}`;
    logDebug("Fetching EMS records from:", url);
    
    const response = await fetch(url);
    logDebug("Response status:", response.status);
    
    const text = await response.text();
    logDebug("Response text:", text.substring(0, 200));
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }

    if (!response.ok) {
      throw new Error(data.error || `Failed to fetch EMS records (${response.status})`);
    }

    return data.data || [];
  } catch (error) {
    const errorMessage = error?.message || JSON.stringify(error) || "Unknown error";
    logError("Error fetching EMS records:", errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * สร้าง EMS record ใหม่
 * @param {Object} record - ข้อมูล EMS record
 * @returns {Promise<Object>} EMS record ที่สร้าง
 */
export async function createEMSRecord(record) {
  try {
    const response = await fetch("/api/accounting/ems/records", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(record),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create EMS record");
    }

    return data.data;
  } catch (error) {
    const errorMessage = error?.message || JSON.stringify(error) || "Unknown error";
    logError("Error creating EMS record:", errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * อัพเดท EMS record
 * @param {string} id - ID ของ EMS record
 * @param {Object} updates - ข้อมูลที่ต้องการอัพเดท
 * @returns {Promise<Object>} EMS record ที่อัพเดท
 */
export async function updateEMSRecord(id, updates) {
  try {
    const response = await fetch(`/api/accounting/ems/records/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update EMS record");
    }

    return data.data;
  } catch (error) {
    const errorMessage = error?.message || JSON.stringify(error) || "Unknown error";
    logError("Error updating EMS record:", errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * ลบ EMS record
 * @param {string} id - ID ของ EMS record
 * @returns {Promise<void>}
 */
export async function deleteEMSRecord(id) {
  try {
    const response = await fetch(`/api/accounting/ems/records/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to delete EMS record");
    }

    return data;
  } catch (error) {
    const errorMessage = error?.message || JSON.stringify(error) || "Unknown error";
    logError("Error deleting EMS record:", errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * ดึงข้อมูล EMS record ตาม ID
 * @param {string} id - ID ของ EMS record
 * @returns {Promise<Object>} EMS record
 */
export async function getEMSRecordById(id) {
  try {
    const response = await fetch(`/api/accounting/ems/records/${id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch EMS record");
    }

    return data.data;
  } catch (error) {
    const errorMessage = error?.message || JSON.stringify(error) || "Unknown error";
    logError("Error fetching EMS record:", errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * ดึงข้อมูล EMS record ตาม barcode
 * @param {string} barcode - Barcode ของ EMS
 * @returns {Promise<Object|null>} EMS record หรือ null ถ้าไม่พบ
 */
export async function getEMSRecordByBarcode(barcode) {
  try {
    const records = await getEMSRecords();
    return records.find((r) => r.emsBarcode === barcode.toUpperCase()) || null;
  } catch (error) {
    const errorMessage = error?.message || JSON.stringify(error) || "Unknown error";
    logError("Error fetching EMS record by barcode:", errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * บันทึกหรืออัพเดท EMS record หลังจากตรวจสอบสถานะ
 * @param {string} barcode - Barcode ของ EMS
 * @param {Object} trackingData - ข้อมูล tracking จากไปรษณีย์
 * @param {Object} options - ตัวเลือกเพิ่มเติม { customerName, status, notes }
 * @returns {Promise<Object>} EMS record
 */
export async function saveOrUpdateEMSRecord(barcode, trackingData, options = {}) {
  try {
    const existing = await getEMSRecordByBarcode(barcode);

    if (existing) {
      // Update existing record with latest tracking data
      return await updateEMSRecord(existing.emsId, {
        lastTracking: trackingData,
        ...options,
      });
    } else {
      // Create new record
      return await createEMSRecord({
        barcode,
        lastTracking: trackingData,
        ...options,
      });
    }
  } catch (error) {
    const errorMessage = error?.message || JSON.stringify(error) || "Unknown error";
    logError("Error saving EMS record:", errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * อัพเดทสถานะการติดต่อลูกค้า
 * @param {string} id - ID ของ EMS record
 * @param {string} status - สถานะใหม่
 * @param {string} notes - บันทึกเพิ่มเติม
 * @param {Date} callDate - วันที่โทร
 * @returns {Promise<Object>} EMS record ที่อัพเดท
 */
export async function updateEMSContactStatus(id, status, notes, callDate) {
  try {
    const updates = {
      status,
      callDate: callDate || new Date().toISOString(),
    };

    if (notes !== undefined) {
      updates.notes = notes;
    }

    return await updateEMSRecord(id, updates);
  } catch (error) {
    const errorMessage = error?.message || JSON.stringify(error) || "Unknown error";
    logError("Error updating EMS contact status:", errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * รายการสถานะ EMS Tracking ที่ใช้ได้
 */
export const EMS_STATUS_OPTIONS = [
  { value: "NOT_CALLED", label: "ยังไม่ได้โทรถาม", color: "default" },
  { value: "CALLED_NOT_RECEIVED", label: "โทรแล้ว - ยังไม่ได้รับ", color: "danger" },
  { value: "CALLED_RECEIVED", label: "โทรแล้ว - ได้รับแล้ว", color: "success" },
  { value: "CANNOT_CONTACT", label: "ติดต่อไม่ได้", color: "warning" },
];

/**
 * แปลงสถานะเป็นข้อความภาษาไทย
 * @param {string} status - สถานะ
 * @returns {string} ข้อความภาษาไทย
 */
export function getEMSStatusLabel(status) {
  const option = EMS_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.label || status;
}

/**
 * แปลงสถานะเป็น color
 * @param {string} status - สถานะ
 * @returns {string} color
 */
export function getEMSStatusColor(status) {
  const option = EMS_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.color || "default";
}
