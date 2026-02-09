"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { showToast } from "@/components";
import { AUTH_MESSAGES } from "@/lib/auth-messages";
import { SignIn as SignInComponent } from "@/features/auth";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/home";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        username: username.trim(),
        password: password,
        redirect: false,
      });
      if (result?.error) {
        const errorMessage = result.code || AUTH_MESSAGES.UNKNOWN_ERROR;
        setError(errorMessage);
        showToast("danger", errorMessage);
        setIsLoading(false);
      } else if (result?.ok) {
        showToast("success", AUTH_MESSAGES.LOGIN_SUCCESS);
        window.location.href = callbackUrl;
      }
    } catch (err) {
      setError(AUTH_MESSAGES.LOGIN_ERROR);
      showToast("danger", AUTH_MESSAGES.LOGIN_ERROR);
      setIsLoading(false);
    }
  };

  return (
    <SignInComponent
      username={username}
      password={password}
      isLoading={isLoading}
      error={error}
      onUsernameChange={setUsername}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
    />
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}