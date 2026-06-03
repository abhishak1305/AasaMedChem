"use server";

import { getServerSession } from "next-auth";
import { eq, desc } from "drizzle-orm";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";

async function readOrdersWithItems(sellerId) {
  // Use JOIN to fetch orders with items in single query, avoiding N+1
  const result = sellerId
    ? await db
        .select({
          orderId: orders.id,
          orderQuotationId: orders.quotationId,
          orderSellerId: orders.sellerId,
          orderClientName: orders.clientName,
          orderClientEmail: orders.clientEmail,
          orderStatus: orders.status,
          orderTotalAmount: orders.totalAmount,
          orderCreatedAt: orders.createdAt,
          orderUpdatedAt: orders.updatedAt,
          itemId: orderItems.id,
          itemProductName: products.name,
          itemProductSku: products.sku,
          itemRequestedQty: orderItems.requestedQty,
          itemUnit: orderItems.unit,
          itemQtyInBaseUnit: orderItems.qtyInBaseUnit,
          itemProductBaseUnit: products.baseUnit,
          itemUnitPrice: orderItems.unitPrice,
          itemTotalPrice: orderItems.totalPrice,
        })
        .from(orders)
        .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orders.sellerId, sellerId))
        .orderBy(desc(orders.createdAt))
    : await db
        .select({
          orderId: orders.id,
          orderQuotationId: orders.quotationId,
          orderSellerId: orders.sellerId,
          orderClientName: orders.clientName,
          orderClientEmail: orders.clientEmail,
          orderStatus: orders.status,
          orderTotalAmount: orders.totalAmount,
          orderCreatedAt: orders.createdAt,
          orderUpdatedAt: orders.updatedAt,
          itemId: orderItems.id,
          itemProductName: products.name,
          itemProductSku: products.sku,
          itemRequestedQty: orderItems.requestedQty,
          itemUnit: orderItems.unit,
          itemQtyInBaseUnit: orderItems.qtyInBaseUnit,
          itemProductBaseUnit: products.baseUnit,
          itemUnitPrice: orderItems.unitPrice,
          itemTotalPrice: orderItems.totalPrice,
        })
        .from(orders)
        .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
        .leftJoin(products, eq(orderItems.productId, products.id))
        .orderBy(desc(orders.createdAt));

  // Transform flat result into nested structure
  const ordersMap = new Map();
  
  for (const row of result) {
    const orderId = row.orderId;
    
    if (!ordersMap.has(orderId)) {
      ordersMap.set(orderId, {
        id: orderId,
        quotationId: row.orderQuotationId,
        sellerId: row.orderSellerId,
        clientName: row.orderClientName,
        clientEmail: row.orderClientEmail,
        status: row.orderStatus,
        totalAmount: row.orderTotalAmount,
        createdAt: row.orderCreatedAt,
        updatedAt: row.orderUpdatedAt,
        items: []
      });
    }
    
    if (row.itemId) {
      ordersMap.get(orderId).items.push({
        id: row.itemId,
        productName: row.itemProductName,
        productSku: row.itemProductSku,
        requestedQty: row.itemRequestedQty,
        unit: row.itemUnit,
        qtyInBaseUnit: row.itemQtyInBaseUnit,
        productBaseUnit: row.itemProductBaseUnit,
        unitPrice: row.itemUnitPrice,
        totalPrice: row.itemTotalPrice,
      });
    }
  }

  return Array.from(ordersMap.values());
}

export async function getAdminOrders() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    return [];
  }

  return readOrdersWithItems();
}

export async function getSellerOrders() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return [];
  }

  return readOrdersWithItems(session.user.id);
}
