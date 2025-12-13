"use client";

import { useSession } from "next-auth/react";
import { useMenu } from "@/hooks/useMenu";
import UIHome from "@/module/home/UIHome";

export default function Home() {
  const { data: session } = useSession();
  const { modules } = useMenu();

  const currentUser = session?.user
    ? {
        ...session.user,
        avatar: "/images/images.jpg",
      }
    : null;

  return <UIHome user={currentUser} modules={modules} />;
}
