"use client";

import { useEffect, useMemo, useState } from "react";
import { resolveFigJamUrls } from "@/lib/figjam";
import { projectInputClass } from "@/lib/project-client-theme";
import { supabase } from "@/lib/supabase";
import { TeamButton } from "../../_components/TeamHubUi";

function FigJamPreview({
  url,
  isRemoving,
  onReplace,
  onRemove,
}: {
  url: string;
  isRemoving: boolean;
  onReplace: () => void;
  onRemove: () => void;
}) {
  const figjamUrls = useMemo(() => resolveFigJamUrls(url), [url]);
  const [previewState, setPreviewState] = useState<
    "loading" | "loaded" | "failed"
  >(figjamUrls ? "loading" : "failed");

  useEffect(() => {
    if (!figjamUrls) return;
    const timeout = window.setTimeout(() => {
      setPreviewState((current) =>
        current === "loading" ? "failed" : current,
      );
    }, 5000);
    return () => window.clearTimeout(timeout);
  }, [figjamUrls]);

  if (previewState === "failed") {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--muted)] px-7 text-center">
        <p className="text-sm font-semibold leading-6 text-[var(--foreground)]">
          This board can&apos;t be previewed here — open it directly instead.
        </p>
        {figjamUrls?.openUrl && (
          <a
            href={figjamUrls.openUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2.5 text-xs font-semibold text-[var(--primary-foreground)] transition hover:brightness-95"
          >
            Open in Figma
            <span aria-hidden="true">↗</span>
          </a>
        )}
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <TeamButton
            type="button"
            tone="secondary"
            themed
            onClick={onReplace}
          >
            Replace link
          </TeamButton>
          <TeamButton
            type="button"
            tone="danger"
            themed
            disabled={isRemoving}
            onClick={onRemove}
          >
            {isRemoving ? "Removing…" : "Remove board"}
          </TeamButton>
        </div>
      </div>
    );
  }

  if (!figjamUrls) return null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-5 text-[var(--muted-foreground)]">
          Preview here, then open in Figma to edit.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <TeamButton
            type="button"
            tone="secondary"
            themed
            onClick={onReplace}
          >
            Replace link
          </TeamButton>
          <TeamButton
            type="button"
            tone="danger"
            themed
            disabled={isRemoving}
            onClick={onRemove}
          >
            {isRemoving ? "Removing…" : "Remove board"}
          </TeamButton>
          <a
            href={figjamUrls.openUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2.5 text-xs font-semibold text-[var(--primary-foreground)] transition hover:brightness-95"
          >
            Open in Figma
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className="relative h-[500px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_18px_45px_rgba(40,50,55,0.12)]">
        <iframe
          title="FigJam board preview"
          src={figjamUrls.embedUrl}
          onLoad={() => setPreviewState("loaded")}
          onError={() => setPreviewState("failed")}
          className="h-full w-full bg-[var(--card)]"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
        {previewState === "loading" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[var(--card)]/90 text-xs font-medium text-[var(--muted-foreground)]">
            Loading FigJam board…
          </div>
        )}
      </div>
    </div>
  );
}

export function FigJamTaskBoard({
  taskId,
  initialUrl,
}: {
  taskId: string;
  initialUrl: string | null;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [input, setInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openEditor() {
    setInput(url ? resolveFigJamUrls(url)?.openUrl ?? "" : "");
    setError(null);
    setIsEditing(true);
  }

  async function saveBoard() {
    if (isSaving) return;
    const figjamUrls = resolveFigJamUrls(input);
    if (!figjamUrls) {
      setError("Paste a valid FigJam board or embed URL.");
      return;
    }

    setIsSaving(true);
    setError(null);
    const { error: updateError } = await supabase
      .from("division_tasks")
      .update({ figjam_embed_url: figjamUrls.embedUrl })
      .eq("id", taskId);
    setIsSaving(false);

    if (updateError) {
      setError(`Could not save the FigJam board: ${updateError.message}`);
      return;
    }

    setUrl(figjamUrls.embedUrl);
    setInput("");
    setIsEditing(false);
  }

  async function removeBoard() {
    if (!url || isRemoving) return;
    setIsRemoving(true);
    setError(null);
    const { error: updateError } = await supabase
      .from("division_tasks")
      .update({ figjam_embed_url: null })
      .eq("id", taskId);
    setIsRemoving(false);

    if (updateError) {
      setError(`Could not remove the FigJam board: ${updateError.message}`);
      return;
    }

    setUrl(null);
    setInput("");
    setIsEditing(false);
  }

  return (
    <section className="mt-8 rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
          Planning board
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
          FigJam board
        </h2>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-[#E4B9B9] bg-[#FFF0F0] px-4 py-3 text-sm text-[#8B3E3E]"
        >
          {error}
        </p>
      )}

      {isEditing ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void saveBoard();
          }}
          className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4"
        >
          <label className="text-xs font-semibold text-[var(--foreground)]">
            Paste FigJam board link
            <input
              autoFocus
              type="url"
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setError(null);
              }}
              placeholder="https://www.figma.com/board/..."
              className={`mt-2 ${projectInputClass}`}
            />
          </label>
          <p className="mt-2 text-[11px] leading-5 text-[var(--muted-foreground)]">
            Paste a board link or an existing Figma embed link. Make sure the
            board is shared as “Anyone can view.”
          </p>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <TeamButton
              type="button"
              tone="secondary"
              themed
              disabled={isSaving}
              onClick={() => {
                setIsEditing(false);
                setInput("");
                setError(null);
              }}
            >
              Cancel
            </TeamButton>
            <TeamButton
              type="submit"
              themed
              disabled={isSaving || !input.trim()}
            >
              {isSaving ? "Saving…" : "Save"}
            </TeamButton>
          </div>
        </form>
      ) : url ? (
        <div className="mt-5">
          <FigJamPreview
            key={url}
            url={url}
            isRemoving={isRemoving}
            onReplace={openEditor}
            onRemove={() => void removeBoard()}
          />
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-3">
          <p className="text-xs leading-5 text-[var(--muted-foreground)]">
            Add a planning board when this task needs one.
          </p>
          <TeamButton
            type="button"
            tone="secondary"
            themed
            onClick={openEditor}
          >
            + Add FigJam board
          </TeamButton>
        </div>
      )}
    </section>
  );
}
