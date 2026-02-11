"use client";

import { useSession } from "next-auth/react";
import { useMenu } from "@/hooks/useMenu";
import { UIHome } from "@/features/home";

export default function Home() {
  const { data: session } = useSession();
  const { modules } = useMenu();

  const currentUser = session?.user
    ? {
        ...session.user,
        avatar: "/images/images.png",
      }
    : null;

  return <UIHome user={currentUser} modules={modules} />;
}
