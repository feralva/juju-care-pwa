/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // Ensure the component is client-side

import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, push, onValue } from "firebase/database";
import { Tabs, Tab, Box, IconButton, CircularProgress } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

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
  const [value, setValue] = useState(0); // State for Tabs
  const [statusStartTime, setStatusStartTime] = useState<string | null>(null); // New state for tracking the start time of status
  const [sleepStart, setSleepStart] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sleepHistory, setSleepHistory] = useState<any[]>([]);
  const [totalSleepToday, setTotalSleepToday] = useState(0);

  useEffect(() => {
    const statusRef = ref(db, "baby/status");
    const feedingHistoryRef = ref(db, "baby/feedingHistory");
    const feedingIntervalRef = ref(db, "baby/feedingInterval");
    const lastFedRef = ref(db, "baby/lastFed");
    const statusStartTimeRef = ref(db, "baby/statusStartTime");
    const sleepHistoryRef = ref(db, "baby/sleepHistory");

    // Get initial values from Firebase
    Promise.all([ 
      get(statusRef),
      get(feedingHistoryRef),
      get(feedingIntervalRef),
      get(lastFedRef),
      get(statusStartTimeRef),
      get(sleepHistoryRef),
    ])
    .then(([statusSnapshot, feedingHistorySnapshot, feedingIntervalSnapshot, lastFedSnapshot, statusStartTimeSnapshot, sleepHistorySnapshot]) => {
      setStatus(statusSnapshot.val() || "Awake");
      setStatusStartTime(statusStartTimeSnapshot.val() || null); // Set initial start time if available

      // Convert Firebase object to an array for feeding history
      const feedingHistory = feedingHistorySnapshot.val();
      setFeedingHistory(feedingHistory ? Object.values(feedingHistory) : []); // Convert object to array

      setFeedingInterval(feedingIntervalSnapshot.val() || 3);
      setLastFed(lastFedSnapshot.val() || null);
      setIsLoading(false); // Set loading to false once data is fetched
      const sleepData = sleepHistorySnapshot.val();
      setSleepHistory(sleepData ? Object.values(sleepData) : []);
    });

    // Listen for real-time updates for status and feeding history
    onValue(statusRef, (snapshot) => setStatus(snapshot.val()));
    onValue(feedingHistoryRef, (snapshot) => {
      const history = snapshot.val();
      setFeedingHistory(history ? Object.values(history) : []); // Convert object to array in real-time
    });
    onValue(feedingIntervalRef, (snapshot) => setFeedingInterval(snapshot.val()));
    onValue(lastFedRef, (snapshot) => setLastFed(snapshot.val()));
    onValue(statusStartTimeRef, (snapshot) => setStatusStartTime(snapshot.val()));
    onValue(sleepHistoryRef, (snapshot) => {
      const history = snapshot.val();
      setSleepHistory(history ? Object.values(history) : []);
      calculateTotalSleep(history || []);
    });

    // Cleanup listeners on unmount
    return () => {
      // Remove listeners when the component unmounts
    };
  }, []);

  const calculateTotalSleep = (sleepData: any[]) => {
    const today = new Date().toISOString().split("T")[0]; 
    const sleepArray = sleepData ? Object.values(sleepData) : [];

    const total = sleepArray.reduce((acc, entry) => {
      if (entry.start.startsWith(today)) {
        const start = new Date(entry.start).getTime();
        const end = new Date(entry.end).getTime();
        return acc + (end - start);
      }
      return acc;
    }, 0);

    setTotalSleepToday(total / (1000 * 60 * 60)); 
  };

  const logSleep = (start: string, end: string) => {
    const sleepHistoryRef = ref(db, "baby/sleepHistory");
    push(sleepHistoryRef, { start, end });
  };

  const updateStatus = (newStatus: string) => {
    const statusRef = ref(db, "baby/status");
    const statusStartTimeRef = ref(db, "baby/statusStartTime");
    const currentTime = new Date().toLocaleString();

    // Set status and record the current time when the status changes
    set(statusRef, newStatus);
    set(statusStartTimeRef, currentTime); // Save the timestamp of when the status changed
    setStatusStartTime(currentTime); // Update local state for tracking start time


    if (newStatus === "Sleeping") {
      const startTime = new Date().toISOString();
      setSleepStart(startTime);
    } else if (newStatus === "Awake" && sleepStart) {
      logSleep(sleepStart, new Date().toISOString());
      setSleepStart(null);
    }
  };

  const logFeeding = () => {
    const feedingHistoryRef = ref(db, "baby/feedingHistory");
    const feedingTime = new Date().toLocaleString(); // Using `toLocaleString` to get the full date and time

    // Push the new feeding time (full date) to the feedingHistory array
    push(feedingHistoryRef, feedingTime);

    // Also update the last feeding time with full date
    const lastFedRef = ref(db, "baby/lastFed");
    set(lastFedRef, feedingTime);
  };

  // Function to update feeding interval in the Firebase database
  const updateFeedingInterval = (newInterval: number) => {
    const feedingIntervalRef = ref(db, "baby/feedingInterval");
    set(feedingIntervalRef, newInterval);
    setFeedingInterval(newInterval); // Update local state as well
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-4">Juju Noticias</h1>
      <p className="text-xl text-center mb-2">Estado: <strong>{status === 'Awake' ? 'Despierto' : 'Dormido'}</strong></p>

      {/* Show spinner while loading */}
      {isLoading ? (
        <div className="flex justify-center items-center mt-8">
          <CircularProgress />
        </div>
      ) : (
        // Show the image once data is loaded
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
          style={{ fontSize: '1.5rem' }}
        >
         😴 
        </button>
        <button
          onClick={() => updateStatus("Awake")}
          className="bg-yellow-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-yellow-600 focus:outline-none"
          style={{ fontSize: '1.5rem' }}
        >
          😁
        </button>
      </div>

      <div>
        <button
          onClick={logFeeding}
          className="bg-green-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-green-600 focus:outline-none"
        >
          🍼 Cargar Comida
        </button>
      </div>

      {lastFed && <p className="mt-4 text-sm" style={{ color: 'grey' }}>Ultima Comida: {lastFed}</p>}

      {statusStartTime && (
        <p className="mt-0 text-sm" style={{ color: 'grey' }}>{status === 'Awake' ? 'Despierto' : 'Dormido'} desde: {statusStartTime}</p>
      )}

      <p className="text-sm text-gray-500">Total dormido hoy: {totalSleepToday.toFixed(2)} horas</p>

      {/* Material UI Tabs for Feeding History and Configuration */}
      <Box sx={{ width: "100%", maxWidth: 500, mt: 1 }}>
        <Tabs value={value} onChange={handleTabChange} centered>
          <Tab label="Comidas" />
          <Tab label="Sueño" />
          <Tab label="Configuracion" />
        </Tabs>

        <Box sx={{ padding: 2 }}>
          {value === 0 && (
            <div>
              <ul className="list-disc pl-6">
                {feedingHistory.length > 0 ? (
                  feedingHistory.slice(-5).reverse().map((feedingTime, index) => (
                  <li key={index} className="text-sm">{feedingTime}</li>
                  ))
                ) : (
                  <p>No hay Comidas guardadas.</p>
                )}
              </ul>
            </div>
          )}

          {value === 1 && (
            <div>
              <ul className="list-disc pl-6">
                {sleepHistory.length > 0 ? (
                  sleepHistory.slice(-5).reverse().map((entry, index) => (
                    <li key={index} className="text-sm">
                      {new Date(entry.start).toLocaleTimeString()} - {new Date(entry.end).toLocaleTimeString()}
                    </li>
                  ))
                ) : (
                  <p>No hay registros de sueño.</p>
                )}
              </ul>
            </div>
          )}

          {value === 2 && (
            <div className="flex flex-col items-center">
              <label>Intervalo comida (horas):</label>
              <div className="flex items-center gap-2 mt-1">
              <IconButton
                onClick={() => updateFeedingInterval(feedingInterval - 0.5)}
                disabled={feedingInterval <= 1}
                sx={{
                backgroundColor: 'red',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'darkred',
                },
                padding: '4px', // Smaller padding
                fontSize: '20px', // Smaller icon size
                }}
              >
                <RemoveIcon />
              </IconButton>
              <span>{feedingInterval} horas</span>
              <IconButton
                onClick={() => updateFeedingInterval(feedingInterval + 0.5)}
                sx={{
                backgroundColor: 'green',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'darkgreen',
                },
                padding: '4px', // Smaller padding
                fontSize: '20px', // Smaller icon size
                }}
              >
                <AddIcon />
              </IconButton>
              </div>
            </div>
          )}
        </Box>
      </Box>
    </div>
  );
}
