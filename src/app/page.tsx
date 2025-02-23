"use client";  // Make sure to add this at the top of the file

import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, onValue } from "firebase/database";

// Firebase config (replace with your actual credentials)
const firebaseConfig = {
  apiKey: "AIzaSyDtZU1zBvQrKa1bqYLGXbeZuxJ6_eMiTrI",
  authDomain: "juju-app-5a0ca.firebaseapp.com",
  projectId: "juju-app-5a0ca",
  storageBucket: "juju-app-5a0ca.firebasestorage.app",
  messagingSenderId: "166649475019",
  appId: "1:166649475019:web:8b59ca460ef4002a00d04e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default function BabyStatusApp() {
  const [status, setStatus] = useState("Awake");
  const [lastFed, setLastFed] = useState<string | null>(null);

  useEffect(() => {
    const statusRef = ref(db, "baby/status");
    const lastFedRef = ref(db, "baby/lastFed");

    // Get initial values
    get(statusRef).then((snapshot) => setStatus(snapshot.val() || "Awake"));
    get(lastFedRef).then((snapshot) => setLastFed(snapshot.val() || null));

    // Listen for changes in real-time
    onValue(statusRef, (snapshot) => setStatus(snapshot.val()));
    onValue(lastFedRef, (snapshot) => setLastFed(snapshot.val()));

    // Cleanup on component unmount
    return () => {
      // Remove listeners when component unmounts
    };
  }, []);

  const updateStatus = (newStatus: string) => {
    const statusRef = ref(db, "baby/status");
    set(statusRef, newStatus);
  };

  const logFeeding = () => {
    const lastFedRef = ref(db, "baby/lastFed");
    const feedTime = new Date().toLocaleTimeString();
    set(lastFedRef, feedTime);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-4">Baby Status</h1>
      <p className="text-xl text-center mb-6">Current Status: <strong>{status}</strong></p>
      
      {/* Display image based on status */}
      {status === "Awake" ? (
        <img src="/images/awake.png" alt="Baby is awake" className="w-48 h-48 object-contain mb-4" />
      ) : (
        <img src="/images/sleeping.png" alt="Baby is sleeping" className="w-48 h-48 object-contain mb-4" />
      )}

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => updateStatus("Sleeping")} 
          className="bg-blue-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-600 focus:outline-none"
        >
          😴 Sleeping
        </button>
        <button 
          onClick={() => updateStatus("Awake")} 
          className="bg-yellow-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-yellow-600 focus:outline-none"
        >
          ☀️ Awake
        </button>
      </div>

      <div>
        <button 
          onClick={logFeeding} 
          className="bg-green-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-green-600 focus:outline-none"
        >
          🍼 Log Feeding
        </button>
        {lastFed && <p className="mt-4 text-lg">Last Fed: {lastFed}</p>}
      </div>
    </div>
  );
}
