"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>AasaMedChem</h1>
        <p style={styles.subtitle}>Inventory & Order Management Portal</p>
        
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="name@company.com"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    width: "100vw",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0b0f19",
    backgroundImage: "radial-gradient(circle at 50% 50%, #1e293b 0%, #0b0f19 100%)",
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    padding: "1rem",
  },
  card: {
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    backdropFilter: "blur(12px)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "2.5rem",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.5)",
  },
  title: {
    color: "#38bdf8",
    fontSize: "2rem",
    fontWeight: "800",
    textAlign: "center",
    margin: "0 0 0.5rem 0",
    letterSpacing: "-0.025em",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "0.875rem",
    textAlign: "center",
    margin: "0 0 2rem 0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    color: "#e2e8f0",
    fontSize: "0.875rem",
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#f8fafc",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  button: {
    backgroundColor: "#0284c7",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    marginTop: "0.5rem",
    transition: "background-color 0.2s ease",
  },
  error: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "8px",
    color: "#fca5a5",
    padding: "0.75rem",
    fontSize: "0.875rem",
    textAlign: "center",
    marginBottom: "1rem",
  },
};
