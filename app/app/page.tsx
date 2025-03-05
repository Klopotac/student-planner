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
  difficulty: string;
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
];

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

export default function BeeSwarmGeoguesser() {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>({ scale: 1, offsetX: 0, offsetY: 0 });
  const [gameState, setGameState] = useState<GameState>({
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
  });

  useEffect(() => {
    const selected = shuffle(LOCATIONS).slice(0, Math.min(5, LOCATIONS.length));
    setGameState((prev) => ({
      ...prev,
      currentRoundLocations: selected,
      currentRoundIndex: 0,
      currentLocation: selected[0],
    }));
  }, []);

  const calculateDistance = (p1: Coordinates, p2: Coordinates): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const handleMapClick = (event: MouseEvent | TouchEvent) => {
    if (gameState.isGuessSubmitted || gameState.gameOver) return;
    const rect = mapContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ("clientX" in event ? event.clientX : event.touches[0].clientX) - rect.left - transform.offsetX;
    const y = ("clientY" in event ? event.clientY : event.touches[0].clientY) - rect.top - transform.offsetY;
    setGameState((prev) => ({ ...prev, guess: { x: Math.round(x), y: Math.round(y) } }));
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-4">
      <header className="mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <MapPin className="mr-2" />
          <h1 className="text-3xl font-bold">Bee Swarm GeoGuesser</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-lg flex items-center">
            <Trophy className="mr-2" /> High Score: {gameState.highScore}
          </div>
          <div className="text-lg">Total Score: {gameState.totalScore}</div>
        </div>
      </header>
      <main className="flex flex-col lg:flex-row gap-4">
        <div ref={mapContainerRef} className="relative bg-white border rounded overflow-hidden flex-1" onClick={handleMapClick}>
          <img src="/BSSMap.png" alt="Bee Swarm Map" className="w-full h-full object-cover" draggable="false" />
        </div>
      </main>
    </div>
  );
}
