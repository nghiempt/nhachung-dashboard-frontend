"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

// ── Types matching the backend responses ─────────────────────
export interface Profile {
  id: string;
  avatarUrl: string | null;
  fullName: string;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  location: string | null;
  isVerifiedResident: boolean;
  [key: string]: unknown;
}

export interface BuildingItem {
  id: string;
  name: string;
  location: string | null;
  apartment: string | null;
  thumbnailUrl: string | null;
  isOwned: boolean;
  isOwner: boolean;
  isActive: boolean;
}

export interface BuildingsResponse {
  active: BuildingItem | null;
  mine: BuildingItem[];
  explore: BuildingItem[];
}

interface UserContextValue {
  profile: Profile | null;
  buildings: BuildingsResponse | null;
  activeBuilding: BuildingItem | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  refreshBuildings: () => Promise<void>;
  activateBuilding: (id: string) => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [buildings, setBuildings] = useState<BuildingsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      setProfile(await api<Profile>("/profile/me"));
    } catch {
      /* token may be missing/expired; api() handles redirect */
    }
  }, []);

  const refreshBuildings = useCallback(async () => {
    try {
      setBuildings(await api<BuildingsResponse>("/buildings"));
    } catch {
      /* ignore */
    }
  }, []);

  const activateBuilding = useCallback(
    async (id: string) => {
      await api(`/buildings/${id}/activate`, { method: "POST" });
      await refreshBuildings();
      // building-scoped data changes → easiest is a soft reload
      if (typeof window !== "undefined") window.location.reload();
    },
    [refreshBuildings],
  );

  useEffect(() => {
    Promise.all([refreshProfile(), refreshBuildings()]).finally(() => setLoading(false));
  }, [refreshProfile, refreshBuildings]);

  const activeBuilding = buildings?.active ?? buildings?.mine?.[0] ?? null;

  return (
    <UserContext.Provider
      value={{
        profile,
        buildings,
        activeBuilding,
        loading,
        refreshProfile,
        refreshBuildings,
        activateBuilding,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within <UserProvider>");
  return ctx;
}
