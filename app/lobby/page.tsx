"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Game {
  score: number;
  locations: string[];
}

export default function Lobby() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [totalLocations, setTotalLocations] = useState<number>(0);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (session) {
      // Call API to check if the user has paid
      fetch("/api/checkAccess")
        .then((res) => res.json())
        .then((data) => {
          setHasAccess(data.hasAccess);
        })
        .catch((err) => {
          console.error("Error checking access:", err);
          setHasAccess(false);
        });
    }
  }, [session]);

  useEffect(() => {
    const savedGames: Game[] = JSON.parse(localStorage.getItem("games") || "[]");
    setGames(savedGames);

    const discoveredLocations = new Set<string>();
    savedGames.forEach((game) => {
      game.locations.forEach((loc) => discoveredLocations.add(loc));
    });
    setTotalLocations(discoveredLocations.size);
  }, []);

  const handlePlay = () => {
    if (!session) {
      router.push("/auth/signin"); // Redirect to sign in if not logged in
    } else if (hasAccess) {
      router.push("/app"); // Redirect to the game if they have access
    } else {
      router.push("/#pricing"); // Redirect to pricing if they haven't paid
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4">Game Lobby</h1>
      <p className="text-lg mb-2">Total Locations Discovered: {totalLocations}</p>
      
      <Button className="mb-4" onClick={handlePlay}>
        Play
      </Button>

      <h2 className="text-2xl font-semibold mt-6 mb-3">Previous Games</h2>
      <div className="w-full max-w-md space-y-3">
        {games.length === 0 ? (
          <p>No previous games found.</p>
        ) : (
          games.map((game, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex justify-between">
                <span>Score: {game.score}</span>
                <span>Locations: {game.locations.length}</span>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
