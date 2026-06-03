"use client";

import { useState, useEffect } from "react";
import { getProducts } from "@/app/admin/products/actions";
import { createQuotation, getSellerQuotations } from "./actions";
import { Plus, Trash2 } from "lucide-react";
import { convertQuantity } from "@/utils/units";

export default function SellerQuotesPage() {
  const [quotationsList, setQuotationsList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const list = await getSellerQuotations();
    const prods = await getProducts();
    setQuotationsList(list);
    setProductsList(prods);
  };

  const handleOpenCreate = () => {
    setClientName("");
    setClientEmail("");
    setItems([{ productId: "", requestedQty: "1", unit: "g" }]);
    setError("");
    setModalOpen(true);
  };

  const handleAddItem = () => {
    setItems([...items, { productId: "", requestedQty: "1", unit: "g" }]);
  };

  const handleRemoveItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === "productId") {
      const selectedProduct = productsList.find((p) => p.id === value);
      if (selectedProduct) {
        // Set unit based on dimension
        let unit = "g";
        if (selectedProduct.dimension === "VOLUME") unit = "L";
        if (selectedProduct.dimension === "COUNT") unit = "item";
        updated[index].unit = unit;
      }
    }
    setItems(updated);
  };

  // Safe UI Total Calculation display with 4-decimal precision to match server
  const computeCalculations = () => {
    let grandTotal = 0;
    const computedItems = items.map((item) => {
      const prod = productsList.find((p) => p.id === item.productId);
      if (!prod) return { ...item, lineTotal: 0, unitPrice: 0, conversionMsg: "" };

      let baseQtyForOneUnit = 1;
      if (prod.dimension !== "COUNT") {
        baseQtyForOneUnit = convertQuantity(1, item.unit, prod.baseUnit);
      }

      const pricePerBaseUnit = parseFloat(prod.pricePerBaseUnit);
      const computedUnitPrice = parseFloat((pricePerBaseUnit * baseQtyForOneUnit).toFixed(4));
      const lineTotal = parseFloat((computedUnitPrice * parseFloat(item.requestedQty || 0)).toFixed(4));

      grandTotal += lineTotal;

      return {
        ...item,
        unitPrice: computedUnitPrice,
        lineTotal,
        conversionMsg: `(1 ${item.unit} = ${baseQtyForOneUnit} ${prod.baseUnit})`
      };
    });

    return { computedItems, grandTotal: parseFloat(grandTotal.toFixed(4)) };
  };

  const { computedItems, grandTotal } = computeCalculations();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    const emptyFields = items.some((item) => !item.productId || !item.requestedQty);
    if (emptyFields) {
      setError("Please fill out all product selections and quantities.");
      setLoading(false);
      return;
    }

    const res = await createQuotation({ clientName, clientEmail }, items);
    setLoading(false);

    if (res.success) {
      setModalOpen(false);
      loadData();
    } else {
      setError(res.error || "Failed to create quotation.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Quotation Management</h1>
          <p style={styles.subtitle}>Draft client requests and submit them for review</p>
        </div>
        <button onClick={handleOpenCreate} style={styles.createBtn}>
          <Plus size={16} />
          <span>New Quotation</span>
        </button>
      </div>

      {/* List of Quotations */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Client Name</th>
              <th style={styles.th}>Client Email</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Total Amount</th>
              <th style={styles.th}>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {quotationsList.map((quote) => (
              <tr key={quote.id} style={styles.tr}>
                <td style={styles.tdBold}>{quote.clientName}</td>
                <td style={styles.td}>{quote.clientEmail}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: 
                      quote.status === "APPROVED" ? "rgba(16, 185, 129, 0.15)" : 
                      quote.status === "PENDING_REVIEW" ? "rgba(245, 158, 11, 0.15)" : 
                      "rgba(148, 163, 184, 0.15)",
                    color: 
                      quote.status === "APPROVED" ? "#10b981" : 
                      quote.status === "PENDING_REVIEW" ? "#f59e0b" : 
                      "#cbd5e1"
                  }}>
                    {quote.status}
                  </span>
                </td>
                <td style={styles.tdBold}>₹ {parseFloat(quote.totalAmount).toFixed(2)}</td>
                <td style={styles.td}>{new Date(quote.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {quotationsList.length === 0 && (
              <tr>
                <td colSpan="5" style={styles.emptyText}>No quotations created yet. Click "New Quotation" to start.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Draft Quotation</h2>
              <button onClick={() => setModalOpen(false)} style={styles.closeBtn}>Close</button>
            </div>

            {error && <div style={styles.formError}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Client Name</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    style={styles.input}
                    placeholder="Enter client name"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Client Email</label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    style={styles.input}
                    placeholder="client@company.com"
                  />
                </div>
              </div>

              <div style={styles.itemsHeader}>
                <span style={styles.itemsTitle}>Quotation Line Items</span>
                <button type="button" onClick={handleAddItem} style={styles.addItemBtn}>Add Item</button>
              </div>

              <div style={styles.itemsList}>
                {items.map((item, index) => {
                  const product = productsList.find((p) => p.id === item.productId);
                  return (
                    <div key={index} style={styles.itemRow}>
                      <div style={{ ...styles.formGroup, flex: 2 }}>
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                          required
                          style={styles.select}
                        >
                          <option value="">Select Catalog Product</option>
                          {productsList.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku}) - Base: {p.baseUnit}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ ...styles.formGroup, flex: 1 }}>
                        <input
                          type="number"
                          step="0.00000001"
                          required
                          value={item.requestedQty}
                          onChange={(e) => handleItemChange(index, "requestedQty", e.target.value)}
                          style={styles.input}
                          placeholder="Qty"
                        />
                      </div>

                      <div style={{ ...styles.formGroup, flex: 1 }}>
                        <select
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                          style={styles.select}
                        >
                          {product?.dimension === "WEIGHT" && (
                            <>
                              <option value="g">g</option>
                              <option value="kg">kg</option>
                            </>
                          )}
                          {product?.dimension === "VOLUME" && (
                            <>
                              <option value="L">L</option>
                              <option value="mL">mL</option>
                            </>
                          )}
                          {(!product || product?.dimension === "COUNT") && (
                            <option value="item">item</option>
                          )}
                        </select>
                      </div>

                      {/* Display price conversion calculation inside the line for auditing transparency */}
                      <div style={styles.lineCalculation}>
                        <div style={styles.calcValue}>₹ {computedItems[index].lineTotal.toFixed(2)}</div>
                        <div style={styles.calcMsg}>{computedItems[index].conversionMsg}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        style={styles.removeBtn}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div style={styles.footerSummary}>
                <div style={styles.totalLabel}>Grand Total (INR)</div>
                <div style={styles.totalValue}>₹ {grandTotal.toFixed(2)}</div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Submitting Request..." : "Submit Quotation Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: "800",
    color: "#f8fafc",
    margin: 0,
    letterSpacing: "-0.025em",
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#94a3b8",
    margin: "0.25rem 0 0 0",
  },
  createBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "0.6rem 1.2rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  tableWrapper: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #1e293b",
    color: "#94a3b8",
    fontSize: "0.75rem",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  tr: {
    borderBottom: "1px solid #1e293b",
  },
  td: {
    padding: "1.2rem 1.5rem",
    fontSize: "0.875rem",
    color: "#cbd5e1",
  },
  tdBold: {
    padding: "1.2rem 1.5rem",
    fontSize: "0.875rem",
    color: "#f8fafc",
    fontWeight: "600",
  },
  statusBadge: {
    fontSize: "0.75rem",
    fontWeight: "700",
    padding: "0.25rem 0.6rem",
    borderRadius: "6px",
    textTransform: "uppercase",
  },
  emptyText: {
    padding: "3rem",
    textAlign: "center",
    color: "#64748b",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  modalCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "800px",
    padding: "2rem",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "1rem",
  },
  modalTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#f8fafc",
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#94a3b8",
    padding: "0.4rem 0.8rem",
    cursor: "pointer",
    fontSize: "0.875rem",
  },
  formError: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "8px",
    color: "#fca5a5",
    padding: "0.75rem",
    fontSize: "0.875rem",
    marginBottom: "1.5rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  formRow: {
    display: "flex",
    gap: "1rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    flex: 1,
  },
  label: {
    fontSize: "0.875rem",
    color: "#e2e8f0",
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    color: "#f8fafc",
    padding: "0.6rem 0.8rem",
    fontSize: "0.875rem",
    outline: "none",
  },
  select: {
    backgroundColor: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    color: "#f8fafc",
    padding: "0.6rem 0.8rem",
    fontSize: "0.875rem",
    outline: "none",
  },
  itemsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #1e293b",
    paddingTop: "1.5rem",
  },
  itemsTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#f8fafc",
  },
  addItemBtn: {
    backgroundColor: "transparent",
    border: "1px dashed #0284c7",
    color: "#38bdf8",
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    fontSize: "0.875rem",
    cursor: "pointer",
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  itemRow: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    backgroundColor: "#0b0f19",
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #1e293b",
  },
  lineCalculation: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    minWidth: "120px",
  },
  calcValue: {
    fontSize: "0.875rem",
    fontWeight: "700",
    color: "#38bdf8",
  },
  calcMsg: {
    fontSize: "0.7rem",
    color: "#64748b",
  },
  removeBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    padding: "0.25rem",
    ":hover": {
      color: "#ef4444",
    },
  },
  footerSummary: {
    borderTop: "1px solid #1e293b",
    paddingTop: "1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#94a3b8",
  },
  totalValue: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#38bdf8",
  },
  submitBtn: {
    backgroundColor: "#0284c7",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "0.8rem",
    fontSize: "0.875rem",
    fontWeight: "700",
    cursor: "pointer",
  },
};
