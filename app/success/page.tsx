"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const stripeSessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!stripeSessionId) {
      router.push("/");
      return;
    }

    fetch("/api/user/update-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: stripeSessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        router.push("/app"); // Redirect after updating
      });
  }, [stripeSessionId, router]);

  return <div>Payment successful! Updating your account...</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccess />
    </Suspense>
  );
}
