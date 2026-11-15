import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { RecordInspector } from "@/components/explorer/RecordInspector";
import { SaveViewModal } from "@/components/saved-views/SaveViewModal";

export const metadata: Metadata = {
  title: "DataScope – Enterprise Data Discovery & Intelligence Platform",
  description:
    "High-performance data discovery and search platform managing 100,000+ structured enterprise records.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col">
        <ReduxProvider>
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-b from-slate-950 via-slate-900/30 to-slate-950">
              <div className="mx-auto max-w-7xl space-y-6">
                {children}
              </div>
            </main>
          </div>
          <RecordInspector />
          <SaveViewModal />
        </ReduxProvider>
      </body>
    </html>
  );
}
