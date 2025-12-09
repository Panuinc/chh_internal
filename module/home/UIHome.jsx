import { Ghost, Settings, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function HeaderMenu({ icons, text, href }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center w-40 h-40 p-2 gap-2 border-1 border-foreground rounded-xl shadow hover:scale-105"
    >
      <div className="flex items-center justify-center w-full h-full p-2 gap-2">
        {icons}
      </div>
      <div className="flex items-center justify-center w-full h-fit p-2 gap-2">
        {text}
      </div>
    </Link>
  );
}

export default function UIHome() {
  return (
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full p-2 gap-2">
      <div className="flex flex-col items-center justify-center w-full xl:w-2/12 h-fit xl:h-full gap-2">
        <div className="flex items-center justify-center w-full h-fit p-2 gap-2 border-1 border-foreground text-foreground rounded-xl">
          <Image src="/images/images.jpg" alt="logo" width={200} height={200} />
        </div>
        <div className="xl:flex flex-col items-center justify-start w-full h-full p-2 gap-2 border-1 border-foreground text-foreground rounded-xl hidden">
          <div className="flex items-center justify-center w-full h-fit p-2 gap-2 text-2xl">
            <Ghost /> Welcome Back
          </div>
          <div className="flex items-center justify-center w-full h-fit p-2 gap-2 text-xl">
            Panuwat Jangchudjai
          </div>
          <div className="flex items-center justify-center w-full h-fit p-2 gap-2">
            Description
          </div>
          <div className="flex flex-col items-center justify-start w-full h-fit gap-2 border-t-1 border-foreground text-sm">
            <div className="flex flex-row items-center justify-center w-full h-full gap-2">
              <div className="flex items-center justify-start w-full h-full p-2 gap-2">
                Position:
              </div>
              <div className="flex items-center justify-end w-full h-full p-2 gap-2 whitespace-nowrap">
                Software Developer
              </div>
            </div>
            <div className="flex flex-row items-center justify-center w-full h-full gap-2">
              <div className="flex items-center justify-start w-full h-full p-2 gap-2">
                Department:
              </div>
              <div className="flex items-center justify-end w-full h-full p-2 gap-2 whitespace-nowrap">
                IT Department
              </div>
            </div>
            <div className="flex flex-row items-center justify-center w-full h-full gap-2">
              <div className="flex items-center justify-start w-full h-full p-2 gap-2">
                Role:
              </div>
              <div className="flex items-center justify-end w-full h-full p-2 gap-2 whitespace-nowrap">
                SuperAdmin
              </div>
            </div>
            <div className="flex flex-row items-center justify-center w-full h-full gap-2">
              <div className="flex items-center justify-start w-full h-full p-2 gap-2">
                Email:
              </div>
              <div className="flex items-center justify-end w-full h-full p-2 gap-2 whitespace-nowrap">
                panuwat@company.com
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-3 place-items-center w-full xl:w-8/12 h-full p-2 gap-2 border-1 border-foreground rounded-xl overflow-auto">
        <HeaderMenu href="hr" icons={<User />} text="HR" />
        <HeaderMenu href="hr" icons={<User />} text="HR" />
        <HeaderMenu href="hr" icons={<User />} text="HR" />
        <HeaderMenu href="hr" icons={<User />} text="HR" />
        <HeaderMenu href="hr" icons={<User />} text="HR" />
        <HeaderMenu href="hr" icons={<User />} text="HR" />
        <HeaderMenu href="hr" icons={<User />} text="HR" />
        <HeaderMenu href="hr" icons={<User />} text="HR" />
        <HeaderMenu href="hr" icons={<Settings />} text="Setting" />
      </div>
    </div>
  );
}
