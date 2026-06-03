"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import { quotations, quotationItems, products, orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    throw new Error("Admin access required");
  }
}

export async function getAllQuotations() {
  try {
    await requireAdmin();

    return await db.select().from(quotations);
  } catch (error) {
    console.error("Failed to fetch all quotations:", error);
    return [];
  }
}

async function readQuotationDetails(id) {
  const [quote] = await db.select().from(quotations).where(eq(quotations.id, id)).limit(1);
  if (!quote) return null;

  const items = await db
    .select({
      id: quotationItems.id,
      productId: quotationItems.productId,
      requestedQty: quotationItems.requestedQty,
      unit: quotationItems.unit,
      qtyInBaseUnit: quotationItems.qtyInBaseUnit,
      unitPrice: quotationItems.unitPrice,
      totalPrice: quotationItems.totalPrice,
      productName: products.name,
      productSku: products.sku,
      productBaseUnit: products.baseUnit,
      productBasePrice: products.pricePerBaseUnit,
      productStock: products.stockQty
    })
    .from(quotationItems)
    .leftJoin(products, eq(quotationItems.productId, products.id))
    .where(eq(quotationItems.quotationId, id));

  return { quote, items };
}

export async function getQuotationDetails(id) {
  try {
    await requireAdmin();

    return await readQuotationDetails(id);
  } catch (error) {
    console.error("Failed to fetch quotation details:", error);
    return null;
  }
}

export async function updateQuotationStatus(id, newStatus) {
  try {
    await requireAdmin();

    const [updatedQuote] = await db
      .update(quotations)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(quotations.id, id))
      .returning();

    revalidatePath("/admin/quotes");
    revalidatePath("/dashboard/quotes");
    return { success: true, quotation: updatedQuote };
  } catch (error) {
    console.error("Failed to update status:", error);
    return { success: false, error: error.message };
  }
}

// Convert Approved Quote to Fulfillment Order & Deduct Inventory Stock
// Validates all stock BEFORE any changes to prevent partial operations
export async function convertQuoteToOrder(quoteId) {
  try {
    await requireAdmin();

    const details = await readQuotationDetails(quoteId);
    if (!details) {
      throw new Error("Quotation not found");
    }

    if (details.quote.status !== "APPROVED") {
      throw new Error("Only APPROVED quotations can be converted to orders.");
    }

    // CRITICAL: Validate ALL stock BEFORE any database changes
    for (const item of details.items) {
      const stock = parseFloat(item.productStock);
      const needed = parseFloat(item.qtyInBaseUnit);
      if (stock < needed) {
        throw new Error(`Insufficient stock for product ${item.productName}. Required: ${needed} ${item.productBaseUnit}, Available: ${stock} ${item.productBaseUnit}`);
      }
    }

    // Create order
    const [insertedOrder] = await db
      .insert(orders)
      .values({
        quotationId: details.quote.id,
        sellerId: details.quote.sellerId,
        clientName: details.quote.clientName,
        clientEmail: details.quote.clientEmail,
        status: "PROCESSING",
        totalAmount: details.quote.totalAmount,
      })
      .returning();

    // Insert all order items first (non-destructive)
    for (const item of details.items) {
      await db.insert(orderItems).values({
        orderId: insertedOrder.id,
        productId: item.productId,
        requestedQty: item.requestedQty,
        unit: item.unit,
        qtyInBaseUnit: item.qtyInBaseUnit,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      });
    }

    // Deduct inventory (final destructive step)
    for (const item of details.items) {
      const newStock = (parseFloat(item.productStock) - parseFloat(item.qtyInBaseUnit)).toFixed(8);
      await db
        .update(products)
        .set({ stockQty: newStock, updatedAt: new Date() })
        .where(eq(products.id, item.productId));
    }

    // Mark quote as converted
    await db
      .update(quotations)
      .set({ status: "CONVERTED", updatedAt: new Date() })
      .where(eq(quotations.id, quoteId));

    revalidatePath("/admin/quotes");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/products");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/quotes");
    revalidatePath("/dashboard/orders");
    return { success: true, order: insertedOrder };
  } catch (error) {
    console.error("Conversion failed:", error);
    return { success: false, error: error.message };
  }
}
