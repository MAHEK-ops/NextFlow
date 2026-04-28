"use client";

import { useState, useEffect, useRef } from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { X, Mail, Shield, ArrowRight } from "lucide-react";
import { useUIStore } from "@/store/ui";
import type { EmailCodeFactor } from "@clerk/types";

type View = "main" | "otp" | "password";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useUIStore();
  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp();
  const router = useRouter();

  const [view, setView] = useState<View>("main");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeAuthModal();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isAuthModalOpen) {
      setView("main");
      setEmail("");
      setCode("");
      setPassword("");
      setError("");
      setLoading(false);
    }
  }, [isAuthModalOpen]);

  async function handleGoogleOAuth() {
    if (!signInLoaded || !signIn) return;
    setError("");
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: "/dashboard",
      });
    } catch {
      setError("Could not start Google sign-in. Please try again.");
    }
  }

  async function handleAppleOAuth() {
    if (!signInLoaded || !signIn) return;
    setError("");
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_apple",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: "/dashboard",
      });
    } catch {
      setError("Could not start Apple sign-in. Please try again.");
    }
  }

  async function handleEmailContinue() {
    if (!signInLoaded || !signUpLoaded || !email.trim()) return;
    setLoading(true);
    setError("");

    try {
      const result = await signIn!.create({ identifier: email.trim() });

      if (result.status === "complete") {
        await setSignInActive!({ session: result.createdSessionId });
        closeAuthModal();
        router.refresh();
        return;
      }

      const emailCodeFactor = result.supportedFirstFactors?.find(
        (f): f is EmailCodeFactor => f.strategy === "email_code"
      );
      const passwordFactor = result.supportedFirstFactors?.find(
        (f) => f.strategy === "password"
      );

      if (emailCodeFactor) {
        await signIn!.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailCodeFactor.emailAddressId,
        });
        setIsSigningUp(false);
        setView("otp");
      } else if (passwordFactor) {
        setIsSigningUp(false);
        setView("password");
      } else {
        setError("This account requires a different sign-in method.");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ code: string }> };
      if (clerkErr.errors?.[0]?.code === "form_identifier_not_found") {
        try {
          await signUp!.create({ emailAddress: email.trim() });
          await signUp!.prepareEmailAddressVerification({ strategy: "email_code" });
          setIsSigningUp(true);
          setView("otp");
          return;
        } catch {
          setError("Could not create account. Please try again.");
        }
      } else {
        setError("Sign in failed. Please check your email and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleOTPVerify() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");

    try {
      if (isSigningUp) {
        const result = await signUp!.attemptEmailAddressVerification({ code });
        if (result.status === "complete") {
          await setSignUpActive!({ session: result.createdSessionId });
          closeAuthModal();
          router.refresh();
        } else {
          setError("Verification incomplete. Please try again.");
        }
      } else {
        const result = await signIn!.attemptFirstFactor({ strategy: "email_code", code });
        if (result.status === "complete") {
          await setSignInActive!({ session: result.createdSessionId });
          closeAuthModal();
          router.refresh();
        } else {
          setError("Verification incomplete. Please try again.");
        }
      }
    } catch {
      setError("Invalid code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSignIn() {
    if (!password.trim()) return;
    setLoading(true);
    setError("");

    try {
      const result = await signIn!.attemptFirstFactor({ strategy: "password", password });
      if (result.status === "complete") {
        await setSignInActive!({ session: result.createdSessionId });
        closeAuthModal();
        router.refresh();
      } else {
        setError("Sign in incomplete. Please try again.");
      }
    } catch {
      setError("Incorrect password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthModalOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) closeAuthModal();
      }}
    >
      <div className="w-[820px] max-w-[95vw] h-[560px] flex rounded-2xl overflow-hidden animate-scale-in shadow-2xl">

        {/* Left panel */}
        <div className="w-[400px] flex-none bg-[#0b0b0f] flex flex-col p-9">

          {view === "main" && (
            <>
              <h2 className="text-[1.6rem] font-bold text-white mb-7 leading-tight">
                Sign in to NextFlow
              </h2>

              <div className="flex flex-col gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => void handleGoogleOAuth()}
                  className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-[#f0f0f0] text-black text-sm font-medium rounded-xl transition-colors"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={() => void handleAppleOAuth()}
                  className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-[#f0f0f0] text-black text-sm font-medium rounded-xl transition-colors"
                >
                  <AppleIcon />
                  Continue with Apple
                </button>
                <button
                  type="button"
                  className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-[#f0f0f0] text-black text-sm font-medium rounded-xl transition-colors"
                >
                  <Shield size={16} className="text-black flex-none" />
                  Single Sign-On (SSO)
                </button>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-[#525252] font-semibold tracking-widest">OR</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="relative mb-4">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Mail size={15} className="text-[#525252]" />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") void handleEmailContinue(); }}
                  className="w-full bg-[#16161a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#525252] outline-none focus:border-white/25 transition-colors"
                />
              </div>

              {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

              <button
                type="button"
                onClick={() => void handleEmailContinue()}
                disabled={loading || !email.trim()}
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <>Continue <ArrowRight size={15} /></>
                }
              </button>

              <p className="text-xs text-[#444] mt-auto pt-5 text-center leading-relaxed">
                By continuing, you agree to NextFlow&apos;s{" "}
                <span className="text-[#3b82f6] cursor-pointer hover:underline">Terms of Use</span>
                {" & "}
                <span className="text-[#3b82f6] cursor-pointer hover:underline">Privacy Policy</span>.
              </p>
            </>
          )}

          {view === "otp" && (
            <>
              <button
                type="button"
                onClick={() => { setView("main"); setError(""); setCode(""); }}
                className="flex items-center gap-1.5 text-xs text-[#525252] hover:text-white transition-colors mb-7"
              >
                ← Back
              </button>
              <h2 className="text-[1.6rem] font-bold text-white mb-2 leading-tight">Check your email</h2>
              <p className="text-sm text-[#525252] mb-7">
                We sent a code to <span className="text-white">{email}</span>
              </p>

              <input
                type="text"
                inputMode="numeric"
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => { if (e.key === "Enter") void handleOTPVerify(); }}
                autoFocus
                className="w-full bg-[#16161a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#525252] outline-none focus:border-white/25 mb-4 tracking-[0.4em] text-center transition-colors"
              />

              {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

              <button
                type="button"
                onClick={() => void handleOTPVerify()}
                disabled={loading || code.length < 6}
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : "Verify"
                }
              </button>
            </>
          )}

          {view === "password" && (
            <>
              <button
                type="button"
                onClick={() => { setView("main"); setError(""); setPassword(""); }}
                className="flex items-center gap-1.5 text-xs text-[#525252] hover:text-white transition-colors mb-7"
              >
                ← Back
              </button>
              <h2 className="text-[1.6rem] font-bold text-white mb-2 leading-tight">Enter your password</h2>
              <p className="text-sm text-[#525252] mb-7">
                Signing in as <span className="text-white">{email}</span>
              </p>

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void handlePasswordSignIn(); }}
                autoFocus
                className="w-full bg-[#16161a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#525252] outline-none focus:border-white/25 mb-4 transition-colors"
              />

              {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

              <button
                type="button"
                onClick={() => void handlePasswordSignIn()}
                disabled={loading || !password.trim()}
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : "Sign in"
                }
              </button>
            </>
          )}
        </div>

        {/* Right panel */}
        <div className="flex-1 relative overflow-hidden">
          <img
            src="/hero-bg.jpeg"
            alt=""
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/20" />
          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Close"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors z-10"
          >
            <X size={15} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className="flex-none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="flex-none">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}
