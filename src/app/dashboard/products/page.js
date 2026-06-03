"use client";

import { useState, useEffect } from "react";
import { getProducts } from "@/app/admin/products/actions";
import { Search, Filter, AlertTriangle } from "lucide-react";

export default function SellerProductsPage() {
  const [productsList, setProductsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dimensionFilter, setDimensionFilter] = useState("ALL");

  const loadProducts = async () => {
    const list = await getProducts();
    setProductsList(list);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts();
  }, []);

  const filteredProducts = productsList.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDimension = 
      dimensionFilter === "ALL" || product.dimension === dimensionFilter;

    return matchesSearch && matchesDimension;
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Chemical & Lab Catalog</h1>
          <p style={styles.subtitle}>Browse real-time available stock levels and bulk pricing structures</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.searchGroup}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by SKU or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterGroup}>
          <Filter size={16} color="#94a3b8" />
          <select
            value={dimensionFilter}
            onChange={(e) => setDimensionFilter(e.target.value)}
            style={styles.select}
          >
            <option value="ALL">All Dimensions</option>
            <option value="WEIGHT">Weight (Mass)</option>
            <option value="VOLUME">Volume (Liquid)</option>
            <option value="COUNT">Count (Discrete)</option>
          </select>
        </div>
      </div>

      {/* Grid of Catalog Cards */}
      <div style={styles.grid}>
        {filteredProducts.map((product) => {
          const isLowStock = parseFloat(product.stockQty) <= parseFloat(product.minStockAlert);
          return (
            <div key={product.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.skuBadge}>{product.sku}</span>
                <span style={styles.dimensionBadge}>{product.dimension}</span>
              </div>
              <h3 style={styles.productName}>{product.name}</h3>
              <p style={styles.productDesc}>{product.description || "No catalog details provided."}</p>
              
              <div style={styles.metaRow}>
                <div style={styles.metaCol}>
                  <div style={styles.metaLabel}>Price / Base Unit</div>
                  <div style={styles.metaValue}>₹ {parseFloat(product.pricePerBaseUnit).toFixed(2)} <span style={styles.unitText}>/ {product.baseUnit}</span></div>
                </div>

                <div style={styles.metaCol}>
                  <div style={styles.metaLabel}>Current Stock</div>
                  <div style={{
                    ...styles.metaValue,
                    color: isLowStock ? "#f59e0b" : "#f8fafc"
                  }}>
                    {isLowStock && <AlertTriangle size={14} style={{ marginRight: "0.25rem" }} />}
                    {parseFloat(product.stockQty)} {product.baseUnit}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredProducts.length === 0 && (
          <div style={styles.emptyCard}>
            No catalog items found matching your filters.
          </div>
        )}
      </div>
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
  toolbar: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  searchGroup: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "0 0.75rem",
    flex: 1,
    minWidth: "260px",
  },
  searchIcon: {
    color: "#475569",
    marginRight: "0.5rem",
  },
  searchInput: {
    backgroundColor: "transparent",
    border: "none",
    color: "#f8fafc",
    padding: "0.6rem 0",
    fontSize: "0.875rem",
    outline: "none",
    width: "100%",
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "0 0.75rem",
  },
  select: {
    backgroundColor: "transparent",
    border: "none",
    color: "#cbd5e1",
    fontSize: "0.875rem",
    outline: "none",
    padding: "0.6rem 0",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skuBadge: {
    fontSize: "0.75rem",
    fontFamily: "var(--font-geist-mono)",
    color: "#38bdf8",
    fontWeight: "700",
  },
  dimensionBadge: {
    fontSize: "0.7rem",
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    color: "#94a3b8",
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  productName: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#f8fafc",
    margin: 0,
  },
  productDesc: {
    fontSize: "0.8rem",
    color: "#94a3b8",
    lineHeight: "1.4",
    margin: 0,
    minHeight: "40px",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid #1e293b",
    paddingTop: "1rem",
    marginTop: "auto",
  },
  metaCol: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  metaLabel: {
    fontSize: "0.7rem",
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  metaValue: {
    fontSize: "0.875rem",
    fontWeight: "700",
    color: "#f8fafc",
    display: "flex",
    alignItems: "center",
  },
  unitText: {
    fontSize: "0.75rem",
    color: "#64748b",
    fontWeight: "normal",
  },
  emptyCard: {
    gridColumn: "1 / -1",
    padding: "3rem",
    textAlign: "center",
    backgroundColor: "#0f172a",
    border: "1px dashed #1e293b",
    borderRadius: "12px",
    color: "#64748b",
  },
};
