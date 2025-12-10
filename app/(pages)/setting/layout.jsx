"use client";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function SettingLayout({ children }) {
  const pathname = usePathname();

  const pathSegments = pathname.split("/").filter((segment) => segment);

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");

    const name = segment.charAt(0).toUpperCase() + segment.slice(1);

    return { name, href };
  });

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2 overflow-hidden">
      <div className="flex items-center justify-start w-full h-fit p-2 gap-2 border-b-1 border-foreground">
        <Breadcrumbs color="foreground" variant="solid" size="lg">
          <BreadcrumbItem>
            <Link href="/home">Home</Link>
          </BreadcrumbItem>

          {breadcrumbItems.map((item, index) => (
            <BreadcrumbItem key={item.href}>
              {index === breadcrumbItems.length - 1 ? (
                <span>{item.name}</span>
              ) : (
                <Link href={item.href}>{item.name}</Link>
              )}
            </BreadcrumbItem>
          ))}
        </Breadcrumbs>
      </div>
      <div className="flex items-center justify-center w-full h-full gap-2 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
