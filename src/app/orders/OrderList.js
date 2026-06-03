"use client";

function money(value) {
  return `INR ${Number(value || 0).toFixed(2)}`;
}

function qty(value) {
  return Number(value || 0).toString();
}

export default function OrderList({ ordersList, emptyText }) {
  if (ordersList.length === 0) {
    return <div style={styles.emptyCard}>{emptyText}</div>;
  }

  return (
    <div style={styles.list}>
      {ordersList.map((order) => (
        <div key={order.id} style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.clientName}>{order.clientName}</h2>
              <p style={styles.clientEmail}>{order.clientEmail}</p>
            </div>
            <div style={styles.summaryBox}>
              <span style={styles.status}>{order.status}</span>
              <strong style={styles.total}>{money(order.totalAmount)}</strong>
              <span style={styles.date}>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Product</th>
                  <th style={styles.th}>Ordered Qty</th>
                  <th style={styles.th}>Base Qty</th>
                  <th style={styles.th}>Unit Price</th>
                  <th style={styles.th}>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>
                      <strong style={styles.productName}>{item.productName || "Deleted product"}</strong>
                      <div style={styles.sku}>{item.productSku}</div>
                    </td>
                    <td style={styles.td}>
                      {qty(item.requestedQty)} {item.unit}
                    </td>
                    <td style={styles.td}>
                      {qty(item.qtyInBaseUnit)} {item.productBaseUnit}
                    </td>
                    <td style={styles.td}>{money(item.unitPrice)} / {item.unit}</td>
                    <td style={styles.tdBold}>{money(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #1e293b",
  },
  clientName: {
    color: "#f8fafc",
    fontSize: "1rem",
    margin: 0,
  },
  clientEmail: {
    color: "#94a3b8",
    fontSize: "0.825rem",
    margin: "0.25rem 0 0 0",
  },
  summaryBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "0.25rem",
  },
  status: {
    color: "#38bdf8",
    fontSize: "0.75rem",
    fontWeight: "700",
  },
  total: {
    color: "#f8fafc",
    fontSize: "1rem",
  },
  date: {
    color: "#64748b",
    fontSize: "0.75rem",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "0.85rem 1.5rem",
    color: "#94a3b8",
    fontSize: "0.75rem",
    borderBottom: "1px solid #1e293b",
    textTransform: "uppercase",
  },
  td: {
    padding: "1rem 1.5rem",
    color: "#cbd5e1",
    fontSize: "0.875rem",
    borderBottom: "1px solid #1e293b",
  },
  tdBold: {
    padding: "1rem 1.5rem",
    color: "#f8fafc",
    fontSize: "0.875rem",
    fontWeight: "700",
    borderBottom: "1px solid #1e293b",
  },
  productName: {
    color: "#f8fafc",
  },
  sku: {
    color: "#64748b",
    fontSize: "0.75rem",
    marginTop: "0.2rem",
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
