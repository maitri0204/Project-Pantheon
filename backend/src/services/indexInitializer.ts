/**
 * Database index improvements for Invoice model.
 * These indexes optimize payment queries and reporting.
 */

import Invoice from "../models/Invoice";

export const ensureInvoiceIndexes = async (): Promise<void> => {
  try {
    const existing = await Invoice.collection.indexes();

    const hasIndex = (keyObj: object) => existing.some((ix) => JSON.stringify(ix.key) === JSON.stringify(keyObj));

    // Composite index for user invoices lookup
    if (!hasIndex({ user: 1, status: 1, createdAt: -1 })) {
      await Invoice.collection.createIndex({ user: 1, status: 1, createdAt: -1 });
    }

    // Index for payment reference verification (sparse)
    if (!hasIndex({ paymentReference: 1 })) {
      await Invoice.collection.createIndex({ paymentReference: 1 }, { sparse: true });
    }

    // Index for invoice number lookup
    if (!hasIndex({ invoiceNumber: 1 })) {
      await Invoice.collection.createIndex({ invoiceNumber: 1 });
    }

    // Index for organization-wide invoice queries
    if (!hasIndex({ organization: 1, createdAt: -1 })) {
      await Invoice.collection.createIndex({ organization: 1, createdAt: -1 }, { sparse: true });
    }

    // Index for coupon usage tracking
    if (!hasIndex({ couponCode: 1, status: 1 })) {
      await Invoice.collection.createIndex({ couponCode: 1, status: 1 }, { sparse: true });
    }

    console.log("✓ Invoice indexes ensured");
  } catch (error) {
    console.warn("ensureInvoiceIndexes: failed to create indexes", error);
    // Non-blocking - indexes are optimizations, not critical for functionality
  }
};
