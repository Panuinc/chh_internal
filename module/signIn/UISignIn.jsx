"use client";
import { Button, Input, Spinner } from "@heroui/react";
import Image from "next/image";

export default function UISignIn({
  username,
  password,
  isLoading,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}) {
  return (
    <div className="flex flex-row items-center justify-center w-full h-full gap-2">
      <div className="flex flex-col items-center justify-center w-full xl:w-4/12 h-full p-2 gap-2 xl:border-r-1">
        <div className="flex items-end justify-center w-full h-fit p-2 gap-2 text-3xl font-black">
          Ever
          <span className="text-success text-6xl">
            G
            <span className="relative inline-block">
              r
              <svg
                className="absolute -top-4 -right-1 w-7 h-7 text-success"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
              </svg>
            </span>
            een
          </span>
          Internal
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-col items-center justify-center w-full p-2 gap-2"
        >
          <div className="flex items-center justify-center w-full h-fit p-2 gap-2">
            <Input
              type="text"
              label="Username"
              labelPlacement="outside"
              placeholder="Enter your username"
              color="default"
              variant="bordered"
              size="lg"
              isRequired
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              isDisabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-center w-full h-fit p-2 gap-2">
            <Input
              type="password"
              label="Password"
              labelPlacement="outside"
              placeholder="Enter your password"
              color="default"
              variant="bordered"
              size="lg"
              isRequired
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              isDisabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-center w-full h-fit p-2 gap-2">
            <Button
              type="submit"
              color="default"
              variant="bordered"
              size="lg"
              className="w-6/12"
              isLoading={isLoading}
              spinner={<Spinner size="sm" color="current" />}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>
      </div>

      <div className="xl:flex items-center justify-center xl:w-10/12 h-full p-2 gap-2 hidden">
        <Image src="/logo/logo-01.png" alt="logo" width={300} height={300} />
      </div>
    </div>
  );
}
