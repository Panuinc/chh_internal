"use client";

import React from "react";

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
