"use client";

import { type FormEvent, useState } from "react";

import LY from "country-flag-icons/react/3x2/LY";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { authApi } from "@/lib/api/services/auth";
import type { ForgotPasswordRequest } from "@/lib/api/types/auth";
import { notify } from "@/lib/notify";

type ResetChannel = "email" | "phone";

const LIBYA_CALLING_CODE = "+218";

function toLibyanPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  const national = (digits.startsWith("218") ? digits.slice(3) : digits).replace(/^0+/, "");
  return `${LIBYA_CALLING_CODE}${national}`;
}

const ForgotPasswordForm = () => {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<ResetChannel>("email");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const phoneNumber = toLibyanPhone(String(formData.get("phone_number") ?? ""));
    if (channel === "phone" && phoneNumber === LIBYA_CALLING_CODE) {
      notify.error("Enter a phone number");
      return;
    }
    const body: ForgotPasswordRequest =
      channel === "email" ? { email, phone_number: null } : { email: null, phone_number: phoneNumber };

    setPending(true);
    try {
      const response = await authApi.forgotPassword(body);
      setMessage(response.message);
    } catch (error) {
      notify.error("Unable to request password reset", { description: getApiErrorMessage(error) });
    } finally {
      setPending(false);
    }
  }

  if (message) {
    return (
      <p role="status" className="text-sm">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel>Send reset instructions to</FieldLabel>
          <ToggleGroup
            type="single"
            variant="outline"
            value={channel}
            onValueChange={(value) => {
              if (value === "email" || value === "phone") setChannel(value);
            }}
            className="w-full"
            disabled={pending}
          >
            <ToggleGroupItem value="email" className="flex-1">
              Email
            </ToggleGroupItem>
            <ToggleGroupItem value="phone" className="flex-1">
              Phone number
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>

        {channel === "email" ? (
          <Field>
            <FieldLabel htmlFor="forgot-email" className="sr-only">
              Email address
            </FieldLabel>
            <Input
              id="forgot-email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              autoComplete="email"
              required
              disabled={pending}
            />
          </Field>
        ) : (
          <Field>
            <FieldLabel htmlFor="forgot-phone" className="sr-only">
              Libya phone number. Country code +218 is included.
            </FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <LY title="Libya" className="h-4 w-6 shrink-0 rounded-[2px]" />
                <span>{LIBYA_CALLING_CODE}</span>
              </InputGroupAddon>
              <InputGroupInput
                id="forgot-phone"
                name="phone_number"
                type="tel"
                inputMode="tel"
                placeholder="91 234 5678"
                autoComplete="tel-national"
                required
                disabled={pending}
              />
            </InputGroup>
          </Field>
        )}

        <Field>
          <Button className="w-full" type="submit" disabled={pending}>
            {pending && <Spinner data-icon="inline-start" />}
            {pending ? "Sending…" : "Send reset link"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
};

export default ForgotPasswordForm;
