"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ClientIdentity = "gary" | "dorothy" | "sarah";
export type ClientSlug = "mvp" | "boardwalk";
export type ClientAccessLevel = "owner" | "manager";

export const CLIENT_IDENTITIES: Record<
  ClientIdentity,
  {
    name: string;
    role: string;
    initials: string;
    clientSlug: ClientSlug;
    clientName: string;
    label: string;
    username: string;
    accessLevel: ClientAccessLevel;
  }
> = {
  gary: {
    name: "Gary",
    role: "Owner",
    initials: "G",
    clientSlug: "mvp",
    clientName: "MVP",
    label: "MVP - Gary",
    username: "MVP_Gary",
    accessLevel: "owner",
  },
  dorothy: {
    name: "Dorothy",
    role: "Studio Manager",
    initials: "D",
    clientSlug: "mvp",
    clientName: "MVP",
    label: "MVP - Dorothy",
    username: "MVP_Dorothy",
    accessLevel: "manager",
  },
  sarah: {
    name: "Sarah",
    role: "Client reviewer",
    initials: "S",
    clientSlug: "boardwalk",
    clientName: "Boardwalk",
    label: "Boardwalk - Sarah",
    username: "Boardwalk_Sarah",
    accessLevel: "owner",
  },
};

export const VALID_CLIENT_USERNAMES = [
  "MVP_Gary",
  "MVP_Dorothy",
  "Boardwalk_Sarah",
] as const;

const LEGACY_SESSION_KEY = "understory-client-portal-identity";
const REVIEWER_SESSION_KEY = "understory-client-portal-reviewer";
const CLIENT_SESSION_KEY = "understory-client-portal-client-slug";
const ACCESS_SESSION_KEY = "understory-client-portal-access-level";

type ClientIdentityContextValue = {
  identity: ClientIdentity | null;
  reviewerName: string | null;
  clientSlug: ClientSlug | null;
  clientName: string | null;
  accessLevel: ClientAccessLevel | null;
  isReady: boolean;
  isPickerOpen: boolean;
  selectIdentity: (identity: ClientIdentity) => void;
  openIdentityPicker: () => void;
};

const ClientIdentityContext =
  createContext<ClientIdentityContextValue | null>(null);

export function ClientIdentityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [identity, setIdentity] = useState<ClientIdentity | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedReviewer = window.sessionStorage.getItem(
        REVIEWER_SESSION_KEY,
      );
      const savedClientSlug = window.sessionStorage.getItem(CLIENT_SESSION_KEY);
      const savedAccessLevel = window.sessionStorage.getItem(
        ACCESS_SESSION_KEY,
      );
      const savedIdentity = (
        Object.keys(CLIENT_IDENTITIES) as ClientIdentity[]
      ).find((identityKey) => {
        const profile = CLIENT_IDENTITIES[identityKey];
        return (
          profile.name === savedReviewer &&
          profile.clientSlug === savedClientSlug &&
          (!savedAccessLevel || profile.accessLevel === savedAccessLevel)
        );
      });

      const legacyIdentity = window.sessionStorage.getItem(LEGACY_SESSION_KEY);
      const compatibleLegacyIdentity =
        legacyIdentity === "gary" || legacyIdentity === "dorothy"
          ? legacyIdentity
          : null;
      const restoredIdentity = savedIdentity ?? compatibleLegacyIdentity;

      if (restoredIdentity) {
        const profile = CLIENT_IDENTITIES[restoredIdentity];
        window.sessionStorage.setItem(REVIEWER_SESSION_KEY, profile.name);
        window.sessionStorage.setItem(CLIENT_SESSION_KEY, profile.clientSlug);
        window.sessionStorage.setItem(
          ACCESS_SESSION_KEY,
          profile.accessLevel,
        );
        window.sessionStorage.setItem(LEGACY_SESSION_KEY, restoredIdentity);
        setIdentity(restoredIdentity);
      } else {
        window.sessionStorage.removeItem(LEGACY_SESSION_KEY);
        window.sessionStorage.removeItem(REVIEWER_SESSION_KEY);
        window.sessionStorage.removeItem(CLIENT_SESSION_KEY);
        window.sessionStorage.removeItem(ACCESS_SESSION_KEY);
        setIsPickerOpen(true);
      }

      setIsReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const value = useMemo<ClientIdentityContextValue>(
    () => {
      const profile = identity ? CLIENT_IDENTITIES[identity] : null;

      return {
        identity,
        reviewerName: profile?.name ?? null,
        clientSlug: profile?.clientSlug ?? null,
        clientName: profile?.clientName ?? null,
        accessLevel: profile?.accessLevel ?? null,
        isReady,
        isPickerOpen,
        selectIdentity: (nextIdentity) => {
          const nextProfile = CLIENT_IDENTITIES[nextIdentity];
          window.sessionStorage.setItem(
            REVIEWER_SESSION_KEY,
            nextProfile.name,
          );
          window.sessionStorage.setItem(
            CLIENT_SESSION_KEY,
            nextProfile.clientSlug,
          );
          window.sessionStorage.setItem(
            ACCESS_SESSION_KEY,
            nextProfile.accessLevel,
          );
          window.sessionStorage.setItem(LEGACY_SESSION_KEY, nextIdentity);
          setIdentity(nextIdentity);
          setIsPickerOpen(false);
        },
        openIdentityPicker: () => {
          window.sessionStorage.removeItem(LEGACY_SESSION_KEY);
          window.sessionStorage.removeItem(REVIEWER_SESSION_KEY);
          window.sessionStorage.removeItem(CLIENT_SESSION_KEY);
          window.sessionStorage.removeItem(ACCESS_SESSION_KEY);
          setIdentity(null);
          setIsPickerOpen(true);
        },
      };
    },
    [identity, isPickerOpen, isReady],
  );

  return (
    <ClientIdentityContext.Provider value={value}>
      {children}
    </ClientIdentityContext.Provider>
  );
}

export function useClientIdentity() {
  const context = useContext(ClientIdentityContext);

  if (!context) {
    throw new Error(
      "useClientIdentity must be used within ClientIdentityProvider.",
    );
  }

  return context;
}
