"use client";

import { ServerUnreachable } from "@/components/server-unreachable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useI18n } from "@/i18n/language-provider";
import { getApiErrorMessage, isUnreachableError } from "@/lib/api/api-error";

export function AccessError({ error, retry, busy = false }: { error: unknown; retry?: () => void; busy?: boolean }) {
  const { locale } = useI18n();
  const ar = locale === "ar";
  if (isUnreachableError(error)) return <ServerUnreachable retry={retry} busy={busy} />;
  return (
    <Alert variant="destructive">
      <AlertTitle>{ar ? "تعذر إكمال الطلب" : "Unable to complete the request"}</AlertTitle>
      <AlertDescription className="flex flex-col items-start gap-3">
        <p>{getApiErrorMessage(error)}</p>
        {retry && (
          <Button variant="outline" size="sm" onClick={retry} disabled={busy}>
            {busy && <Spinner data-icon="inline-start" />}
            {ar ? "إعادة المحاولة" : "Try again"}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

export function AccessUpdating({ active }: { active: boolean }) {
  const { locale } = useI18n();
  return (
    <div className="flex min-h-5 items-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
      {active && (
        <>
          <Spinner aria-hidden="true" />
          {locale === "ar" ? "جارٍ التحديث…" : "Updating…"}
        </>
      )}
    </div>
  );
}
