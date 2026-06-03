"use client";

import { useEffect, useState } from "react";
import OrderList from "@/app/orders/OrderList";
import { getSellerOrders } from "@/app/orders/actions";

export default function SellerOrdersPage() {
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const list = await getSellerOrders();
      setOrdersList(list);
      setLoading(false);
    }

    loadOrders();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Orders</h1>
        <p style={styles.subtitle}>Orders created from your approved quotations</p>
      </div>

      {loading ? (
        <div style={styles.emptyCard}>Loading orders...</div>
      ) : (
        <OrderList
          ordersList={ordersList}
          emptyText="No orders yet. Orders appear here after an admin converts your approved quotations."
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  },
  header: {
    marginBottom: "2rem",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: "800",
    color: "#f8fafc",
    margin: 0,
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#94a3b8",
    margin: "0.25rem 0 0 0",
  },
  emptyCard: {
    backgroundColor: "#0f172a",
    border: "1px dashed #1e293b",
    borderRadius: "10px",
    color: "#64748b",
    padding: "3rem 2rem",
    textAlign: "center",
    fontSize: "0.875rem",
  },
};
