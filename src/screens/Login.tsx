"use client";

import { manrope_400, manrope_600 } from "@/config/fonts";
import Image from "next/image";
import React, { useEffect, useState, Suspense } from "react";
import {
  AppButton,
  CustomInput,
  InputWithIcon,
} from "../components/AppLayout";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoginMutation, useSuperadminClientRedirectMutation } from "@/api/userSlice.api";
import { useAppDispatch } from "@/hooks/reduxHook";
import { setCredentials } from "@/store/slices/usersSlice";
import { toast } from "react-toastify";
import { setCookie } from "nookies";
import { getClientProfile, getSuperadminProfile } from "@/api/auth.api";
import { IProfile } from "@/types/api/profile.types";
import DashboardSkeleton from "@/components/DashboardSkeleton";

const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const SUCESS_CODES = [201, 200];

// Extracted inner component so we can wrap useSearchParams in Suspense
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryEmail = searchParams.get("email"); // 🟩 Grab email from route

  const [inputType, setInputType] = useState("password");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  
  // Initial loading state to show skeleton
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true); 
  
  const dispatch = useAppDispatch();

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [superadminClientRedirect, { isLoading: isSuperadminClientRedirectLoading }] = useSuperadminClientRedirectMutation();

  const submitHandler = async () => {
    // 🟩 Bypass strict validation if we are in the redirect flow
    if (!queryEmail && (email === "" || password === "" || !regex.test(email))) {
      return;
    } 
    console.log(queryEmail, 'here...')
    try {
      setLoading(true);
      let res;

      // 🟩 FIXED COMMENT LOGIC
      if (queryEmail) {
        // Superadmin is trying to access a client dashboard
        const c = await superadminClientRedirect({ email: queryEmail }).unwrap();
        console.log(c, queryEmail)
        res = c
      } else {
        // Standard login
        res = await login({
          email,
          password,
        }).unwrap();
      }

      if (SUCESS_CODES.includes(res.status) && res.data) {
        const isSuperAdmin = res.data.role === "superadmin";
        if(queryEmail){
          const r = localStorage.getItem("role");
          localStorage.setItem("role", `${r}_${res.data.role}`);
        }else{
          localStorage.setItem("role", res.data.role);
        }
        localStorage.setItem(isSuperAdmin ? "superadmin_token" : "auth_token", res.data.token);

        setCookie(null, isSuperAdmin ? "superadmin_token" : "auth_token", res.data.token, {
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: "/", // Makes it accessible in all pages
        });

        // Trigger the user profile query after login
        const resProfile = isSuperAdmin
          ? await getSuperadminProfile(res.data.token)
          : await getClientProfile(res.data.token);

        if (resProfile.ok && resProfile.data && resProfile.data !== null) {
          const superAdmin =
            (resProfile.data.data as IProfile[])[0] ||
            (resProfile.data.data as IProfile);
          const superAdminPatch: IProfile = {
            profile: superAdmin as any,
            photo_url: "",
          };
          dispatch(
            setCredentials(isSuperAdmin ? superAdminPatch : superAdmin)
          );
          router.replace("/dashboard");

          toast("Successful login", {
            type: "success",
          });
        } else {
          toast("Opps! couldn't authenticate user", {
            type: "error",
          });
        }
      }
    } catch (error) {
      console.log("Login error:", error);
      toast(`Something went wrong`, {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  async function handleAuthUser() {
    // 🟩 If the URL has ?email=..., automatically trigger the superadmin redirect flow
    if (queryEmail) {
      await submitHandler();
      return;
    }

    const r = localStorage.getItem("role");
     const role = r?.split("_") || [];
    const isSuperAdmin = role.includes("superadmin");
    const token = localStorage.getItem(isSuperAdmin ? "superadmin_token" : "auth_token");
    if(isSuperAdmin && role.length >1) localStorage.setItem("role", "superadmin"); // Clean up role if we had a superadmin-client redirect before

    if (token && role.length > 0) {
      try {
        const resProfile = isSuperAdmin
          ? await getSuperadminProfile(token)
          : await getClientProfile(token);

        if (resProfile.ok && resProfile.data && resProfile.data !== null) {
          const userData =
            (resProfile.data.data as IProfile[])[0] ||
            (resProfile.data.data as IProfile);
          
          const superAdminPatch: IProfile = {
            profile: userData as any,
            photo_url: "",
          };
          dispatch(setCredentials(isSuperAdmin ? superAdminPatch : userData));

          setCookie(null, isSuperAdmin ? "superadmin_token" : "auth_token", token, {
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: "/",
          });

          toast(
            `Welcome ${
              isSuperAdmin
                ? superAdminPatch.profile.first_name
                : userData.profile.first_name
            }`,
            {
              type: "success",
            }
          );
          router.replace("/dashboard");
          return; 
        }
      } catch (error) {
        console.log("Auto-login failed:", error);
      }
    }
    
    setIsCheckingAuth(false);
  }

  useEffect(() => {
    handleAuthUser();
  }, [queryEmail]);

  // IF CHECKING AUTH, RENDER THE SKELETON
  if (isCheckingAuth) {
    return <DashboardSkeleton />;
  }

  // OTHERWISE, RENDER THE LOGIN FORM
  return (
    <div className="relative grid min-h-dvh w-full place-items-center overflow-hidden bg-[#090b10] px-5 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(239,68,68,.12),transparent_30rem),radial-gradient(circle_at_90%_90%,rgba(59,130,246,.06),transparent_28rem)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className={`${manrope_400.className} relative w-full max-w-[420px] rounded-[24px] border border-white/[0.08] bg-[#12151d]/95 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9`}>
        <Image src="/Logo.png" width={148} height={54} alt="Reeplay" className="mb-10 h-auto w-[148px]" priority />

        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-400">Admin portal</p>
          <h1 className={`${manrope_600.className} text-2xl font-semibold tracking-tight text-white`}>Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to manage your Reeplay workspace.</p>
        </div>

        <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); submitHandler(); }}>
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-slate-400">Email address</span>
            <CustomInput type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-slate-400">Password</span>
            <InputWithIcon value={password} onChange={(event) => setPassword(event.target.value)} type={inputType} width={17} height={12} placeholder="Enter your password" autoComplete="current-password" onPress={() => setInputType(inputType === "text" ? "password" : "text")} src="/eye.png" />
          </label>

          <AppButton
            type="submit"
            isLoading={isLoginLoading || loading || isSuperadminClientRedirectLoading}
            disabled={!queryEmail && !(email && password && regex.test(email))}
            title="Sign in"
            className="mt-2 w-full bg-red-500 hover:bg-red-600"
          />
        </form>

        <p className="mt-8 text-center text-xs text-slate-500">
          Need help accessing your account? <button type="button" className="font-medium text-slate-300 hover:text-white">Contact support</button>
        </p>
      </div>
    </div>
  );
}

// 🟩 Wrap everything in Suspense so useSearchParams doesn't break Next.js build
export default function Login() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}
