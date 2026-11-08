"use client";

import { type ReactNode, useState } from "react";

import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MonitorSmartphoneIcon, ShieldCheckIcon, UserIcon } from "lucide-react";

import { useMyProfileQuery } from "@/app/(main)/dashboard/_components/access/access.queries";
import { AccessError } from "@/app/(main)/dashboard/_components/access/access-feedback";
import {
  SettingsInfoCard,
  SettingsInfoRow,
} from "@/components/shadcn-studio/blocks/account-settings-13/content/settings-info-card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n/language-provider";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { isMockApi } from "@/lib/api/client";
import { authApi } from "@/lib/api/services/auth";
import type {
  ChangePasswordRequest,
  DeleteAccountRequest,
  MyProfile,
  UpdateMyProfileRequest,
} from "@/lib/api/types/auth";
import { notify } from "@/lib/notify";
import { currentUserKey } from "@/lib/query/query-client";
import { cn } from "@/lib/utils";

import { MyProfileDetailsSection } from "./my-profile-details-section";
import { MyProfileSecuritySection } from "./my-profile-security-section";
import { MyProfileTrustedBrowsersSection } from "./my-profile-trusted-browsers-section";

type SectionId = "profile" | "security" | "trusted-browsers";

type NavItem = { id: SectionId; label: string; icon: ReactNode };

function ProfileInfoPanel({ profile }: { profile: MyProfile }) {
  const { t } = useI18n();
  const accountTypeLabel = {
    employee: t("profile.accountEmployee"),
    customer: t("profile.accountCustomer"),
    owner: t("profile.accountOwner"),
  }[profile.account_type];
  const primaryRole = profile.roles[0]?.name ?? accountTypeLabel;
  return (
    <SettingsInfoCard title={t("profile.account")}>
      <SettingsInfoRow
        label={t("profile.yourRole")}
        icon={<ShieldCheckIcon className="size-3.5 shrink-0 opacity-70" />}
        value={<Badge variant="secondary">{primaryRole}</Badge>}
      />
      <SettingsInfoRow label={t("profile.accountType")} value={accountTypeLabel} />
      {profile.employee_id ? <SettingsInfoRow label={t("profile.employeeId")} value={profile.employee_id} /> : null}
    </SettingsInfoCard>
  );
}

export function MyProfileWorkspace() {
  const { t } = useI18n();
  const router = useRouter();
  const client = useQueryClient();
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  //--------navigation----//
  const navItems: NavItem[] = [
    { id: "profile", label: t("profile.navProfile"), icon: <UserIcon className="size-4" /> },
    { id: "security", label: t("profile.navSecurity"), icon: <ShieldCheckIcon className="size-4" /> },
    {
      id: "trusted-browsers",
      label: t("profile.navTrustedBrowsers"),
      icon: <MonitorSmartphoneIcon className="size-4" />,
    },
  ];
  //-------end-navigation----//

  //--------session-account----//
  const profileQuery = useMyProfileQuery();

  const invalidateSession = async () => {
    await client.invalidateQueries({ queryKey: currentUserKey });
  };
  //-------end-session-account----//

  const updateProfile = useMutation({
    mutationKey: ["session", "my-profile", "update"],
    mutationFn: (input: UpdateMyProfileRequest) => authApi.updateMyProfile(input),
    onSuccess: async () => {
      await invalidateSession();
      notify.success(t("profile.profileUpdated"));
    },
    onError: (error) => notify.error(getApiErrorMessage(error)),
  });

  const changePassword = useMutation({
    mutationKey: ["session", "my-profile", "change-password"],
    mutationFn: (input: ChangePasswordRequest) => authApi.changePassword(input),
    onSuccess: () => notify.success(t("profile.passwordUpdated")),
    onError: (error) => notify.error(getApiErrorMessage(error)),
  });

  const deleteAccount = useMutation({
    mutationKey: ["session", "my-profile", "delete"],
    mutationFn: (input: DeleteAccountRequest) => authApi.deleteMyAccount(input),
    onSuccess: async () => {
      client.setQueryData(currentUserKey, null);
      await client.cancelQueries();
      client.clear();
      router.replace("/login");
    },
    onError: (error) => notify.error(getApiErrorMessage(error)),
  });

  if (isMockApi) {
    return <p className="text-muted-foreground text-sm">{t("profile.mockApi")}</p>;
  }

  if (profileQuery.isPending) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <AccessError
        error={profileQuery.error}
        retry={() => void profileQuery.refetch()}
        busy={profileQuery.isFetching}
      />
    );
  }

  const profile = profileQuery.data;

  return (
    <section className="py-3">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="font-bold text-2xl">{t("profile.pageTitle")}</h1>
          <p className="text-muted-foreground text-sm">{t("profile.pageDescription")}</p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <nav className="hidden w-56 shrink-0 flex-col gap-1 lg:flex">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-start font-medium text-sm transition-colors",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="lg:hidden">
            <Select value={activeSection} onValueChange={(value) => value && setActiveSection(value as SectionId)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("profile.selectSection")} />
              </SelectTrigger>
              <SelectContent className="w-(--anchor-width)">
                {navItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    <span className="inline-flex items-center gap-2.5">
                      {item.icon}
                      {item.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-0 flex-1 xl:grid xl:grid-cols-[minmax(0,1fr)_17rem] xl:items-start xl:gap-8">
            <div className="flex min-w-0 flex-col gap-6">
              {/* //--------sections----// */}
              {activeSection === "profile" ? (
                <MyProfileDetailsSection
                  profile={profile}
                  pending={updateProfile.isPending}
                  deletePending={deleteAccount.isPending}
                  onSave={async (input) => {
                    await updateProfile.mutateAsync(input);
                  }}
                  onDeleteAccount={(password) => deleteAccount.mutateAsync({ password })}
                />
              ) : null}
              {activeSection === "security" ? (
                <MyProfileSecuritySection
                  pending={changePassword.isPending}
                  onChangePassword={(input) => changePassword.mutateAsync(input)}
                />
              ) : null}
              {activeSection === "trusted-browsers" ? <MyProfileTrustedBrowsersSection /> : null}
              {/* //-------end-sections----// */}
            </div>

            {activeSection === "profile" ? (
              <aside className="mt-6 flex flex-col gap-6 xl:sticky xl:top-6 xl:mt-0">
                <ProfileInfoPanel profile={profile} />
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
