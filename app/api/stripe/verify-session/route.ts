// app/api/stripe/verify-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

export async function GET(req: Request) {
  console.log("🔹 Verify Session API called");

  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId");
    console.log("🔹 sessionId:", sessionId);

    if (!sessionId) {
      console.error("❌ Missing sessionId");
      return NextResponse.json({ error: "Missing sessionId parameter" }, { status: 400 });
    }

    // Get the user session
    const userSession = await getServerSession(authOptions);
    console.log("🔹 User session:", userSession);

    if (!userSession?.user) {
      console.error("❌ User not logged in");
      return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
    }

    // Retrieve the Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("🔹 Stripe session:", session);

    if (session.payment_status !== "paid") {
      console.error("❌ Payment not completed");
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    // Verify the session belongs to this user
    if (!session.metadata?.userId) {
      console.error("❌ Stripe metadata is missing userId");
      return NextResponse.json({ error: "Invalid session metadata" }, { status: 400 });
    }

    const userId = session.metadata.userId;
    const user = await prisma.user.findUnique({
      where: { email: userSession.user.email as string },
    });

    console.log("🔹 User from DB:", user);

    if (!user || user.id !== userId) {
      console.error("❌ Session does not belong to this user");
      return NextResponse.json({ error: "Session does not belong to this user" }, { status: 403 });
    }

    // Check if subscription exists
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    console.log("🔹 Subscription:", subscription);

    if (!subscription || subscription.status !== "active") {
      console.error("❌ No active subscription found");
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    console.log("✅ Verification successful");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Verify Session Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
