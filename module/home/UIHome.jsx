"use client";
import { Ghost } from "lucide-react";
import { Button } from "@heroui/react";
import Image from "next/image";
import { SubMenu } from "@/components";
import { useMenu } from "@/hooks/useMenu";

function UserProfileCard({ user }) {
  return (
    <div className="xl:flex flex-col items-center justify-start w-full h-full p-2 gap-2 border-2 border-foreground rounded-xl hidden overflow-auto">
      <div className="flex items-center justify-center w-full h-fit p-2 gap-2 text-2xl">
        <Ghost /> Welcome Back
      </div>
      <div className="flex items-center justify-center w-full h-fit p-2 gap-2 text-xl">
        {user.name}
      </div>
      <div className="flex items-center justify-center w-full h-fit p-2 gap-2">
        Description
      </div>

      <div className="flex flex-col items-center justify-start w-full h-fit gap-2 text-xs">
        <UserInfoRow label="Position" value={user.position} />
        <UserInfoRow label="Department" value={user.department} />
        <UserInfoRow label="Role" value={user.role} />
        <UserInfoRow label="Email" value={user.email} />
      </div>

      <div className="flex items-end justify-center w-full h-full p-2 gap-2">
        <Button
          color="none"
          variant="solid"
          size="lg"
          className="w-full bg-foreground text-background font-black"
        >
          Change Password
        </Button>
      </div>
    </div>
  );
}

function UserInfoRow({ label, value }) {
  return (
    <div className="flex flex-row items-center justify-center w-full h-full p-2 gap-2">
      <div className="flex items-center justify-start w-full h-full p-2 gap-2">
        {label}:
      </div>
      <div className="flex items-center justify-end w-full h-full p-2 gap-2 whitespace-nowrap">
        {value}
      </div>
    </div>
  );
}

export default function UIHome() {
  const { modules } = useMenu();

  const currentUser = {
    name: "Panuwat Jangchudjai",
    position: "Software Developer",
    department: "IT Department",
    role: "SuperAdmin",
    email: "panuwat@company.com",
    avatar: "/images/images.jpg",
  };

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full gap-2">
      <div className="flex flex-col items-center justify-start w-full xl:w-2/12 h-fit xl:h-full gap-2">
        <div className="flex items-center justify-center w-full min-h-52 p-2 gap-2">
          <Image
            src={currentUser.avatar}
            alt="profile"
            width={200}
            height={200}
            className="rounded-full"
          />
        </div>

        <UserProfileCard user={currentUser} />
      </div>

      <div className="flex flex-col items-center justify-center w-full xl:w-8/12 h-full gap-2 overflow-hidden">
        <div className="xl:flex flex-col items-center justify-start w-full min-h-52 p-2 gap-2 border-2 border-foreground rounded-xl hidden">
          <div className="flex items-center justify-start w-full h-fit p-2 gap-2 text-3xl font-semibold">
            EverGreen Dashboard
          </div>
          <div className="flex items-center justify-start w-full h-fit p-2 gap-2 text-sm opacity-80">
            Your tools. Your workflow. Your operations.
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 place-items-center w-full h-full p-2 gap-2 border-2 border-foreground rounded-xl overflow-auto">
          {modules.length > 0 ? (
            modules.map((module) => (
              <SubMenu
                key={module.id}
                href={module.href}
                text={module.text}
                icon={module.icon}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-foreground/50">
              No modules available. Please contact administrator.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
