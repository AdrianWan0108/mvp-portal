"use client";

import { useEffect, type FormEvent, type ReactNode } from "react";

export const teamInputClass =
  "w-full rounded-xl border border-[#CDBAD9] bg-white px-3.5 py-2.5 text-sm text-[#341F60] placeholder:text-[#AA98B4] focus:border-[#7D4698] focus:outline-none focus:ring-2 focus:ring-[#EEE3FA]";

export function TeamButton({
  children,
  tone = "primary",
  themed = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "danger";
  themed?: boolean;
}) {
  const understoryTones = {
    primary: "bg-[#341F60] text-white hover:bg-[#28154F]",
    secondary:
      "border border-[#CDBAD9] bg-white text-[#5F3378] hover:bg-[#EEE3FA]",
    danger:
      "border border-[#E2BABA] bg-white text-[#9A4040] hover:bg-[#FFF0F0]",
  };
  const themedTones = {
    primary:
      "bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-95",
    secondary:
      "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]",
    danger:
      "border border-[#E2BABA] bg-[var(--card)] text-[#9A4040] hover:bg-[#FFF0F0]",
  };
  const focusColor = themed
    ? "focus-visible:outline-[var(--ring)]"
    : "focus-visible:outline-[#7D4698]";
  return (
    <button
      {...props}
      className={`rounded-full px-4 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 ${focusColor} ${
        themed ? themedTones[tone] : understoryTones[tone]
      } ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function TeamModal({
  open,
  title,
  description,
  children,
  submitLabel = "Save",
  isSaving = false,
  submitDisabled = false,
  themed = false,
  hideSubmit = false,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  submitLabel?: string;
  isSaving?: boolean;
  submitDisabled?: boolean;
  themed?: boolean;
  hideSubmit?: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  useEffect(() => {
    if (!open) return;
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) onClose();
    }
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [isSaving, onClose, open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#28154F]/60 px-4 py-8 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0"
        onClick={() => {
          if (!isSaving) onClose();
        }}
      />
      <section
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full max-w-xl overflow-hidden rounded-[24px] border shadow-[0_28px_90px_rgba(40,21,79,0.28)] ${
          themed
            ? "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
            : "border-white/70 bg-[#FFFDF8]"
        }`}
      >
        <div
          className={`flex items-start justify-between gap-4 border-b px-5 py-5 sm:px-6 ${
            themed ? "border-[var(--border)]" : "border-[#E2D7E8]"
          }`}
        >
          <div>
            <p
              className={`text-[9px] font-bold uppercase tracking-[0.18em] ${
                themed ? "text-[var(--primary)]" : "text-[#7D4698]"
              }`}
            >
              Team Hub
            </p>
            <h2
              className={`mt-1 text-xl font-semibold ${
                themed ? "text-[var(--foreground)]" : "text-[#28154F]"
              }`}
            >
              {title}
            </h2>
            {description && (
              <p
                className={`mt-2 text-sm leading-6 ${
                  themed
                    ? "text-[var(--muted-foreground)]"
                    : "text-[#75647F]"
                }`}
              >
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className={`flex size-9 items-center justify-center rounded-full border text-lg transition ${
              themed
                ? "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                : "border-[#D7CBE0] bg-white text-[#695677] hover:bg-[#EEE3FA]"
            }`}
          >
            ×
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="max-h-[65vh] overflow-y-auto px-5 py-5 sm:px-6">
            {children}
          </div>
          <div
            className={`flex flex-col-reverse gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end sm:px-6 ${
              themed
                ? "border-[var(--border)] bg-[var(--card)]"
                : "border-[#E2D7E8] bg-white"
            }`}
          >
            <TeamButton
              type="button"
              tone="secondary"
              themed={themed}
              disabled={isSaving}
              onClick={onClose}
            >
              Cancel
            </TeamButton>
            {!hideSubmit && (
              <TeamButton
                type="submit"
                themed={themed}
                disabled={isSaving || submitDisabled}
              >
                {isSaving ? "Saving…" : submitLabel}
              </TeamButton>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
