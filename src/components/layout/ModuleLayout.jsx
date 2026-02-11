"use client";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
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
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Breadcrumb bar */}
      <div className="flex items-center p-2 h-10 border-b-1 border-default bg-background shrink-0">
        <Breadcrumbs
          color="default"
          variant="light"
          size="sm"
          classNames={{
            list: "gap-2",
          }}
        >
          <BreadcrumbItem>
            <Link
              href="/home"
              className="text-[12px] text-default-400 hover:text-foreground transition-colors"
            >
              Home
            </Link>
          </BreadcrumbItem>

          {breadcrumbItems.map((item, index) => (
            <BreadcrumbItem key={item.href}>
              {index === breadcrumbItems.length - 1 ? (
                <span className="text-[12px] text-foreground font-medium">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-[12px] text-default-400 hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </BreadcrumbItem>
          ))}
        </Breadcrumbs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
