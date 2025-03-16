"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Game {
  score: number;
  locations: string[];
}

interface Bee {
  initialX: number;
  initialY: number;
  opacity: number;
  animateX: number[];
  animateY: number[];
  duration: number;
}

export default function Lobby() {
  const [games, setGames] = useState<Game[]>([]);
  const [totalLocations, setTotalLocations] = useState<number>(0);
  const { data: session } = useSession();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [bees, setBees] = useState<Bee[]>([]);

  // Generate bees for the background animation
  useEffect(() => {
    if (typeof window !== "undefined") {
      const generateBees = (): Bee[] => {
        return Array.from({ length: 10 }, () => ({
          initialX: Math.random() * window.innerWidth,
          initialY: Math.random() * window.innerHeight,
          opacity: 0.6 + Math.random() * 0.4,
          animateX: [
            Math.random() * window.innerWidth,
            Math.random() * window.innerWidth,
            Math.random() * window.innerWidth,
          ],
          animateY: [
            Math.random() * window.innerHeight,
            Math.random() * window.innerHeight,
            Math.random() * window.innerHeight,
          ],
          duration: 15 + Math.random() * 20,
        }));
      };
      setBees(generateBees());
    }
  }, []);

  // Load saved games from localStorage
  useEffect(() => {
    const savedGames: Game[] = JSON.parse(localStorage.getItem("games") || "[]");
    setGames(savedGames);

    const discoveredLocations = new Set<string>();
    savedGames.forEach((game) => {
      game.locations.forEach((loc) => discoveredLocations.add(loc));
    });
    setTotalLocations(discoveredLocations.size);
  }, []);

  // Check access status if user is logged in
  useEffect(() => {
    if (session) {
      fetch("/api/checkAccess", { method: "GET" })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch access status");
          }
          return res.json();
        })
        .then((data) => {
          setHasAccess(data.hasAccess);
        })
        .catch((err) => {
          console.error("Error checking access:", err);
          setHasAccess(false);
        });
    }
  }, [session]);

  // Handle the Play button click
  const handlePlay = () => {
    if (!session) {
      router.push("/auth/signin");
    } else if (hasAccess) {
      router.push("/app");
    } else {
      router.push("/#pricing");
    }
  };

  // Animation variant for fading in and moving up
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white relative overflow-hidden">
      {/* Floating Bees Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {bees.map((bee, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full bg-amber-400"
            initial={{
              x: bee.initialX,
              y: bee.initialY,
              opacity: bee.opacity,
            }}
            animate={{
              x: bee.animateX,
              y: bee.animateY,
            }}
            transition={{
              duration: bee.duration,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Lobby Content */}
      <div className="relative z-10 flex flex-col items-center p-8 pt-16">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
          className="text-4xl font-bold tracking-tight text-amber-900 mb-6"
        >
          Game Lobby
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
          className="text-lg text-amber-800 mb-4"
        >
          Total Locations Discovered: {totalLocations}
        </motion.p>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
          className="mb-8"
        >
          <Button
            onClick={handlePlay}
            className="px-8 py-3 bg-amber-500 text-white rounded-full hover:bg-amber-400 transition-all"
          >
            Play
          </Button>
        </motion.div>

        <motion.h2
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
          className="text-2xl font-semibold text-amber-900 mb-4"
        >
          Previous Games
        </motion.h2>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
          className="w-full max-w-md space-y-4"
        >
          {games.length === 0 ? (
            <p className="text-amber-700">No previous games found.</p>
          ) : (
            games.map((game, index) => (
              <Card
                key={index}
                className="bg-amber-50 border border-amber-200 shadow-sm"
              >
                <CardContent className="p-4 flex justify-between">
                  <span className="text-amber-800">Score: {game.score}</span>
                  <span className="text-amber-800">
                    Locations: {game.locations.length}
                  </span>
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
