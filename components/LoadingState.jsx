"use client";

import Image from "next/image";

export default function LoadingState() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="animate-pulse">
        <Image
          src="/logo/logo-01.png"
          alt="loading"
          width={150}
          height={150}
          priority
        />
      </div>
    </div>
  );
}
