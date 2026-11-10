"use client";

import { useState } from "react";

import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n/language-provider";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { adminWalletOperationApi } from "@/lib/api/services/admin-wallet-operation";
import type { WithdrawalAction, WithdrawalActionDetails } from "@/lib/api/types/admin-wallet-operation";
import { notify } from "@/lib/notify";

export function WithdrawalActionDialog({
  withdrawalId,
  open,
  onOpenChange,
  onCompleted,
}: {
  withdrawalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted: () => void;
}) {
  const { t } = useI18n();
  const [action, setAction] = useState<WithdrawalAction>("approve");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [evidenceId, setEvidenceId] = useState("");
  const [evidenceReference, setEvidenceReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fieldError, setFieldError] = useState("");

  function resetForm() {
    setAction("approve");
    setReason("");
    setNote("");
    setEvidenceId("");
    setEvidenceReference("");
    setFile(null);
    setFieldError("");
  }

  //--------action-mutation----//
  const submitAction = useMutation({
    mutationFn: async () => {
      let details: WithdrawalActionDetails | null = null;
      let nextEvidenceId = evidenceId.trim();

      if (action === "settle" && file) {
        const uploaded = await adminWalletOperationApi.uploadWithdrawalEvidence(withdrawalId, file);
        nextEvidenceId = uploaded.evidence_id;
        notify.success(t("wallet-operations.evidenceUploaded"));
      }

      if (action === "reject") {
        details = { reason: reason.trim() };
      } else if (action === "start" || action === "unknown") {
        details = note.trim() ? { note: note.trim() } : null;
      } else if (action === "settle") {
        details = {
          evidence_id: nextEvidenceId,
          ...(note.trim() ? { note: note.trim() } : {}),
        };
      } else if (action === "fail") {
        details = {
          evidence_reference: evidenceReference.trim(),
          ...(note.trim() ? { note: note.trim() } : {}),
        };
      }

      return adminWalletOperationApi.applyWithdrawalAction(withdrawalId, action, details);
    },
    onSuccess: () => {
      notify.success(t("wallet-operations.actionSuccess"));
      resetForm();
      onOpenChange(false);
      onCompleted();
    },
    onError: (error) => {
      notify.error(getApiErrorMessage(error));
    },
  });
  //-------end-action-mutation----//

  function handleSubmit() {
    if (action === "reject" && !reason.trim()) {
      setFieldError(t("wallet-operations.reasonRequired"));
      return;
    }
    if (action === "settle" && !evidenceId.trim() && !file) {
      setFieldError(t("wallet-operations.evidenceRequired"));
      return;
    }
    if (action === "fail" && !evidenceReference.trim()) {
      setFieldError(t("wallet-operations.evidenceReferenceRequired"));
      return;
    }
    setFieldError("");
    submitAction.mutate();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("wallet-operations.actions")}</DialogTitle>
          <DialogDescription className="font-mono" dir="ltr">
            {withdrawalId}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Field>
            <FieldLabel>{t("wallet-operations.action")}</FieldLabel>
            <Select
              value={action}
              onValueChange={(value) => {
                if (!value) return;
                setAction(value as WithdrawalAction);
                setFieldError("");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("wallet-operations.chooseAction")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="approve">{t("wallet-operations.approve")}</SelectItem>
                  <SelectItem value="reject">{t("wallet-operations.reject")}</SelectItem>
                  <SelectItem value="start">{t("wallet-operations.start")}</SelectItem>
                  <SelectItem value="settle">{t("wallet-operations.settle")}</SelectItem>
                  <SelectItem value="fail">{t("wallet-operations.fail")}</SelectItem>
                  <SelectItem value="unknown">{t("wallet-operations.unknown")}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          {action === "reject" ? (
            <Field data-invalid={fieldError ? true : undefined}>
              <FieldLabel htmlFor="withdrawal-reason">{t("wallet-operations.reason")}</FieldLabel>
              <Textarea
                id="withdrawal-reason"
                value={reason}
                maxLength={500}
                disabled={submitAction.isPending}
                aria-invalid={fieldError ? true : undefined}
                placeholder={t("wallet-operations.reasonPlaceholder")}
                onChange={(event) => setReason(event.target.value)}
              />
              {fieldError ? <FieldError>{fieldError}</FieldError> : null}
            </Field>
          ) : null}

          {action === "settle" ? (
            <>
              <Field>
                <FieldLabel htmlFor="withdrawal-evidence-file">{t("wallet-operations.uploadEvidence")}</FieldLabel>
                <Input
                  id="withdrawal-evidence-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  disabled={submitAction.isPending}
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
                <FieldDescription>{t("wallet-operations.uploadEvidenceHint")}</FieldDescription>
              </Field>
              <Field data-invalid={fieldError ? true : undefined}>
                <FieldLabel htmlFor="withdrawal-evidence-id">{t("wallet-operations.evidenceId")}</FieldLabel>
                <Input
                  id="withdrawal-evidence-id"
                  value={evidenceId}
                  dir="ltr"
                  disabled={submitAction.isPending}
                  aria-invalid={fieldError ? true : undefined}
                  placeholder={t("wallet-operations.evidenceIdPlaceholder")}
                  onChange={(event) => setEvidenceId(event.target.value)}
                />
                {fieldError ? <FieldError>{fieldError}</FieldError> : null}
              </Field>
            </>
          ) : null}

          {action === "fail" ? (
            <Field data-invalid={fieldError ? true : undefined}>
              <FieldLabel htmlFor="withdrawal-evidence-reference">
                {t("wallet-operations.evidenceReference")}
              </FieldLabel>
              <Input
                id="withdrawal-evidence-reference"
                value={evidenceReference}
                dir="ltr"
                maxLength={128}
                disabled={submitAction.isPending}
                aria-invalid={fieldError ? true : undefined}
                placeholder={t("wallet-operations.evidenceReferencePlaceholder")}
                onChange={(event) => setEvidenceReference(event.target.value)}
              />
              {fieldError ? <FieldError>{fieldError}</FieldError> : null}
            </Field>
          ) : null}

          {action === "start" || action === "settle" || action === "fail" || action === "unknown" ? (
            <Field>
              <FieldLabel htmlFor="withdrawal-note">{t("wallet-operations.note")}</FieldLabel>
              <Textarea
                id="withdrawal-note"
                value={note}
                maxLength={500}
                disabled={submitAction.isPending}
                placeholder={t("wallet-operations.notePlaceholder")}
                onChange={(event) => setNote(event.target.value)}
              />
            </Field>
          ) : null}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={submitAction.isPending}>
              {t("wallet-operations.cancel")}
            </Button>
          </DialogClose>
          <Button type="button" disabled={submitAction.isPending} onClick={handleSubmit}>
            {submitAction.isPending ? <Spinner data-icon="inline-start" /> : null}
            {t("wallet-operations.submitAction")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
