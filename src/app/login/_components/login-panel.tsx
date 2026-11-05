"use client";

import { useState } from "react";

import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { SocialAuthButtons } from "@/components/ui/social-auth-buttons";
import { APP_CONFIG } from "@/config/app-config";

import { LoginForm } from "./login-form";
import { LoginTermsStep } from "./login-terms-step";

export function LoginPanel() {
  const [termsToken, setTermsToken] = useState<string | null>(null);

  if (termsToken) {
    return (
      <div className="flex w-full max-w-lg flex-col p-6">
        <LoginTermsStep transactionToken={termsToken} onBack={() => setTermsToken(null)} />
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-6 p-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold md:text-3xl lg:text-4xl">Welcome back</h2>
        <p className="text-muted-foreground">Sign in to your {APP_CONFIG.name} admin account</p>
      </div>

      <SocialAuthButtons intent="login" />

      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <p>Or</p>
        <Separator className="flex-1" />
      </div>

      <div className="flex flex-col gap-4">
        <LoginForm onTermsRequired={setTermsToken} />

        <p className="text-muted-foreground text-center">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="text-foreground hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
