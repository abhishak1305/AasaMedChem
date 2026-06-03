"use client";

import { useState, useEffect } from "react";
import { getAllQuotations, getQuotationDetails, updateQuotationStatus, convertQuoteToOrder } from "./actions";
import { ClipboardCheck, FileText, Check, X, ArrowRight, CornerDownRight } from "lucide-react";

export default function AdminQuotesPage() {
  const [quotesList, setQuotesList] = useState([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [quoteDetail, setQuoteDetail] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    const list = await getAllQuotations();
    setQuotesList(list);
  };

  const handleOpenDetail = async (id) => {
    setSelectedQuoteId(id);
    setActionError("");
    setLoading(true);
    const details = await getQuotationDetails(id);
    setQuoteDetail(details);
    setLoading(false);
    setModalOpen(true);
  };

  const handleUpdateStatus = async (status) => {
    setActionError("");
    setLoading(true);
    const res = await updateQuotationStatus(selectedQuoteId, status);
    setLoading(false);
    if (res.success) {
      setModalOpen(false);
      loadQuotes();
    } else {
      setActionError(res.error || "Failed to update quotation state.");
    }
  };

  const handleConvertToOrder = async () => {
    setActionError("");
    setLoading(true);
    const res = await convertQuoteToOrder(selectedQuoteId);
    setLoading(false);
    if (res.success) {
      setModalOpen(false);
      loadQuotes();
    } else {
      setActionError(res.error || "Fulfillment conversion error.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Quotation Approvals Queue</h1>
          <p style={styles.subtitle}>Audit transaction conversion scales, verify balances, and authorize orders</p>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Client</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Total Value</th>
              <th style={styles.th}>Submitted Date</th>
              <th style={styles.th}>Review</th>
            </tr>
          </thead>
          <tbody>
            {quotesList.map((quote) => (
              <tr key={quote.id} style={styles.tr}>
                <td style={styles.tdBold}>{quote.clientName}</td>
                <td style={styles.td}>{quote.clientEmail}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: 
                      quote.status === "APPROVED" ? "rgba(16, 185, 129, 0.15)" : 
                      quote.status === "PENDING_REVIEW" ? "rgba(245, 158, 11, 0.15)" : 
                      quote.status === "CONVERTED" ? "rgba(56, 189, 248, 0.15)" :
                      "rgba(148, 163, 184, 0.15)",
                    color: 
                      quote.status === "APPROVED" ? "#10b981" : 
                      quote.status === "PENDING_REVIEW" ? "#f59e0b" : 
                      quote.status === "CONVERTED" ? "#38bdf8" :
                      "#cbd5e1"
                  }}>
                    {quote.status}
                  </span>
                </td>
                <td style={styles.tdBold}>₹ {parseFloat(quote.totalAmount).toFixed(2)}</td>
                <td style={styles.td}>{new Date(quote.createdAt).toLocaleDateString()}</td>
                <td style={styles.td}>
                  <button onClick={() => handleOpenDetail(quote.id)} style={styles.inspectBtn}>
                    <ClipboardCheck size={14} />
                    <span>Inspect</span>
                  </button>
                </td>
              </tr>
            ))}
            {quotesList.length === 0 && (
              <tr>
                <td colSpan="6" style={styles.emptyText}>No submitted quotations in review queue.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && quoteDetail && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Quotation Audit Sheet</h2>
                <p style={styles.modalSubtitle}>Client: {quoteDetail.quote.clientName} ({quoteDetail.quote.clientEmail})</p>
              </div>
              <button onClick={() => setModalOpen(false)} style={styles.closeBtn}>Close</button>
            </div>

            {actionError && <div style={styles.formError}>{actionError}</div>}

            <div style={styles.detailBody}>
              <h3 style={styles.sectionTitle}>Conversion & Price Auditing</h3>
              
              <div style={styles.itemsList}>
                {quoteDetail.items.map((item) => {
                  const basePrice = parseFloat(item.productBasePrice);
                  const orderedQty = parseFloat(item.requestedQty);
                  const convertedQty = parseFloat(item.qtyInBaseUnit);
                  const unitPrice = parseFloat(item.unitPrice);
                  const totalPrice = parseFloat(item.totalPrice);
                  const stock = parseFloat(item.productStock);

                  return (
                    <div key={item.id} style={styles.auditItem}>
                      <div style={styles.auditItemHeader}>
                        <span style={styles.productName}>{item.productName} ({item.productSku})</span>
                        <span style={styles.lineTotalText}>₹ {totalPrice.toFixed(2)}</span>
                      </div>
                      
                      <div style={styles.auditDetailsGrid}>
                        <div style={styles.auditColumn}>
                          <div style={styles.auditLabel}>Ordered Quantity</div>
                          <div style={styles.auditVal}>{orderedQty} {item.unit}</div>
                        </div>

                        <div style={styles.auditColumn}>
                          <div style={styles.auditLabel}>Conversion Equivalent</div>
                          <div style={styles.auditVal}>
                            <CornerDownRight size={12} style={{ marginRight: "0.25rem" }} />
                            {convertedQty} {item.productBaseUnit}
                          </div>
                        </div>

                        <div style={styles.auditColumn}>
                          <div style={styles.auditLabel}>Unit Rate</div>
                          <div style={styles.auditVal}>₹ {unitPrice.toFixed(2)} / {item.unit}</div>
                          <div style={styles.subtext}>Base price: ₹ {basePrice.toFixed(2)} / {item.productBaseUnit}</div>
                        </div>

                        <div style={styles.auditColumn}>
                          <div style={styles.auditLabel}>Available Stock Check</div>
                          <div style={{
                            ...styles.auditVal,
                            color: stock >= convertedQty ? "#10b981" : "#ef4444"
                          }}>
                            {stock} {item.productBaseUnit} available
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={styles.grandTotalRow}>
                <div>Grand Total (INR)</div>
                <div style={styles.grandTotalValue}>₹ {parseFloat(quoteDetail.quote.totalAmount).toFixed(2)}</div>
              </div>

              {/* Action Buttons */}
              <div style={styles.actionPanel}>
                {quoteDetail.quote.status === "PENDING_REVIEW" && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus("APPROVED")} 
                      disabled={loading}
                      style={styles.approveBtn}
                    >
                      <Check size={16} />
                      <span>Approve Quote</span>
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus("REJECTED")} 
                      disabled={loading}
                      style={styles.rejectBtn}
                    >
                      <X size={16} />
                      <span>Reject Quote</span>
                    </button>
                  </>
                )}

                {quoteDetail.quote.status === "APPROVED" && (
                  <button 
                    onClick={handleConvertToOrder} 
                    disabled={loading}
                    style={styles.convertBtn}
                  >
                    <ArrowRight size={16} />
                    <span>Convert to Dispatch Order</span>
                  </button>
                )}

                {quoteDetail.quote.status === "CONVERTED" && (
                  <div style={styles.infoBadge}>
                    This quotation has been approved, converted, and locked to a live order.
                  </div>
                )}
              </div>
            </div>
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
  inspectBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    color: "#cbd5e1",
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    fontSize: "0.825rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "#0284c7",
      color: "#ffffff",
      borderColor: "#0284c7",
    },
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
    maxWidth: "850px",
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
  modalSubtitle: {
    fontSize: "0.875rem",
    color: "#94a3b8",
    margin: "0.25rem 0 0 0",
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
  detailBody: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  sectionTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#94a3b8",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  auditItem: {
    backgroundColor: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "1.25rem",
  },
  auditItemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    borderBottom: "1px dashed #1e293b",
    paddingBottom: "0.5rem",
  },
  productName: {
    fontWeight: "700",
    color: "#f8fafc",
  },
  lineTotalText: {
    fontWeight: "700",
    color: "#38bdf8",
  },
  auditDetailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "1rem",
  },
  auditColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  auditLabel: {
    fontSize: "0.7rem",
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  auditVal: {
    fontSize: "0.875rem",
    fontWeight: "700",
    color: "#e2e8f0",
    display: "flex",
    alignItems: "center",
  },
  subtext: {
    fontSize: "0.75rem",
    color: "#64748b",
  },
  grandTotalRow: {
    borderTop: "1px solid #1e293b",
    paddingTop: "1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#e2e8f0",
  },
  grandTotalValue: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#38bdf8",
  },
  actionPanel: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
  },
  approveBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "0.75rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: "700",
    cursor: "pointer",
  },
  rejectBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "0.75rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: "700",
    cursor: "pointer",
  },
  convertBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "0.75rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: "700",
    cursor: "pointer",
    width: "100%",
    justifyContent: "center",
  },
  infoBadge: {
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    border: "1px solid rgba(56, 189, 248, 0.2)",
    borderRadius: "8px",
    color: "#38bdf8",
    padding: "0.75rem",
    fontSize: "0.875rem",
    width: "100%",
    textAlign: "center",
  },
};
