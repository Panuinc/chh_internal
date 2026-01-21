"use client";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function ModuleLayout({ children }) {
  const pathname = usePathname();

  const pathSegments = pathname.split("/").filter((segment) => segment);

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const name = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return { name, href };
  });

  return (
    <div className="flex flex-col items-center justify-center w-full h-full overflow-hidden">
      <div className="flex items-center justify-start w-full h-fit gap-2">
        <Breadcrumbs
          color="default"
          variant="light"
          size="md"
          className="flex items-center justify-start w-full h-full p-2 gap-2 border-1 border-default"
        >
          <BreadcrumbItem>
            <Link
              href="/home"
              className="flex items-center justify-center w-full h-full p-2 gap-2"
            >
              Home
            </Link>
          </BreadcrumbItem>

          {breadcrumbItems.map((item, index) => (
            <BreadcrumbItem key={item.href}>
              {index === breadcrumbItems.length - 1 ? (
                <span className="flex items-center justify-center w-full h-full p-2 gap-2 font-black">
                  {item.name}
                </span>
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
