// app/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FiChevronDown, FiTrash2, FiEdit3 } from "react-icons/fi";
import Script from "next/script";

// Dynamically import FullCalendar to prevent SSR issues.
const FullCalendar = dynamic(() => import("@fullcalendar/react"), { ssr: false });
import dayGridPlugin from "@fullcalendar/daygrid";

const colorPalette = [
  "#FF6F61", "#FFD166", "#06D6A0", "#118AB2", "#EF476F", "#FF9F1C",
  "#FF6392", "#7BDFF2", "#B2F7EF", "#F4A261", "#FF007F", "#00FF7F",
  "#00FFFF", "#FF00FF", "#FFD700", "#7FFF00", "#FF4500", "#8A2BE2",
  "#FF1493", "#00FF00", "#2D3047", "#419D78", "#3D3B8E", "#4A4E69",
  "#6A4C93", "#3F88C5", "#FF6B6B", "#4ECDC4", "#C7F464", "#FFE66D"
];

interface Test {
  subject: string;
  startDate: string;
  endDate: string;
  difficulty: number;
  color: string;
}

interface CalendarEvent {
  title: string;
  start: string;
  backgroundColor: string;
  allDay: boolean;
}

// ─── Google Authentication Component ─────────────────────────────
function GoogleAuth() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [gapiLoaded, setGapiLoaded] = useState(false);

  // Initialize Google API after script is loaded
  useEffect(() => {
    if (typeof window !== "undefined" && window.gapi && !gapiLoaded) {
      function initGoogleAPI() {
        window.gapi.client.init({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
          clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          scope: "https://www.googleapis.com/auth/calendar.events",
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        }).then(() => {
          if (window.gapi.auth2) {
            const authInstance = window.gapi.auth2.getAuthInstance();
            setIsSignedIn(authInstance.isSignedIn.get());
            authInstance.isSignedIn.listen(setIsSignedIn);
          }
          setGapiLoaded(true);
        }).catch(err => {
          console.error("Error initializing Google API:", err);
        });
      }
      
      if (window.gapi.client) {
        initGoogleAPI();
      } else {
        window.gapi.load("client:auth2", initGoogleAPI);
      }
    }
  }, [gapiLoaded]);

  const handleSignIn = () => {
    if (typeof window !== "undefined" && window.gapi && window.gapi.auth2) {
      window.gapi.auth2.getAuthInstance().signIn();
    } else {
      console.error("Google API not loaded yet");
    }
  };

  const handleSignOut = () => {
    if (typeof window !== "undefined" && window.gapi && window.gapi.auth2) {
      window.gapi.auth2.getAuthInstance().signOut();
    }
  };

  return (
    <>
      <div className="flex space-x-4">
        {isSignedIn ? (
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition"
          >
            Sign Out
          </button>
        ) : (
          <button
            onClick={handleSignIn}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
          >
            Sign In with Google
          </button>
        )}
      </div>
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────────
export default function ProtectedAppPage() {
  // Local states that use browser APIs are initialized safely.
  const [studyHours, setStudyHours] = useState<number>(3);
  const [tests, setTests] = useState<Test[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [openTestIndex, setOpenTestIndex] = useState<number | null>(null);
  const [editingSubjectIndex, setEditingSubjectIndex] = useState<number | null>(null);
  const [gapiReady, setGapiReady] = useState(false);

  // Handle Google API script loading
  const handleGapiLoaded = () => {
    setGapiReady(true);
  };

  // Use useEffect to safely access localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedHours = localStorage.getItem("studyHours");
      if (storedHours) setStudyHours(JSON.parse(storedHours));
      const storedTests = localStorage.getItem("tests");
      if (storedTests) setTests(JSON.parse(storedTests));
    }
  }, []);

  // Persist changes to localStorage on the client
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("studyHours", JSON.stringify(studyHours));
    }
  }, [studyHours]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tests", JSON.stringify(tests));
    }
  }, [tests]);

  useEffect(() => {
    generateSchedule();
  }, [tests, studyHours]);

  // Save events to Google Calendar (only runs on client)
  const saveEventsToGoogleCalendar = async () => {
    if (typeof window === "undefined" || !window.gapi) return;
    
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (!authInstance || !authInstance.isSignedIn.get()) {
        alert("Please sign in with Google first.");
        return;
      }
      
      for (const event of events) {
        const calendarEvent = {
          summary: event.title,
          start: { date: event.start },
          end: { date: event.start },
        };
        
        try {
          await window.gapi.client.calendar.events.insert({
            calendarId: "primary",
            resource: calendarEvent,
          });
          console.log("Event added:", calendarEvent);
        } catch (error) {
          console.error("Error adding event:", error);
        }
      }
      
      alert("Events have been added to your Google Calendar.");
    } catch (error) {
      console.error("Error saving to Google Calendar:", error);
      alert("Failed to save events. Make sure you're signed in with Google.");
    }
  };

  // Custom event renderer for FullCalendar
  const renderEventContent = (eventInfo: any) => {
    const [subject, allocated] = eventInfo.event.title.split(" | ");
    return (
      <div
        className="p-2 rounded-lg text-white shadow transition transform hover:scale-105"
        style={{ backgroundColor: eventInfo.event.backgroundColor }}
      >
        <div className="font-bold text-sm">{subject}</div>
        <div className="text-xs">{allocated}</div>
      </div>
    );
  };

  // Test management functions
  const addTest = () => {
    const randomColor =
      colorPalette[Math.floor(Math.random() * colorPalette.length)];
    setTests((prev) => [
      ...prev,
      {
        subject: "New Test",
        startDate: "",
        endDate: "",
        difficulty: 1,
        color: randomColor,
      },
    ]);
  };

  const deleteTest = (index: number) => {
    setTests((prev) => prev.filter((_, i) => i !== index));
    if (openTestIndex === index) setOpenTestIndex(null);
    if (editingSubjectIndex === index) setEditingSubjectIndex(null);
  };

  const updateTest = (index: number, key: keyof Test, value: string | number) => {
    setTests((prev) => {
      const updated = [...prev];
      updated[index][key] = value as never;
      return updated;
    });
  };

  const toggleSettings = (index: number) => {
    setOpenTestIndex(openTestIndex === index ? null : index);
  };

  const clearTests = () => {
    if (confirm("Are you sure you want to delete all tests?")) {
      setTests([]);
      setOpenTestIndex(null);
      setEditingSubjectIndex(null);
    }
  };

  // Generate study events based on tests and study hours
  const generateSchedule = () => {
    const finalEvents: CalendarEvent[] = [];
    const dateSet = new Set<string>();

    tests.forEach((test) => {
      if (!test.startDate || !test.endDate) return;
      const start = new Date(test.startDate);
      const end = new Date(test.endDate);
      if (start > end) return;
      let current = new Date(start);
      while (current <= end) {
        dateSet.add(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
    });

    const allDates = Array.from(dateSet).sort();

    const testWeights = tests.map((test) => {
      if (!test.startDate || !test.endDate) return 0;
      const start = new Date(test.startDate);
      const end = new Date(test.endDate);
      if (start > end) return 0;
      const totalDays =
        Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return test.difficulty / totalDays;
    });

    allDates.forEach((date) => {
      const activeTests = tests
        .map((test, idx) => ({ test, idx }))
        .filter(({ test }) => {
          if (!test.startDate || !test.endDate) return false;
          const start = new Date(test.startDate);
          const end = new Date(test.endDate);
          const current = new Date(date);
          return current >= start && current <= end;
        });
      if (activeTests.length === 0) return;

      const totalWeight = activeTests.reduce(
        (sum, { idx }) => sum + (testWeights[idx] || 0),
        0
      );
      activeTests.forEach(({ test, idx }) => {
        const weight = testWeights[idx] || 0;
        const allocated = studyHours * (weight / totalWeight);
        finalEvents.push({
          title: `${test.subject} | ${allocated.toFixed(1)}h`,
          start: date,
          backgroundColor: test.color,
          allDay: true,
        });
      });
    });

    setEvents(finalEvents);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Load Google API Script */}
      <Script
        src="https://apis.google.com/js/api.js"
        onLoad={handleGapiLoaded}
        strategy="beforeInteractive"
      />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg py-10 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 transition-transform duration-300 transform hover:scale-105">
            Study Planner
          </h1>
          <p className="text-base sm:text-lg md:text-xl font-light">
            Plan, schedule, and conquer your tests with style.
          </p>
        </div>
      </header>

      {/* Top Control Panel */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <GoogleAuth />
            <button
              onClick={saveEventsToGoogleCalendar}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition"
              disabled={!gapiReady}
            >
              Save to Google Calendar
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={addTest}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow transition transform hover:scale-105"
            >
              + Add Test
            </button>
            <div className="flex items-center gap-2">
              <label className="text-gray-700 font-medium">
                Max Study Hours / Day
              </label>
              <input
                type="number"
                value={studyHours}
                min="1"
                max="24"
                onChange={(e) => setStudyHours(parseInt(e.target.value) || 1)}
                className="w-20 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Test Management Panel */}
          <aside className="w-full lg:w-1/3 px-4">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold mb-4">Your Tests</h2>
              {tests.length === 0 && (
                <p className="text-gray-600 text-sm">
                  No tests added. Click "+ Add Test" to start.
                </p>
              )}
              {tests.map((test, index) => (
                <div
                  key={index}
                  className="mb-4 border rounded-lg overflow-hidden shadow hover:shadow-xl transition"
                >
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer"
                    style={{ backgroundColor: test.color }}
                    onClick={() => toggleSettings(index)}
                  >
                    {editingSubjectIndex === index ? (
                      <input
                        type="text"
                        value={test.subject}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateTest(index, "subject", e.target.value)}
                        onBlur={() => setEditingSubjectIndex(null)}
                        className="bg-white text-gray-700 px-2 py-1 rounded"
                      />
                    ) : (
                      <span className="font-semibold text-white truncate">
                        {test.subject}
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSubjectIndex(index);
                        }}
                        className="text-white hover:text-gray-200"
                      >
                        <FiEdit3 size={18} />
                      </button>
                      <FiChevronDown
                        size={20}
                        className={`transition-transform duration-300 ${
                          openTestIndex === index ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                  {openTestIndex === index && (
                    <div className="p-3 bg-gray-50">
                      <div className="mb-3">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={test.startDate}
                          onChange={(e) => updateTest(index, "startDate", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={test.endDate}
                          onChange={(e) => updateTest(index, "endDate", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Difficulty
                        </label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((level) => {
                            const colorClasses = [
                              "bg-blue-500",
                              "bg-green-500",
                              "bg-yellow-500",
                              "bg-orange-500",
                              "bg-red-500",
                            ];
                            return (
                              <div
                                key={level}
                                onClick={() => updateTest(index, "difficulty", level)}
                                className={`w-7 h-7 rounded cursor-pointer transition transform hover:scale-110 ${colorClasses[level - 1]} ${
                                  test.difficulty === level
                                    ? "ring-2 ring-offset-2 ring-offset-gray-50 ring-black"
                                    : ""
                                }`}
                              ></div>
                            );
                          })}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTest(index)}
                        className="w-full py-2 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg shadow transition"
                      >
                        <FiTrash2 className="mr-2" /> Delete Test
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {tests.length > 0 && (
                <button
                  onClick={clearTests}
                  className="w-full py-2 mt-4 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition"
                >
                  Clear All Tests
                </button>
              )}
            </div>
          </aside>

          {/* Calendar Panel */}
          <main className="w-full lg:w-2/3 px-4">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={events}
                eventContent={renderEventContent}
                height="70vh"
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}