import crypto from "crypto";
import mongoose from "mongoose";
import Razorpay from "razorpay";

import AssessmentPaymentSession from "../models/AssessmentPaymentSession";
import Invoice from "../models/Invoice";
import InvoiceCounter from "../models/InvoiceCounter";
import Organization from "../models/Organization";
import ReviewerPayment from "../models/ReviewerPayment";

const getFinancialYear = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const startYear = month >= 3 ? year : year - 1;
  const endYearShort = String((startYear + 1) % 100).padStart(2, "0");
  return `${startYear}-${endYearShort}`;
};

const getCompanyPrefix = (companyName: string): string => {
  const normalized = (companyName || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (normalized.length >= 4) {
    return normalized.slice(0, 4);
  }
  return "COMP";
};

const generateInvoiceNumber = async (organizationId: mongoose.Types.ObjectId | string): Promise<string> => {
  const org = await Organization.findById(organizationId).select("name branding.companyName");
  const companyName = org?.branding?.companyName || org?.name || "COMPANY";
  const prefix = getCompanyPrefix(companyName);
  const financialYear = getFinancialYear();

  const counter = await InvoiceCounter.findOneAndUpdate(
    { organization: organizationId, financialYear },
    { $inc: { counter: 1 } },
    { new: true, upsert: true },
  );

  if (!counter) {
    throw new Error("Unable to generate invoice number.");
  }

  const padded = String(counter.counter).padStart(6, "0");
  return `${prefix}/AS${padded}/${financialYear}`;
};

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return null;
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

const verifyWebhookSignature = (rawBody: Buffer, signature: string, secret: string): boolean => {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
};

const finalizeAssessmentPaymentSession = async (args: {
  orderId: string;
  paymentId: string;
}): Promise<boolean> => {
  const session = await AssessmentPaymentSession.findOne({
    razorpayOrderId: args.orderId,
    status: { $nin: ["PAID", "CONSUMED"] },
  });

  if (!session) {
    return false;
  }

  const razorpay = getRazorpayClient();
  if (razorpay) {
    const payment = await razorpay.payments.fetch(args.paymentId);
    const expectedAmount = Math.round(Number(session.finalAmount || 0) * 100);
    const paidAmount = Number(payment.amount || 0);
    const paymentStatus = String(payment.status || "").toLowerCase();
    if (
      String(payment.order_id || "") !== args.orderId
      || paidAmount !== expectedAmount
      || (paymentStatus !== "captured" && paymentStatus !== "authorized")
    ) {
      session.status = "FAILED";
      await session.save();
      return false;
    }
  }

  const claimedSession = await AssessmentPaymentSession.findOneAndUpdate(
    {
      _id: session._id,
      status: { $nin: ["PAID", "CONSUMED"] },
      $or: [{ invoice: { $exists: false } }, { invoice: null }],
    },
    {
      $set: {
        status: "PAID",
        razorpayPaymentId: args.paymentId,
      },
    },
    { new: true },
  );

  if (!claimedSession) {
    return true;
  }

  try {
    const invoice = await Invoice.create({
      invoiceNumber: await generateInvoiceNumber(claimedSession.organization),
      user: claimedSession.user,
      organization: claimedSession.organization,
      assessmentCode: claimedSession.assessmentCode,
      amount: claimedSession.amount,
      discountAmount: claimedSession.discountAmount,
      gstAmount: claimedSession.gstAmount,
      finalAmount: claimedSession.finalAmount,
      currency: claimedSession.currency,
      couponCode: claimedSession.couponCode,
      paymentMethod: "RAZORPAY",
      paymentReference: args.paymentId,
      status: "PAID",
    });

    claimedSession.invoice = invoice._id;
    await claimedSession.save();
  } catch (error) {
    await AssessmentPaymentSession.updateOne(
      { _id: claimedSession._id, status: "PAID" },
      {
        $set: { status: "CREATED" },
        $unset: { razorpayPaymentId: "" },
      },
    );
    throw error;
  }

  return true;
};

const finalizeReviewerPayment = async (args: {
  orderId: string;
  paymentId: string;
}): Promise<boolean> => {
  const pendingPayment = await ReviewerPayment.findOne({
    razorpayOrderId: args.orderId,
    status: { $ne: "PAID" },
  });

  if (!pendingPayment) {
    return false;
  }

  const razorpay = getRazorpayClient();
  if (razorpay) {
    const payment = await razorpay.payments.fetch(args.paymentId);
    const expectedAmount = Math.round(Number(pendingPayment.amount || 0) * 100);
    const paidAmount = Number(payment.amount || 0);
    const paymentStatus = String(payment.status || "").toLowerCase();
    if (
      String(payment.order_id || "") !== args.orderId
      || paidAmount !== expectedAmount
      || (paymentStatus !== "captured" && paymentStatus !== "authorized")
    ) {
      pendingPayment.status = "FAILED";
      await pendingPayment.save();
      return false;
    }
  }

  await ReviewerPayment.findOneAndUpdate(
    {
      _id: pendingPayment._id,
      status: { $ne: "PAID" },
    },
    {
      $set: {
        status: "PAID",
        razorpayPaymentId: args.paymentId,
        verifiedAt: new Date(),
      },
    },
  );

  return true;
};

export const processRazorpayWebhookPayload = async (payload: {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
      };
    };
  };
}): Promise<void> => {
  const event = String(payload.event || "");
  if (event !== "payment.captured" && event !== "payment.authorized") {
    return;
  }

  const paymentEntity = payload.payload?.payment?.entity;
  const paymentId = paymentEntity?.id;
  const orderId = paymentEntity?.order_id;
  if (!paymentId || !orderId) {
    return;
  }

  await finalizeAssessmentPaymentSession({ orderId, paymentId });
  await finalizeReviewerPayment({ orderId, paymentId });
};

export const verifyAndProcessRazorpayWebhook = async (
  rawBody: Buffer,
  signature: string | undefined,
): Promise<void> => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!webhookSecret) {
    throw new Error("Webhook secret is not configured");
  }

  if (!signature || !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
    throw new Error("Invalid webhook signature");
  }

  const payload = JSON.parse(rawBody.toString("utf8")) as Parameters<typeof processRazorpayWebhookPayload>[0];
  await processRazorpayWebhookPayload(payload);
};
