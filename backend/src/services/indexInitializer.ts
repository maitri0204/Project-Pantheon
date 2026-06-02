/**
 * Database index improvements for Invoice model.
 * These indexes optimize payment queries and reporting.
 */

import Invoice from "../models/Invoice";
import StudentAssessmentAttempt from "../models/StudentAssessmentAttempt";

const normalizeIndexKey = (keyObj: object) => JSON.stringify(keyObj);

export const ensureStudentAssessmentAttemptIndexes = async (): Promise<void> => {
  try {
    const existing = await StudentAssessmentAttempt.collection.indexes();
    
    // Drop any old unique index on user + assessmentCode (MongoDB doesn't support $ne in partial filters)
    const legacyIndex = existing.find((ix) => ix.name === "user_1_assessmentCode_1");
    if (legacyIndex) {
      await StudentAssessmentAttempt.collection.dropIndex("user_1_assessmentCode_1");
    }

    // Create a non-unique compound index for query performance
    const hasQueryIndex = existing.some((ix) => 
      normalizeIndexKey(ix.key) === normalizeIndexKey({ user: 1, assessmentCode: 1 })
      && !ix.unique
    );

    if (!hasQueryIndex) {
      await StudentAssessmentAttempt.collection.createIndex(
        { user: 1, assessmentCode: 1 },
        { background: true }
      );
    }

    // Single-attempt enforcement for non-AQ is now handled at application level in startStudentAssessment()
    console.log("✓ StudentAssessmentAttempt indexes ensured");
  } catch (error) {
    console.warn("ensureStudentAssessmentAttemptIndexes: failed to create or update indexes", error);
  }
};

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
