"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Package, 
  FileText, 
  ShoppingCart, 
  Users
} from "lucide-react";
import { getProducts } from "@/app/admin/products/actions";
import { getAllQuotations } from "@/app/admin/quotes/actions";
import { getAdminOrders } from "@/app/orders/actions";

export default function DashboardOverview() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const [stats, setStats] = useState({ products: 0, pendingQuotes: 0, orders: 0, sellers: 1 });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const products = await getProducts();
      const allQuotes = await getAllQuotations();
      const allOrders = await getAdminOrders();
      
      const pendingQuotes = allQuotes.filter(q => q.status === "PENDING_REVIEW").length;
      
      setStats({
        products: products.length,
        pendingQuotes,
        orders: allOrders.length,
        sellers: 1
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === "ADMIN") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadStats();
    }
  }, [role]);

  if (role === "ADMIN") {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Admin Overview</h1>
            <p style={styles.subtitle}>System oversight, stock statuses, and order approvals</p>
          </div>
        </div>

        {/* Admin Metric Cards */}
        <div style={styles.grid}>
          <div style={styles.metricCard}>
            <div style={styles.metricHeader}>
              <span style={styles.metricLabel}>Total Products</span>
              <Package size={20} color="#38bdf8" />
            </div>
            <div style={styles.metricVal}>{loading ? "-" : stats.products}</div>
            <div style={styles.metricDesc}>In inventory system</div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricHeader}>
              <span style={styles.metricLabel}>Pending Quotes</span>
              <FileText size={20} color="#f59e0b" />
            </div>
            <div style={styles.metricVal}>{loading ? "-" : stats.pendingQuotes}</div>
            <div style={styles.metricDesc}>Awaiting approval/rejection</div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricHeader}>
              <span style={styles.metricLabel}>Total Orders</span>
              <ShoppingCart size={20} color="#10b981" />
            </div>
            <div style={styles.metricVal}>{loading ? "-" : stats.orders}</div>
            <div style={styles.metricDesc}>Processed and converted</div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricHeader}>
              <span style={styles.metricLabel}>Active Sellers</span>
              <Users size={20} color="#ec4899" />
            </div>
            <div style={styles.metricVal}>{stats.sellers}</div>
            <div style={styles.metricDesc}>Seller accounts active</div>
          </div>
        </div>

        {/* Action Blocks */}
        <div style={styles.sectionSplit}>
          <div style={styles.actionCard}>
            <h2 style={styles.sectionTitle}>Administrative Functions</h2>
            <div style={styles.actionGrid}>
              <Link href="/admin/products" style={styles.actionButton}>
                Manage Products
              </Link>
              <Link href="/admin/quotes" style={styles.actionButtonSecondary}>
                Review Quotations
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Seller Dashboard
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Seller Dashboard</h1>
          <p style={styles.subtitle}>Check product catalog prices, request quotes, and record orders</p>
        </div>
      </div>

      {/* Seller Metric Cards */}
      <div style={styles.grid}>
        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricLabel}>My Draft Quotes</span>
            <FileText size={20} color="#38bdf8" />
          </div>
          <div style={styles.metricVal}>3</div>
          <div style={styles.metricDesc}>Saved drafts ready for submission</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricLabel}>Pending Approval</span>
            <FileText size={20} color="#f59e0b" />
          </div>
          <div style={styles.metricVal}>2</div>
          <div style={styles.metricDesc}>Waiting on administrator review</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricLabel}>My Successful Orders</span>
            <ShoppingCart size={20} color="#10b981" />
          </div>
          <div style={styles.metricVal}>14</div>
          <div style={styles.metricDesc}>Converted contracts fulfilled</div>
        </div>
      </div>

      {/* Action Blocks */}
      <div style={styles.sectionSplit}>
        <div style={styles.actionCard}>
          <h2 style={styles.sectionTitle}>Quick Sales Actions</h2>
          <div style={styles.actionGrid}>
            <Link href="/dashboard/quotes" style={styles.actionButton}>
              Create New Quotation
            </Link>
            <Link href="/dashboard/products" style={styles.actionButtonSecondary}>
              Browse Product Catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#f8fafc",
    margin: 0,
    letterSpacing: "-0.025em",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#94a3b8",
    margin: "0.25rem 0 0 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1.5rem",
  },
  metricCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  metricHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricLabel: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#94a3b8",
  },
  metricVal: {
    fontSize: "2.25rem",
    fontWeight: "800",
    color: "#f8fafc",
  },
  metricDesc: {
    fontSize: "0.75rem",
    color: "#64748b",
  },
  sectionSplit: {
    marginTop: "1rem",
  },
  actionCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "2rem",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#f8fafc",
    margin: "0 0 1.5rem 0",
  },
  actionGrid: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
  actionButton: {
    display: "inline-block",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: "600",
    transition: "background-color 0.2s ease",
  },
  actionButtonSecondary: {
    display: "inline-block",
    backgroundColor: "transparent",
    border: "1px solid #334155",
    color: "#cbd5e1",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },
};
