"use client";

import { type FormEvent, useState } from "react";

import Link from "next/link";

import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { authApi } from "@/lib/api/services/auth";
import { notify } from "@/lib/notify";

export function ResetPasswordForm({ token }: { token: string }) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newPassword = String(formData.get("new_password") ?? "");
    const confirmPassword = String(formData.get("confirm_password") ?? "");
    if (newPassword !== confirmPassword) {
      notify.error("Passwords do not match");
      return;
    }

    setPending(true);
    try {
      await authApi.resetPassword({
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setDone(true);
    } catch (error) {
      notify.error("Unable to reset password", { description: getApiErrorMessage(error) });
    } finally {
      setPending(false);
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-4">
        <p role="status" className="text-sm">
          This reset link is missing its token. Request a new email from the forgot-password page.
        </p>
        <Button className="w-full" asChild>
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <p role="status" className="text-sm">
          Your password has been updated. Sign in with the new password.
        </p>
        <Button className="w-full" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="new-password">New password</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="new-password"
              name="new_password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              required
              disabled={pending}
            />
            <InputGroupAddon align="inline-end" className="pr-1.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword((current) => !current)}
                className="rounded-l-none text-muted-foreground hover:bg-transparent"
                disabled={pending}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="confirm-password"
              name="confirm_password"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              required
              disabled={pending}
            />
            <InputGroupAddon align="inline-end" className="pr-1.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowConfirm((current) => !current)}
                className="rounded-l-none text-muted-foreground hover:bg-transparent"
                disabled={pending}
              >
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                <span className="sr-only">{showConfirm ? "Hide password" : "Show password"}</span>
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </Field>
        <Field>
          <Button className="w-full" type="submit" disabled={pending}>
            {pending && <Spinner data-icon="inline-start" />}
            {pending ? "Saving…" : "Save new password"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
