/**
 * Printer Settings Component
 * 
 * แสดงการตั้งค่าและควบคุม RFID Printer
 * 
 * File: components/rfid/PrinterSettings.jsx
 */

"use client";

import React, { useState, useEffect } from 'react';
import { usePrinterStatus } from '@/hooks/useRFID';

/**
 * Printer Settings Panel
 * 
 * @example
 * <PrinterSettings
 *   onConfigChange={(config) => console.log(config)}
 * />
 */
export function PrinterSettings({ onConfigChange, className = '' }) {
  const [config, setConfig] = useState({
    host: '',
    port: '9100',
  });
  const [savedConfig, setSavedConfig] = useState(null);

  const {
    status,
    loading,
    error,
    isConnected,
    refresh,
    testConnection,
    calibrate,
    resetPrinter,
    cancelAllJobs,
  } = usePrinterStatus({
    ...savedConfig,
    autoConnect: !!savedConfig,
  });

  // Load saved config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('rfidPrinterConfig');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
        setSavedConfig(parsed);
      } catch (e) {
        console.error('Failed to parse saved config:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('rfidPrinterConfig', JSON.stringify(config));
    setSavedConfig(config);
    onConfigChange?.(config);
  };

  const handleTest = async () => {
    setSavedConfig(config);
    await testConnection();
  };

  const [actionLoading, setActionLoading] = useState(null);

  const handleAction = async (action, fn) => {
    setActionLoading(action);
    try {
      await fn();
    } catch (e) {
      console.error(`${action} failed:`, e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        ตั้งค่า RFID Printer
      </h3>

      {/* Connection Status */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">สถานะการเชื่อมต่อ</span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isConnected
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            <span
              className={`w-2 h-2 mr-1.5 rounded-full ${
                isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`}
            />
            {loading ? 'กำลังตรวจสอบ...' : isConnected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}
          </span>
        </div>
        
        {status?.config && (
          <div className="text-sm text-gray-500">
            เชื่อมต่อที่: {status.config.host}:{status.config.port}
          </div>
        )}
        
        {error && (
          <div className="mt-2 text-sm text-red-600">
            ข้อผิดพลาด: {error}
          </div>
        )}
      </div>

      {/* Configuration Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            IP Address
          </label>
          <input
            type="text"
            value={config.host}
            onChange={(e) => setConfig({ ...config, host: e.target.value })}
            placeholder="192.168.1.100"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Port
          </label>
          <input
            type="text"
            value={config.port}
            onChange={(e) => setConfig({ ...config, port: e.target.value })}
            placeholder="9100"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={handleTest}
          disabled={loading || !config.host}
          className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-50"
        >
          {loading ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={!config.host}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          บันทึกการตั้งค่า
        </button>
      </div>

      {/* Printer Controls */}
      {isConnected && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">ควบคุม Printer</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleAction('calibrate', calibrate)}
              disabled={actionLoading}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              {actionLoading === 'calibrate' ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  กำลัง Calibrate...
                </span>
              ) : (
                'Calibrate'
              )}
            </button>

            <button
              type="button"
              onClick={refresh}
              disabled={actionLoading}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              รีเฟรชสถานะ
            </button>

            <button
              type="button"
              onClick={() => handleAction('cancel', cancelAllJobs)}
              disabled={actionLoading}
              className="px-3 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 disabled:opacity-50"
            >
              {actionLoading === 'cancel' ? 'กำลังยกเลิก...' : 'ยกเลิกงานพิมพ์'}
            </button>

            <button
              type="button"
              onClick={() => handleAction('reset', resetPrinter)}
              disabled={actionLoading}
              className="px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50"
            >
              {actionLoading === 'reset' ? 'กำลัง Reset...' : 'Reset Printer'}
            </button>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="text-sm font-medium text-blue-900 mb-2">คำแนะนำ</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• ตรวจสอบว่า Printer อยู่ใน network เดียวกับ Server</li>
          <li>• Port เริ่มต้นของ RFID Printer คือ 9100</li>
          <li>• หากเชื่อมต่อไม่ได้ ให้ตรวจสอบ Firewall</li>
          <li>• ใช้ Calibrate เมื่อเปลี่ยน label ใหม่</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Print History Component
 */
export function PrintHistory({ history = [], className = '' }) {
  if (history.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ประวัติการพิมพ์</h3>
        <div className="text-center py-8 text-gray-500">
          ยังไม่มีประวัติการพิมพ์
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        ประวัติการพิมพ์ ({history.length} รายการ)
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {history.map((item, index) => (
          <div
            key={index}
            className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
          >
            <div>
              <div className="text-sm font-medium text-gray-900">
                {item.items} รายการ
              </div>
              <div className="text-xs text-gray-500">
                {new Date(item.timestamp).toLocaleString('th-TH')}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {item.success > 0 && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                  สำเร็จ {item.success}
                </span>
              )}
              {item.failed > 0 && (
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                  ล้มเหลว {item.failed}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * EPC Preview Component
 */
export function EPCPreview({ epc, className = '' }) {
  if (!epc) return null;

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 mb-2">EPC Preview</h4>
      
      <div className="font-mono text-lg bg-gray-100 p-3 rounded break-all">
        {epc}
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        96-bit EPC (24 hex characters)
      </div>
    </div>
  );
}

// ============================================
// Export
// ============================================

export default {
  PrinterSettings,
  PrintHistory,
  EPCPreview,
};