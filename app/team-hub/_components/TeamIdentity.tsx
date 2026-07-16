"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type TeamAccessLevel = "owner" | "staff";
export type TeamIdentity =
  | "karen"
  | "adrian"
  | "arion"
  | "sure"
  | "emilia";

export const TEAM_IDENTITIES: Record<
  TeamIdentity,
  {
    username: string;
    name: string;
    title: string;
    accessLevel: TeamAccessLevel;
    initials: string;
  }
> = {
  karen: {
    username: "Understory_Karen",
    name: "Karen",
    title: "Owner",
    accessLevel: "owner",
    initials: "K",
  },
  adrian: {
    username: "Understory_Adrian",
    name: "Adrian",
    title: "Co-owner",
    accessLevel: "owner",
    initials: "A",
  },
  arion: {
    username: "Understory_Arion",
    name: "Arion",
    title: "Creative Director",
    accessLevel: "staff",
    initials: "A",
  },
  sure: {
    username: "Understory_Sure",
    name: "Sure",
    title: "Media Buyer",
    accessLevel: "staff",
    initials: "S",
  },
  emilia: {
    username: "Understory_Emilia",
    name: "Emilia",
    title: "Graphic Designer",
    accessLevel: "staff",
    initials: "E",
  },
};

export const VALID_TEAM_USERNAMES = Object.values(TEAM_IDENTITIES).map(
  (profile) => profile.username,
);

export const TEAM_IDENTITY_SESSION_KEY = "understory-team-hub-identity";
export const TEAM_NAME_SESSION_KEY = "understory-team-hub-name";
export const TEAM_TITLE_SESSION_KEY = "understory-team-hub-title";
export const TEAM_ACCESS_SESSION_KEY = "understory-team-hub-access-level";

type TeamIdentityContextValue = {
  identity: TeamIdentity | null;
  username: string | null;
  name: string | null;
  title: string | null;
  accessLevel: TeamAccessLevel | null;
  isReady: boolean;
  isPickerOpen: boolean;
  selectIdentity: (identity: TeamIdentity) => void;
  openIdentityPicker: () => void;
};

const TeamIdentityContext =
  createContext<TeamIdentityContextValue | null>(null);

function clearSession() {
  window.sessionStorage.removeItem(TEAM_IDENTITY_SESSION_KEY);
  window.sessionStorage.removeItem(TEAM_NAME_SESSION_KEY);
  window.sessionStorage.removeItem(TEAM_TITLE_SESSION_KEY);
  window.sessionStorage.removeItem(TEAM_ACCESS_SESSION_KEY);
}

export function readTeamSessionProfile() {
  if (typeof window === "undefined") return null;
  const identity = window.sessionStorage.getItem(
    TEAM_IDENTITY_SESSION_KEY,
  ) as TeamIdentity | null;
  const profile = identity ? TEAM_IDENTITIES[identity] : null;
  if (
    !profile ||
    profile.name !== window.sessionStorage.getItem(TEAM_NAME_SESSION_KEY) ||
    profile.title !== window.sessionStorage.getItem(TEAM_TITLE_SESSION_KEY) ||
    profile.accessLevel !==
      window.sessionStorage.getItem(TEAM_ACCESS_SESSION_KEY)
  ) {
    return null;
  }
  return { identity, ...profile };
}

export function TeamIdentityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [identity, setIdentity] = useState<TeamIdentity | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedIdentity = window.sessionStorage.getItem(
        TEAM_IDENTITY_SESSION_KEY,
      ) as TeamIdentity | null;
      const profile = savedIdentity ? TEAM_IDENTITIES[savedIdentity] : null;
      const isValid =
        profile &&
        profile.name === window.sessionStorage.getItem(TEAM_NAME_SESSION_KEY) &&
        profile.title ===
          window.sessionStorage.getItem(TEAM_TITLE_SESSION_KEY) &&
        profile.accessLevel ===
          window.sessionStorage.getItem(TEAM_ACCESS_SESSION_KEY);

      if (isValid && savedIdentity) {
        setIdentity(savedIdentity);
      } else {
        clearSession();
        setIsPickerOpen(true);
      }
      setIsReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const value = useMemo<TeamIdentityContextValue>(() => {
    const profile = identity ? TEAM_IDENTITIES[identity] : null;

    return {
      identity,
      username: profile?.username ?? null,
      name: profile?.name ?? null,
      title: profile?.title ?? null,
      accessLevel: profile?.accessLevel ?? null,
      isReady,
      isPickerOpen,
      selectIdentity: (nextIdentity) => {
        const nextProfile = TEAM_IDENTITIES[nextIdentity];
        window.sessionStorage.setItem(TEAM_IDENTITY_SESSION_KEY, nextIdentity);
        window.sessionStorage.setItem(TEAM_NAME_SESSION_KEY, nextProfile.name);
        window.sessionStorage.setItem(TEAM_TITLE_SESSION_KEY, nextProfile.title);
        window.sessionStorage.setItem(
          TEAM_ACCESS_SESSION_KEY,
          nextProfile.accessLevel,
        );
        setIdentity(nextIdentity);
        setIsPickerOpen(false);
      },
      openIdentityPicker: () => {
        clearSession();
        setIdentity(null);
        setIsPickerOpen(true);
      },
    };
  }, [identity, isPickerOpen, isReady]);

  return (
    <TeamIdentityContext.Provider value={value}>
      {children}
    </TeamIdentityContext.Provider>
  );
}

export function useTeamIdentity() {
  const context = useContext(TeamIdentityContext);

  if (!context) {
    throw new Error(
      "useTeamIdentity must be used within TeamIdentityProvider.",
    );
  }

  return context;
}
