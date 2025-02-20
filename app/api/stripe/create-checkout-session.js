import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(req) {
  try {
    const { priceId } = await req.json(); // Expecting the priceId in the request

    if (!priceId) {
      return NextResponse.json({ error: "Missing price ID" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment", // Change to "subscription" if necessary
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/app?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    console.error("Stripe Checkout Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
