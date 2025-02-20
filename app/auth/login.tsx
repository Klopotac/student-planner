// app/auth/login.tsx
"use client";

import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const handleGoogleSuccess = (credentialResponse: any) => {
    console.log("Google login success:", credentialResponse);
    // Handle successful login (e.g., save session)
  };

  const handleGoogleError = () => {
    console.error("Google login error");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md p-8 bg-white shadow-lg rounded-lg text-center">
        <h1 className="text-3xl font-bold mb-4">Login</h1>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
      </div>
    </div>
  );
}
