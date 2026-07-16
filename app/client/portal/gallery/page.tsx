"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type GalleryBook = {
  id: string;
  client_id: string;
  title: string;
  cover_note: string | null;
  created_at: string;
};

const coverStyles = [
  {
    cover: "bg-[#7D4698] text-white",
    spine: "bg-[#67377E]",
    detail: "border-white/25 text-white/70",
  },
  {
    cover: "bg-[#EEE3FA] text-[#341F60]",
    spine: "bg-[#D7C1E7]",
    detail: "border-[#7D4698]/20 text-[#695677]",
  },
  {
    cover: "bg-[#341F60] text-white",
    spine: "bg-[#251548]",
    detail: "border-white/20 text-white/65",
  },
];

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function GalleryPage() {
  const [books, setBooks] = useState<GalleryBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadBooks() {
      setIsLoading(true);

      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("id")
        .eq("slug", "mvp")
        .single();

      if (!isActive) return;
      if (clientError || !client) {
        setErrorMessage(
          `Could not load the MVP client: ${clientError?.message ?? "Client not found."}`,
        );
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("gallery_books")
        .select("id, client_id, title, cover_note, created_at")
        .eq("client_id", client.id)
        .order("created_at", { ascending: true });

      if (!isActive) return;
      if (error) {
        setErrorMessage(`Could not load gallery books: ${error.message}`);
        setBooks([]);
      } else {
        setBooks((data ?? []) as GalleryBook[]);
        setErrorMessage(null);
      }

      setIsLoading(false);
    }

    void loadBooks();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7D4698]">
            Client portal · MVP
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#341F60] sm:text-4xl">
            Gallery
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75647F] sm:text-base">
            Browse project photography and event moments by album.
          </p>
        </header>

        {errorMessage && (
          <div
            role="alert"
            className="mt-7 rounded-2xl border border-[#E4C88F] bg-[#FFF7E6] px-4 py-3 text-sm leading-6 text-[#805A22]"
          >
            {errorMessage}
          </div>
        )}

        <section className="mt-10" aria-labelledby="gallery-books-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#8B7895]">
                Photo library
              </p>
              <h2
                id="gallery-books-heading"
                className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#341F60]"
              >
                Albums
              </h2>
            </div>
            {!isLoading && (
              <span className="rounded-full bg-[#EEE3FA] px-3 py-1.5 text-[11px] font-semibold text-[#5F3378]">
                {books.length} books
              </span>
            )}
          </div>

          <div className="relative mt-6">
            <div className="overflow-x-auto pb-8 pt-2 [scrollbar-color:#CDB4DB_transparent] [scrollbar-width:thin]">
              <div className="flex min-w-max items-end gap-3 px-1 sm:gap-4">
                {isLoading
                  ? Array.from({ length: 3 }, (_, index) => (
                      <div
                        key={index}
                        className="aspect-[2/3] w-40 animate-pulse rounded-r-xl rounded-l-sm border border-[#E3D8EA] bg-white sm:w-44"
                      />
                    ))
                  : books.map((book, index) => {
                      const style = coverStyles[index % coverStyles.length];

                      return (
                        <Link
                          key={book.id}
                          href={`/client/portal/gallery/${book.id}`}
                          aria-label={`Open ${book.title} album`}
                          className={`group relative aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-r-xl rounded-l-sm border border-[#341F60]/10 shadow-[8px_10px_24px_rgba(52,31,96,0.12)] transition duration-300 hover:-translate-y-2 hover:shadow-[10px_18px_32px_rgba(52,31,96,0.18)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7D4698] sm:w-44 ${style.cover}`}
                        >
                          <span
                            className={`absolute inset-y-0 left-0 w-8 border-r border-black/10 shadow-[4px_0_10px_rgba(0,0,0,0.08)] ${style.spine}`}
                          />
                          <span className="absolute inset-y-5 left-1.5 flex w-5 items-center justify-center">
                            <span
                              className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.18em] opacity-70"
                              style={{
                                writingMode: "vertical-rl",
                                transform: "rotate(180deg)",
                              }}
                            >
                              MVP gallery
                            </span>
                          </span>

                          <span className="absolute inset-x-0 top-0 h-px bg-white/35" />
                          <span className="absolute bottom-0 right-0 top-0 w-px bg-black/10" />

                          <span className="flex h-full flex-col justify-between py-6 pl-12 pr-5">
                            <span className="flex size-8 items-center justify-center rounded-full border border-current/25 text-[10px] font-semibold opacity-80">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span>
                              <span className="block text-xl font-semibold leading-tight tracking-[-0.025em]">
                                {book.title}
                              </span>
                              <span
                                className={`mt-4 flex items-center justify-between gap-2 border-t pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] ${style.detail}`}
                              >
                                {book.cover_note ?? "Photo album"}
                                <ArrowIcon />
                              </span>
                            </span>
                          </span>
                        </Link>
                      );
                    })}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-5 h-3 rounded-full bg-[linear-gradient(180deg,#E2D2E9_0%,#CBB7D4_45%,#A98AB8_46%,#EADFF0_100%)] shadow-[0_7px_14px_rgba(52,31,96,0.12)]" />
          </div>

          {!isLoading && books.length === 0 && !errorMessage && (
            <div className="mt-6 rounded-[24px] border border-dashed border-[#D8C6E4] bg-white px-6 py-12 text-center">
              <p className="text-sm font-semibold text-[#341F60]">
                No gallery books yet.
              </p>
              <p className="mt-1 text-xs text-[#75647F]">
                New albums will appear here when they are ready.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
