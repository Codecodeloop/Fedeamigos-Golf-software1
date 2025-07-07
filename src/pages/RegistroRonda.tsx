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

const RegistroRonda = () => {
  const [date, setDate] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [players, setPlayers] = useState<string[]>([]);

  const addPlayer = () => {
    const trimmed = playerName.trim();
    if (trimmed && !players.includes(trimmed)) {
      setPlayers((prev) => [...prev, trimmed]);
      setPlayerName("");
    }
  };

  const removePlayer = (name: string) => {
    setPlayers((prev) => prev.filter((p) => p !== name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now just log the data
    console.log("Ronda registrada:", { date, players });
    alert("Ronda registrada correctamente.");
    setDate("");
    setPlayers([]);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Registro de Ronda de Golf</CardTitle>
          <CardDescription>
            Ingresa la información de la ronda para registrar jugadores y fecha.
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

            <div>
              <Label htmlFor="playerName">Nombre del jugador</Label>
              <div className="flex gap-2">
                <Input
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Agregar jugador"
                />
                <Button type="button" onClick={addPlayer}>
                  Añadir
                </Button>
              </div>
              {players.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
                  {players.map((p) => (
                    <li key={p} className="flex justify-between items-center">
                      <span>{p}</span>
                      <button
                        type="button"
                        onClick={() => removePlayer(p)}
                        className="text-red-500 hover:text-red-700 ml-2"
                        aria-label={`Eliminar jugador ${p}`}
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button type="submit">Registrar Ronda</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistroRonda;