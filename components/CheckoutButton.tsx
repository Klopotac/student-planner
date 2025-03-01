// components/CheckoutButton.tsx
"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function CheckoutButton() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    // If not logged in, redirect to sign in
    if (!session) {
      signIn("google", { callbackUrl: "/#pricing" });
      return;
    }

    // Otherwise, proceed with checkout
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Something went wrong");
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Failed to start checkout session");
    } finally {
      setLoading(false);
    }
  };

  // If user already has Pro
  if (session?.user?.hasPro) {
    return (
      <button
        className="w-full py-3 px-6 rounded-full font-semibold bg-green-600 text-white"
        disabled
      >
        You have Pro ✓
      </button>
    );
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full py-3 px-6 rounded-full font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors duration-200"
    >
      {loading ? "Processing..." : "Get Pro"}
    </button>
  );
}