import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route"; // Adjust path as needed

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: Request) {
  console.log("Received a request to create a checkout session.");

  try {
    // Verify the user session
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Ensure environment variables exist
    if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_BASE_URL) {
      console.error("Missing required environment variables.");
      return NextResponse.json(
        { error: "Server misconfiguration. Missing environment variables." },
        { status: 500 }
      );
    }

    // Use your one-time price ID
    const priceId = process.env.STRIPE_PRICE_ID || "price_1QwObpJxQLhmtE09Q9FlilsN";

    if (!priceId) {
      console.error("Missing priceId in request or environment.");
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    console.log("Creating Stripe checkout session...");
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      customer_email: session.user?.email || undefined,
    });

    console.log("Checkout session created successfully:", checkoutSession.url);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
