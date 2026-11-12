"use client";

import { useEffect, useState } from "react";
import { parseCookies, setCookie } from "nookies";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHook";
import {
  selectUserProfile,
  setCredentials,
} from "@/store/slices/usersSlice";
import { getClientProfile, getSuperadminProfile } from "@/api/auth.api";
import { IProfile } from "@/types/api/profile.types";
import DashboardSkeleton from "./DashboardSkeleton";

const publicRoutes = ["/"];

function resolveAuth() {
  const roleRaw = localStorage.getItem("role");
  const roleParts = roleRaw?.split("_").filter(Boolean) || [];
  const hasSuperadminToken = !!localStorage.getItem("superadmin_token");
  const hasClientToken = !!localStorage.getItem("auth_token");
  const isSuperAdmin =
    roleParts.includes("superadmin") ||
    (hasSuperadminToken && !hasClientToken);

  const token =
    localStorage.getItem(isSuperAdmin ? "superadmin_token" : "auth_token") ||
    localStorage.getItem("superadmin_token") ||
    localStorage.getItem("auth_token");

  if (isSuperAdmin && roleParts.length > 1) {
    localStorage.setItem("role", "superadmin");
  }

  return { isSuperAdmin, token };
}

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUserProfile);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession() {
      const { isSuperAdmin, token } = resolveAuth();
      const cookies = parseCookies();
      const cookieToken = cookies.superadmin_token || cookies.auth_token;
      const authToken = token || cookieToken;
      const useSuperAdmin =
        isSuperAdmin ||
        !!localStorage.getItem("superadmin_token") ||
        !!cookies.superadmin_token;

      // Already hydrated in this session (client navigation)
      if (user?.profile?.role) {
        if (!cancelled) setReady(true);
        return;
      }

      if (!authToken) {
        if (!publicRoutes.includes(pathname)) {
          router.replace("/");
        }
        if (!cancelled) setReady(true);
        return;
      }

      try {
        const resProfile = useSuperAdmin
          ? await getSuperadminProfile(authToken)
          : await getClientProfile(authToken);

        if (cancelled) return;

        if (resProfile.ok && resProfile.data) {
          const raw = resProfile.data.data;
          const userData = Array.isArray(raw) ? raw[0] : raw;

          if (useSuperAdmin) {
            const superAdminPatch: IProfile = {
              profile: userData as unknown as IProfile["profile"],
              photo_url: "",
            };
            dispatch(setCredentials(superAdminPatch));
          } else {
            dispatch(setCredentials(userData as IProfile));
          }

          setCookie(
            null,
            useSuperAdmin ? "superadmin_token" : "auth_token",
            authToken,
            {
              maxAge: 30 * 24 * 60 * 60,
              path: "/",
            },
          );

          if (publicRoutes.includes(pathname)) {
            router.replace("/dashboard");
            return;
          }
        } else if (!publicRoutes.includes(pathname)) {
          router.replace("/");
        }
      } catch {
        if (!cancelled && !publicRoutes.includes(pathname)) {
          router.replace("/");
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    hydrateSession();
    return () => {
      cancelled = true;
    };
    // Intentionally once on mount — role/token restore for reloads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;

    const cookies = parseCookies();
    const authToken =
      cookies.auth_token ||
      cookies.superadmin_token ||
      localStorage.getItem("superadmin_token") ||
      localStorage.getItem("auth_token");

    if (!authToken && !publicRoutes.includes(pathname)) {
      router.replace("/");
    }
  }, [pathname, ready, router]);

  // Hold the previous shell until the logged-in profile is restored
  if (!ready) {
    return <DashboardSkeleton />;
  }

  // Authenticated user landing on login — keep skeleton while redirecting
  if (user?.profile && publicRoutes.includes(pathname)) {
    return <DashboardSkeleton />;
  }

  return <>{children}</>;
};

export default AuthGuard;
