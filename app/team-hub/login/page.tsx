"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import understoryLogo from "@/public/under story logo-purple.png";
import {
  getSafeTeamReturnPath,
  getTeamIdentityForUsername,
  TEAM_IDENTITIES,
} from "@/lib/team-auth";
import { saveTeamSession } from "../_components/TeamIdentity";

function TeamLoginForm() {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const identity = getTeamIdentityForUsername(username);

    if (!identity) {
      setError(
        "That username isn't recognized. Check with your Understory contact.",
      );
      return;
    }

    setError(null);
    saveTeamSession(identity);

    const profile = TEAM_IDENTITIES[identity];
    const returnPath = getSafeTeamReturnPath(
      searchParams.get("returnTo"),
      profile.accessLevel,
    );

    window.location.replace(returnPath);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#E9E0EF] px-5 py-8 text-[#28154F]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-[#CDB4DB]/65 blur-3xl" />
        <div className="absolute -bottom-36 -left-24 size-[30rem] rounded-full bg-[#FFF1B7]/75 blur-3xl" />
      </div>

      <section className="relative w-full max-w-xl rounded-[28px] border border-white/80 bg-[#FFFDF8] p-6 shadow-[0_28px_90px_rgba(40,21,79,0.18)] sm:p-10">
        <Image
          src={understoryLogo}
          alt="Understory"
          className="mx-auto size-12 rounded-2xl"
          priority
        />
        <div className="mt-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#7D4698]">
            Understory team portal
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#28154F] sm:text-4xl">
            Welcome to the Team Hub
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#75647F] sm:text-base">
            Enter your team username. Your access stays active for this browser
            session.
          </p>
        </div>

        <form onSubmit={submit} className="mt-8">
          <label
            htmlFor="team-hub-username"
            className="block text-xs font-semibold text-[#341F60]"
          >
            Username
          </label>
          <input
            id="team-hub-username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            autoFocus
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              if (error) setError(null);
            }}
            placeholder="Enter your username"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "team-hub-login-error" : undefined}
            className="mt-2 w-full rounded-xl border border-[#CDBAD9] bg-white px-4 py-3.5 text-sm text-[#341F60] placeholder:text-[#AA98B4] focus:border-[#7D4698] focus:outline-none focus:ring-2 focus:ring-[#EEE3FA]"
          />
          {error && (
            <p
              id="team-hub-login-error"
              role="alert"
              className="mt-3 rounded-xl border border-[#E4B9B9] bg-[#FFF0F0] px-4 py-3 text-sm text-[#8B3E3E]"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!username.trim()}
            className="mt-5 w-full rounded-full bg-[#341F60] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(40,21,79,0.16)] transition hover:bg-[#28154F] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D4698]"
          >
            Continue
          </button>
        </form>
      </section>
    </main>
  );
}

export default function TeamLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#E9E0EF]" />}>
      <TeamLoginForm />
    </Suspense>
  );
}
