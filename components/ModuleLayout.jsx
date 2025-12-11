"use client";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center w-full h-full gap-2 overflow-hidden">
      <div className="flex items-center justify-start w-full h-fit p-2 gap-2 border-b-2 border-foreground">
        <Breadcrumbs color="foreground" variant="solid" size="lg">
          <BreadcrumbItem>
            <Link href="/home" className="flex items-center gap-2">
              <Home />
              <span>Home</span>
            </Link>
          </BreadcrumbItem>

          {breadcrumbItems.map((item, index) => (
            <BreadcrumbItem key={item.href}>
              {index === breadcrumbItems.length - 1 ? (
                <span className="font-medium">{item.name}</span>
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
