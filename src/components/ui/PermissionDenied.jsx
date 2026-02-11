"use client";

import React from "react";

/**
 * PermissionDenied Component
 * 
 * ใช้แสดงข้อความเมื่อผู้ใช้ไม่มีสิทธิ์เข้าถึงหน้า
 * 
 * @param {Object} props
 * @param {string} props.message - ข้อความที่จะแสดง (default: "You do not have permission to access this page")
 * @param {string} props.className - CSS class เพิ่มเติม
 */
export function PermissionDenied({
  message = "You do not have permission to access this page",
  className = "",
}) {
  return (
    <div
      className={`flex items-center justify-center h-full ${className}`}
    >
      <p className="text-danger">{message}</p>
    </div>
  );
}

export default PermissionDenied;
