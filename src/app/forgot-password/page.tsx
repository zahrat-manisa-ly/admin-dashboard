import type { Metadata } from "next";

import ForgotPassword from "@/components/shadcn-studio/blocks/forgot-password-07/forgot-password-07";
import { APP_CONFIG } from "@/config/app-config";

export const metadata: Metadata = {
  title: "Forgot password",
  description: `Reset your ${APP_CONFIG.name} admin password.`,
};

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
