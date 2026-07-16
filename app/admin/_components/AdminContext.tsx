"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";

export type AdminClientSlug = "mvp" | "boardwalk";

export const ADMIN_CLIENTS: Record<
  AdminClientSlug,
  { name: string; slug: AdminClientSlug }
> = {
  mvp: { name: "MVP", slug: "mvp" },
  boardwalk: { name: "Boardwalk", slug: "boardwalk" },
};

export const ADMIN_USERNAME = "understory_admin";
export const ADMIN_PASSWORD = "understory2026";

const AUTH_KEY = "understory-admin-authenticated";
const CLIENT_KEY = "understory-admin-client-slug";

type AdminContextValue = {
  isReady: boolean;
  isAuthenticated: boolean;
  clientSlug: AdminClientSlug | null;
  clientName: string | null;
  clientId: string | null;
  clientError: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  selectClient: (slug: AdminClientSlug) => void;
  clearClient: () => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clientSlug, setClientSlug] = useState<AdminClientSlug | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const authenticated = window.sessionStorage.getItem(AUTH_KEY) === "true";
      const savedClient = window.sessionStorage.getItem(CLIENT_KEY);
      setIsAuthenticated(authenticated);
      if (
        authenticated &&
        (savedClient === "mvp" || savedClient === "boardwalk")
      ) {
        setClientSlug(savedClient);
      }
      setIsReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let isActive = true;

    async function resolveClient() {
      setClientId(null);
      setClientError(null);
      if (!isAuthenticated || !clientSlug) return;

      const { data, error } = await supabase
        .from("clients")
        .select("id")
        .eq("slug", clientSlug)
        .single();

      if (!isActive) return;
      if (error || !data) {
        setClientError(
          `Could not resolve ${ADMIN_CLIENTS[clientSlug].name}: ${error?.message ?? "Client not found."}`,
        );
      } else {
        setClientId(data.id);
      }
    }

    void resolveClient();
    return () => {
      isActive = false;
    };
  }, [clientSlug, isAuthenticated]);

  const value = useMemo<AdminContextValue>(
    () => ({
      isReady,
      isAuthenticated,
      clientSlug,
      clientName: clientSlug ? ADMIN_CLIENTS[clientSlug].name : null,
      clientId,
      clientError,
      login: (username, password) => {
        const isValid =
          username.trim().toLocaleLowerCase() ===
            ADMIN_USERNAME.toLocaleLowerCase() &&
          password === ADMIN_PASSWORD;
        if (isValid) {
          window.sessionStorage.setItem(AUTH_KEY, "true");
          setIsAuthenticated(true);
        }
        return isValid;
      },
      logout: () => {
        window.sessionStorage.removeItem(AUTH_KEY);
        window.sessionStorage.removeItem(CLIENT_KEY);
        setIsAuthenticated(false);
        setClientSlug(null);
        setClientId(null);
      },
      selectClient: (slug) => {
        window.sessionStorage.setItem(CLIENT_KEY, slug);
        setClientSlug(slug);
      },
      clearClient: () => {
        window.sessionStorage.removeItem(CLIENT_KEY);
        setClientSlug(null);
        setClientId(null);
      },
    }),
    [
      clientError,
      clientId,
      clientSlug,
      isAuthenticated,
      isReady,
    ],
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used within AdminProvider.");
  return context;
}
