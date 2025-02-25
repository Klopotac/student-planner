"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      router.push("/"); // Redirect to landing or protected page
    }
  }, [session, router]);

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded shadow">
        <h1 className="text-2xl mb-4">Sign In</h1>
        <button
          onClick={() => signIn("google")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
