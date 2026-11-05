"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { useSessionMutations } from "@/app/(main)/dashboard/_components/access/access.mutations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { authApi } from "@/lib/api/services/auth";
import { notify } from "@/lib/notify";

export function LoginTermsStep({ transactionToken, onBack }: { transactionToken: string; onBack: () => void }) {
  const router = useRouter();
  const { acceptLoginTerms } = useSessionMutations();
  const [accepted, setAccepted] = useState(false);
  //--------current-terms----//
  const termsQuery = useQuery({
    queryKey: ["terms", "current"],
    queryFn: ({ signal }) => authApi.getCurrentTerms(signal),
  });
  //-------end-current-terms----//

  async function handleAccept() {
    try {
      const result = await acceptLoginTerms.mutateAsync(transactionToken);
      if ("challenge_token" in result) {
        notify.info("Verification required", {
          description: "Your account requires MFA verification before sign-in.",
        });
        return;
      }
      notify.success("Signed in");
      router.replace("/dashboard/default");
    } catch (error) {
      notify.error("Unable to accept terms", { description: getApiErrorMessage(error) });
    }
  }

  const terms = termsQuery.data;
  const pending = acceptLoginTerms.isPending;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold md:text-3xl lg:text-4xl">Terms and conditions</h2>
        <p className="text-muted-foreground">Accept the current terms to finish signing in.</p>
      </div>

      {termsQuery.isPending ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : null}

      {termsQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load terms</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <span>{getApiErrorMessage(termsQuery.error)}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => void termsQuery.refetch()}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {terms ? (
        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">Version {terms.version}</p>
          <ScrollArea className="h-72 rounded-lg border">
            <div dir="auto" className="flex flex-col gap-4 p-4">
              {terms.content.length === 0 ? (
                <p className="text-muted-foreground text-sm">The current terms have no content.</p>
              ) : (
                terms.content.map((section, sectionIndex) => (
                  <section key={`${section.title}-${sectionIndex}`} className="flex flex-col gap-2">
                    <h3 className="font-medium">{section.title}</h3>
                    <ul className="flex list-disc flex-col gap-1 ps-5 text-sm">
                      {section.items.map((item, itemIndex) => (
                        <li key={`${sectionIndex}-${itemIndex}`}>{item}</li>
                      ))}
                    </ul>
                  </section>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      ) : null}

      <Field orientation="horizontal" className="items-center gap-2">
        <Checkbox
          id="acceptTerms"
          checked={accepted}
          onCheckedChange={(checked) => setAccepted(checked === true)}
          disabled={!terms || pending}
        />
        <FieldLabel htmlFor="acceptTerms" className="font-normal">
          I accept these terms
        </FieldLabel>
      </Field>

      <div className="flex flex-col gap-2">
        <Button type="button" disabled={!terms || !accepted || pending} onClick={() => void handleAccept()}>
          {pending && <Spinner data-icon="inline-start" />}
          {pending ? "Accepting…" : "Accept and continue"}
        </Button>
        <Button type="button" variant="ghost" disabled={pending} onClick={onBack}>
          Back to sign in
        </Button>
      </div>
    </div>
  );
}
