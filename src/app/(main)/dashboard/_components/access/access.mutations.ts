"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { isMockApi } from "@/lib/api/client";
import { accessApi, loadSessionAccount, type SessionAccount } from "@/lib/api/services/access";
import { authApi } from "@/lib/api/services/auth";
import type { CurrentUser } from "@/lib/api/types/access";
import type { AcceptLoginTermsResult, LoginResult } from "@/lib/api/types/auth";
import { currentUserKey } from "@/lib/query/query-client";

export function useSessionMutations() {
  const client = useQueryClient();
  const reset = async () => {
    await client.cancelQueries();
    client.clear();
  };
  return {
    login: useMutation<LoginResult | CurrentUser, Error, { email: string; password: string; remember_me?: boolean }>({
      mutationKey: ["session", "login"],
      mutationFn: (input) =>
        isMockApi
          ? accessApi.login({ email: input.email, password: input.password })
          : authApi.login({
              email: input.email,
              password: input.password,
              remember_me: input.remember_me,
            }),
      onSuccess: async (result) => {
        if ("transaction_token" in result || "challenge_token" in result) return;
        const account: SessionAccount =
          "access_token" in result ? await loadSessionAccount() : { profile: null, user: result };
        await reset();
        client.setQueryData(currentUserKey, account);
      },
    }),
    acceptLoginTerms: useMutation<AcceptLoginTermsResult, Error, string>({
      mutationKey: ["session", "accept-login-terms"],
      mutationFn: (transactionToken) => authApi.acceptLoginTerms(transactionToken),
      onSuccess: async (result) => {
        if ("challenge_token" in result) return;
        const account = await loadSessionAccount();
        await reset();
        client.setQueryData(currentUserKey, account);
      },
    }),
    logout: useMutation({
      mutationKey: ["session", "logout"],
      mutationFn: accessApi.logout,
      onSettled: async () => {
        await reset();
        client.setQueryData(currentUserKey, null);
      },
    }),
  };
}
