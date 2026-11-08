"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { sessionQueryOptions } from "@/app/(main)/dashboard/_components/access/access.queries";
import { Spinner } from "@/components/ui/spinner";
import { getAccessToken } from "@/lib/api/client";

export default function Home() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const session = useQuery({
    ...sessionQueryOptions(),
    enabled: hasToken === true,
  });

  //--------session-check----//
  useEffect(() => {
    setHasToken(Boolean(getAccessToken()));
  }, []);

  useEffect(() => {
    if (hasToken === null) return;
    if (!hasToken) {
      router.replace("/login");
      return;
    }
    if (session.isPending) return;
    router.replace(session.data?.user ? "/dashboard/default" : "/login");
  }, [hasToken, router, session.data, session.isPending]);
  //-------end-session-check----//

  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <Spinner className="size-6" />
    </div>
  );
}
