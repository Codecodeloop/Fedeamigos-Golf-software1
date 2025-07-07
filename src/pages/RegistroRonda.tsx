"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Player = {
  name: string;
  handicap: number | null;
  scores: (number | null)[];
};

// Updated hole handicaps as per user correction
const holeHandicaps = [
  5, 17, 15, 1, 13, 7, 9, 3, 1,
  18, 2, 14, 6, 12, 10, 8, 4, 16,
];

const RegistroRonda = () => {
  const [date, setDate] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerHandicap, setPlayerHandicap] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);

  const addPlayer = () => {
    const trimmedName = playerName.trim();
    if (!trimmedName) return;

    if (players.some((p) => p.name.toLowerCase() === trimmedName.toLowerCase())) {
      alert("El jugador ya está agregado.");
      return;
    }

    const handicapNum = parseFloat(playerHandicap);
    const handicap = !isNaN(handicapNum) && handicapNum >= 0 ? handicapNum : null;

    const newPlayer: Player = {
      name: trimmedName,
      handicap,
      scores: Array(18).fill(null),
    };

    setPlayers((prev) => [...prev, newPlayer]);
    setPlayerName("");
    setPlayerHandicap("");
  };

  const removePlayer = (name: string) => {
    setPlayers((prev) => prev.filter((p) => p.name !== name));
  };

  const updateScore = (playerIndex: number, holeIndex: number, value: string) => {
    const scoreNum = parseInt(value);
    setPlayers((prev) => {
      const newPlayers = [...prev];
      if (!isNaN(scoreNum) && scoreNum >= 0) {
        newPlayers[playerIndex].scores[holeIndex] = scoreNum;
      } else {
        newPlayers[playerIndex].scores[holeIndex] = null;
      }
      return newPlayers;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      alert("Por favor ingresa la fecha de la ronda.");
      return;
    }
    if (players.length === 0) {
      alert("Por favor agrega al menos un jugador.");
      return;
    }
    // For now just log the data
    console.log("Ronda registrada:", { date, players });
    alert("Ronda registrada correctamente.");
    setDate("");
    setPlayers([]);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Registro de Ronda de Golf</CardTitle>
          <CardDescription>
            Ingresa la información de la ronda, jugadores, handicap y scores por hoyo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="date">Fecha de la ronda</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="border rounded p-4">
              <h3 className="font-semibold mb-2">Agregar jugador</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <Label htmlFor="playerName">Nombre del jugador</Label>
                  <Input
                    id="playerName"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <Label htmlFor="playerHandicap">Handicap</Label>
                  <Input
                    id="playerHandicap"
                    type="number"
                    min={0}
                    step={0.1}
                    value={playerHandicap}
                    onChange={(e) => setPlayerHandicap(e.target.value)}
                    placeholder="Ej: 12.5"
                  />
                </div>
                <div>
                  <Button type="button" onClick={addPlayer} className="w-full">
                    Añadir jugador
                  </Button>
                </div>
              </div>
            </div>

            {players.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-2 text-left">Jugador</th>
                      <th className="border border-border p-2 text-left">Handicap</th>
                      {holeHandicaps.map((handicap, i) => (
                        <th key={i} className="border border-border p-2 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-semibold">{i + 1}</span>
                            <span className="text-xs text-muted-foreground">
                              {handicap}
                            </span>
                          </div>
                        </th>
                      ))}
                      <th className="border border-border p-2 text-center">Eliminar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player, pIndex) => (
                      <tr key={player.name} className="odd:bg-background even:bg-muted/20">
                        <td className="border border-border p-2">{player.name}</td>
                        <td className="border border-border p-2">{player.handicap ?? "-"}</td>
                        {player.scores.map((score, hIndex) => (
                          <td key={hIndex} className="border border-border p-1">
                            <Input
                              type="number"
                              min={0}
                              value={score !== null ? score : ""}
                              onChange={(e) =>
                                updateScore(pIndex, hIndex, e.target.value)
                              }
                              className="w-12 text-center p-1"
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td className="border border-border p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removePlayer(player.name)}
                            className="text-red-600 hover:text-red-800 font-bold"
                            aria-label={`Eliminar jugador ${player.name}`}
                          >
                            &times;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Button type="submit">Registrar Ronda</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistroRonda;