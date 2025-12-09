import Image from "next/image";
import React from "react";

export default function UIHome() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-2 gap-2 border">
      <div className="flex flex-row items-center justify-center w-full h-fit p-2 gap-2 border">
        <div className="flex items-center justify-center w-3/12 h-full p-2 gap-2 border-2 border-warning bg-warning/75 rounded-xl">
          <Image src="/images/images.png" alt="logo" width={200} height={200} />
        </div>
        <div className="flex items-center justify-center w-9/12 h-full p-2 gap-2 border">
          1
        </div>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 place-items-center w-full h-full p-2 gap-2 border overflow-auto">
        <div className="flex items-center justify-center w-40 h-40 p-2 gap-2 rounded-xl shadow">
          1
        </div>
        <div className="flex items-center justify-center w-40 h-40 p-2 gap-2 rounded-xl shadow">
          1
        </div>
        <div className="flex items-center justify-center w-40 h-40 p-2 gap-2 rounded-xl shadow">
          1
        </div>
        <div className="flex items-center justify-center w-40 h-40 p-2 gap-2 rounded-xl shadow">
          1
        </div>
        <div className="flex items-center justify-center w-40 h-40 p-2 gap-2 rounded-xl shadow">
          1
        </div>
        <div className="flex items-center justify-center w-40 h-40 p-2 gap-2 rounded-xl shadow">
          1
        </div>
        <div className="flex items-center justify-center w-40 h-40 p-2 gap-2 rounded-xl shadow">
          1
        </div>
        <div className="flex items-center justify-center w-40 h-40 p-2 gap-2 rounded-xl shadow">
          1
        </div>
      </div>
    </div>
  );
}
