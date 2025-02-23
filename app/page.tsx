"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ""
);

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleBuyNow = async () => {
    setLoading(true);

    if (!stripePromise) {
      alert("Stripe is not initialized. Check your API key.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: "price_your_price_id" }), // Replace with actual price ID
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || "Something went wrong"}`);
        setLoading(false);
        return;
      }

      const session = await res.json();

      if (session.url) {
        window.location.href = session.url; // Redirect to Stripe Checkout
      } else {
        alert("Payment session creation failed.");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Buy Our Product</h1>
      <button
        onClick={handleBuyNow}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Processing..." : "Buy Now"}
      </button>
    </main>
  );
}
