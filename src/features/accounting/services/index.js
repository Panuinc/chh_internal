export { trackEMS, isValidEMSBarcode, getStatusDescription } from "./ems.service";
export {
  getEMSRecords,
  createEMSRecord,
  updateEMSRecord,
  deleteEMSRecord,
  getEMSRecordByBarcode,
  saveOrUpdateEMSRecord,
  updateEMSContactStatus,
  EMS_STATUS_OPTIONS,
  getEMSStatusLabel,
  getEMSStatusColor,
} from "./emsRecord.service";
