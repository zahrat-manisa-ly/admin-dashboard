"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { Check, LogOut, UserRound } from "lucide-react";

import { useSessionMutations } from "@/app/(main)/dashboard/_components/access/access.mutations";
import { useCurrentUserQuery } from "@/app/(main)/dashboard/_components/access/access.queries";
import { AccessError } from "@/app/(main)/dashboard/_components/access/access-feedback";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { useI18n } from "@/i18n/language-provider";
import { isMockApi } from "@/lib/api/client";
import { accessApi } from "@/lib/api/services/access";
import { getInitials } from "@/lib/utils";

export function AccountSwitcher() {
  const { t } = useI18n();
  const router = useRouter();
  const currentUserQuery = useCurrentUserQuery();
  const activeUser = currentUserQuery.data;
  const accountsQuery = useQuery({
    queryKey: ["session", "demo-accounts"],
    queryFn: ({ signal }) => accessApi.demoAccounts(signal),
    enabled: isMockApi && Boolean(activeUser),
  });
  const { logout, switchAccount } = useSessionMutations();

  if (!activeUser) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full ring-2 ring-primary/60 ring-offset-2 ring-offset-background transition-[box-shadow] hover:ring-primary focus-visible:outline-none focus-visible:ring-primary"
          aria-label={activeUser.name}
        >
          <Avatar className="size-7">
            <AvatarFallback className="text-xs">{getInitials(activeUser.name)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56 space-y-1 rounded-lg" side="bottom" align="end" sideOffset={4}>
        <DropdownMenuGroup>
          {isMockApi &&
            accountsQuery.data?.map((user) => (
              <DropdownMenuItem
                key={user.id}
                className={cn("p-0", user.id === activeUser.id && "bg-accent/50")}
                aria-current={user.id === activeUser.id ? "true" : undefined}
                disabled={switchAccount.isPending}
                onClick={() => {
                  if (user.id !== activeUser.id) switchAccount.mutate(user.id);
                }}
              >
                <div className="flex w-full items-center gap-2 px-1 py-1.5">
                  <Avatar className="size-9 rounded-lg">
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                  {switchAccount.isPending && switchAccount.variables === user.id ? (
                    <Spinner />
                  ) : (
                    <span
                      className={cn(
                        "mr-1 flex size-5 items-center justify-center text-primary opacity-0",
                        user.id === activeUser.id && "opacity-100",
                      )}
                    >
                      <Check aria-hidden="true" />
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
        </DropdownMenuGroup>
        {isMockApi && accountsQuery.isError && (
          <div className="p-2">
            <AccessError
              error={accountsQuery.error}
              retry={() => void accountsQuery.refetch()}
              busy={accountsQuery.isFetching}
            />
          </div>
        )}
        {isMockApi && <DropdownMenuSeparator />}
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile" prefetch={false}>
            <UserRound />
            {t("profile.pageTitle")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={logout.isPending}
          onClick={() => logout.mutate(undefined, { onSuccess: () => router.replace("/login") })}
        >
          {logout.isPending ? <Spinner data-icon="inline-start" /> : <LogOut />} Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
