"use client";

import { type ReactNode, useEffect } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useIsMutating, useQueryClient } from "@tanstack/react-query";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/language-provider";
import { getRoutePermission } from "@/lib/auth/permissions";

import { usePermissions } from "./access.queries";
import { AccessError } from "./access-feedback";
import { AccessSkeleton } from "./access-skeleton";

export function AccessGate({ children }: { children: ReactNode }) {
  const { currentUser, can, isPending, isError, error, refetch, isFetching } = usePermissions();
  const switching = useIsMutating({ mutationKey: ["session"] }) > 0;
  const pathname = usePathname();
  const router = useRouter();
  const client = useQueryClient();
  const { locale } = useI18n();
  const ar = locale === "ar";
  const permission = getRoutePermission(pathname);

  useEffect(() => {
    if (isPending || isError || switching || currentUser) return;
    void client.cancelQueries({ queryKey: ["access"] }).then(() => client.removeQueries({ queryKey: ["access"] }));
    router.replace("/login");
  }, [client, currentUser, isError, isPending, router, switching]);

  if (isPending || switching)
    return <AccessSkeleton kind={pathname.includes("roles-permissions") ? "roles" : "users"} />;
  if (isError) return <AccessError error={error} retry={() => void refetch()} busy={isFetching} />;
  if (!currentUser) return <AccessSkeleton />;
  if (permission && !can(permission)) {
    const destination = "/dashboard/default";
    return (
      <Alert>
        <AlertTitle>{ar ? "الوصول غير متاح" : "Access unavailable"}</AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-3">
          <p>{ar ? "حسابك لا يملك صلاحية عرض هذه الصفحة." : "Your account cannot view this page."}</p>
          <Button asChild variant="outline">
            <Link href={destination}>{ar ? "العودة" : "Go back"}</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  return children;
}
