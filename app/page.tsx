"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with your public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "");

export default function HomePage() {
  const [loading, setLoading] = useState(false);

  const handleBuyNow = async () => {
    setLoading(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        alert("Stripe failed to load. Check your API key.");
        setLoading(false);
        return;
      }

      // Call the API route with your correct Price ID
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert("Error: " + (errorData.error || "Unknown error"));
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        alert("No checkout session URL returned.");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Checkout failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Buy Student Planner Premium</h1>
      <button
        onClick={handleBuyNow}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Processing..." : "Buy Now for €2"}
      </button>
    </main>
  );
}
