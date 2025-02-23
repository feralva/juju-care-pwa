"use client";  // Add this at the top

import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, push, onValue } from "firebase/database";

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
  const [feedingHistory, setFeedingHistory] = useState<string[]>([]);
  const [feedingInterval, setFeedingInterval] = useState<number>(3); // Default to 3 hours
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    const statusRef = ref(db, "baby/status");
    const feedingHistoryRef = ref(db, "baby/feedingHistory");
    const feedingIntervalRef = ref(db, "baby/feedingInterval");
  
    // Get initial values from Firebase
    Promise.all([get(statusRef), get(feedingHistoryRef), get(feedingIntervalRef)])
      .then(([statusSnapshot, feedingHistorySnapshot, feedingIntervalSnapshot]) => {
        setStatus(statusSnapshot.val() || "Awake");
  
        const feedingHistory = feedingHistorySnapshot.val();
        setFeedingHistory(feedingHistory ? Object.values(feedingHistory) : []); 
  
        setFeedingInterval(feedingIntervalSnapshot.val() || 3);
        setIsLoading(false); 
      });
  
    // Listen for real-time updates
    onValue(statusRef, (snapshot) => setStatus(snapshot.val()));
    onValue(feedingHistoryRef, (snapshot) => {
      const history = snapshot.val();
      setFeedingHistory(history ? Object.values(history) : []); 
    });
    onValue(feedingIntervalRef, (snapshot) => setFeedingInterval(snapshot.val()));
  
    return () => {
      // Cleanup listeners on unmount
    };
  }, []);

  const updateStatus = (newStatus: string) => {
    const statusRef = ref(db, "baby/status");
    set(statusRef, newStatus);
  };

  const logFeeding = () => {
    const feedingHistoryRef = ref(db, "baby/feedingHistory");
    const feedingTime = new Date().toISOString(); // Use ISO string
    
    push(feedingHistoryRef, feedingTime); // Store feeding time

    const lastFedRef = ref(db, "baby/lastFed");
    set(lastFedRef, feedingTime); // Update last fed time
  };

  // Function to update the feeding interval
  const updateFeedingInterval = (newInterval: number) => {
    const feedingIntervalRef = ref(db, "baby/feedingInterval");
    set(feedingIntervalRef, newInterval); // Update Firebase
    setFeedingInterval(newInterval); // Update local state
  };

  // Functions for increment and decrement
  const incrementInterval = () => updateFeedingInterval(feedingInterval + 1);
  const decrementInterval = () => {
    if (feedingInterval > 1) {
      updateFeedingInterval(feedingInterval - 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-4">Baby Status</h1>
      <p className="text-xl text-center mb-6">Current Status: <strong>{status}</strong></p>

      {isLoading ? (
        <div className="flex justify-center items-center mt-8">
          <div className="animate-spin rounded-full border-t-4 border-blue-500 h-16 w-16 border-b-4 border-transparent"></div>
        </div>
      ) : (
        status === "Awake" ? (
          <img src="/images/awake.png" alt="Baby is awake" className="w-48 h-48 object-contain mb-4" />
        ) : (
          <img src="/images/sleeping.png" alt="Baby is sleeping" className="w-48 h-48 object-contain mb-4" />
        )
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
        {lastFed && <p className="mt-4 text-lg">Last Fed: {new Date(lastFed).toLocaleString()}</p>}
      </div>

      <div className="mt-6">
        <h2 className="text-xl mb-2">Feeding History</h2>
        <ul className="list-disc pl-6">
          {feedingHistory.length > 0 ? (
            feedingHistory.map((time, index) => (
              <li key={index}>{time}</li>  // Properly displaying date
            ))
          ) : (
            <p>No feeding history available.</p>
          )}
        </ul>
      </div>

      <div className="mt-6">
        <h2 className="text-xl mb-2">Set Feeding Interval (hours)</h2>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={decrementInterval}
            className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 focus:outline-none"
          >
            −
          </button>
          <input
            type="number"
            value={feedingInterval}
            onChange={(e) => updateFeedingInterval(Number(e.target.value))}
            min={1}
            max={12}
            className="text-lg border-2 border-gray-300 px-4 py-2 text-center w-24"
          />
          <button
            onClick={incrementInterval}
            className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 focus:outline-none"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
