"use client";

import { type FormEvent, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { EyeIcon, EyeOffIcon } from "lucide-react";

import { useSessionMutations } from "@/app/(main)/dashboard/_components/access/access.mutations";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { APP_CONFIG } from "@/config/app-config";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { notify } from "@/lib/notify";

export function LoginForm({ onTermsRequired }: { onTermsRequired: (transactionToken: string) => void }) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const { login } = useSessionMutations();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const result = await login.mutateAsync({ email, password, remember_me: remember });
      if ("transaction_token" in result) {
        onTermsRequired(result.transaction_token);
        return;
      }
      if ("challenge_token" in result) {
        notify.info("Verification required", {
          description: "Your account requires MFA verification before sign-in.",
        });
        return;
      }
      notify.success("Signed in");
      router.replace("/dashboard/default");
    } catch (error) {
      notify.error("Unable to sign in", { description: getApiErrorMessage(error) });
    }
  }

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
      <FieldGroup className="gap-4">
        <Field>
          <Input
            type="email"
            placeholder="Enter your email address"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={login.isPending}
          />
        </Field>
        <InputGroup>
          <InputGroupInput
            id="password"
            type={isVisible ? "text" : "password"}
            placeholder="••••••••••••••••"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={login.isPending}
          />
          <InputGroupAddon align="inline-end" className="pr-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsVisible((prevState) => !prevState)}
              className="text-muted-foreground rounded-l-none hover:bg-transparent"
              disabled={login.isPending}
            >
              {isVisible ? <EyeOffIcon /> : <EyeIcon />}
              <span className="sr-only">{isVisible ? "Hide password" : "Show password"}</span>
            </Button>
          </InputGroupAddon>
        </InputGroup>
        <div className="flex items-center justify-between gap-y-2">
          <Field orientation="horizontal" className="flex items-center gap-2">
            <Checkbox
              id="rememberMe"
              checked={remember}
              onCheckedChange={(checked) => setRemember(checked === true)}
              disabled={login.isPending}
            />
            <FieldLabel htmlFor="rememberMe" className="text-muted-foreground font-normal">
              Remember me
            </FieldLabel>
          </Field>
          <Link href="/forgot-password" className="text-nowrap hover:underline">
            Forgot password?
          </Link>
        </div>
        <Field>
          <Button className="w-full" type="submit" disabled={login.isPending}>
            {login.isPending && <Spinner data-icon="inline-start" />}
            {login.isPending ? "Signing in…" : `Sign in to ${APP_CONFIG.name}`}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
