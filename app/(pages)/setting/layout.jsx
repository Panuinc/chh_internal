"use client";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";

export default function SettingLayout({ children }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-2 gap-2 border overflow-hidden">
      <div className="flex items-center justify-start w-full h-fit p-2 gap-2 border">
        <Breadcrumbs color="foreground" variant="solid" size="lg">
          <BreadcrumbItem>Home</BreadcrumbItem>
          <BreadcrumbItem>Music</BreadcrumbItem>
          <BreadcrumbItem>Artist</BreadcrumbItem>
          <BreadcrumbItem>Album</BreadcrumbItem>
          <BreadcrumbItem>Song</BreadcrumbItem>
        </Breadcrumbs>
      </div>
      <div className="flex items-center justify-center w-full h-full p-2 gap-2 border">
        {children}
      </div>
    </div>
  );
}
