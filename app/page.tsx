// app/page.tsx
"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleBuyNow = async () => {
    setLoading(true);
    const stripe = await stripePromise;
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId: "price_your_price_id", // Replace with your actual price ID from Stripe if using subscription/product pricing; or remove if using Payment Intents.
      }),
    });
    const session = await res.json();
    if (session.sessionId) {
      stripe?.redirectToCheckout({ sessionId: session.sessionId });
    } else {
      alert("Payment session creation failed.");
    }
    setLoading(false);
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    console.log("Google login success:", credentialResponse);
    // You can store the credential in state, context, or cookies.
  };

  const handleGoogleError = () => {
    console.error("Google login error");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl p-8 bg-white shadow-xl rounded-lg text-center">
        <h1 className="text-4xl font-bold mb-4">Student Planner Premium</h1>
        <p className="text-lg mb-8">
          Plan, schedule, and conquer your tests with style. Get full access for just €2.
        </p>
        <button
          onClick={handleBuyNow}
          className="px-6 py-3 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 transition"
          disabled={loading}
        >
          {loading ? "Processing..." : "Buy Now for €2"}
        </button>
        <div className="mt-8">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </div>
      </div>
    </div>
  );
}
