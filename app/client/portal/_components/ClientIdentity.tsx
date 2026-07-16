"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ClientIdentity = "gary" | "dorothy";

export const CLIENT_IDENTITIES: Record<
  ClientIdentity,
  { name: string; role: string; initials: string }
> = {
  gary: { name: "Gary", role: "Owner", initials: "G" },
  dorothy: { name: "Dorothy", role: "Studio Manager", initials: "D" },
};

const SESSION_KEY = "understory-client-portal-identity";

type ClientIdentityContextValue = {
  identity: ClientIdentity | null;
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
      const savedIdentity = window.sessionStorage.getItem(SESSION_KEY);
      const isValidIdentity =
        savedIdentity === "gary" || savedIdentity === "dorothy";

      if (isValidIdentity) {
        setIdentity(savedIdentity);
      } else {
        window.sessionStorage.removeItem(SESSION_KEY);
        setIsPickerOpen(true);
      }

      setIsReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const value = useMemo<ClientIdentityContextValue>(
    () => ({
      identity,
      isReady,
      isPickerOpen,
      selectIdentity: (nextIdentity) => {
        window.sessionStorage.setItem(SESSION_KEY, nextIdentity);
        setIdentity(nextIdentity);
        setIsPickerOpen(false);
      },
      openIdentityPicker: () => setIsPickerOpen(true),
    }),
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
