"use client";

import { useState, useRef, useEffect, MouseEvent, TouchEvent, WheelEvent } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Target, Trophy, Home } from "lucide-react";

const ORIGINAL_WIDTH = 3545;
const ORIGINAL_HEIGHT = 4413;

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

// 3 pre-selected locations for the demo, chosen to represent different difficulty levels
const DEMO_LOCATIONS: Location[] = [
  {
    name: "Gift Shop",
    coordinates: { x: 2951, y: 2700 },
    image: "/locations/gift.png",
    description: "The gift shop is where players can purchase souvenirs and game merchandise.",
    difficulty: "Easy",
    hint: "Look for the shopping area in the southern part of the map."
  },
  {
    name: "Score Board",
    coordinates: { x: 2389, y: 2459 },
    image: "/locations/panda.png",
    description: "The score board displays player rankings and achievements.",
    difficulty: "Medium",
    hint: "Find this near the central area of the map."
  },
  {
    name: "Sticker Path",
    coordinates: { x: 2524, y: 1763 },
    image: "/locations/sticker.png",
    description: "The sticker path is a popular route decorated with collectible stickers.",
    difficulty: "Hard",
    hint: "This is located in the northern section of the map."
  }
];

interface Transform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

interface GameState {
  currentLocations: Location[];
  currentLocationIndex: number;
  currentLocation: Location | null;
  guess: Coordinates | null;
  score: number | null;
  totalScore: number;
  isGuessSubmitted: boolean;
  gameOver: boolean;
}

export default function DemoGame() {
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

  const [gameState, setGameState] = useState<GameState>({
    currentLocations: DEMO_LOCATIONS,
    currentLocationIndex: 0,
    currentLocation: DEMO_LOCATIONS[0],
    guess: null,
    score: null,
    totalScore: 0,
    isGuessSubmitted: false,
    gameOver: false,
  });

  // Reset game state for a fresh demo session
  const resetGame = () => {
    setGameState({
      currentLocations: DEMO_LOCATIONS,
      currentLocationIndex: 0,
      currentLocation: DEMO_LOCATIONS[0],
      guess: null,
      score: null,
      totalScore: 0,
      isGuessSubmitted: false,
      gameOver: false,
    });
  };

  // Move to the next location or finish the game
  const goToNextLocation = () => {
    setGameState(prev => {
      const newTotalScore = prev.totalScore + (prev.score || 0);
      let newLocationIndex = prev.currentLocationIndex + 1;
      
      if (newLocationIndex >= prev.currentLocations.length) {
        return {
          ...prev,
          totalScore: newTotalScore,
          gameOver: true,
          currentLocation: null,
          guess: null,
          score: null,
        };
      } else {
        return {
          ...prev,
          currentLocationIndex: newLocationIndex,
          currentLocation: prev.currentLocations[newLocationIndex],
          guess: null,
          score: null,
          totalScore: newTotalScore,
          isGuessSubmitted: false,
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

  // Countdown effect before moving to the next location
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

  // Zoom and pan handlers
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

  // Center the map view in the container on initial load
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

  // When the game is over, show a summary screen with the score and navigation options
  if (gameState.gameOver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-900 p-4">
        <h1 className="text-4xl font-bold mb-4">Demo Complete!</h1>
        <p className="text-xl mb-2">Your Score: {gameState.totalScore}</p>
        <p className="text-md text-gray-600 mb-8 text-center max-w-md">
          That was just a taste of Bee Swarm GeoGuesser! The full game has many more locations and challenges.
        </p>
        <div className="flex gap-4">
          <button
            onClick={resetGame}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded flex items-center"
          >
            <Target className="mr-2" /> Play Again
          </button>
          <button
            onClick={() => router.push('/#pricing')}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center"
          >
            <Trophy className="mr-2" /> Get Pro
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded flex items-center"
          >
            <Home className="mr-2" /> Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-4">
      <header className="mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <MapPin className="mr-2" />
          <h1 className="text-3xl font-bold">Bee Swarm GeoGuesser Demo</h1>
        </div>
        <div className="flex items-center">
          <div className="text-lg">
            Score: <span>{gameState.totalScore}</span>
          </div>
        </div>
      </header>
      <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
        <p className="font-medium">Demo Mode</p>
        <p className="text-sm">This is a free demo with 3 locations. The full game offers 10+ locations and additional features.</p>
      </div>
      <main className="flex flex-col lg:flex-row gap-4">
        {/* Map container */}
        <div 
          ref={mapContainerRef}
          className="relative bg-white border rounded overflow-hidden flex-1"
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
                className="absolute w-6 h-6 bg-red-500 rounded-full border border-white"
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
                  className="absolute w-6 h-6 bg-green-500 rounded-full border border-white"
                />
                {gameState.guess && (
                  <div
                    style={{
                      left: `${gameState.guess.x}px`,
                      top: `${gameState.guess.y}px`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    className="absolute w-6 h-6 bg-red-500 rounded-full border border-white"
                  />
                )}
              </>
            )}
          </div>
        </div>
        {/* Info panel */}
        <div className="w-full lg:w-1/3 bg-white border p-6 rounded flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Location {gameState.currentLocationIndex + 1} of {gameState.currentLocations.length}
              </h2>
              <span className={`
                px-3 py-1 rounded text-sm font-bold 
                ${
                  gameState.currentLocation?.difficulty === 'Easy' ? 'bg-green-200' :
                  gameState.currentLocation?.difficulty === 'Medium' ? 'bg-yellow-200' :
                  gameState.currentLocation?.difficulty === 'Hard' ? 'bg-orange-200' :
                  'bg-red-200'
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
              </div>
            )}
            {gameState.currentLocation?.hint && (
              <div className="bg-blue-50 p-3 rounded mb-4 border border-blue-100">
                <p className="text-sm font-medium text-blue-800">Hint:</p>
                <p className="text-sm text-blue-700">{gameState.currentLocation.hint}</p>
              </div>
            )}
            {!gameState.isGuessSubmitted && gameState.guess && (
              <button
                onClick={submitGuess}
                className="w-full bg-blue-500 hover:bg-blue-600 py-2 rounded text-white transition flex items-center justify-center"
              >
                <Target className="mr-2" /> Submit Guess
              </button>
            )}
            {gameState.isGuessSubmitted && (
              <div className="mt-4 space-y-2">
                <p className="text-xl flex justify-between">
                  <span>Score:</span> 
                  <span className="text-green-600">{gameState.score}</span>
                </p>
                {countdown !== null && (
                  <p className="text-sm text-gray-600">Next location in: {countdown}</p>
                )}
                {gameState.currentLocation?.description && (
                  <p className="text-sm text-gray-600 mt-4">
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
      <footer className="mt-6 flex justify-between items-center">
        <button
          onClick={() => router.push('/')}
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded flex items-center"
        >
          <Home className="mr-2" /> Back to Home
        </button>
        <p className="text-sm text-gray-600">Demo Version | Get Pro for Full Access</p>
      </footer>
    </div>
  );
}