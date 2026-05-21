"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080b14" }}>
      <Sidebar onLogout={handleLogout} onCollapse={setSidebarCollapsed} />
      <main
        style={{
          marginLeft: sidebarCollapsed ? 72 : 256,
          flex: 1,
          minHeight: "100vh",
          transition: "margin-left 0.3s ease",
          overflowX: "hidden",
        }}
      >
        {children}
      </main>
    </div>
  );
}
