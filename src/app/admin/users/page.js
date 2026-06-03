"use client";

import { Users } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#f8fafc", margin: 0, letterSpacing: "-0.025em" }}>User Management</h1>
        <p style={{ fontSize: "0.875rem", color: "#94a3b8", margin: "0.25rem 0 0 0" }}>Onboard and manage seller accounts</p>
      </div>

      <div style={{
        backgroundColor: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: "12px",
        padding: "4rem 2rem",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem"
      }}>
        <Users size={48} color="#1e293b" />
        <p style={{ color: "#64748b", fontSize: "0.875rem", maxWidth: "400px" }}>
          User management can be extended here. Currently, users are created via the database seed script.
        </p>
      </div>
    </div>
  );
}
