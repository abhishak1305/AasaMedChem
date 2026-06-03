"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    throw new Error("Admin access required");
  }
}

export async function getProducts() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return [];
    }

    return await db.select().from(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function createProduct(data) {
  try {
    await requireAdmin();

    const { sku, name, description, dimension, baseUnit, pricePerBaseUnit, stockQty, minStockAlert } = data;

    // Validate required fields
    if (!sku || !name || !dimension || !baseUnit || pricePerBaseUnit === "" || pricePerBaseUnit == null) {
      throw new Error("Missing required fields");
    }

    // Validate numeric values
    const price = parseFloat(pricePerBaseUnit);
    const stock = parseFloat(stockQty || 0);
    const alert = parseFloat(minStockAlert || 0);

    if (!Number.isFinite(price) || price < 0) {
      throw new Error("Price must be a non-negative number");
    }
    if (!Number.isFinite(stock) || stock < 0) {
      throw new Error("Stock quantity must be a non-negative number");
    }
    if (!Number.isFinite(alert) || alert < 0) {
      throw new Error("Alert threshold must be a non-negative number");
    }

    // Validate dimension-unit pairing
    if (dimension === "WEIGHT" && !["g", "kg"].includes(baseUnit)) {
      throw new Error("Weight dimension must use g or kg");
    }
    if (dimension === "VOLUME" && !["L", "mL"].includes(baseUnit)) {
      throw new Error("Volume dimension must use L or mL");
    }
    if (dimension === "COUNT" && baseUnit !== "item") {
      throw new Error("Count dimension must use item");
    }

    // Trim whitespace from string fields
    const trimmedSku = sku.trim();
    const trimmedName = name.trim();

    if (trimmedSku.length === 0 || trimmedName.length === 0) {
      throw new Error("SKU and product name cannot be empty");
    }

    const [newProduct] = await db
      .insert(products)
      .values({
        sku: trimmedSku,
        name: trimmedName,
        description: (description || "").trim(),
        dimension,
        baseUnit,
        pricePerBaseUnit: price.toFixed(4),
        stockQty: stock.toFixed(8),
        minStockAlert: alert.toFixed(8),
      })
      .returning();

    revalidatePath("/admin/products");
    revalidatePath("/dashboard/products");
    return { success: true, product: newProduct };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { success: false, error: error.message };
  }
}

export async function updateProduct(id, data) {
  try {
    await requireAdmin();

    const { sku, name, description, dimension, baseUnit, pricePerBaseUnit, stockQty, minStockAlert } = data;

    // Validate numeric values
    const price = parseFloat(pricePerBaseUnit);
    const stock = parseFloat(stockQty || 0);
    const alert = parseFloat(minStockAlert || 0);

    if (!Number.isFinite(price) || price < 0) {
      throw new Error("Price must be a non-negative number");
    }
    if (!Number.isFinite(stock) || stock < 0) {
      throw new Error("Stock quantity must be a non-negative number");
    }
    if (!Number.isFinite(alert) || alert < 0) {
      throw new Error("Alert threshold must be a non-negative number");
    }

    // Validate dimension-unit pairing
    if (dimension === "WEIGHT" && !["g", "kg"].includes(baseUnit)) {
      throw new Error("Weight dimension must use g or kg");
    }
    if (dimension === "VOLUME" && !["L", "mL"].includes(baseUnit)) {
      throw new Error("Volume dimension must use L or mL");
    }
    if (dimension === "COUNT" && baseUnit !== "item") {
      throw new Error("Count dimension must use item");
    }

    const [updatedProduct] = await db
      .update(products)
      .set({
        sku: sku.trim(),
        name: name.trim(),
        description: (description || "").trim(),
        dimension,
        baseUnit,
        pricePerBaseUnit: price.toFixed(4),
        stockQty: stock.toFixed(8),
        minStockAlert: alert.toFixed(8),
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    revalidatePath("/admin/products");
    revalidatePath("/dashboard/products");
    return { success: true, product: updatedProduct };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(id) {
  try {
    await requireAdmin();

    await db.delete(products).where(eq(products.id, id));
    revalidatePath("/admin/products");
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, error: error.message };
  }
}
