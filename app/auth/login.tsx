"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginPage() {
  const { data: session } = useSession();

  // Production callback URL for Vercel
  const callbackUrl = "https://student-planner-jans-projects-96cb0206.vercel.app/todo";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md p-8 bg-white shadow-lg rounded-lg text-center">
        <h1 className="text-3xl font-bold mb-4">Login</h1>
        {session ? (
          <div>
            <p>Welcome, {session.user?.name}!</p>
            <button onClick={() => signOut()}>Sign Out</button>
          </div>
        ) : (
          <button onClick={() => signIn("google", { callbackUrl })}>
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  );
}
