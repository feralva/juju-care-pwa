// src/app/page.tsx
'use client';

import { useState } from "react";

export default function BabyStatusApp() {
  const [status, setStatus] = useState("Awake");
  const [lastFed, setLastFed] = useState<string | null>(null);

  const updateStatus = (newStatus: string) => {
    setStatus(newStatus);
  };

  const logFeeding = () => {
    setLastFed(new Date().toLocaleTimeString());
  };

  // Inline button component
  const Button = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
    >
      {children}
    </button>
  );

  // Image source based on status
  const statusImage = status === "Awake" ? "/images/awake baby.jpeg" : "/images/sleeping baby.jpeg";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-700">Baby Status</h1>
      <p className="text-lg mt-2 text-gray-600">
        Current Status: <strong>{status}</strong>
      </p>
      
      {/* Display the corresponding image */}
      <img src={statusImage} alt={status} className="mt-4 w-48 h-48 object-cover" />

      <div className="mt-4 space-x-2">
        <Button onClick={() => updateStatus("Sleeping")}>😴 Sleeping</Button>
        <Button onClick={() => updateStatus("Awake")}>☀️ Awake</Button>
      </div>
      <div className="mt-6">
        <Button onClick={logFeeding}>🍼 Log Feeding</Button>
        {lastFed && <p className="mt-2 text-sm text-gray-500">Last Fed: {lastFed}</p>}
      </div>
    </div>
  );
}
