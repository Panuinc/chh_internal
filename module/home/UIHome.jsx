import { Ghost } from "lucide-react";
import { Button } from "@heroui/react";
import { SubMenu } from "@/components";
import Image from "next/image";

function UserProfileCard({ user }) {
  return (
    <div className="xl:flex flex-col items-center justify-start w-full h-full p-2 gap-2 border-1 hidden overflow-auto">
      <div className="flex items-center justify-center w-full min-h-52 p-2 gap-2 border-1">
        <Image
          src={user.avatar}
          alt="profile"
          width={200}
          height={200}
          className="rounded-full"
        />
      </div>
      <div className="flex items-center justify-center w-full h-fit p-2 gap-2 border-1 text-xl font-black">
        <Ghost /> Welcome Back <Ghost />
      </div>

      <div className="flex items-center justify-center w-full h-fit p-2 gap-2 border-1 text-lg font-black">
        {user.name}
      </div>

      <div className="flex items-center justify-center w-full h-fit p-2 gap-2 border-1 text-md font-black">
        {user.email}
      </div>

      <div className="flex flex-col items-center justify-start w-full h-fit p-2 gap-2 border-1 text-sm">
        <UserInfoRow
          label="Role"
          value={user.isSuperAdmin ? "Super Admin" : "User"}
        />
        <UserInfoRow
          label="Permissions"
          value={user.permissions?.length || 0}
        />
      </div>

      <div className="flex flex-col items-end justify-end w-full h-full p-2 gap-2 border-1">
        <Button
          color="default"
          variant="bordered"
          size="lg"
          className="w-full"
        >
          Change Password
        </Button>
      </div>
    </div>
  );
}

function UserInfoRow({ label, value }) {
  return (
    <div className="flex flex-row items-center justify-center w-full h-full p-2 gap-2 border-1">
      <div className="flex items-center justify-start w-full h-full p-2 gap-2 border-1">
        {label}:
      </div>
      <div className="flex items-center justify-end w-full h-full p-2 gap-2 border-1 whitespace-nowrap">
        {value}
      </div>
    </div>
  );
}

export default function UIHome({ user, modules }) {
  return (
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full p-2 gap-2 border-1">
      <div className="flex flex-col items-center justify-start w-full xl:w-2/12 h-fit xl:h-full p-2 gap-2 border-1">
        {user && <UserProfileCard user={user} />}
      </div>

      <div className="flex flex-col items-center justify-center w-full xl:w-10/12 h-full p-2 gap-2 border-1 overflow-hidden">
        <div className="xl:flex flex-col items-center justify-start w-full min-h-52 p-2 gap-2 border-1 hidden">
          <div className="flex items-center justify-start w-full h-fit p-2 gap-2 border-1 text-2xl font-black">
            EverGreen Dashboard
          </div>
          <div className="flex items-center justify-start w-full h-fit p-2 gap-2 border-1 opacity-80">
            Your tools. Your workflow. Your operations.
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 place-items-center w-full h-full p-2 gap-2 border-1 overflow-auto">
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
            <div className="col-span-full place-items-center text-center p-2 gap-2 border-1">
              No modules available. Please contact administrator.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
