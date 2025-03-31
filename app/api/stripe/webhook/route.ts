// app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

// This is your Stripe webhook secret for testing your endpoint locally
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
    }

    // Store the event in the database for logging purposes
    await prisma.stripeEvent.create({
      data: {
        id: event.id,
        type: event.type,
        object: event.object,
        data: event.data as any,
      },
    });

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Make sure this is a payment for a subscription
        if (session.mode === "payment" && session.payment_status === "paid") {
          const userId = session.metadata?.userId;
          if (!userId) {
            console.error("No userId found in session metadata");
            return NextResponse.json({ error: "No userId found" }, { status: 400 });
          }

          // Retrieve payment intent to get payment details
          const paymentIntent = await stripe.paymentIntents.retrieve(
            session.payment_intent as string
          );

          // Update or create subscription record
          await prisma.subscription.upsert({
            where: { userId },
            update: {
              stripeCustomerId: session.customer as string,
              stripePriceId: session.line_items?.data[0]?.price?.id || '',
              status: "active",
              // For one-time purchases, set an expiration date (e.g., 1 year from now)
              currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
            create: {
              userId,
              stripeCustomerId: session.customer as string,
              stripePriceId: session.line_items?.data[0]?.price?.id || '',
              status: "active",
              currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          });
        }
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Stripe requires the raw body to construct the event
export const config = {
  api: {
    bodyParser: false,
  },
};