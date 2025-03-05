// app/api/stripe/create-checkout-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to subscribe" },
        { status: 401 }
      );
    }
    
    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      include: { subscription: true },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Check if the user already has an active subscription
    if (user.subscription?.status === "active") {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      );
    }
    
    // Use your **one-time price ID** here
    const priceId = "price_1QwObpJxQLhmtE09Q9FlilsN"; 

    // Create or retrieve the Stripe customer
    let customerId = user.subscription?.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email as string,
        name: user.name as string,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "payment", // Use "payment" for one-time purchases
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}