"use client";

import React from "react";

export function PageLoading({ className = "" }) {
  return (
    <div className={`flex items-center justify-center min-h-screen ${className}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

export default PageLoading;
