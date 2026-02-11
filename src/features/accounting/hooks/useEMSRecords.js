"use client";

import { useState, useCallback, useEffect } from "react";
import {
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
} from "@/features/accounting/services/emsRecord.service";

export function useEMSRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "ALL",
    search: "",
  });

  const fetchRecords = useCallback(
    async (newFilters = null) => {
      setLoading(true);
      setError(null);

      try {
        const currentFilters = newFilters || filters;
        const data = await getEMSRecords(currentFilters);
        setRecords(data);
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  const createRecord = useCallback(async (record) => {
    setLoading(true);
    setError(null);

    try {
      const data = await createEMSRecord(record);
      setRecords((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRecord = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);

    try {
      const data = await updateEMSRecord(id, updates);
      setRecords((prev) =>
        prev.map((record) => (record.emsId === id ? data : record)),
      );
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRecord = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await deleteEMSRecord(id);
      setRecords((prev) => prev.filter((record) => record.emsId !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const findByBarcode = useCallback(async (barcode) => {
    try {
      return await getEMSRecordByBarcode(barcode);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return null;
    }
  }, []);

  const saveOrUpdate = useCallback(
    async (barcode, trackingData, options = {}) => {
      setLoading(true);
      setError(null);

      try {
        const data = await saveOrUpdateEMSRecord(
          barcode,
          trackingData,
          options,
        );
        setRecords((prev) => {
          const exists = prev.find((r) => r.emsId === data.emsId);
          if (exists) {
            return prev.map((record) =>
              record.emsId === data.emsId ? data : record,
            );
          }
          return [data, ...prev];
        });
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateContactStatus = useCallback(
    async (id, status, notes, callDate) => {
      setLoading(true);
      setError(null);

      try {
        const data = await updateEMSContactStatus(id, status, notes, callDate);
        setRecords((prev) =>
          prev.map((record) => (record.emsId === id ? data : record)),
        );
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords, filters.status, filters.search]);

  return {
    records,
    loading,
    error,
    filters,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    findByBarcode,
    saveOrUpdate,
    updateContactStatus,
    updateFilters,
    statusOptions: EMS_STATUS_OPTIONS,
    getStatusLabel: getEMSStatusLabel,
    getStatusColor: getEMSStatusColor,
  };
}

export function useEMSRecordByBarcode(barcode) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecord = useCallback(async () => {
    if (!barcode) {
      setRecord(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getEMSRecordByBarcode(barcode);
      setRecord(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [barcode]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  return {
    record,
    loading,
    error,
    refetch: fetchRecord,
  };
}
