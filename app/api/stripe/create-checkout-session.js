import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(req) {
  try {
    console.log("🔄 Received request to create checkout session...");

    // Debug: Check environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("❌ STRIPE_SECRET_KEY is missing!");
      return NextResponse.json(
        { error: "Server misconfiguration: Missing Stripe secret key." },
        { status: 500 }
      );
    }
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      console.error("❌ NEXT_PUBLIC_BASE_URL is missing!");
      return NextResponse.json(
        { error: "Server misconfiguration: Missing base URL." },
        { status: 500 }
      );
    }

    // Parse JSON body
    const body = await req.json();
    console.log("📦 Request body:", body);

    const { priceId } = body;

    // Validate priceId
    if (!priceId) {
      console.error("❌ Missing priceId in request!");
      return NextResponse.json({ error: "Missing price ID" }, { status: 400 });
    }

    console.log("🔗 Creating Stripe checkout session...");

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/app?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    });

    console.log("✅ Checkout session created:", session.url);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("❌ Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method Not Allowed" },
    { status: 405 }
  );
}
