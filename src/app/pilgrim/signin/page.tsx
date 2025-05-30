"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PilgrimSignIn() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (code === "12345678912") {
      router.push("/pilgrim/otp");
    } else {
      setError("Invalid code. Please enter the correct 11-digit code.");
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
      {/* Pilgrim Code Form */}
      <div className="max-w-md w-full p-8 bg-white bg-opacity-90 rounded-lg shadow-xl relative z-10">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-6">
            <span className="text-5xl">🕋</span>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">
            Pilgrim Sign In
          </h1>
          <p className="text-gray-600 mb-6">Enter your 11-digit Pilgrim Code</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            maxLength={11}
            minLength={11}
            pattern="\d{11}"
            required
            className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
            placeholder="Enter 11-digit code"
            value={code}
            onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ""))}
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md text-white bg-primary hover:bg-primary-dark font-semibold shadow"
          >
            Continue
          </button>
        </form>
        <button
          type="button"
          className="w-full mt-4 py-2 px-4 rounded-md text-primary border border-primary bg-white hover:bg-primary hover:text-white font-semibold shadow transition"
          onClick={() => router.push('/identify')}
        >
          Back
        </button>
      </div>
    </div>
  );
} 