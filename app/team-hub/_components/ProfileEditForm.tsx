"use client";

import { useState, type FormEvent } from "react";
import { TeamButton, teamInputClass } from "./TeamHubUi";

export type ProfileEditValues = {
  full_name: string;
  email: string;
  title: string;
};

export type ProfileSaveResult =
  | { ok: true }
  | { ok: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ProfileEditForm({
  initialValues,
  onSave,
  onCancel,
  saveLabel = "Save changes",
}: {
  initialValues: ProfileEditValues;
  onSave: (values: ProfileEditValues) => Promise<ProfileSaveResult>;
  onCancel?: () => void;
  saveLabel?: string;
}) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ProfileEditValues, string>>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    tone: "error" | "success";
    text: string;
  } | null>(null);

  function updateField<Key extends keyof ProfileEditValues>(
    field: Key,
    value: ProfileEditValues[Key],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setMessage(null);
  }

  function validate(): boolean {
    const errors: typeof fieldErrors = {};
    if (!values.full_name.trim()) {
      errors.full_name = "Full name is required.";
    }
    if (!EMAIL_PATTERN.test(values.email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    if (!validate()) return;

    setIsSaving(true);
    setMessage(null);
    const result = await onSave({
      full_name: values.full_name.trim(),
      email: values.email.trim(),
      title: values.title.trim(),
    });
    setIsSaving(false);

    setMessage(
      result.ok
        ? { tone: "success", text: "Profile saved." }
        : { tone: "error", text: result.error },
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {message && (
        <p
          role={message.tone === "error" ? "alert" : "status"}
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.tone === "error"
              ? "border-[#E4B9B9] bg-[#FFF0F0] text-[#8B3E3E]"
              : "border-[#BFD8C7] bg-[#EDF7EF] text-[#356346]"
          }`}
        >
          {message.text}
        </p>
      )}

      <label className="block text-xs font-semibold text-[#341F60]">
        Full name
        <input
          type="text"
          value={values.full_name}
          onChange={(event) => updateField("full_name", event.target.value)}
          className={`mt-2 ${teamInputClass}`}
          aria-invalid={Boolean(fieldErrors.full_name)}
          aria-describedby={
            fieldErrors.full_name ? "profile-full-name-error" : undefined
          }
        />
        {fieldErrors.full_name && (
          <span
            id="profile-full-name-error"
            role="alert"
            className="mt-1.5 block text-xs font-medium text-[#9A4040]"
          >
            {fieldErrors.full_name}
          </span>
        )}
      </label>

      <label className="block text-xs font-semibold text-[#341F60]">
        Email
        <input
          type="email"
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          className={`mt-2 ${teamInputClass}`}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={
            fieldErrors.email ? "profile-email-error" : undefined
          }
        />
        {fieldErrors.email && (
          <span
            id="profile-email-error"
            role="alert"
            className="mt-1.5 block text-xs font-medium text-[#9A4040]"
          >
            {fieldErrors.email}
          </span>
        )}
      </label>

      <label className="block text-xs font-semibold text-[#341F60]">
        Title
        <input
          type="text"
          value={values.title}
          onChange={(event) => updateField("title", event.target.value)}
          className={`mt-2 ${teamInputClass}`}
          placeholder="e.g. Creative Director"
        />
      </label>

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        {onCancel && (
          <TeamButton
            type="button"
            tone="secondary"
            disabled={isSaving}
            onClick={onCancel}
          >
            Cancel
          </TeamButton>
        )}
        <TeamButton type="submit" disabled={isSaving}>
          {isSaving ? "Saving…" : saveLabel}
        </TeamButton>
      </div>
    </form>
  );
}
