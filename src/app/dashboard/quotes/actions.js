"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import { quotations, quotationItems, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { convertQuantity, UNIT_DIMENSIONS } from "@/utils/units";
import { revalidatePath } from "next/cache";

async function requireLoggedInUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Please sign in first.");
  }

  return session.user;
}

export async function getSellerQuotations() {
  try {
    const user = await requireLoggedInUser();

    return await db
      .select()
      .from(quotations)
      .where(eq(quotations.sellerId, user.id));
  } catch (error) {
    console.error("Failed to fetch seller quotations:", error);
    return [];
  }
}

export async function createQuotation(clientData, items) {
  try {
    const user = await requireLoggedInUser();

    // Validate client data
    const clientName = (clientData.clientName || "").trim();
    const clientEmail = (clientData.clientEmail || "").trim();

    if (!clientName) {
      throw new Error("Client name is required");
    }
    if (!clientEmail) {
      throw new Error("Client email is required");
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      throw new Error("Please enter a valid email address");
    }

    if (!items || items.length === 0) {
      throw new Error("At least one product line item is required.");
    }

    let calculatedGrandTotal = 0;
    const itemsToInsert = [];

    // Process each line item
    for (const item of items) {
      if (!item.productId) {
        throw new Error("All line items must have a product selected");
      }

      const requestedQty = Number(item.requestedQty);

      if (!Number.isFinite(requestedQty) || requestedQty <= 0) {
        throw new Error("Each line item needs a quantity greater than 0.");
      }

      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      if (!product) {
        throw new Error(`Product not found for ID: ${item.productId}`);
      }

      // Check dimensional match
      if (UNIT_DIMENSIONS[item.unit] !== product.dimension) {
        throw new Error(`Dimension mismatch: cannot order unit ${item.unit} for product dimension ${product.dimension}`);
      }

      // Convert requested quantity into product's base unit
      const qtyInBaseUnit = convertQuantity(item.requestedQty, item.unit, product.baseUnit);

      // Perform pricing calculation
      // Price is stored in product table as price per base unit.
      // We first calculate the price of 1 transaction unit:
      const priceOfTransactionUnit = convertQuantity(1, item.unit, product.baseUnit) * parseFloat(product.pricePerBaseUnit);
      
      const lineTotalPrice = requestedQty * priceOfTransactionUnit;
      calculatedGrandTotal += lineTotalPrice;

      itemsToInsert.push({
        productId: product.id,
        requestedQty: item.requestedQty.toString(),
        unit: item.unit,
        qtyInBaseUnit: qtyInBaseUnit.toString(),
        unitPrice: priceOfTransactionUnit.toFixed(4),
        totalPrice: lineTotalPrice.toFixed(4)
      });
    }

    // Insert Quotation transaction
    const [insertedQuote] = await db
      .insert(quotations)
      .values({
        sellerId: user.id,
        clientName: clientData.clientName,
        clientEmail: clientData.clientEmail,
        status: "PENDING_REVIEW",
        totalAmount: calculatedGrandTotal.toFixed(4),
      })
      .returning();

    // Insert line items
    for (const item of itemsToInsert) {
      await db.insert(quotationItems).values({
        quotationId: insertedQuote.id,
        productId: item.productId,
        requestedQty: item.requestedQty,
        unit: item.unit,
        qtyInBaseUnit: item.qtyInBaseUnit,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      });
    }

    revalidatePath("/dashboard/quotes");
    revalidatePath("/admin/quotes");
    return { success: true, quotation: insertedQuote };
  } catch (error) {
    console.error("Failed to create quotation:", error);
    return { success: false, error: error.message };
  }
}
