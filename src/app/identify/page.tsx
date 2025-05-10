"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function IdentifyUserType() {
  const router = useRouter();

  const handleSelect = (type: string) => {
    router.push(`/login?type=${type}`);
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
      {/* Identity Card */}
      <div className="max-w-md w-full p-8 bg-white bg-opacity-90 rounded-lg shadow-xl relative z-10">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-6">
            <span className="text-5xl">🕋</span>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              Tafweej
            </span>{' '}
            Hajj
          </h1>
          <p className="text-gray-600 mb-6">Please select your user type to continue</p>
        </div>
        <div className="flex flex-col gap-6">
          <button
            className="bg-primary text-white py-3 px-6 rounded-lg shadow hover:bg-primary-dark transition text-lg font-semibold"
            onClick={() => router.push("/pilgrim/signin")}
          >
            Pilgrim
          </button>
          <button
            className="bg-yellow-500 text-white py-3 px-6 rounded-lg shadow hover:bg-yellow-600 transition text-lg font-semibold"
            onClick={() => router.push("/login?type=admin")}
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
} 