import type { Metadata } from "next";

import { APP_CONFIG } from "@/config/app-config";

import { ResetPasswordScreen } from "./_components/reset-password-screen";

export const metadata: Metadata = {
  title: "Reset password",
  description: `Choose a new password for your ${APP_CONFIG.name} admin account.`,
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  return <ResetPasswordScreen token={typeof token === "string" ? token : ""} />;
}
