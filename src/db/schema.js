import { pgTable, uuid, varchar, numeric, pgEnum, timestamp } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "SELLER"]);
export const unitDimensionEnum = pgEnum("unit_dimension", ["WEIGHT", "VOLUME", "COUNT"]);
export const unitTypeEnum = pgEnum("unit_type", ["g", "kg", "L", "mL", "item"]);
export const quoteStatusEnum = pgEnum("quote_status", ["DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED", "CONVERTED"]);
export const orderStatusEnum = pgEnum("order_status", ["PENDING_PAYMENT", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: userRoleEnum("role").default("SELLER").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  sku: varchar("sku", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  dimension: unitDimensionEnum("dimension").notNull(),
  baseUnit: unitTypeEnum("base_unit").notNull(),
  pricePerBaseUnit: numeric("price_per_base_unit", { precision: 20, scale: 4 }).notNull(),
  stockQty: numeric("stock_qty", { precision: 20, scale: 8 }).default("0.0").notNull(),
  minStockAlert: numeric("min_stock_alert", { precision: 20, scale: 8 }).default("0.0").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const quotations = pgTable("quotations", {
  id: uuid("id").defaultRandom().primaryKey(),
  sellerId: uuid("seller_id").references(() => users.id, { onDelete: "restrict" }).notNull(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientEmail: varchar("client_email", { length: 255 }).notNull(),
  status: quoteStatusEnum("status").default("DRAFT").notNull(),
  totalAmount: numeric("total_amount", { precision: 20, scale: 4 }).default("0.0").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const quotationItems = pgTable("quotation_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  quotationId: uuid("quotation_id").references(() => quotations.id, { onDelete: "cascade" }).notNull(),
  productId: uuid("product_id").references(() => products.id, { onDelete: "restrict" }).notNull(),
  requestedQty: numeric("requested_qty", { precision: 20, scale: 8 }).notNull(),
  unit: unitTypeEnum("unit").notNull(),
  qtyInBaseUnit: numeric("qty_in_base_unit", { precision: 20, scale: 8 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 20, scale: 4 }).notNull(),
  totalPrice: numeric("total_price", { precision: 20, scale: 4 }).notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  quotationId: uuid("quotation_id").references(() => quotations.id, { onDelete: "set null" }),
  sellerId: uuid("seller_id").references(() => users.id, { onDelete: "restrict" }).notNull(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientEmail: varchar("client_email", { length: 255 }).notNull(),
  status: orderStatusEnum("status").default("PENDING_PAYMENT").notNull(),
  totalAmount: numeric("total_amount", { precision: 20, scale: 4 }).default("0.0").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  productId: uuid("product_id").references(() => products.id, { onDelete: "restrict" }).notNull(),
  requestedQty: numeric("requested_qty", { precision: 20, scale: 8 }).notNull(),
  unit: unitTypeEnum("unit").notNull(),
  qtyInBaseUnit: numeric("qty_in_base_unit", { precision: 20, scale: 8 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 20, scale: 4 }).notNull(),
  totalPrice: numeric("total_price", { precision: 20, scale: 4 }).notNull(),
});
