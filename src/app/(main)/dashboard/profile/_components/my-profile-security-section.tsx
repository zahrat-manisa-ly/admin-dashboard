"use client";

import { useState } from "react";

import { ShieldCheckIcon, SmartphoneIcon } from "lucide-react";

import SettingsSection from "@/components/shadcn-studio/blocks/account-settings-13/content/settings-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useI18n } from "@/i18n/language-provider";
import type { ChangePasswordRequest } from "@/lib/api/types/auth";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";

export function MyProfileSecuritySection({
  pending,
  onChangePassword,
}: {
  pending: boolean;
  onChangePassword: (input: ChangePasswordRequest) => Promise<void>;
}) {
  const { t } = useI18n();
  const [values, setValues] = useState({ current: "", next: "", confirm: "" });

  const handleSubmit = async () => {
    if (pending) return;
    if (values.next.length < 8) {
      notify.error(t("profile.passwordMinLength"));
      return;
    }
    if (values.next !== values.confirm) {
      notify.error(t("profile.passwordsDoNotMatch"));
      return;
    }
    await onChangePassword({
      current_password: values.current,
      new_password: values.next,
      confirm_password: values.confirm,
    });
    setValues({ current: "", next: "", confirm: "" });
  };

  return (
    <div className="flex flex-col gap-6">
      <SettingsSection title={t("profile.changePassword")} description={t("profile.changePasswordDescription")}>
        <div className="flex max-w-sm flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="my-profile-current-password">{t("profile.currentPassword")}</Label>
            <Input
              id="my-profile-current-password"
              type="password"
              autoComplete="current-password"
              value={values.current}
              disabled={pending}
              onChange={(event) => setValues((prev) => ({ ...prev, current: event.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="my-profile-new-password">{t("profile.newPassword")}</Label>
            <Input
              id="my-profile-new-password"
              type="password"
              autoComplete="new-password"
              value={values.next}
              disabled={pending}
              onChange={(event) => setValues((prev) => ({ ...prev, next: event.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="my-profile-confirm-password">{t("profile.confirmNewPassword")}</Label>
            <Input
              id="my-profile-confirm-password"
              type="password"
              autoComplete="new-password"
              value={values.confirm}
              disabled={pending}
              onChange={(event) => setValues((prev) => ({ ...prev, confirm: event.target.value }))}
            />
          </div>
          <div>
            <Button
              type="button"
              disabled={pending || !values.current || !values.next || !values.confirm || values.next !== values.confirm}
              onClick={() => void handleSubmit()}
            >
              {pending && <Spinner data-icon="inline-start" />}
              {t("profile.changePassword")}
            </Button>
          </div>
        </div>
      </SettingsSection>

      <TwoFactorPlaceholder />
    </div>
  );
}

function TwoFactorPlaceholder() {
  const { t } = useI18n();
  const [enabled, setEnabled] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);

  return (
    <SettingsSection title={t("profile.twoFactor")} description={t("profile.twoFactorDescription")}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-sm">{t("profile.authenticatorApp")}</span>
        </div>
        <Badge
          className={cn(
            "rounded-sm",
            enabled
              ? "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
              : "bg-muted text-muted-foreground",
          )}
        >
          {enabled ? t("profile.enabled") : t("profile.notEnabled")}
        </Badge>
        {enabled ? (
          <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                {t("profile.turnOff")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-100">
              <DialogHeader>
                <DialogTitle>{t("profile.turnOffTitle")}</DialogTitle>
                <DialogDescription>{t("profile.turnOffDescription")}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-end">
                <DialogClose asChild>
                  <Button variant="outline">{t("profile.cancel")}</Button>
                </DialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    setEnabled(false);
                    setDisableOpen(false);
                    notify.success(t("profile.twoFactorOff"));
                  }}
                >
                  {t("profile.turnOff")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
            <DialogTrigger asChild>
              <Button type="button" size="sm">
                {t("profile.setUp")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-100">
              <DialogHeader>
                <DialogTitle>{t("profile.setUpTitle")}</DialogTitle>
                <DialogDescription>{t("profile.setUpDescription")}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="flex size-32 items-center justify-center rounded-lg border bg-muted">
                  <SmartphoneIcon className="size-16 text-muted-foreground" />
                </div>
              </div>
              <Button
                type="button"
                onClick={() => {
                  setEnabled(true);
                  setSetupOpen(false);
                  notify.info(t("profile.mfaPlaceholder"));
                }}
              >
                {t("profile.scanned")}
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </SettingsSection>
  );
}
