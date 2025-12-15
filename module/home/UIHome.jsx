import { Ghost } from "lucide-react";
import { Button } from "@heroui/react";
import { SubMenu } from "@/components";
import Image from "next/image";

function UserProfileCard({ user }) {
  return (
    <>
      <div className="flex items-center justify-center w-full min-h-52 p-2 gap-2 border">
        <Image
          src={user.avatar}
          alt="profile"
          width={200}
          height={200}
          className="rounded-full"
        />
      </div>

      <div className="xl:flex flex-col items-center justify-start w-full h-full p-2 gap-2 border hidden overflow-auto">
        <div className="flex items-center justify-center w-full h-fit p-2 gap-2 border">
          <Ghost /> Welcome Back
        </div>

        <div className="flex items-center justify-center w-full h-fit p-2 gap-2 border">
          {user.name}
        </div>

        <div className="flex flex-col items-center justify-start w-full h-fit p-2 gap-2 border text-xs">
          <UserInfoRow label="Email" value={user.email} />
          <UserInfoRow
            label="Role"
            value={user.isSuperAdmin ? "Super Admin" : "User"}
          />
          <UserInfoRow
            label="Permissions"
            value={user.permissions?.length || 0}
          />
        </div>

        <div className="flex flex-col items-end justify-end w-full h-full p-2 gap-2 border">
          <Button
            color="none"
            variant="solid"
            size="lg"
            className="w-full"
          >
            Change Password
          </Button>
        </div>
      </div>
    </>
  );
}

function UserInfoRow({ label, value }) {
  return (
    <div className="flex flex-row items-center justify-center w-full h-full p-2 gap-2 border">
      <div className="flex items-center justify-start w-full h-full p-2 gap-2 border">
        {label}:
      </div>
      <div className="flex items-center justify-end w-full h-full p-2 gap-2 border whitespace-nowrap">
        {value}
      </div>
    </div>
  );
}

export default function UIHome({ user, modules }) {
  return (
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full p-2 gap-2 border">
      <div className="flex flex-col items-center justify-start w-full xl:w-2/12 h-fit xl:h-full p-2 gap-2 border">
        {user && <UserProfileCard user={user} />}
      </div>

      <div className="flex flex-col items-center justify-center w-full xl:w-8/12 h-full p-2 gap-2 border overflow-hidden">
        <div className="xl:flex flex-col items-center justify-start w-full min-h-52 p-2 gap-2 border hidden">
          <div className="flex items-center justify-start w-full h-fit p-2 gap-2 border">
            EverGreen Dashboard
          </div>
          <div className="flex items-center justify-start w-full h-fit p-2 gap-2 border opacity-80">
            Your tools. Your workflow. Your operations.
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 place-items-center w-full h-full p-2 gap-2 border overflow-auto">
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
            <div className="col-span-full place-items-center text-center p-2 gap-2 border">
              No modules available. Please contact administrator.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
