"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { LogOut, UserRound } from "lucide-react";

import { useSessionMutations } from "@/app/(main)/dashboard/_components/access/access.mutations";
import { useCurrentUserQuery } from "@/app/(main)/dashboard/_components/access/access.queries";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { useI18n } from "@/i18n/language-provider";
import { getInitials } from "@/lib/utils";

export function AccountSwitcher() {
  const { t } = useI18n();
  const router = useRouter();
  const currentUserQuery = useCurrentUserQuery();
  const activeUser = currentUserQuery.data;
  const { logout } = useSessionMutations();

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
