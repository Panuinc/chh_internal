"use client";

import Image from "next/image";

export default function LoadingState() {
  return (
    <div className="flex items-center justify-center w-full h-full bg-default-100">
      <div className="animate-pulse">
        <Image
          src="/logo/logo-01.png"
          alt="loading"
          width={100}
          height={100}
          priority
        />
      </div>
    </div>
  );
}
