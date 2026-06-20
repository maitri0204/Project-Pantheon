import { Request, Response } from "express";

import { verifyAndProcessRazorpayWebhook } from "../services/paymentWebhook";

export const handleRazorpayWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signatureHeader = req.headers["x-razorpay-signature"];
    const signature = typeof signatureHeader === "string" ? signatureHeader : undefined;
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body ?? {}));

    await verifyAndProcessRazorpayWebhook(rawBody, signature);
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    const status = message.includes("signature") ? 400 : 500;
    res.status(status).json({ message: status === 400 ? "Invalid webhook signature" : "Webhook processing failed" });
  }
};
