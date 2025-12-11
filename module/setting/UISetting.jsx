"use client";
import { ModulePage, SubMenu } from "@/components";
import { useModuleMenu } from "@/hooks/useMenu";
import { AlertCircle } from "lucide-react";

function SettingSidebar() {
  return (
    <div className="flex flex-col items-center justify-start w-full h-full gap-4 p-2">
      <div className="text-lg font-semibold">System Info</div>

      <div className="flex flex-col w-full gap-2 text-sm">
        <InfoItem label="Version" value="1.0.0" />
        <InfoItem label="Environment" value="Production" />
        <InfoItem label="Last Updated" value="2024-01-15" />
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="flex justify-between w-full p-2 border-b border-foreground/20">
      <span className="opacity-70">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default function UISetting() {
  const { menu, isEmpty } = useModuleMenu("setting");

  if (!menu) {
    return (
      <div className="flex items-center justify-center w-full h-full p-2 gap-2">
        <div className="flex items-center gap-2 text-danger">
          <AlertCircle />
          <span>Module configuration not found</span>
        </div>
      </div>
    );
  }

  const Icon = menu.icon;

  return (
    <ModulePage
      icon={<Icon />}
      title={menu.title}
      description={menu.description}
      sidebar={<SettingSidebar />}
    >
      {isEmpty ? (
        <div className="col-span-full text-center text-foreground/50">
          No accessible menu items. Please contact administrator.
        </div>
      ) : (
        menu.items.map((item) => (
          <SubMenu
            key={item.id}
            href={item.href}
            text={item.text}
            icon={item.icon}
          />
        ))
      )}
    </ModulePage>
  );
}
