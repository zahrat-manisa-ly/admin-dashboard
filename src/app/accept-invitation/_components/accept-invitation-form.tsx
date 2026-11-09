"use client";

import { type FormEvent, useState } from "react";

import Link from "next/link";

import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { usersApi } from "@/lib/api/services/users";
import { notify } from "@/lib/notify";

export function AcceptInvitationForm({ token }: { token: string }) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  //--------submit----//
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirm_password") ?? "");

    if (password !== confirmPassword) {
      notify.error("Passwords do not match");
      return;
    }
    if (!termsAccepted) {
      notify.error("Please accept the terms and conditions");
      return;
    }

    setPending(true);
    try {
      await usersApi.acceptInvitation({
        token,
        password,
        confirm_password: confirmPassword,
        terms_and_conditions: termsAccepted,
      });
      setDone(true);
      notify.success("Invitation accepted", {
        description: "Your account is ready. Sign in with your new password.",
      });
    } catch (error) {
      notify.error("Unable to accept invitation", { description: getApiErrorMessage(error) });
    } finally {
      setPending(false);
    }
  }
  //-------end-submit----//

  //--------missing-token----//
  if (!token.trim()) {
    return (
      <div className="flex flex-col gap-4">
        <p role="status" className="text-sm">
          This invitation link is missing its token. Ask an admin to resend your invitation email.
        </p>
        <Button className="w-full" asChild>
          <Link href="/login">Go to login</Link>
        </Button>
      </div>
    );
  }
  //-------end-missing-token----//

  //--------success----//
  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <p role="status" className="text-sm">
          Your account has been created. Sign in with the email from your invitation and the password you just set.
        </p>
        <Button className="w-full" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }
  //-------end-success----//

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <FieldGroup className="gap-4">
        {/* //--------password-fields----// */}
        <Field>
          <FieldLabel htmlFor="invitation-password">Password</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="invitation-password"
              name="password"
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
          <FieldLabel htmlFor="invitation-confirm-password">Confirm password</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="invitation-confirm-password"
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
        {/* //-------end-password-fields----// */}

        {/* //--------terms----// */}
        <Field orientation="horizontal" className="flex items-center gap-2">
          <Checkbox
            id="invitation-terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            disabled={pending}
          />
          <FieldLabel htmlFor="invitation-terms" className="font-normal">
            <span className="text-muted-foreground">I accept the </span>
            <span className="text-foreground">terms and conditions</span>
          </FieldLabel>
        </Field>
        {/* //-------end-terms----// */}

        <Field>
          <Button className="w-full" type="submit" disabled={pending}>
            {pending && <Spinner data-icon="inline-start" />}
            {pending ? "Creating account…" : "Accept invitation"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
