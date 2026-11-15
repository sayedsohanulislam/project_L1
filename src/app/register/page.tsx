"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/slices/authSlice";
import { Layers, ArrowRight, Lock, Mail, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "DATA_ANALYST" | "VIEWER">("DATA_ANALYST");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      setCredentials({
        user: {
          id: `usr-${Date.now()}`,
          name,
          email,
          role,
          avatarUrl: null,
        },
        token: "demo-registered-jwt-token",
      })
    );
    router.push("/explorer");
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur">
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20 text-white mb-3">
            <Layers className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Create DataScope Account</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access enterprise discovery tools and analytics
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Jordan Hayes"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan.hayes@enterprise.com"
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
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Assigned Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-slate-100 focus:border-blue-500 focus:outline-none"
            >
              <option value="DATA_ANALYST">Data Analyst (Standard)</option>
              <option value="VIEWER">Viewer (Read-Only)</option>
              <option value="ADMIN">Administrator (Full Access)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
          >
            <span>Complete Registration</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already registered?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
