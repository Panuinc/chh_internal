"use client";
import { Button, Input } from "@heroui/react";
import Image from "next/image";
import React from "react";

export default function page() {
  return (
    <div className="flex flex-row items-center justify-center w-full h-full p-2 gap-2 border">
      <div className="flex flex-col items-center justify-center w-full xl:w-4/12 h-full p-2 gap-2 border">
        <div className="flex items-center justify-center w-full h-fit p-2 gap-2 border text-3xl">
          EverGreen
        </div>
        <div className="flex items-center justify-center w-full h-fit p-2 gap-2 border">
          <Input
            type="text"
            label="Username"
            labelPlacement="outside"
            placeholder="Enter your username"
            variant="bordered"
            size="lg"
            // value={email}
            // onChange={(e) => setEmail(e.target.value)}
            isRequired
          />
        </div>
        <div className="flex items-center justify-center w-full h-fit p-2 gap-2 border">
          <Input
            type="password"
            label="Password"
            labelPlacement="outside"
            placeholder="Enter your password"
            variant="bordered"
            size="lg"
            // value={email}
            // onChange={(e) => setEmail(e.target.value)}
            isRequired
          />
        </div>
        <div className="flex items-center justify-center w-full h-fit p-2 gap-2 border">
          <Button
            variant="solid"
            size="lg"
            color="success"
            className="w-6/12 text-background font-black"
          >
            Login
          </Button>
        </div>
      </div>
      <div className="xl:flex items-center justify-center xl:w-8/12 h-full p-2 gap-2 border hidden">
        <Image src="/logo/logo-01.png" alt="logo" width={300} height={300} />
      </div>
    </div>
  );
}
