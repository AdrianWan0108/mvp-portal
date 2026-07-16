"use client";

import { useEffect, type FormEvent, type ReactNode } from "react";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 border-b border-[#D7CBE0] pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7D4698]">
          {eyebrow ?? "Understory admin"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#28154F] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6C5A78]">
          {description}
        </p>
      </div>
      {action}
    </header>
  );
}

export function AdminButton({
  children,
  tone = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "danger";
}) {
  const styles = {
    primary: "bg-[#341F60] text-white hover:bg-[#28154F]",
    secondary:
      "border border-[#CDBAD9] bg-white text-[#5F3378] hover:bg-[#EEE3FA]",
    danger:
      "border border-[#E2BABA] bg-white text-[#9A4040] hover:bg-[#FFF0F0]",
  };

  return (
    <button
      {...props}
      className={`rounded-full px-4 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D4698] ${styles[tone]} ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function AdminEmpty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-dashed border-[#CDBAD9] bg-white px-6 py-12 text-center text-sm text-[#75647F]">
      {children}
    </div>
  );
}

export function AdminMessage({
  error,
  success,
}: {
  error?: string | null;
  success?: string | null;
}) {
  if (!error && !success) return null;
  return (
    <div
      role={error ? "alert" : "status"}
      className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
        error
          ? "border-[#E4B9B9] bg-[#FFF0F0] text-[#8B3E3E]"
          : "border-[#BFD8C7] bg-[#EDF7EF] text-[#356346]"
      }`}
    >
      {error ?? success}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-[#CDBAD9] bg-white px-3.5 py-2.5 text-sm text-[#341F60] placeholder:text-[#AA98B4] focus:border-[#7D4698] focus:outline-none focus:ring-2 focus:ring-[#EEE3FA]";

type AdminModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  submitLabel?: string;
  isSaving?: boolean;
  submitDisabled?: boolean;
  maxWidth?: "md" | "lg" | "xl";
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AdminModal({
  open,
  title,
  description,
  children,
  submitLabel = "Save",
  isSaving = false,
  submitDisabled = false,
  maxWidth = "lg",
  onClose,
  onSubmit,
}: AdminModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, onClose, open]);

  if (!open) return null;

  const widths = {
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#28154F]/60 px-4 py-8 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 cursor-default"
        onClick={() => {
          if (!isSaving) onClose();
        }}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className={`relative z-10 w-full ${widths[maxWidth]} overflow-hidden rounded-[24px] border border-white/70 bg-[#FFFDF8] shadow-[0_28px_90px_rgba(40,21,79,0.28)]`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E2D7E8] px-5 py-5 sm:px-6">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#7D4698]">
              Understory admin
            </p>
            <h2
              id="admin-modal-title"
              className="mt-1 text-xl font-semibold tracking-[-0.025em] text-[#28154F]"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-2 text-sm leading-6 text-[#75647F]">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            disabled={isSaving}
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#D7CBE0] bg-white text-lg text-[#695677] transition hover:bg-[#EEE3FA] hover:text-[#341F60] disabled:opacity-45"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="max-h-[65vh] overflow-y-auto px-5 py-5 sm:px-6">
            {children}
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-[#E2D7E8] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <AdminButton
              type="button"
              tone="secondary"
              disabled={isSaving}
              onClick={onClose}
            >
              Cancel
            </AdminButton>
            <AdminButton
              type="submit"
              disabled={isSaving || submitDisabled}
            >
              {isSaving ? "Saving…" : submitLabel}
            </AdminButton>
          </div>
        </form>
      </section>
    </div>
  );
}

export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  isWorking = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isWorking?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isWorking) onCancel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWorking, onCancel, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#28154F]/60 px-4 py-8 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Cancel deletion"
        className="absolute inset-0 cursor-default"
        onClick={() => {
          if (!isWorking) onCancel();
        }}
      />
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        aria-describedby="admin-confirm-description"
        className="relative z-10 w-full max-w-md rounded-[24px] border border-white/70 bg-[#FFFDF8] p-6 shadow-[0_28px_90px_rgba(40,21,79,0.28)]"
      >
        <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F0] text-xl text-[#9A4040]">
          !
        </span>
        <h2
          id="admin-confirm-title"
          className="mt-5 text-xl font-semibold text-[#28154F]"
        >
          {title}
        </h2>
        <p
          id="admin-confirm-description"
          className="mt-2 text-sm leading-6 text-[#75647F]"
        >
          {description}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AdminButton
            type="button"
            tone="secondary"
            disabled={isWorking}
            onClick={onCancel}
          >
            Cancel
          </AdminButton>
          <AdminButton
            type="button"
            tone="danger"
            disabled={isWorking}
            onClick={onConfirm}
          >
            {isWorking ? "Deleting…" : confirmLabel}
          </AdminButton>
        </div>
      </section>
    </div>
  );
}
