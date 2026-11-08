"use client";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MonitorSmartphoneIcon } from "lucide-react";

import { AccessError } from "@/app/(main)/dashboard/_components/access/access-feedback";
import SettingsSection from "@/components/shadcn-studio/blocks/account-settings-13/content/settings-section";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useI18n } from "@/i18n/language-provider";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { authApi } from "@/lib/api/services/auth";
import type { TrustedBrowser } from "@/lib/api/types/auth";
import { notify } from "@/lib/notify";

const trustedBrowsersKey = ["session", "trusted-browsers"] as const;

export function MyProfileTrustedBrowsersSection() {
  const { formatDateTime, t } = useI18n();
  const client = useQueryClient();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [browserToRemove, setBrowserToRemove] = useState<TrustedBrowser | null>(null);
  const [removeAllOpen, setRemoveAllOpen] = useState(false);

  //--------fetch-data----//
  const browsersQuery = useQuery({
    queryKey: trustedBrowsersKey,
    queryFn: ({ signal }) => authApi.listTrustedBrowsers(signal),
  });
  //-------end-fetch-data----//

  const refresh = async () => {
    await client.invalidateQueries({ queryKey: trustedBrowsersKey });
  };

  //--------remove-browser----//
  const removeBrowser = useMutation({
    mutationFn: (id: string) => authApi.removeTrustedBrowser(id),
    onMutate: (id) => setPendingId(id),
    onSuccess: async (response) => {
      setBrowserToRemove(null);
      notify.success(response.message);
      await refresh();
    },
    onError: (error) => notify.error(getApiErrorMessage(error)),
    onSettled: () => setPendingId(null),
  });
  //-------end-remove-browser----//

  //--------remove-all----//
  const removeAll = useMutation({
    mutationFn: () => authApi.removeAllTrustedBrowsers(),
    onSuccess: async (response) => {
      setRemoveAllOpen(false);
      notify.success(response.message);
      await refresh();
    },
    onError: (error) => notify.error(getApiErrorMessage(error)),
  });
  //-------end-remove-all----//

  const browsers = browsersQuery.data ?? [];
  const busy = removeBrowser.isPending || removeAll.isPending;

  //--------section----//
  return (
    <SettingsSection
      title={t("profile.navTrustedBrowsers")}
      description={t("profile.trustedDescription")}
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy || browsers.length === 0}
          onClick={() => setRemoveAllOpen(true)}
        >
          {removeAll.isPending && <Spinner data-icon="inline-start" />}
          {t("profile.removeAll")}
        </Button>
      }
    >
      {browsersQuery.isPending ? <Skeleton className="h-24 w-full" /> : null}
      {browsersQuery.isError ? (
        <AccessError
          error={browsersQuery.error}
          retry={() => void browsersQuery.refetch()}
          busy={browsersQuery.isFetching}
        />
      ) : null}
      {browsersQuery.isSuccess && browsers.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MonitorSmartphoneIcon />
            </EmptyMedia>
            <EmptyTitle>{t("profile.noTrustedBrowsers")}</EmptyTitle>
            <EmptyDescription>{t("profile.noTrustedBrowsersDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}
      {browsersQuery.isSuccess && browsers.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {browsers.map((browser) => (
            <li key={browser.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <MonitorSmartphoneIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-sm">{browser.label}</p>
                    {browser.current ? <Badge variant="secondary">{t("profile.thisBrowser")}</Badge> : null}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t("profile.lastUsedExpires", {
                      lastUsed: formatDateTime(browser.last_used_at),
                      expires: formatDateTime(browser.expires_at),
                    })}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => setBrowserToRemove(browser)}
              >
                {pendingId === browser.id && <Spinner data-icon="inline-start" />}
                {t("profile.remove")}
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      <AlertDialog open={browserToRemove !== null} onOpenChange={(open) => !open && setBrowserToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("profile.removeBrowserTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("profile.removeBrowserDescription", { label: browserToRemove?.label ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeBrowser.isPending}>{t("profile.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={removeBrowser.isPending || !browserToRemove}
              onClick={() => browserToRemove && removeBrowser.mutate(browserToRemove.id)}
            >
              {t("profile.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={removeAllOpen} onOpenChange={setRemoveAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("profile.removeAllTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("profile.removeAllDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeAll.isPending}>{t("profile.cancel")}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={removeAll.isPending} onClick={() => removeAll.mutate()}>
              {t("profile.removeAll")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsSection>
  );
  //-------end-section----//
}
