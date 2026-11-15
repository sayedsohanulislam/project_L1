"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store";
import {
  LayoutDashboard,
  Table,
  Database,
  Search,
  BookmarkCheck,
  History,
  BarChart3,
  BookOpen,
  Gauge,
  Settings,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  {
    name: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Data Explorer",
    href: "/explorer",
    icon: Table,
    highlight: true,
  },
  {
    name: "Dataset Library",
    href: "/datasets",
    icon: Database,
  },
  {
    name: "Advanced Search",
    href: "/search",
    icon: Search,
  },
  {
    name: "Saved Views",
    href: "/saved-views",
    icon: BookmarkCheck,
  },
  {
    name: "Search History",
    href: "/history",
    icon: History,
  },
  {
    name: "Data Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "TDR Architecture",
    href: "/architecture",
    icon: BookOpen,
  },
  {
    name: "Performance Tests",
    href: "/benchmarks",
    icon: Gauge,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarCollapsed = useAppSelector(
    (state) => state.uiPreference.sidebarCollapsed
  );

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-800 bg-slate-950/80 transition-all duration-300 ${
        sidebarCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-1 flex-col justify-between p-3">
        <nav className="space-y-1">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {!sidebarCollapsed && "Core Platform"}
          </div>

          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                } ${item.highlight && !isActive ? "border border-blue-900/30 bg-blue-950/20 text-blue-300" : ""}`}
                title={item.name}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? "text-blue-400" : "text-slate-400"
                    } ${item.highlight && !isActive ? "text-blue-400" : ""}`}
                  />
                  {!sidebarCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </div>

                {!sidebarCollapsed && item.highlight && (
                  <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold text-blue-400 uppercase tracking-wider">
                    Core
                  </span>
                )}
                {!sidebarCollapsed && isActive && !item.highlight && (
                  <ChevronRight className="h-3.5 w-3.5 text-blue-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* System status pill */}
        {!sidebarCollapsed && (
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="font-semibold text-slate-300 text-[11px]">Database Status</span>
              <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ready
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              PostgreSQL 16 with GIN Trigram & Full-Text Search indexing enabled.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
