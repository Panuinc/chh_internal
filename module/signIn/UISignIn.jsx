"use client";
import { Button, Input } from "@heroui/react";
import Image from "next/image";
import React from "react";

export default function UISignIn() {
  return (
    <div className="flex flex-row items-center justify-center w-full h-full p-2 gap-2">
      <div className="flex flex-col items-center justify-center w-full xl:w-4/12 h-full p-2 gap-2 border-r-2 border-foreground">
        <div className="flex items-center justify-center w-full h-fit p-2 gap-2 text-3xl">
          Ever<span className="text-success">Green</span> Internal สวัสดี
        </div>

        <div className="flex items-center justify-center w-full h-fit p-2 gap-2">
          <Input
            type="text"
            label="Username"
            labelPlacement="outside"
            placeholder="Enter your username"
            color="none"
            variant="bordered"
            size="lg"
            // value={email}
            // onChange={(e) => setEmail(e.target.value)}
            isRequired
          />
        </div>
        <div className="flex items-center justify-center w-full h-fit p-2 gap-2">
          <Input
            type="password"
            label="Password"
            labelPlacement="outside"
            placeholder="Enter your password"
            color="none"
            variant="bordered"
            size="lg"
            // value={email}
            // onChange={(e) => setEmail(e.target.value)}
            isRequired
          />
        </div>
        <div className="flex items-center justify-center w-full h-fit p-2 gap-2">
          <Button
            color="success"
            variant="solid"
            size="lg"
            className="w-6/12 text-background font-black"
          >
            Login
          </Button>
        </div>
      </div>
      <div className="xl:flex items-center justify-center xl:w-8/12 h-full p-2 gap-2 hidden">
        <Image src="/logo/logo-01.png" alt="logo" width={300} height={300} />
      </div>
    </div>
  );
}
