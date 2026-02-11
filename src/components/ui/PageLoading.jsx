"use client";

import React from "react";

/**
 * PageLoading Component
 * 
 * ใช้แสดง loading spinner ตรงกลางหน้าจอ
 * 
 * @param {Object} props
 * @param {string} props.className - CSS class เพิ่มเติม
 */
export function PageLoading({ className = "" }) {
  return (
    <div className={`flex items-center justify-center min-h-screen ${className}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

export default PageLoading;
