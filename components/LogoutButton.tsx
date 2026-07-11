"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      style={{
        border: "1px solid #E7DFC9",
        background: "#FBF6EC",
        color: "#6B6259",
        borderRadius: 10,
        padding: "8px 14px",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "Almarai, sans-serif",
      }}
    >
      {loading ? "..." : "🚪 تسجيل الخروج"}
    </button>
  );
}