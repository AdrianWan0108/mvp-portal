"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAdmin } from "../_components/AdminContext";
import {
  AdminButton,
  AdminConfirmDialog,
  AdminEmpty,
  AdminMessage,
  AdminModal,
  AdminPageHeader,
  inputClass,
} from "../_components/AdminUi";

type Book = {
  id: string;
  title: string;
  cover_note: string | null;
};

type BookEditor = {
  id?: string;
  title: string;
  coverNote: string;
};

export default function AdminGalleryPage() {
  const { clientId, clientName } = useAdmin();
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<BookEditor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!clientId) return;
    const { data, error: loadError } = await supabase
      .from("gallery_books")
      .select("id, title, cover_note")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true });
    if (loadError) setError(loadError.message);
    else setBooks((data ?? []) as Book[]);
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveBook() {
    if (!clientId || !editor || !editor.title.trim() || isSaving) return;
    setIsSaving(true);
    setError(null);
    const payload = {
      title: editor.title.trim(),
      cover_note: editor.coverNote.trim() || null,
    };
    const { error: mutationError } = editor.id
      ? await supabase
          .from("gallery_books")
          .update(payload)
          .eq("id", editor.id)
      : await supabase
          .from("gallery_books")
          .insert({ client_id: clientId, ...payload });
    setIsSaving(false);
    if (mutationError) {
      setError(mutationError.message);
      return;
    }
    setEditor(null);
    void load();
  }

  async function deleteBook() {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    const { error: mutationError } = await supabase
      .from("gallery_books")
      .delete()
      .eq("id", deleteTarget.id);
    setIsDeleting(false);
    if (mutationError) {
      setError(mutationError.message);
      return;
    }
    setDeleteTarget(null);
    void load();
  }

  return (
    <main className="px-5 py-10 sm:px-8 lg:px-10">
      <AdminPageHeader
        title="Gallery"
        description={`Create photo books and manage Drive-linked photos for ${clientName ?? "this client"}.`}
        action={
          <AdminButton
            onClick={() =>
              setEditor({ title: "", coverNote: "0 photos" })
            }
          >
            + Create book
          </AdminButton>
        }
      />
      <AdminMessage error={error} />
      <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {books.length ? (
          books.map((book, index) => (
            <article
              key={book.id}
              className="rounded-[22px] border border-[#D7CBE0] bg-white p-5"
            >
              <div
                className={`aspect-[3/2] rounded-2xl p-5 text-white ${
                  index % 2 ? "bg-[#7D4698]" : "bg-[#341F60]"
                }`}
              >
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#F4CE45]">
                  Gallery book
                </p>
                <h2 className="mt-3 text-xl font-semibold">{book.title}</h2>
                <p className="mt-2 text-xs text-white/70">
                  {book.cover_note || "No cover note"}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/admin/gallery/${book.id}`}
                  className="rounded-full bg-[#341F60] px-4 py-2.5 text-xs font-semibold text-white"
                >
                  Manage photos
                </Link>
                <AdminButton
                  tone="secondary"
                  onClick={() =>
                    setEditor({
                      id: book.id,
                      title: book.title,
                      coverNote: book.cover_note ?? "",
                    })
                  }
                >
                  Edit
                </AdminButton>
                <AdminButton
                  tone="danger"
                  onClick={() => setDeleteTarget(book)}
                >
                  Delete
                </AdminButton>
              </div>
            </article>
          ))
        ) : (
          <AdminEmpty>No gallery books yet.</AdminEmpty>
        )}
      </div>

      <AdminModal
        open={Boolean(editor)}
        title={`${editor?.id ? "Edit" : "Create"} gallery book`}
        description="Books organize the photos shown in the client gallery."
        submitLabel={editor?.id ? "Save changes" : "Create book"}
        isSaving={isSaving}
        submitDisabled={!editor?.title.trim()}
        onClose={() => setEditor(null)}
        onSubmit={(event) => {
          event.preventDefault();
          void saveBook();
        }}
      >
        {editor && (
          <div className="grid gap-4">
            <label className="text-xs font-semibold text-[#341F60]">
              Book title
              <input
                autoFocus
                value={editor.title}
                onChange={(event) =>
                  setEditor({ ...editor, title: event.target.value })
                }
                className={`mt-2 ${inputClass}`}
              />
            </label>
            <label className="text-xs font-semibold text-[#341F60]">
              Cover note
              <input
                value={editor.coverNote}
                onChange={(event) =>
                  setEditor({ ...editor, coverNote: event.target.value })
                }
                placeholder="3 photos"
                className={`mt-2 ${inputClass}`}
              />
            </label>
          </div>
        )}
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete gallery book?"
        description={`This permanently deletes “${deleteTarget?.title ?? "this book"}” and every photo record inside it.`}
        isWorking={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void deleteBook()}
      />
    </main>
  );
}
