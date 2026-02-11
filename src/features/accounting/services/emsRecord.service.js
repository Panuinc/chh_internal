// Service for client-side, using console instead of node logger
const logDebug = (message, meta) => console.log(`[EMSRecordService] ${message}`, meta || "");
const logError = (message, meta) => console.error(`[EMSRecordService] ${message}`, meta || "");

/**
 * Fetch all EMS records
 * @param {Object} filters - Filters { status, search }
 * @returns {Promise<Array>} List of EMS records
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
 * Create a new EMS record
 * @param {Object} record - EMS record data
 * @returns {Promise<Object>} Created EMS record
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
 * Update an EMS record
 * @param {string} id - EMS record ID
 * @param {Object} updates - Data to update
 * @returns {Promise<Object>} Updated EMS record
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
 * Delete an EMS record
 * @param {string} id - EMS record ID
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
 * Fetch an EMS record by ID
 * @param {string} id - EMS record ID
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
 * Fetch an EMS record by barcode
 * @param {string} barcode - EMS barcode
 * @returns {Promise<Object|null>} EMS record or null if not found
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
 * Save or update an EMS record after checking status
 * @param {string} barcode - EMS barcode
 * @param {Object} trackingData - Tracking data from Thailand Post
 * @param {Object} options - Additional options { customerName, status, notes }
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
 * Update customer contact status
 * @param {string} id - EMS record ID
 * @param {string} status - New status
 * @param {string} notes - Additional notes
 * @param {Date} callDate - Call date
 * @returns {Promise<Object>} Updated EMS record
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
 * Available EMS Tracking status options
 */
export const EMS_STATUS_OPTIONS = [
  { value: "NOT_CALLED", label: "Not Called", color: "default" },
  { value: "CALLED_NOT_RECEIVED", label: "Called - Not Received", color: "danger" },
  { value: "CALLED_RECEIVED", label: "Called - Received", color: "success" },
  { value: "CANNOT_CONTACT", label: "Cannot Contact", color: "warning" },
];

/**
 * Convert status to label text
 * @param {string} status - Status value
 * @returns {string} Status label
 */
export function getEMSStatusLabel(status) {
  const option = EMS_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.label || status;
}

/**
 * Convert status to color
 * @param {string} status - Status value
 * @returns {string} color
 */
export function getEMSStatusColor(status) {
  const option = EMS_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.color || "default";
}
