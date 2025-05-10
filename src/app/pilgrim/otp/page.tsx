"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PilgrimOTP() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp === "1234") {
      router.push("/pilgrim/main");
    } else {
      setError("Invalid OTP. Please enter the correct 4-digit code.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/kaaba-pilgrims.jpg"
          alt="Kaaba and pilgrims"
          fill
          style={{ objectFit: 'cover' }}
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>
      {/* OTP Form */}
      <div className="max-w-md w-full p-8 bg-white bg-opacity-90 rounded-lg shadow-xl relative z-10">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-6">
            <span className="text-5xl">🕋</span>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">
            OTP Verification
          </h1>
          <p className="text-gray-600 mb-6">Enter the 4-digit code sent to your email</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            maxLength={4}
            minLength={4}
            pattern="\d{4}"
            required
            className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm text-center tracking-widest text-2xl"
            placeholder="Enter 4-digit OTP"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md text-white bg-primary hover:bg-primary-dark font-semibold shadow"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
} 