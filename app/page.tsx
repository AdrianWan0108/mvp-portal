"use client";

import { useState } from "react";
import { Fraunces } from "next/font/google";
import Image, { type StaticImageData } from "next/image";
import igPost3 from "../public/IG POST 3.png";
import igPost3B from "../public/IG POST 3 B.png";
import dorothyIntroPoster from "../public/dorothy-self-intro-poster.png";
import mobilityPost from "../public/Mobility's Post.png";
import movementPost from "../public/Movement's Post.png";
import mvpIntroPoster from "../public/mvp-intro-v3-poster.png";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

type PersonId = "gary" | "dorothy";
type ReviewStatus = "approved" | "pending" | "changes";
type PostType = "Reel" | "Feed" | "Carousel" | "Story";

type Review = {
  status: ReviewStatus;
  reviewedAt?: string;
  comment?: string;
};

type AuditEntry = {
  person: PersonId;
  status: Exclude<ReviewStatus, "pending">;
  at: string;
  note?: string;
};

type MediaAsset = {
  src: StaticImageData;
  alt: string;
  label: string;
};

type VideoAsset = {
  src: string;
  poster: StaticImageData;
  alt: string;
  label: string;
};

type Post = {
  id: string;
  date: string;
  platform: string;
  postType: PostType;
  title?: string;
  caption: string;
  content: string;
  media?: MediaAsset[];
  video?: VideoAsset;
  isPosted?: boolean;
  approvals: Record<PersonId, Review>;
  history: AuditEntry[];
};

const PEOPLE: Record<PersonId, { name: string; role: string; initials: string }> = {
  gary: { name: "Gary", role: "Owner", initials: "G" },
  dorothy: { name: "Dorothy", role: "Studio Manager", initials: "D" },
};

const PERSON_IDS = Object.keys(PEOPLE) as PersonId[];
const YEAR = 2026;
const MONTH_INDEX = 6;

function review(
  status: ReviewStatus,
  reviewedAt?: string,
  comment?: string,
): Review {
  return { status, reviewedAt, comment };
}

const initialPosts: Post[] = [
  {
    id: "5",
    date: "2026-07-14",
    platform: "Instagram",
    postType: "Carousel",
    title: "IG POST 3 + 3B · Summer schedule",
    caption:
      "Summer is here — and so is our summer schedule. ☀️🌿\n\n" +
      "New season, new energy, same commitment to helping you move well.\n\n" +
      "Check out our latest class times on Mindbody or our website before booking your next session.\n\n" +
      "We can't wait to see you on the reformer!\n\n" +
      "#pilatesmarkham #pilates #pilatescommunity #boutiquepilates #MVPilates #summerschedule",
    content: "#DCCFC0",
    media: [
      {
        src: igPost3,
        alt: "Motion Vitality Pilates summer schedule for July 13 to July 19",
        label: "IG POST 3",
      },
      {
        src: igPost3B,
        alt: "Motion Vitality Pilates summer schedule for July 20 to July 26",
        label: "IG POST 3B",
      },
    ],
    isPosted: true,
    approvals: {
      gary: review("approved", "Jul 14, 4:18 PM"),
      dorothy: review("approved", "Jul 14, 4:42 PM"),
    },
    history: [
      { person: "gary", status: "approved", at: "Jul 14, 4:18 PM" },
      { person: "dorothy", status: "approved", at: "Jul 14, 4:42 PM" },
    ],
  },
  {
    id: "mvp-intro-v3",
    date: "2026-07-16",
    platform: "Instagram",
    postType: "Reel",
    title: "MVP Intro v3",
    caption:
      "Who is MVP, really?\n\n" +
      "Every client. Every staff. Every single person who walks through our doors.\n\n" +
      "Motion Vitality Pilates isn't just a name — it's a philosophy. Motion create vitality. Every client and staff are our MVP.\n" +
      "We're a boutique Pilates studio in Markham, built on the belief that movement isn't just exercise — it's how we build strength, restore balance, and bring energy into everyday life.\n\n" +
      "Whether you're stepping onto the reformer for the first time or you've been moving with us for years, you belong here.\n" +
      "This is more than a studio. It's a community built one movement at a time.\n\n" +
      "Come join us and become an MVP. 🌿\n\n" +
      "#pilatesmarkham #pilates #pilatescommunity #boutiquepilates #lovewhatyoudo #MVPilates",
    content: "#D9D4CC",
    video: {
      src: "/mvp-intro-v3.m4v",
      poster: mvpIntroPoster,
      alt: "MVP Intro v3 Pilates studio community video",
      label: "MVP Intro v3",
    },
    approvals: {
      gary: review("approved", "Jul 15, 11:02 AM"),
      dorothy: review("approved", "Jul 15, 11:02 AM"),
    },
    history: [
      { person: "gary", status: "approved", at: "Jul 15, 11:02 AM" },
      { person: "dorothy", status: "approved", at: "Jul 15, 11:02 AM" },
    ],
  },
  {
    id: "movement-post",
    date: "2026-07-21",
    platform: "Instagram",
    postType: "Feed",
    title: "Movement · Confidence and resilience",
    caption:
      "Movement builds confidence. Confidence strengthens resilience.\n\n" +
      "With every controlled stretch, reach, and breath, you learn to trust your body and move with greater purpose.\n\n" +
      "Keep moving. Keep growing. ✨\n\n" +
      "#MotionVitalityPilates #MoveWithConfidence #BuildResilience #PilatesMovement #MindfulMovement",
    content: "#EFC9D8",
    media: [
      {
        src: movementPost,
        alt: "Pilates movement demonstrating confidence and resilience against a pink and cream background",
        label: "Movement's Post",
      },
    ],
    approvals: {
      gary: review("approved", "Jul 15, 11:02 AM"),
      dorothy: review("approved", "Jul 15, 11:02 AM"),
    },
    history: [
      { person: "gary", status: "approved", at: "Jul 15, 11:02 AM" },
      { person: "dorothy", status: "approved", at: "Jul 15, 11:02 AM" },
    ],
  },
  {
    id: "dorothy-intro",
    date: "2026-07-23",
    platform: "Instagram",
    postType: "Reel",
    title: "Dorothy self intro · Final revised",
    caption:
      "Meet Dorothy! She's one of our Polestar-certified instructors at MVP.\n\n" +
      "She came to it while recovering from an injury — and the more she felt her own body change, the more she wanted to understand why it worked.\n\n" +
      "That curiosity led her to Polestar certification, a science-based training used by physical therapists worldwide.\n" +
      "Now she brings that same approach to every client: paying attention to how your body actually moves, not just running through a workout.\n\n" +
      "Polestar is a science-based Pilates method used by physical therapists — Dorothy uses that training to actually watch how your body moves, not just guide you through a set of exercises.\n\n" +
      "If you've been curious about working with her, book a session with her now! ✨\n\n" +
      "#pilatesmarkham #pilates #pilatescommunity #meetdorothy #polestarmethod #MVPilates",
    content: "#D9DDE1",
    video: {
      src: "/dorothy-self-intro-final-revised.m4v",
      poster: dorothyIntroPoster,
      alt: "Dorothy introducing herself as a Polestar-certified Pilates instructor",
      label: "Dorothy self intro · Final revised",
    },
    approvals: {
      gary: review("approved", "Jul 15, 11:02 AM"),
      dorothy: review("approved", "Jul 15, 11:02 AM"),
    },
    history: [
      { person: "gary", status: "approved", at: "Jul 15, 11:02 AM" },
      { person: "dorothy", status: "approved", at: "Jul 15, 11:02 AM" },
    ],
  },
  {
    id: "mobility-post",
    date: "2026-07-27",
    platform: "Instagram",
    postType: "Feed",
    title: "Mobility · Polestar method",
    caption:
      "Movement isn't just exercise.\n\n" +
      "It's how you build balance, control, and mobility — from the inside out.\n\n" +
      "That's why Polestar is the method we teach at MVP.\n\n" +
      "Dorothy is one of our Polestar-certified instructors, trained to see how your body actually moves, not just count reps.\n" +
      "Curious what that feels like? Check our pinned Summer Schedule and book a session with Dorothy. ✨\n\n" +
      "#pilatesmarkham #pilates #pilatescommunity #polestarmethod #MVPilates",
    content: "#EFC9D8",
    media: [
      {
        src: mobilityPost,
        alt: "Dorothy demonstrating mobility against a pink background with balanced, strong, and confident messaging",
        label: "Mobility's Post",
      },
    ],
    approvals: {
      gary: review("approved", "Jul 15, 11:02 AM"),
      dorothy: review("approved", "Jul 15, 11:02 AM"),
    },
    history: [
      { person: "gary", status: "approved", at: "Jul 15, 11:02 AM" },
      { person: "dorothy", status: "approved", at: "Jul 15, 11:02 AM" },
    ],
  },
];

const reviewStyles: Record<ReviewStatus, { label: string; shortLabel: string; pill: string; dot: string }> = {
  approved: {
    label: "Approved",
    shortLabel: "Approved",
    pill: "bg-[var(--brand-100)] text-[var(--brand-800)]",
    dot: "bg-[var(--brand-700)]",
  },
  pending: {
    label: "Not yet reviewed",
    shortLabel: "Not yet reviewed",
    pill: "bg-[#F4EFE5] text-[#806944]",
    dot: "bg-[#B18C4C]",
  },
  changes: {
    label: "Changes requested",
    shortLabel: "Needs changes",
    pill: "bg-[#F4E7E2] text-[#875344]",
    dot: "bg-[#B16954]",
  },
};

function getOverallStatus(post: Post): ReviewStatus {
  const statuses = PERSON_IDS.map((id) => post.approvals[id].status);
  if (statuses.includes("changes")) return "changes";
  if (statuses.every((status) => status === "approved")) return "approved";
  return "pending";
}

function formatPostDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function currentTimestamp() {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}

function StatusIcon({ status, className = "h-4 w-4" }: { status: ReviewStatus; className?: string }) {
  if (status === "approved") {
    return (
      <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
        <circle cx="10" cy="10" r="8" fill="var(--brand-700)" />
        <path d="m6.5 10.2 2.2 2.1 4.8-5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === "changes") {
    return (
      <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
        <circle cx="10" cy="10" r="8" fill="#B16954" />
        <path d="M7 7l6 6m0-6-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="7.25" stroke="#B18C4C" strokeWidth="1.5" />
      <path d="M10 6v4.25l2.7 1.55" stroke="#B18C4C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PostTypeIcon({ type, className = "h-5 w-5" }: { type: PostType; className?: string }) {
  if (type === "Reel") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 9l5 3-5 3V9z" fill="currentColor" />
      </svg>
    );
  }
  if (type === "Carousel") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <rect x="4" y="5" width="13" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 2.8h10a2 2 0 0 1 2 2v11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "Story") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 9h10M7 13h10M7 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PersonStatus({ personId, review: personReview, compact = false }: { personId: PersonId; review: Review; compact?: boolean }) {
  const person = PEOPLE[personId];
  return (
    <div className={`flex items-center ${compact ? "gap-1.5" : "gap-3"}`}>
      <StatusIcon status={personReview.status} className={compact ? "h-3.5 w-3.5 shrink-0" : "h-5 w-5 shrink-0"} />
      <div className="min-w-0">
        <p className={`${compact ? "whitespace-nowrap text-[10px]" : "truncate text-sm"} font-medium text-[var(--foreground)]`}>
          {person.name}: {reviewStyles[personReview.status].shortLabel}
        </p>
        {!compact && (
          <p className="mt-0.5 text-xs text-[var(--foreground)]/50">
            {personReview.reviewedAt ?? `${person.role} · Awaiting action`}
          </p>
        )}
      </div>
    </div>
  );
}

function IdentityGate({ onChoose }: { onChoose: (person: PersonId) => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[var(--brand-100)] px-5 py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[var(--brand-300)]/55 blur-3xl" />
        <div className="absolute -bottom-36 -left-24 h-[30rem] w-[30rem] rounded-full bg-[var(--brand-200)]/60 blur-3xl" />
      </div>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="identity-title"
        aria-describedby="identity-description"
        className="relative w-full max-w-2xl rounded-[28px] border border-white/70 bg-[var(--card)] p-6 shadow-[0_28px_90px_rgba(49,75,62,0.16)] sm:p-10"
      >
        <div className="mx-auto mb-7 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--brand-700)]">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path d="M7.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm9-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 20v-2.2c0-2.65 2.24-4.8 5-4.8s5 2.15 5 4.8V20m1-6.5c.8-.55 1.84-.86 3-.86 2.76 0 5 1.8 5 4.02V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="text-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-700)]">Motion Vitality Pilates</p>
          <h1 id="identity-title" className={`${fraunces.className} text-3xl font-medium tracking-tight text-[var(--foreground)] sm:text-4xl`}>
            Who is reviewing today?
          </h1>
          <p id="identity-description" className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--foreground)]/60 sm:text-base">
            Choose your identity before entering. Every approval and change request will be recorded under your name with a timestamp.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {PERSON_IDS.map((personId) => {
            const person = PEOPLE[personId];
            return (
              <button
                key={personId}
                type="button"
                onClick={() => onChoose(personId)}
                className="group flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 text-left shadow-[0_8px_24px_rgba(49,75,62,0.04)] transition hover:-translate-y-0.5 hover:border-[var(--brand-700)]/45 hover:shadow-[0_12px_28px_rgba(49,75,62,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-700)] focus-visible:ring-offset-2"
              >
                <span className={`${fraunces.className} flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xl font-medium text-[var(--brand-800)]`}>
                  {person.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold text-[var(--foreground)]">{person.name}</span>
                  <span className="mt-0.5 block text-sm text-[var(--foreground)]/55">{person.role}</span>
                </span>
                <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 text-[var(--foreground)]/25 transition group-hover:translate-x-0.5 group-hover:text-[var(--brand-700)]" aria-hidden="true">
                  <path d="m7.5 4.5 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            );
          })}
        </div>

        <div className="mt-7 flex items-start gap-2.5 rounded-xl bg-[var(--muted)] px-4 py-3 text-xs leading-5 text-[var(--muted-foreground)]">
          <svg viewBox="0 0 20 20" fill="none" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
            <path d="M10 2.75 17 5.5v4.64c0 3.55-2.22 6.2-7 7.61-4.78-1.41-7-4.06-7-7.61V5.5l7-2.75Z" stroke="currentColor" strokeWidth="1.4" />
            <path d="m7.2 10 1.8 1.8 3.8-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>For accountability, do not approve on someone else’s behalf. You can switch identity at any time from the top-right menu.</p>
        </div>
      </section>
    </div>
  );
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Home() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [currentUser, setCurrentUser] = useState<PersonId | null>(null);
  const [isIdentityOpen, setIsIdentityOpen] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [actionFeedback, setActionFeedback] = useState("");
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const approvedCount = posts.filter((post) => getOverallStatus(post) === "approved").length;
  const changesCount = posts.filter((post) => getOverallStatus(post) === "changes").length;
  const awaitingCount = posts.filter((post) => getOverallStatus(post) === "pending").length;
  const selectedPost = posts.find((post) => post.id === selectedId) ?? null;

  const firstDayOfWeek = new Date(YEAR, MONTH_INDEX, 1).getDay();
  const daysInMonth = new Date(YEAR, MONTH_INDEX + 1, 0).getDate();
  const calendarCells: (number | null)[] = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const postsByDate = new Map(posts.map((post) => [post.date, post]));

  function chooseIdentity(personId: PersonId) {
    setCurrentUser(personId);
    setIsIdentityOpen(false);
  }

  function openPost(id: string) {
    setSelectedId(id);
    setSelectedMediaIndex(0);
    setIsRequestingChanges(false);
    setCommentDraft("");
    setActionFeedback("");
  }

  function closeModal() {
    setSelectedId(null);
    setSelectedMediaIndex(0);
    setIsRequestingChanges(false);
    setCommentDraft("");
    setActionFeedback("");
  }

  function approvePost(id: string) {
    if (!currentUser) return;
    const timestamp = currentTimestamp();
    setPosts((previous) =>
      previous.map((post) =>
        post.id === id
          ? {
              ...post,
              approvals: {
                ...post.approvals,
                [currentUser]: review("approved", timestamp),
              },
              history: [
                ...post.history,
                { person: currentUser, status: "approved", at: timestamp },
              ],
            }
          : post,
      ),
    );
    setIsRequestingChanges(false);
    setActionFeedback(`${PEOPLE[currentUser].name}’s approval was recorded at ${timestamp}.`);
  }

  function sendChanges(id: string) {
    if (!currentUser || !commentDraft.trim()) return;
    const timestamp = currentTimestamp();
    const note = commentDraft.trim();
    setPosts((previous) =>
      previous.map((post) =>
        post.id === id
          ? {
              ...post,
              approvals: {
                ...post.approvals,
                [currentUser]: review("changes", timestamp, note),
              },
              history: [
                ...post.history,
                { person: currentUser, status: "changes", at: timestamp, note },
              ],
            }
          : post,
      ),
    );
    setIsRequestingChanges(false);
    setCommentDraft("");
    setActionFeedback(`${PEOPLE[currentUser].name}’s change request was recorded at ${timestamp}.`);
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {currentUser && (
        <main className="mx-auto w-full max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
          <header className="mb-10 flex flex-col gap-6 border-b border-[var(--border)] pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-700)]">Content approvals</p>
              <h1 className={`${fraunces.className} text-4xl font-medium leading-tight tracking-tight sm:text-5xl`}>
                July social calendar
              </h1>
              <p className={`${fraunces.className} mt-2 italic text-lg text-[var(--foreground)]/55`}>Motion Vitality Pilates</p>
            </div>
            <button
              type="button"
              onClick={() => setIsIdentityOpen(true)}
              className="flex w-fit items-center gap-3 rounded-full border border-[var(--border)] bg-white py-2 pl-2 pr-4 shadow-sm transition hover:border-[var(--brand-300)] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-700)]"
              aria-label={`Signed in as ${PEOPLE[currentUser].name}, ${PEOPLE[currentUser].role}. Switch identity.`}
            >
              <span className={`${fraunces.className} flex h-9 w-9 items-center justify-center rounded-full bg-[var(--muted)] text-sm font-semibold text-[var(--brand-800)]`}>
                {PEOPLE[currentUser].initials}
              </span>
              <span className="text-left">
                <span className="block text-xs font-semibold text-[var(--foreground)]">{PEOPLE[currentUser].name}</span>
                <span className="block text-[10px] text-[var(--foreground)]/50">{PEOPLE[currentUser].role} · Switch</span>
              </span>
            </button>
          </header>

          <section aria-label="Monthly approval summary" className="mb-10 grid gap-3 sm:grid-cols-3">
            {[
              { count: awaitingCount, label: "Awaiting one or both", detail: "At least one review is missing", color: "text-[#9A773F]", dot: "bg-[#9A773F]" },
              { count: changesCount, label: "Changes requested", detail: "Blocked until revisions are reviewed", color: "text-[#A15E4C]", dot: "bg-[#A15E4C]" },
              { count: approvedCount, label: "Fully approved", detail: "Gary and Dorothy both approved", color: "text-[var(--brand-700)]", dot: "bg-[var(--brand-700)]" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_4px_18px_rgba(49,75,62,0.025)] sm:p-6">
                <div className="flex items-end justify-between gap-4">
                  <p className={`${fraunces.className} text-4xl font-medium ${item.color}`}>{item.count}</p>
                  <span className={`mb-2 h-2 w-2 rounded-full ${item.dot}`} />
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]/70">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--foreground)]/45">{item.detail}</p>
              </div>
            ))}
          </section>

          <section aria-labelledby="calendar-heading">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="calendar-heading" className={`${fraunces.className} text-2xl font-medium`}>July 2026</h2>
                <p className="mt-1 text-xs text-[var(--foreground)]/50">Every scheduled post requires two named approvals.</p>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--foreground)]/55" aria-label="Status legend">
                {(["approved", "pending", "changes"] as ReviewStatus[]).map((status) => (
                  <span key={status} className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${reviewStyles[status].dot}`} />
                    {reviewStyles[status].shortLabel}
                  </span>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white shadow-[0_4px_18px_rgba(49,75,62,0.025)]">
              <div className="min-w-[1260px]">
                <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--brand-50)]">
                  {WEEKDAY_LABELS.map((label) => (
                    <div key={label} className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground)]/40">
                      {label}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 bg-[var(--border)] gap-px">
                  {calendarCells.map((day, index) => {
                    if (day === null) {
                      return <div key={`blank-${index}`} className="min-h-32 bg-[var(--background)]" />;
                    }
                    const dateString = `${YEAR}-${String(MONTH_INDEX + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const post = postsByDate.get(dateString);
                    return (
                      <div key={dateString} className="relative min-h-32 bg-white p-2.5">
                        <span className="text-[11px] font-medium text-[var(--foreground)]/40">{day}</span>
                        {post?.isPosted && (
                          <span className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 -rotate-12 items-center justify-center rounded-full border-[3px] border-[#7651A6] bg-transparent p-1.5 text-center shadow-[0_5px_16px_rgba(90,54,137,0.18)]">
                            <span className="flex h-full w-full items-center justify-center rounded-full border-2 border-dashed border-[#7651A6] text-[8px] font-black uppercase tracking-[0.12em] text-[#5A3689]">
                              Posted
                            </span>
                          </span>
                        )}
                        {post && (
                          <button
                            type="button"
                            onClick={() => openPost(post.id)}
                            aria-label={`Review ${post.postType} scheduled for ${formatPostDate(post.date)}`}
                            className={`mt-1.5 block w-full rounded-xl border border-[var(--border)] bg-[var(--brand-50)] p-2 text-left transition hover:border-[var(--brand-700)]/35 hover:bg-[var(--brand-100)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-700)] ${post.isPosted ? "opacity-50" : "opacity-100"}`}
                          >
                            <span className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--foreground)]/55">
                              <PostTypeIcon type={post.postType} className="h-3.5 w-3.5" />
                              {post.postType}
                            </span>
                            {post.title && (
                              <span className="mb-2 block truncate text-[9px] font-semibold text-[var(--foreground)]/70">
                                {post.title}
                              </span>
                            )}
                            {post.media?.[0] && (
                              <span className="relative mb-2 block h-20 overflow-hidden rounded-lg bg-[var(--brand-200)]">
                                <Image
                                  src={post.media[0].src}
                                  alt=""
                                  fill
                                  sizes="110px"
                                  placeholder="blur"
                                  className="object-cover"
                                />
                                {post.media.length > 1 && (
                                  <span className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full bg-[var(--foreground)]/75 px-1.5 py-1 text-[7px] font-bold text-white backdrop-blur-sm">
                                    <PostTypeIcon type="Carousel" className="h-2.5 w-2.5" />
                                    {post.media.length}
                                  </span>
                                )}
                              </span>
                            )}
                            {post.video && (
                              <span className="relative mb-2 block h-20 overflow-hidden rounded-lg bg-[var(--foreground)]">
                                <Image
                                  src={post.video.poster}
                                  alt=""
                                  fill
                                  sizes="110px"
                                  placeholder="blur"
                                  className="object-cover"
                                />
                                <span className="absolute inset-0 flex items-center justify-center bg-black/10">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[var(--foreground)] shadow-sm">
                                    <svg viewBox="0 0 12 12" className="ml-px h-2.5 w-2.5" fill="currentColor" aria-hidden="true">
                                      <path d="M3 1.8v8.4L10 6 3 1.8Z" />
                                    </svg>
                                  </span>
                                </span>
                              </span>
                            )}
                            <span className="grid gap-1.5">
                              {PERSON_IDS.map((personId) => (
                                <PersonStatus key={personId} personId={personId} review={post.approvals[personId]} compact />
                              ))}
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-[var(--foreground)]/40 sm:hidden">Swipe the calendar sideways to see every day and reviewer status.</p>
          </section>

          <section aria-labelledby="register-heading" className="mt-14">
            <div className="mb-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-700)]">Approval register</p>
              <h2 id="register-heading" className={`${fraunces.className} mt-1 text-3xl font-medium`}>Every post, every decision</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--foreground)]/55">Open a card to review the creative, leave a change request, or record your approval. A post is cleared only when both people approve.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {posts.map((post) => {
                const overallStatus = getOverallStatus(post);
                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => openPost(post.id)}
                    className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-white text-left shadow-[0_4px_18px_rgba(49,75,62,0.025)] transition hover:-translate-y-0.5 hover:border-[var(--brand-300)] hover:shadow-[0_12px_28px_rgba(49,75,62,0.07)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-700)]"
                  >
                    <div className="flex">
                      <div className="relative w-24 shrink-0 overflow-hidden sm:w-32" style={{ backgroundColor: post.content }}>
                        {post.media?.[0] ? (
                          <Image
                            src={post.media[0].src}
                            alt={post.media[0].alt}
                            fill
                            sizes="(min-width: 640px) 128px, 96px"
                            placeholder="blur"
                            className="object-cover"
                          />
                        ) : post.video ? (
                          <Image
                            src={post.video.poster}
                            alt={post.video.alt}
                            fill
                            sizes="(min-width: 640px) 128px, 96px"
                            placeholder="blur"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full min-h-52 items-center justify-center text-[var(--foreground)]/35">
                            <PostTypeIcon type={post.postType} className="h-7 w-7" />
                          </div>
                        )}
                        {post.media && post.media.length > 1 && (
                          <span className="absolute bottom-2 left-2 rounded-full bg-[var(--foreground)]/75 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur-sm">
                            {post.media.length} slides
                          </span>
                        )}
                        {post.video && (
                          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-[var(--foreground)]/75 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur-sm">
                            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="currentColor" aria-hidden="true">
                              <path d="M3 1.8v8.4L10 6 3 1.8Z" />
                            </svg>
                            Video
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground)]/40">{formatPostDate(post.date)} · {post.postType}</p>
                            {post.title && <p className="mt-1.5 text-xs font-semibold text-[var(--foreground)]/75">{post.title}</p>}
                            <p className="mt-2 line-clamp-2 text-sm leading-5 text-[var(--foreground)]/85">{post.caption}</p>
                          </div>
                          <span className={`h-2 w-2 shrink-0 rounded-full ${reviewStyles[overallStatus].dot}`} title={reviewStyles[overallStatus].label} />
                        </div>
                        <div className="mt-4 grid gap-3 border-t border-[var(--border)] pt-4">
                          {PERSON_IDS.map((personId) => (
                            <PersonStatus key={personId} personId={personId} review={post.approvals[personId]} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </main>
      )}

      {isIdentityOpen && <IdentityGate onChoose={chooseIdentity} />}

      {selectedPost && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
          <button type="button" aria-label="Close post details" className="absolute inset-0 bg-[var(--foreground)]/55 backdrop-blur-sm" onClick={closeModal} />
          <section role="dialog" aria-modal="true" aria-labelledby="post-dialog-title" className="relative z-10 max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-[24px] bg-[var(--card)] shadow-2xl">
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 rounded-full bg-white/85 p-2 text-[var(--foreground)]/55 shadow-sm backdrop-blur transition hover:bg-white hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-700)]"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <div className="grid md:grid-cols-[1fr_1fr]">
              <div className="bg-[var(--brand-100)] p-4 sm:p-5">
                {selectedPost.media?.length ? (
                  <>
                    <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-white shadow-sm">
                      <Image
                        src={selectedPost.media[selectedMediaIndex].src}
                        alt={selectedPost.media[selectedMediaIndex].alt}
                        fill
                        sizes="(min-width: 768px) 480px, 92vw"
                        placeholder="blur"
                        className="object-cover"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-[var(--foreground)]/75 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                        Slide {selectedMediaIndex + 1} of {selectedPost.media.length} · {selectedPost.media[selectedMediaIndex].label}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2" aria-label="Choose carousel slide">
                      {selectedPost.media.map((asset, index) => (
                        <button
                          key={asset.label}
                          type="button"
                          onClick={() => setSelectedMediaIndex(index)}
                          aria-label={`View ${asset.label}`}
                          aria-pressed={selectedMediaIndex === index}
                          className={`flex items-center gap-2 rounded-xl border bg-white p-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-700)] ${selectedMediaIndex === index ? "border-[var(--brand-700)] shadow-sm" : "border-transparent opacity-65 hover:opacity-100"}`}
                        >
                          <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-[var(--brand-200)]">
                            <Image src={asset.src} alt="" fill sizes="40px" placeholder="blur" className="object-cover" />
                          </span>
                          <span>
                            <span className="block text-[10px] font-semibold text-[var(--foreground)]/80">{asset.label}</span>
                            <span className="mt-0.5 block text-[9px] text-[var(--foreground)]/40">Slide {index + 1}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : selectedPost.video ? (
                  <div className="flex min-h-56 flex-col items-center justify-center md:min-h-[34rem]">
                    <video
                      controls
                      playsInline
                      preload="metadata"
                      poster={selectedPost.video.poster.src}
                      aria-label={selectedPost.video.alt}
                      className="max-h-[72vh] w-full rounded-xl bg-black shadow-sm"
                    >
                      <source src={selectedPost.video.src} type="video/mp4" />
                      Your browser does not support embedded video playback.
                    </video>
                    <div className="mt-3 flex w-full items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5">
                      <span className="flex items-center gap-2 text-[10px] font-semibold text-[var(--foreground)]/70">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--foreground)] text-white">
                          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="currentColor" aria-hidden="true">
                            <path d="M3 1.8v8.4L10 6 3 1.8Z" />
                          </svg>
                        </span>
                        {selectedPost.video.label}
                      </span>
                      <span className="text-[9px] uppercase tracking-[0.12em] text-[var(--foreground)]/35">Video</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-56 items-center justify-center rounded-xl text-[var(--foreground)]/30 md:min-h-[34rem]" style={{ backgroundColor: selectedPost.content }}>
                    <PostTypeIcon type={selectedPost.postType} className="h-12 w-12" />
                  </div>
                )}
              </div>
              <div className="p-5 sm:p-7 md:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--foreground)]/45">{selectedPost.platform} · {selectedPost.postType} · {formatPostDate(selectedPost.date)}</p>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${reviewStyles[getOverallStatus(selectedPost)].pill}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${reviewStyles[getOverallStatus(selectedPost)].dot}`} />
                    {getOverallStatus(selectedPost) === "approved" ? "Fully approved" : reviewStyles[getOverallStatus(selectedPost)].label}
                  </span>
                </div>
                <h2 id="post-dialog-title" className={`${fraunces.className} mt-4 text-2xl font-medium leading-8`}>
                  {selectedPost.title ?? "Post caption"}
                </h2>
                {selectedPost.title && <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground)]/40">Caption</p>}
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--foreground)]/75">{selectedPost.caption}</p>

                <div className="mt-7">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]/55">Required approvals</h3>
                    <span className="text-[10px] text-[var(--foreground)]/40">2 people required</span>
                  </div>
                  <div className="mt-3 grid gap-3">
                    {PERSON_IDS.map((personId) => {
                      const person = PEOPLE[personId];
                      const personReview = selectedPost.approvals[personId];
                      return (
                        <div key={personId} className={`rounded-xl border p-4 ${personId === currentUser ? "border-[var(--brand-700)]/35 bg-[var(--brand-100)]" : "border-[var(--border)] bg-white"}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className={`${fraunces.className} flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-sm font-semibold text-[var(--foreground)]/65`}>{person.initials}</span>
                              <div>
                                <p className="text-sm font-semibold text-[var(--foreground)]">{person.name} {personId === currentUser && <span className="font-normal text-[var(--brand-700)]">(you)</span>}</p>
                                <p className="mt-0.5 text-[11px] text-[var(--foreground)]/45">{person.role}</p>
                              </div>
                            </div>
                            <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${reviewStyles[personReview.status].pill}`}>
                              <StatusIcon status={personReview.status} className="h-3.5 w-3.5" />
                              {reviewStyles[personReview.status].label}
                            </span>
                          </div>
                          <p className="mt-3 border-t border-[var(--border)] pt-3 text-[11px] text-[var(--foreground)]/45">
                            {personReview.reviewedAt ? `Last action: ${personReview.reviewedAt}` : "No decision has been recorded."}
                          </p>
                          {personReview.comment && (
                            <div className="mt-3 rounded-lg bg-[#F4E7E2] px-3 py-2.5 text-xs leading-5 text-[#754A3E]">
                              <span className="font-semibold">{person.name}:</span> {personReview.comment}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {actionFeedback && (
                  <div role="status" className="mt-4 flex items-start gap-2 rounded-xl bg-[var(--brand-100)] px-3.5 py-3 text-xs leading-5 text-[var(--brand-800)]">
                    <StatusIcon status="approved" className="mt-0.5 h-4 w-4 shrink-0" />
                    {actionFeedback}
                  </div>
                )}

                <div className="mt-5 border-t border-[var(--border)] pt-5">
                  <p className="mb-3 text-[11px] leading-5 text-[var(--foreground)]/50">
                    You are acting as <strong className="font-semibold text-[var(--foreground)]/75">{PEOPLE[currentUser].name}</strong>. This action changes only your own review status.
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => approvePost(selectedPost.id)}
                      disabled={selectedPost.approvals[currentUser].status === "approved"}
                      className="rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--brand-800)] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-700)] focus-visible:ring-offset-2"
                    >
                      {selectedPost.approvals[currentUser].status === "changes" ? "Approve revised post" : selectedPost.approvals[currentUser].status === "approved" ? "You approved this" : "Approve as me"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRequestingChanges((value) => !value);
                        setActionFeedback("");
                      }}
                      className="rounded-full border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--foreground)]/70 transition hover:bg-[var(--foreground)]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-700)]"
                    >
                      Request changes
                    </button>
                  </div>

                  {isRequestingChanges && (
                    <div className="mt-4 rounded-xl border border-[#B16954]/20 bg-[#FAF5F2] p-4">
                      <label htmlFor="change-request" className="text-xs font-semibold text-[#694A41]">What must be changed?</label>
                      <p className="mt-1 text-[11px] leading-5 text-[var(--foreground)]/45">Be specific. Your note and the time it was submitted will be visible to both reviewers.</p>
                      <textarea
                        id="change-request"
                        value={commentDraft}
                        onChange={(event) => setCommentDraft(event.target.value)}
                        rows={4}
                        autoFocus
                        placeholder="Example: Replace slide 2 with the reformer photo and remove the final sentence from the caption."
                        className="mt-3 w-full resize-none rounded-xl border border-[var(--border)] bg-white p-3 text-sm leading-5 text-[var(--foreground)] placeholder:text-[var(--foreground)]/35 focus:outline-none focus:ring-2 focus:ring-[#B16954]/30"
                      />
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-[10px] text-[var(--foreground)]/35">Recorded under {PEOPLE[currentUser].name}</span>
                        <button
                          type="button"
                          onClick={() => sendChanges(selectedPost.id)}
                          disabled={!commentDraft.trim()}
                          className="rounded-full bg-[#A76350] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#925442] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B16954] focus-visible:ring-offset-2"
                        >
                          Submit change request
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {selectedPost.history.length > 0 && (
                  <details className="mt-6 border-t border-[var(--border)] pt-4">
                    <summary className="cursor-pointer text-xs font-semibold text-[var(--foreground)]/60">View decision history ({selectedPost.history.length})</summary>
                    <ol className="mt-3 space-y-3 border-l border-[var(--border)] pl-4">
                      {[...selectedPost.history].reverse().map((entry, index) => (
                        <li key={`${entry.person}-${entry.at}-${index}`} className="relative text-[11px] leading-5 text-[var(--foreground)]/55">
                          <span className={`absolute -left-[19px] top-1.5 h-2 w-2 rounded-full ${reviewStyles[entry.status].dot}`} />
                          <strong className="font-semibold text-[var(--foreground)]/75">{PEOPLE[entry.person].name}</strong> {entry.status === "approved" ? "approved" : "requested changes"} · {entry.at}
                          {entry.note && <span className="mt-1 block text-[var(--foreground)]/65">“{entry.note}”</span>}
                        </li>
                      ))}
                    </ol>
                  </details>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
