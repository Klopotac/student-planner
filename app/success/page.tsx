// app/success/page.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const stripeSessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!stripeSessionId) {
      router.push("/");
      return;
    }

    // Call an API route to update the payment status for the current user.
    // In a real app, verify the payment with Stripe here.
    fetch("/api/user/update-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: stripeSessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        // Optionally, you can refresh the session so that the "paid" flag is updated
        // For example, using next-auth's useSession() hook with a callback URL.
        router.push("/app"); // redirect to the protected app page
      });
  }, [stripeSessionId, router]);

  return <div>Payment successful! Updating your account...</div>;
}
