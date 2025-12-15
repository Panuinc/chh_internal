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
    <div className="flex flex-row items-center justify-center w-full h-full">
      <div className="flex flex-col items-center justify-center w-full xl:w-4/12 h-full p-2 gap-2">
        <div className="flex items-end justify-center w-full h-fit p-2 gap-2 text-3xl font-black">
          Ever<span className="text-primary text-6xl">Green</span> Internal
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
              color="none"
              variant="faded"
              size="lg"
              isRequired
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              isDisabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="flex items-center justify-center w-full h-fit p-2 gap-2">
            <Input
              type="password"
              label="Password"
              labelPlacement="outside"
              placeholder="Enter your password"
              color="none"
              variant="faded"
              size="lg"
              isRequired
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              isDisabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-center w-full h-fit p-2 gap-2">
            <Button
              type="submit"
              color="none"
              variant="solid"
              size="lg"
              className="w-6/12 border-2"
              isLoading={isLoading}
              spinner={<Spinner size="sm" color="current" />}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>
      </div>

      <div className="xl:flex items-center justify-center xl:w-8/12 h-full p-2 gap-2 hidden bg-primary">
        <Image src="/logo/logo-05.png" alt="logo" width={300} height={300} />
      </div>
    </div>
  );
}
