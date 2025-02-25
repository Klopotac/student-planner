import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import admin from "@/lib/firebaseAdmin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const { session_id } = await req.json();
    
    // Verify payment with Stripe
    const stripeSession = await stripe.checkout.sessions.retrieve(session_id);
    
    if (stripeSession.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    console.log(`Payment verified for user: ${session.user.email}`);

    // Ensure email is a string (fixes TypeScript error)
    const userEmail = session.user.email ?? "unknown-user@example.com";

    // Update user payment status in Firebase
    const userRef = admin.firestore().collection("users").doc(userEmail);
    await userRef.set({ paid: true }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment update error:", error);
    return NextResponse.json({ error: "Database update failed" }, { status: 500 });
  }
}
