/**
 * Database index improvements for Invoice model.
 * These indexes optimize payment queries and reporting.
 */

import Invoice from "../models/Invoice";

export const ensureInvoiceIndexes = async (): Promise<void> => {
  try {
    // Composite index for user invoices lookup
    await Invoice.collection.createIndex({ user: 1, status: 1, createdAt: -1 });
    
    // Index for payment reference verification (unique constraint)
    await Invoice.collection.createIndex({ paymentReference: 1 }, { sparse: true });
    
    // Index for invoice number lookup
    await Invoice.collection.createIndex({ invoiceNumber: 1 });
    
    // Index for organization-wide invoice queries
    await Invoice.collection.createIndex({ organization: 1, createdAt: -1 }, { sparse: true });
    
    // Index for coupon usage tracking
    await Invoice.collection.createIndex({ couponCode: 1, status: 1 }, { sparse: true });
    
    console.log("✓ Invoice indexes ensured");
  } catch (error) {
    console.warn("ensureInvoiceIndexes: failed to create indexes", error);
    // Non-blocking - indexes are optimizations, not critical for functionality
  }
};
