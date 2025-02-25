import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route"; // Adjust the path as needed

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: Request) {
  try {
    // Log environment variables (for debugging)
    console.log("STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY);
    console.log("NEXT_PUBLIC_BASE_URL:", process.env.NEXT_PUBLIC_BASE_URL);

    // Verify the user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error("User not authenticated");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    console.log("Authenticated user:", session.user?.email);

    // Set your price ID (this could also come from an env variable)
    const priceId = process.env.STRIPE_PRICE_ID || "price_1QwObpJxQLhmtE09Q9FlilsN";
    if (!priceId) {
      console.error("Missing priceId");
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }
    console.log("Using priceId:", priceId);

    // Create a Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      customer_email: session.user?.email, // Attach the user's email if available
    });
    console.log("Checkout session created:", checkoutSession);

    // Make sure we got a URL back
    if (!checkoutSession.url) {
      console.error("Missing checkout session URL");
      return NextResponse.json(
        { error: "Checkout session URL is missing" },
        { status: 500 }
      );
    }

    // Return the URL as JSON
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
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
