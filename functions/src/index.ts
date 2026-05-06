import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import Stripe from "stripe";

initializeApp();
const db = getFirestore();

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new HttpsError("failed-precondition", "STRIPE_SECRET_KEY not set");
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

/**
 * Creates a Stripe Checkout Session for a booking and returns the URL.
 * Called from the client when a buyer is ready to pay an accepted booking.
 *
 * Note: in the demo emulator flow we mark the booking paid client-side because
 * Stripe webhooks aren't wired in local emulator mode. In production, the webhook
 * below is the source of truth.
 */
export const createCheckoutSession = onCall(async (req) => {
  const { bookingId, returnUrl } = req.data ?? {};
  if (!req.auth) throw new HttpsError("unauthenticated", "Sign in required");
  if (!bookingId) throw new HttpsError("invalid-argument", "bookingId required");

  const snap = await db.doc(`bookings/${bookingId}`).get();
  if (!snap.exists) throw new HttpsError("not-found", "Booking not found");
  const b = snap.data() as any;
  if (b.buyerId !== req.auth.uid) throw new HttpsError("permission-denied", "Not your booking");
  if (b.status !== "accepted") throw new HttpsError("failed-precondition", "Booking not accepted yet");

  const stripe = stripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "usd",
        product_data: { name: b.listingTitle, description: `LocalLoop booking ${bookingId}` },
        unit_amount: b.totalCents,
      },
    }],
    metadata: { bookingId },
    success_url: `${returnUrl || ""}/checkout/success?booking=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnUrl || ""}/bookings/${bookingId}`,
  });
  return { url: session.url };
});

/** Stripe webhook — only used in deployed environments. */
export const stripeWebhook = onRequest({ cors: false }, async (req, res) => {
  const sig = req.headers["stripe-signature"] as string | undefined;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) { res.status(400).send("Missing signature"); return; }
  const stripe = stripeClient();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent((req as any).rawBody, sig, secret);
  } catch (err: any) {
    res.status(400).send(`Webhook error: ${err.message}`);
    return;
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    if (bookingId) {
      await db.doc(`bookings/${bookingId}`).update({ status: "paid", paidAt: Date.now() });
    }
  }
  res.json({ received: true });
});

/**
 * Promotes the calling user to admin if they used the configured admin email.
 * Used once during setup so Alex can access the admin panel from a real account.
 */
export const claimAdmin = onCall(async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const allowed = (process.env.ADMIN_EMAILS ?? "admin@localloop.dev").split(",").map((s) => s.trim());
  const email = req.auth.token.email;
  if (!email || !allowed.includes(email)) throw new HttpsError("permission-denied", "Not allowed");
  await db.doc(`users/${req.auth.uid}`).update({ role: "admin" });
  return { ok: true };
});
