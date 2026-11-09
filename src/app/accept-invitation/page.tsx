import type { Metadata } from "next";

import { APP_CONFIG } from "@/config/app-config";

import { AcceptInvitationScreen } from "./_components/accept-invitation-screen";

export const metadata: Metadata = {
  title: "Accept invitation",
  description: `Accept your ${APP_CONFIG.name} team invitation and create your password.`,
};

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  //--------token----//
  const { token } = await searchParams;
  //-------end-token----//
  return <AcceptInvitationScreen token={typeof token === "string" ? token : ""} />;
}
