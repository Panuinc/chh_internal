"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Profile } from "@/features/profile";
import { PageLoading } from "@/components";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signIn");
    }
  }, [status, router]);

  if (status === "loading") {
    return <PageLoading />;
  }

  if (!session?.user) {
    return null;
  }

  return <Profile user={session.user} />;
}
