"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type Player = {
  id: number;
  name: string;
  email: string;
  handicap: number | null;
  scores: number[];
};

type Bet = {
  id: number;
  playerName: string;
  amount: number;
  description: string;
  result?: string;
};

const GolfAppMain = () => {
  // Players state
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [playerEmail, setPlayerEmail] = useState("");
  const [playerScores, setPlayerScores] = useState("");
  const [handicapResults, setHandicapResults] = useState<
    { playerId: number; handicap: number }[]
  >([]);

  // Bets state
  const [bets, setBets] = useState<Bet[]>([]);
  const [betPlayerName, setBetPlayerName] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [betDescription, setBetDescription] = useState("");

  // Results state (for simplicity, linked to bets)
  // Add new player
  const addPlayer = () => {
    if (!playerName.trim() || !playerEmail.trim()) return;
    const newPlayer: Player = {
      id: Date.now(),
      name: playerName.trim(),
      email: playerEmail.trim(),
      handicap: null,
      scores: [],
    };
    setPlayers((prev) => [...prev, newPlayer]);
    setPlayerName("");
    setPlayerEmail("");
    setPlayerScores("");
  };

  // Calculate handicap for a player based on scores input (comma separated)
  const calculateHandicap = (playerId: number, scoresInput: string) => {
    const scoresArray = scoresInput
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);

    if (scoresArray.length === 0) return;

    // Simple handicap calculation: average score minus 72 (par)
    const avgScore =
      scoresArray.reduce((acc, cur) => acc + cur, 0) / scoresArray.length;
    const handicap = Math.max(0, Math.round(avgScore - 72));

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId ? { ...p, handicap, scores: scoresArray } : p,
      ),
    );
  };

  // Add bet
  const addBet = () => {
    if (!betPlayerName.trim() || !betAmount.trim()) return;
    const amountNum = parseFloat(betAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const newBet: Bet = {
      id: Date.now(),
      playerName: betPlayerName.trim(),
      amount: amountNum,
      description: betDescription.trim(),
    };
    setBets((prev) => [...prev, newBet]);
    setBetPlayerName("");
    setBetAmount("");
    setBetDescription("");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      {/* Club Info and Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Club Campestre de Bucaramanga - Golf Betting App</CardTitle>
          <CardDescription>
            Bienvenido a la app de apuestas de golf. Aquí puedes registrar
            jugadores, calcular handicaps, gestionar apuestas y ver resultados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h2 className="text-lg font-semibold mb-2">Reglas básicas</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>El handicap se calcula como el promedio de scores menos 72 (par).</li>
            <li>Las apuestas se registran con el nombre del jugador y monto.</li>
            <li>Los resultados se actualizan manualmente en la sección de apuestas.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Player Registration */}
      <Card>
        <CardHeader>
          <CardTitle>Registrar Jugador</CardTitle>
          <CardDescription>Agrega un nuevo jugador al sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="playerName">Nombre</Label>
            <Input
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <Label htmlFor="playerEmail">Correo electrónico</Label>
            <Input
              id="playerEmail"
              type="email"
              value={playerEmail}
              onChange={(e) => setPlayerEmail(e.target.value)}
              placeholder="email@ejemplo.com"
            />
          </div>
          <Button onClick={addPlayer} className="mt-2">
            Agregar jugador
          </Button>
        </CardContent>
      </Card>

      {/* Handicap Calculation */}
      <Card>
        <CardHeader>
          <CardTitle>Cálculo de Handicap</CardTitle>
          <CardDescription>
            Ingresa los scores separados por coma para calcular el handicap
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {players.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay jugadores registrados.
            </p>
          )}
          {players.map((player) => (
            <div key={player.id} className="mb-4 border rounded p-4">
              <h3 className="font-semibold">{player.name}</h3>
              <p className="text-xs text-muted-foreground mb-1">
                Handicap actual:{" "}
                {player.handicap !== null ? player.handicap : "No calculado"}
              </p>
              <Input
                placeholder="Ejemplo: 70, 72, 74"
                value={player.scores.join(", ")}
                onChange={(e) =>
                  calculateHandicap(player.id, e.target.value)
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Bets Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Apuestas</CardTitle>
          <CardDescription>Agrega y visualiza apuestas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="betPlayerName">Nombre del jugador</Label>
            <Input
              id="betPlayerName"
              value={betPlayerName}
              onChange={(e) => setBetPlayerName(e.target.value)}
              placeholder="Nombre del jugador"
            />
          </div>
          <div>
            <Label htmlFor="betAmount">Monto de la apuesta</Label>
            <Input
              id="betAmount"
              type="number"
              min={0}
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Monto en USD"
            />
          </div>
          <div>
            <Label htmlFor="betDescription">Descripción</Label>
            <Textarea
              id="betDescription"
              value={betDescription}
              onChange={(e) => setBetDescription(e.target.value)}
              placeholder="Detalles de la apuesta"
              rows={2}
            />
          </div>
          <Button onClick={addBet} className="mt-2">
            Agregar apuesta
          </Button>

          {bets.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jugador</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Resultado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bets.map((bet) => (
                  <TableRow key={bet.id}>
                    <TableCell>{bet.playerName}</TableCell>
                    <TableCell>${bet.amount.toFixed(2)}</TableCell>
                    <TableCell>{bet.description}</TableCell>
                    <TableCell>{bet.result ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GolfAppMain;