"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/slices/authSlice";
import { Layers, Shield, ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("admin@datascope.io");
  const [password, setPassword] = useState("DataScope@2026");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      let role: "ADMIN" | "DATA_ANALYST" | "VIEWER" = "ADMIN";
      let name = "Alexander Vance";
      if (email.includes("analyst")) {
        role = "DATA_ANALYST";
        name = "Dr. Elena Rostova";
      } else if (email.includes("viewer")) {
        role = "VIEWER";
        name = "Marcus Thorne";
      }

      dispatch(
        setCredentials({
          user: {
            id: "user-session-id",
            name,
            email,
            role,
            avatarUrl: null,
          },
          token: "mock-jwt-auth-token",
        })
      );
      router.push("/explorer");
    }, 400);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur">
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20 text-white mb-3">
            <Layers className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Sign in to DataScope</h2>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise Data Discovery & Intelligence Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-2.5 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Quick Test Accounts:</p>
            <p>• Admin: <span className="text-blue-400">admin@datascope.io</span></p>
            <p>• Analyst: <span className="text-blue-400">analyst@datascope.io</span></p>
            <p>• Viewer: <span className="text-blue-400">viewer@datascope.io</span></p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
          >
            <span>{isLoading ? "Signing in..." : "Sign In to DataScope"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Need an account?{" "}
          <Link href="/register" className="text-blue-400 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
