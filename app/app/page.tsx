"use client";

import { useState, useRef, useEffect, MouseEvent, TouchEvent, WheelEvent } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Target, Trophy } from "lucide-react";

const ORIGINAL_WIDTH = 3545;
const ORIGINAL_HEIGHT = 4413;
const MAX_ROUNDS = 1; // Single round per session

interface Coordinates {
  x: number;
  y: number;
}

interface Location {
  name: string;
  coordinates: Coordinates;
  image: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Impossible";
  hint: string;
}

const LOCATIONS: Location[] = [
  { name: "Gift Shop", coordinates: { x: 2951, y: 2700 }, image: "/locations/gift.png", description: "", difficulty: "Easy", hint: "" },
  { name: "Sticker Path", coordinates: { x: 2524, y: 1763 }, image: "/locations/sticker.png", description: "", difficulty: "Hard", hint: "" },
  { name: "Comando Spot", coordinates: { x: 3245, y: 2831 }, image: "/locations/comando.png", description: "", difficulty: "Hard", hint: "" },
  { name: "White Selling Area", coordinates: { x: 539, y: 2321 }, image: "/locations/shop.png", description: "", difficulty: "Impossible", hint: "" },
  { name: "Switch Location", coordinates: { x: 2965, y: 2324 }, image: "/locations/sw.png", description: "", difficulty: "Hard", hint: "" },
  { name: "Spike Zone", coordinates: { x: 2281, y: 3659 }, image: "/locations/spike.png", description: "", difficulty: "Medium", hint: "" },
  { name: "Score Board", coordinates: { x: 2389, y: 2459 }, image: "/locations/panda.png", description: "", difficulty: "Medium", hint: "" },
  { name: "Blue Landmark", coordinates: { x: 1233, y: 3440 }, image: "/locations/blue.png", description: "", difficulty: "Medium", hint: "" },
  { name: "Sprink", coordinates: { x: 1026, y: 2178 }, image: "/locations/sprink.png", description: "", difficulty: "Hard", hint: "" },
  { name: "Lights", coordinates: { x: 1843, y: 2151 }, image: "/locations/lights.png", description: "", difficulty: "Hard", hint: "" },

  { name: "Ant", coordinates: { x: 2146, y: 3807 }, image: "/locations/ant.png", description: "", difficulty: "Medium", hint: "" },
  { name: "Cloud", coordinates: { x: 1330, y: 1644 }, image: "/locations/cloud.png", description: "", difficulty: "Easy", hint: "" },
  { name: "Cog", coordinates: { x: 2246, y: 3266 }, image: "/locations/cog.png", description: "", difficulty: "Hard", hint: "" },
  { name: "Cog Display", coordinates: { x: 1590, y: 1335 }, image: "/locations/cogdisp.png", description: "", difficulty: "Medium", hint: "" },
  { name: "Cookie", coordinates: { x: 1436, y: 2581 }, image: "/locations/cooke.png", description: "", difficulty: "Easy", hint: "" },
  { name: "Crab", coordinates: { x: 1465, y: 3908 }, image: "/locations/crab.png", description: "", difficulty: "Impossible", hint: "" },
  { name: "Lion", coordinates: { x: 2432, y: 1893 }, image: "/locations/lion.png", description: "", difficulty: "Hard", hint: "" },
  { name: "Lock", coordinates: { x: 1370, y: 3811 }, image: "/locations/lock.png", description: "", difficulty: "Medium", hint: "" },
  { name: "Meteor", coordinates: { x: 658, y: 2445 }, image: "/locations/meteor.png", description: "", difficulty: "Hard", hint: "" },
  { name: "Memory Match", coordinates: { x: 2444, y: 2084 }, image: "/locations/mm.png", description: "", difficulty: "Easy", hint: "" },
  { name: "Nectar", coordinates: { x: 2523, y: 1278 }, image: "/locations/nectar.png", description: "", difficulty: "Medium", hint: "" },
  { name: "Red Portal", coordinates: { x: 3084, y: 2357 }, image: "/locations/redportal.png", description: "", difficulty: "Medium", hint: "" },
  { name: "Roof", coordinates: { x: 1202, y: 2850 }, image: "/locations/roof.png", description: "", difficulty: "Hard", hint: "" },
  { name: "Shadow Bear", coordinates: { x: 2090, y: 586 }, image: "/locations/shadowbear.png", description: "", difficulty: "Impossible", hint: "" },
  { name: "Straw", coordinates: { x: 1157, y: 3094 }, image: "/locations/straw.png", description: "", difficulty: "Easy", hint: "" },
  { name: "Target", coordinates: { x: 2513, y: 2721 }, image: "/locations/target.png", description: "", difficulty: "Medium", hint: "" },
  { name: "Top Bear", coordinates: { x: 2070, y: 1753 }, image: "/locations/topbear.png", description: "", difficulty: "Medium", hint: "" },
  { name: "Trade", coordinates: { x: 2635, y: 3785 }, image: "/locations/trade.png", description: "", difficulty: "Medium", hint: "" },
  { name: "Tunnel", coordinates: { x: 3474, y: 2280 }, image: "/locations/TUNEL.png", description: "", difficulty: "Hard", hint: "" },
  { name: "White", coordinates: { x: 477, y: 3434 }, image: "/locations/white.png", description: "", difficulty: "Medium", hint: "" }
];



// Fisher-Yates shuffle for unbiased randomness.
function shuffle<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

interface Transform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

interface GameState {
  currentRoundLocations: Location[];
  currentLocation: Location | null;
  currentRoundIndex: number;
  guess: Coordinates | null;
  score: number | null;
  round: number;
  totalScore: number;
  highScore: number;
  isGuessSubmitted: boolean;
  gameOver: boolean;
}

// Function to generate default game state.
function getDefaultGameState(): GameState {
  return {
    currentRoundLocations: [],
    currentLocation: null,
    currentRoundIndex: 0,
    guess: null,
    score: null,
    round: 1,
    totalScore: 0,
    highScore: parseInt(localStorage.getItem("highScore") || "0"),
    isGuessSubmitted: false,
    gameOver: false,
  };
}

export default function BeeSwarmGeoguesser() {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<Coordinates>({ x: 0, y: 0 });
  const [countdown, setCountdown] = useState<number | null>(null);

  // Initialize game state from localStorage if available.
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window !== "undefined") {
      const savedGame = localStorage.getItem("currentGame");
      return savedGame ? JSON.parse(savedGame) : getDefaultGameState();
    }
    return getDefaultGameState();
  });

  // Persist game state changes to localStorage.
  useEffect(() => {
    localStorage.setItem("currentGame", JSON.stringify(gameState));
  }, [gameState]);

  // Start a new round (select 5 random locations)
  const startNewRound = () => {
    const selected = shuffle(LOCATIONS).slice(0, Math.min(5, LOCATIONS.length));
    setGameState(prev => ({
      ...prev,
      currentRoundLocations: selected,
      currentRoundIndex: 0,
      currentLocation: selected[0],
      guess: null,
      score: null,
      isGuessSubmitted: false,
    }));
  };

  // Reset game state for a fresh session.
  const resetGame = () => {
    const defaultState = getDefaultGameState();
    setGameState(defaultState);
    startNewRound();
  };

  // Move to the next location or finish the game.
  const goToNextLocation = () => {
    setGameState(prev => {
      const newTotalScore = prev.totalScore + (prev.score || 0);
      const newHighScore = Math.max(newTotalScore, prev.highScore);
      localStorage.setItem("highScore", newHighScore.toString());
      const newRoundIndex = prev.currentRoundIndex + 1;
      if (newRoundIndex >= prev.currentRoundLocations.length) {
        // Save game progress to localStorage
       const newGameData = {
        score: newTotalScore,
        locations: prev.currentRoundLocations.map(loc => loc.name),
      };
      const savedGames = JSON.parse(localStorage.getItem("games") || "[]");
      savedGames.push(newGameData);
      localStorage.setItem("games", JSON.stringify(savedGames));
        return {
          ...prev,
          totalScore: newTotalScore,
          gameOver: true,
          currentLocation: null,
          guess: null,
          score: null,
          highScore: newHighScore,
        };
      } else {
        return {
          ...prev,
          currentRoundIndex: newRoundIndex,
          currentLocation: prev.currentRoundLocations[newRoundIndex],
          guess: null,
          score: null,
          totalScore: newTotalScore,
          isGuessSubmitted: false,
          highScore: newHighScore,
        };
      }
    });
    setCountdown(null);
  };

  const calculateDistancePixels = (point1: Coordinates, point2: Coordinates): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const calculateScore = (guessPoint: Coordinates, actualPoint: Coordinates): number => {
    const distance = calculateDistancePixels(guessPoint, actualPoint);
    const scoreTable = [
      { maxDistance: 50, score: 5000 },
      { maxDistance: 70, score: 4000 },
      { maxDistance: 100, score: 3000 },
      { maxDistance: 120, score: 2000 },
      { maxDistance: 150, score: 1000 },
      { maxDistance: 220, score: 500 },
      { maxDistance: 350, score: 250 },
      { maxDistance: 400, score: 100 },
      { maxDistance: 500, score: 50 },
      { maxDistance: Infinity, score: 0 }
    ];
    return scoreTable.find(entry => distance <= entry.maxDistance)!.score;
  };

  const handleMapClick = (event: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
    if (gameState.isGuessSubmitted || gameState.gameOver) return;
    const rect = mapContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = "clientX" in event ? event.clientX : event.touches[0].clientX;
    const clientY = "clientY" in event ? event.clientY : event.touches[0].clientY;
    const x = (clientX - rect.left - transform.offsetX) / transform.scale;
    const y = (clientY - rect.top - transform.offsetY) / transform.scale;
    setGameState(prev => ({
      ...prev,
      guess: { x: Math.round(x), y: Math.round(y) }
    }));
  };

  const submitGuess = () => {
    if (!gameState.guess || !gameState.currentLocation) return;
    const score = calculateScore(gameState.guess, gameState.currentLocation.coordinates);
    setGameState(prev => ({
      ...prev,
      score,
      isGuessSubmitted: true,
    }));
    setCountdown(3);
  };

  // Countdown effect before moving to the next location.
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      goToNextLocation();
      return;
    }

    

    const timer = setTimeout(() => {
      setCountdown(prev => (prev !== null ? prev - 1 : 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Zoom and pan handlers (with touch support)
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const delta = e.deltaY > 0 ? 1 - zoomSpeed : 1 + zoomSpeed;
    const newScale = Math.min(Math.max(0.25, transform.scale * delta), 3);
    const rect = mapContainerRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setTransform(prev => ({
      scale: newScale,
      offsetX: mouseX - (mouseX - prev.offsetX) * (newScale / prev.scale),
      offsetY: mouseY - (mouseY - prev.offsetY) * (newScale / prev.scale),
    }));
  };

  const startDragging = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({
      x: clientX - transform.offsetX,
      y: clientY - transform.offsetY,
    });
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    startDragging(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setTransform({
      ...transform,
      offsetX: e.clientX - dragStart.x,
      offsetY: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      startDragging(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    setTransform({
      ...transform,
      offsetX: e.touches[0].clientX - dragStart.x,
      offsetY: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Center the map view in the container on initial load.
  useEffect(() => {
    if (mapContainerRef.current) {
      const { width, height } = mapContainerRef.current.getBoundingClientRect();
      setTransform(prev => ({
        ...prev,
        offsetX: width / 2 - (ORIGINAL_WIDTH * prev.scale) / 2,
        offsetY: height / 2 - (ORIGINAL_HEIGHT * prev.scale) / 2,
      }));
    }
  }, []);

  // Initialize first round on mount if not loaded from saved state.
  useEffect(() => {
    if (gameState.currentRoundLocations.length === 0) {
      startNewRound();
    }
  }, []);

  // When the game is over, show a summary screen with the score and a Home button.
  if (gameState.gameOver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-white text-amber-900 p-6">
        <h1 className="text-4xl font-bold mb-4">Round Complete!</h1>
        <p className="text-xl mb-4">Your Score: {gameState.totalScore}</p>
        <button
          onClick={() => router.push('/lobby')}
          className="rounded-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-6 transition-all"
        >
          Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white text-amber-900 p-4">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <MapPin className="mr-2" />
          <h1 className="text-3xl font-bold">Bee Swarm GeoGuesser</h1>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-lg flex items-center">
            <Trophy className="mr-2" />
            <span className="font-semibold">High Score:</span> 
            <span className="ml-1">{gameState.highScore}</span>
          </div>
          <div className="text-lg">
            <span className="font-semibold">Total Score:</span> <span>{gameState.totalScore}</span>
          </div>
        </div>
      </header>
      <main className="flex flex-col lg:flex-row gap-6">
        {/* Map container */}
        <div 
          ref={mapContainerRef}
          className="relative bg-white border border-amber-200 rounded overflow-hidden flex-1 shadow-md"
          style={{ height: '600px', cursor: isDragging ? 'grabbing' : 'grab' }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleMapClick}
        >
          <div
            style={{
              width: ORIGINAL_WIDTH,
              height: ORIGINAL_HEIGHT,
              transform: `translate(${transform.offsetX}px, ${transform.offsetY}px) scale(${transform.scale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out'
            }}
          >
            <img 
              src="/BSSMap.png" 
              alt="Bee Swarm Map" 
              className="w-full h-full object-cover"
              draggable="false"
            />
            {/* SVG line for submitted guess */}
            {gameState.isGuessSubmitted && gameState.guess && (
              <svg
                className="absolute top-0 left-0 pointer-events-none"
                width={ORIGINAL_WIDTH}
                height={ORIGINAL_HEIGHT}
              >
                <line
                  x1={gameState.guess.x}
                  y1={gameState.guess.y}
                  x2={gameState.currentLocation!.coordinates.x}
                  y2={gameState.currentLocation!.coordinates.y}
                  stroke="#333"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="4 2"
                />
              </svg>
            )}
            {/* Marker for guess before submission */}
            {!gameState.isGuessSubmitted && gameState.guess && (
              <div
                style={{
                  left: `${gameState.guess.x}px`,
                  top: `${gameState.guess.y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
                className="absolute w-6 h-6 bg-red-500 rounded-full border border-white shadow"
              />
            )}
            {/* Markers for actual location and guess after submission */}
            {gameState.isGuessSubmitted && (
              <>
                <div
                  style={{
                    left: `${gameState.currentLocation!.coordinates.x}px`,
                    top: `${gameState.currentLocation!.coordinates.y}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className="absolute w-6 h-6 bg-green-500 rounded-full border border-white shadow"
                />
                {gameState.guess && (
                  <div
                    style={{
                      left: `${gameState.guess.x}px`,
                      top: `${gameState.guess.y}px`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    className="absolute w-6 h-6 bg-red-500 rounded-full border border-white shadow"
                  />
                )}
              </>
            )}
          </div>
        </div>
        {/* Info panel */}
        <div className="w-full lg:w-1/3 bg-white border border-amber-200 p-6 rounded shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Round {gameState.round} — Location {gameState.currentRoundIndex + 1} of {gameState.currentRoundLocations.length}
              </h2>
              <span className={`
                px-3 py-1 rounded text-sm font-bold 
                ${
                  gameState.currentLocation?.difficulty === 'Easy' ? 'bg-green-200' :
                  gameState.currentLocation?.difficulty === 'Medium' ? 'bg-yellow-200' :
                  gameState.currentLocation?.difficulty === 'Hard' ? 'bg-orange-200' :
                  'bg-indigo-400'
                }
              `}>
                {gameState.currentLocation?.difficulty}
              </span>
            </div>
            <p className="mb-4">
              Locate: <span className="font-semibold">{gameState.currentLocation?.name}</span>
            </p>
            {gameState.currentLocation?.image && (
              <div className="relative mb-4 h-48 flex items-center justify-center">
                <img 
                  src={gameState.currentLocation.image} 
                  alt={gameState.currentLocation.name} 
                  className="max-h-full object-contain rounded" 
                />
                {gameState.currentLocation?.hint && (
                  <div className="absolute bottom-2 left-2 bg-gray-700 text-white px-2 py-1 rounded">
                    {gameState.currentLocation.hint}
                  </div>
                )}
              </div>
            )}
            {!gameState.isGuessSubmitted && gameState.guess && (
              <button
                onClick={submitGuess}
                className="w-full bg-amber-500 hover:bg-amber-600 py-2 rounded text-white transition-all flex items-center justify-center"
              >
                <Target className="mr-2" /> Submit Guess
              </button>
            )}
            {gameState.isGuessSubmitted && (
              <div className="mt-4 space-y-2">
                <p className="text-xl flex justify-between">
                  <span>Round Score:</span> 
                  <span className="text-green-600">{gameState.score}</span>
                </p>
                {countdown !== null && (
                  <p className="text-sm text-gray-600">Next location in: {countdown}</p>
                )}
                {gameState.currentLocation?.description && (
                  <p className="text-sm text-gray-600">
                    {gameState.currentLocation.description}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="mt-6 text-sm text-center">
            {gameState.isGuessSubmitted ? "Guess submitted! Waiting..." : "Click or tap on the map to place your guess."}
          </div>
        </div>
      </main>
    </div>
  );
}
