"use client";

import { useState, useEffect } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "./actions";
import { Plus, Edit2, Trash2, X, AlertTriangle } from "lucide-react";

const INITIAL_FORM = {
  sku: "",
  name: "",
  description: "",
  dimension: "WEIGHT",
  baseUnit: "g",
  pricePerBaseUnit: "",
  stockQty: "",
  minStockAlert: ""
};

export default function AdminProductsPage() {
  const [productsList, setProductsList] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    const list = await getProducts();
    setProductsList(list);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts();
  }, []);

  const handleDimensionChange = (e) => {
    const dimension = e.target.value;
    let baseUnit = "g";
    if (dimension === "VOLUME") baseUnit = "L";
    if (dimension === "COUNT") baseUnit = "item";
    setForm({ ...form, dimension, baseUnit });
  };

  const handleOpenCreate = () => {
    setForm(INITIAL_FORM);
    setIsEditing(false);
    setError("");
    setModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setForm({
      sku: product.sku,
      name: product.name,
      description: product.description || "",
      dimension: product.dimension,
      baseUnit: product.baseUnit,
      pricePerBaseUnit: parseFloat(product.pricePerBaseUnit),
      stockQty: parseFloat(product.stockQty),
      minStockAlert: parseFloat(product.minStockAlert),
    });
    setEditId(product.id);
    setIsEditing(true);
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const priceNum = parseFloat(form.pricePerBaseUnit);
    const stockNum = parseFloat(form.stockQty);
    const alertNum = parseFloat(form.minStockAlert);

    if (isNaN(priceNum) || priceNum < 0) {
      setError("Price per base unit must be a non-negative number.");
      setLoading(false);
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      setError("Stock quantity must be a non-negative number.");
      setLoading(false);
      return;
    }
    if (isNaN(alertNum) || alertNum < 0) {
      setError("Alert threshold must be a non-negative number.");
      setLoading(false);
      return;
    }

    // Dimension unit check
    if (form.dimension === "WEIGHT" && !["g", "kg"].includes(form.baseUnit)) {
      setError("Weight products must use g or kg.");
      setLoading(false);
      return;
    }
    if (form.dimension === "VOLUME" && !["L", "mL"].includes(form.baseUnit)) {
      setError("Volume products must use L or mL.");
      setLoading(false);
      return;
    }
    if (form.dimension === "COUNT" && form.baseUnit !== "item") {
      setError("Count products must use item.");
      setLoading(false);
      return;
    }

    let result;
    if (isEditing) {
      result = await updateProduct(editId, form);
    } else {
      result = await createProduct(form);
    }

    setLoading(false);

    if (result.success) {
      setModalOpen(false);
      loadProducts();
    } else {
      setError(result.error || "An error occurred while saving the product.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const res = await deleteProduct(id);
      if (res.success) {
        loadProducts();
      } else {
        alert(res.error || "Failed to delete product.");
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Inventory Management</h1>
          <p style={styles.subtitle}>Configure products, base metrics, and alert triggers</p>
        </div>
        <button onClick={handleOpenCreate} style={styles.createBtn}>
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Catalog Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>SKU</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Dimension</th>
              <th style={styles.th}>Base Unit</th>
              <th style={styles.th}>Price/Base Unit</th>
              <th style={styles.th}>Available Stock</th>
              <th style={styles.th}>Alert Threshold</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {productsList.map((product) => {
              const isLowStock = parseFloat(product.stockQty) <= parseFloat(product.minStockAlert);
              return (
                <tr key={product.id} style={styles.tr}>
                  <td style={styles.tdSku}>{product.sku}</td>
                  <td style={styles.td}>
                    <div>
                      <div style={styles.productName}>{product.name}</div>
                      <div style={styles.productDesc}>{product.description}</div>
                    </div>
                  </td>
                  <td style={styles.td}>{product.dimension}</td>
                  <td style={styles.td}><span style={styles.unitBadge}>{product.baseUnit}</span></td>
                  <td style={styles.td}>₹ {parseFloat(product.pricePerBaseUnit).toFixed(2)}</td>
                  <td style={{
                    ...styles.td,
                    color: isLowStock ? "#f59e0b" : "#f8fafc",
                    fontWeight: isLowStock ? "bold" : "normal"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      {isLowStock && <AlertTriangle size={14} />}
                      {parseFloat(product.stockQty)}
                    </div>
                  </td>
                  <td style={styles.td}>{parseFloat(product.minStockAlert)}</td>
                  <td style={styles.tdActions}>
                    <button onClick={() => handleOpenEdit(product)} style={styles.editIconBtn}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} style={styles.deleteIconBtn}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {productsList.length === 0 && (
              <tr>
                <td colSpan="8" style={styles.emptyText}>No products configured yet. Click &quot;Add Product&quot; to create one.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal form */}
      {modalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{isEditing ? "Edit Product" : "Add New Product"}</h2>
              <button onClick={() => setModalOpen(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            {error && <div style={styles.formError}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>SKU / ID</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    required
                    disabled={isEditing}
                    style={styles.input}
                    placeholder="CHEM-ETH-99"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Product Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    style={styles.input}
                    placeholder="Ethanol Absolute"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={styles.textarea}
                  placeholder="Chemical details, specifications, purity details..."
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Dimension</label>
                  <select
                    value={form.dimension}
                    onChange={handleDimensionChange}
                    style={styles.select}
                  >
                    <option value="WEIGHT">WEIGHT (g, kg)</option>
                    <option value="VOLUME">VOLUME (L, mL)</option>
                    <option value="COUNT">COUNT (item)</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Base Measurement Unit</label>
                  <select
                    value={form.baseUnit}
                    onChange={(e) => setForm({ ...form, baseUnit: e.target.value })}
                    style={styles.select}
                  >
                    {form.dimension === "WEIGHT" && (
                      <>
                        <option value="g">Grams (g)</option>
                        <option value="kg">Kilograms (kg)</option>
                      </>
                    )}
                    {form.dimension === "VOLUME" && (
                      <>
                        <option value="L">Liters (L)</option>
                        <option value="mL">Milliliters (mL)</option>
                      </>
                    )}
                    {form.dimension === "COUNT" && (
                      <option value="item">Item (Count)</option>
                    )}
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Price per Base Unit (INR)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.pricePerBaseUnit}
                  onChange={(e) => setForm({ ...form, pricePerBaseUnit: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="0.00"
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Stock Quantity</label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={form.stockQty}
                    onChange={(e) => setForm({ ...form, stockQty: e.target.value })}
                    required
                    style={styles.input}
                    placeholder="0"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Min Stock Level Alert</label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={form.minStockAlert}
                    onChange={(e) => setForm({ ...form, minStockAlert: e.target.value })}
                    required
                    style={styles.input}
                    placeholder="0"
                  />
                </div>
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
                {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Product"}
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
    ":last-child": {
      borderBottom: "none",
    },
  },
  td: {
    padding: "1.2rem 1.5rem",
    fontSize: "0.875rem",
    color: "#cbd5e1",
  },
  tdSku: {
    padding: "1.2rem 1.5rem",
    fontSize: "0.875rem",
    fontFamily: "var(--font-geist-mono)",
    color: "#38bdf8",
  },
  productName: {
    fontWeight: "600",
    color: "#f8fafc",
  },
  productDesc: {
    fontSize: "0.75rem",
    color: "#64748b",
    marginTop: "0.25rem",
  },
  unitBadge: {
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    color: "#38bdf8",
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "700",
  },
  tdActions: {
    padding: "1.2rem 1.5rem",
    display: "flex",
    gap: "0.75rem",
  },
  editIconBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    padding: "0.25rem",
    borderRadius: "4px",
    transition: "all 0.2s ease",
    ":hover": {
      color: "#f8fafc",
      backgroundColor: "#1e293b",
    },
  },
  deleteIconBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    padding: "0.25rem",
    borderRadius: "4px",
    transition: "all 0.2s ease",
    ":hover": {
      color: "#ef4444",
      backgroundColor: "rgba(239, 68, 68, 0.1)",
    },
  },
  emptyText: {
    padding: "3rem",
    textAlign: "center",
    color: "#64748b",
    fontSize: "0.875rem",
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
    maxWidth: "580px",
    padding: "2rem",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  modalTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#f8fafc",
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
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
    gap: "1.25rem",
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
  textarea: {
    backgroundColor: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    color: "#f8fafc",
    padding: "0.6rem 0.8rem",
    fontSize: "0.875rem",
    outline: "none",
    minHeight: "80px",
    resize: "vertical",
  },
  submitBtn: {
    backgroundColor: "#0284c7",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "0.75rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    marginTop: "0.5rem",
  },
};
