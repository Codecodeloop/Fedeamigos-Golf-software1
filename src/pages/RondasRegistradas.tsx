"use client";

import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { useRondas } from "../context/RondasContext";
import { useNavigate } from "react-router-dom";

// Handicap difficulty per hole (1 = hardest, 18 = easiest)
const holeHandicaps = [
  5, 17, 15, 1, 13, 7, 9, 3, 11,
  18, 2, 14, 6, 12, 10, 8, 4, 16,
];

// Hole numbers 1 to 18
const holeNumbers = Array.from({ length: 18 }, (_, i) => i + 1);

// Correct par for each hole at Club Campestre de Bucaramanga
const holePars = [
  4, 3, 4, 5, 4, 4, 3, 5, 4,
  3, 4, 4, 5, 4, 4, 3, 5, 4,
];

// Helper to sum scores for holes in a range
const sumScores = (scores: (number | null)[], start: number, end: number) => {
  return scores
    .slice(start, end)
    .reduce((acc, val) => acc + (val ?? 0), 0);
};

// Calculate net score per hole based on rounded 75% handicap (integer) and hole handicaps
const calculateNetScores = (scores: (number | null)[], playerHandicap: number | null) => {
  if (playerHandicap === null || playerHandicap <= 0) {
    // No handicap, net score = gross score
    return scores.map((score) => (score !== null ? score : null));
  }

  // Calculate handicap al 75% and round according to rule
  const rawHandicap75 = playerHandicap * 0.75;
  const decimalPart = rawHandicap75 - Math.floor(rawHandicap75);
  const handicap75 =
    decimalPart <= 0.5 ? Math.floor(rawHandicap75) : Math.ceil(rawHandicap75);

  return scores.map((score, index) => {
    if (score === null) return null;
    const holeHandicap = holeHandicaps[index];
    let strokesToSubtract = 0;
    if (holeHandicap <= handicap75) {
      strokesToSubtract = 1;
    }
    const netScore = score - strokesToSubtract;
    return netScore > 0 ? netScore : 0;
  });
};

// Compare function for sorting ascending with tie detection
const sortWithTies = (players: { name: string; value: number }[]) => {
  players.sort((a, b) => a.value - b.value);
  // Group ties by value
  const groups: { value: number; players: string[] }[] = [];
  players.forEach(({ name, value }) => {
    const group = groups.find((g) => g.value === value);
    if (group) {
      group.players.push(name);
    } else {
      groups.push({ value, players: [name] });
    }
  });
  return groups;
};

// Distribute points with tie rules for 1st and 2nd place
const distributePoints = (
  groups: { value: number; players: string[] }[],
  firstPoints: number,
  secondPoints: number
) => {
  const pointsMap: Record<string, number> = {};

  if (groups.length === 0) return pointsMap;

  // First place group
  const firstGroup = groups[0];
  if (firstGroup.players.length > 1) {
    // Tie for first: sum first + second points and divide equally
    const totalPoints = firstPoints + secondPoints;
    const pointsPerPlayer = totalPoints / firstGroup.players.length;
    firstGroup.players.forEach((p) => {
      pointsMap[p] = pointsPerPlayer;
    });
    // No second place points awarded
  } else {
    // Single first place
    pointsMap[firstGroup.players[0]] = firstPoints;
    // Check second place
    if (groups.length > 1) {
      const secondGroup = groups[1];
      if (secondGroup.players.length > 1) {
        // Tie for second: divide secondPoints equally
        const pointsPerPlayer = secondPoints / secondGroup.players.length;
        secondGroup.players.forEach((p) => {
          pointsMap[p] = pointsPerPlayer;
        });
      } else {
        pointsMap[secondGroup.players[0]] = secondPoints;
      }
    }
  }

  return pointsMap;
};

type BetResults = {
  puntosPorHoyo: Record<string, number>;
  puntosBrutoTotal: Record<string, number>;
  puntosNetoPrimeros9: Record<string, number>;
  puntosNetoSegundos9: Record<string, number>;
  puntosNetoTotal: Record<string, number>;
  puntosBirdies: Record<string, number>;
};

const RondasRegistradas = () => {
  const { rounds } = useRondas();
  const navigate = useNavigate();

  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
  const [betResultsByRound, setBetResultsByRound] = useState<Record<number, BetResults | null>>({});

  const calcularApuestas = (roundId: number) => {
    const round = rounds.find((r) => r.id === roundId);
    if (!round) {
      alert("Ronda no encontrada");
      return;
    }

    // 1. Puntos por hoyo ganado (18 puntos)
    const puntosPorHoyo: Record<string, number> = {};
    for (let hoyo = 0; hoyo < 18; hoyo++) {
      const scoresHoyo = round.players.map((player) => {
        const netScores = calculateNetScores(player.scores, player.handicap);
        return { name: player.name, netScore: netScores[hoyo] ?? Infinity };
      });

      let desempateHoyo = hoyo;
      let ganadores: string[] = [];

      while (ganadores.length === 0) {
        const minNetScore = Math.min(
          ...scoresHoyo.map((s) => s.netScore === null ? Infinity : s.netScore)
        );
        ganadores = scoresHoyo
          .filter((s) => s.netScore === minNetScore)
          .map((s) => s.name);

        if (ganadores.length === 1) {
          break;
        } else {
          desempateHoyo = (desempateHoyo + 1) % 18;
          scoresHoyo.forEach((s) => {
            const player = round.players.find((p) => p.name === s.name);
            if (player) {
              const netScores = calculateNetScores(player.scores, player.handicap);
              s.netScore = netScores[desempateHoyo] ?? Infinity;
            }
          });
          ganadores = [];
        }
      }

      ganadores.forEach((g) => {
        puntosPorHoyo[g] = (puntosPorHoyo[g] ?? 0) + 1;
      });
    }

    // 2. Puntos por desempeño global (12 puntos)
    const brutoTotal = round.players.map((player) => {
      const total = sumScores(player.scores, 0, 18);
      return { name: player.name, value: total };
    });

    const netoPrimeros9 = round.players.map((player) => {
      const netScores = calculateNetScores(player.scores, player.handicap);
      const total = sumScores(netScores, 0, 9);
      return { name: player.name, value: total };
    });

    const netoSegundos9 = round.players.map((player) => {
      const netScores = calculateNetScores(player.scores, player.handicap);
      const total = sumScores(netScores, 9, 18);
      return { name: player.name, value: total };
    });

    const netoTotal = round.players.map((player) => {
      const netScores = calculateNetScores(player.scores, player.handicap);
      const total = sumScores(netScores, 0, 18);
      return { name: player.name, value: total };
    });

    const puntosBrutoTotal = distributePoints(sortWithTies(brutoTotal), 2, 0);
    const puntosNetoPrimeros9 = distributePoints(sortWithTies(netoPrimeros9), 2, 1);
    const puntosNetoSegundos9 = distributePoints(sortWithTies(netoSegundos9), 2, 1);
    const puntosNetoTotal = distributePoints(sortWithTies(netoTotal), 3, 1);

    // 3. Puntos por birdies (1 punto por birdie bruto)
    const puntosBirdies: Record<string, number> = {};
    round.players.forEach((player) => {
      let birdiesCount = 0;
      player.scores.forEach((score, i) => {
        if (score !== null && score === holePars[i] - 1) {
          birdiesCount++;
        }
      });
      if (birdiesCount > 0) {
        puntosBirdies[player.name] = birdiesCount;
      }
    });

    setBetResultsByRound((prev) => ({
      ...prev,
      [roundId]: {
        puntosPorHoyo,
        puntosBrutoTotal,
        puntosNetoPrimeros9,
        puntosNetoSegundos9,
        puntosNetoTotal,
        puntosBirdies,
      },
    }));
  };

  // Helper para mostrar puntos en tabla
  const renderPointsTable = (pointsMap: Record<string, number>, title: string) => {
    const entries = Object.entries(pointsMap);
    if (entries.length === 0) {
      return <p className="text-sm italic text-muted-foreground">No hay puntos asignados.</p>;
    }
    return (
      <table className="w-full border border-border text-sm mb-4">
        <thead>
          <tr className="bg-muted">
            <th className="border border-border px-2 py-1 text-left">{title}</th>
            <th className="border border-border px-2 py-1 text-right">Puntos</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([player, pts]) => (
            <tr key={player} className="odd:bg-background even:bg-muted/20">
              <td className="border border-border px-2 py-1">{player}</td>
              <td className="border border-border px-2 py-1 text-right">{pts.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Helper para colorear el score según la leyenda
  const getScoreColor = (score: number | null, par: number) => {
    if (score === null) return "bg-gray-100 text-gray-400";

    const diff = score - par;

    if (diff <= -2) return "bg-blue-900 text-white"; // Eagle
    if (diff === -1) return "bg-red-600 text-white"; // Birdie
    if (diff === 0) return "bg-white text-black"; // Par
    if (diff === 1) return "bg-green-700 text-white"; // Bogey
    if (diff === 2) return "bg-yellow-800 text-white"; // Double Bogey (usé amarillo oscuro)
    return "bg-blue-400 text-white"; // Other
  };

  return (
    <div className="min-h-screen p-6 bg-[#f9f7f1] text-[#1a1a1a] font-serif max-w-6xl mx-auto">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Rondas Registradas</h1>
        <div>
          <label htmlFor="round-select" className="mr-2 font-semibold">
            Seleccionar fecha de ronda:
          </label>
          <select
            id="round-select"
            className="border border-border rounded px-3 py-1"
            value={selectedRoundId ?? ""}
            onChange={(e) => setSelectedRoundId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">-- Seleccione una ronda --</option>
            {rounds.map((round) => (
              <option key={round.id} value={round.id}>
                {round.date}
              </option>
            ))}
          </select>
        </div>
      </header>

      {selectedRoundId === null ? (
        <p className="text-center text-muted-foreground">Por favor, selecciona una ronda para visualizar.</p>
      ) : (
        <>
          {(() => {
            const round = rounds.find((r) => r.id === selectedRoundId);
            if (!round) {
              return <p className="text-center text-red-600">Ronda no encontrada.</p>;
            }
            const betResults = betResultsByRound[round.id] ?? null;

            return (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Ronda del día: {round.date}</h2>
                  <Button size="sm" onClick={() => calcularApuestas(round.id)}>
                    Calcular Apuestas
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {round.players.map((player) => {
                    const netScores = calculateNetScores(player.scores, player.handicap);
                    const handicap75 = (() => {
                      if (player.handicap === null) return "-";
                      const rawHandicap75 = player.handicap * 0.75;
                      const decimalPart = rawHandicap75 - Math.floor(rawHandicap75);
                      return decimalPart <= 0.5
                        ? Math.floor(rawHandicap75)
                        : Math.ceil(rawHandicap75);
                    })();

                    return (
                      <div
                        key={player.name}
                        className="border border-border rounded p-4 bg-white shadow-sm"
                      >
                        <h3 className="text-xl font-semibold mb-2">{player.name}</h3>
                        <p>
                          <strong>Handicap:</strong>{" "}
                          {player.handicap !== null ? player.handicap.toFixed(1) : "-"}
                        </p>
                        <p>
                          <strong>Handicap al 75%:</strong> {handicap75}
                        </p>

                        {betResults && (
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2 text-lg">Resultados de Apuestas</h4>

                            <h5 className="font-semibold mt-2 mb-1">Puntos por Hoyo Ganado</h5>
                            <p>
                              {betResults.puntosPorHoyo[player.name]
                                ? betResults.puntosPorHoyo[player.name].toFixed(2)
                                : "0"}
                            </p>

                            <h5 className="font-semibold mt-2 mb-1">Puntos por Desempeño Global</h5>
                            <ul className="list-disc list-inside">
                              <li>
                                Score Bruto Total:{" "}
                                {betResults.puntosBrutoTotal[player.name]
                                  ? betResults.puntosBrutoTotal[player.name].toFixed(2)
                                  : "0"}
                              </li>
                              <li>
                                Score Neto Primeros 9 Hoyos:{" "}
                                {betResults.puntosNetoPrimeros9[player.name]
                                  ? betResults.puntosNetoPrimeros9[player.name].toFixed(2)
                                  : "0"}
                              </li>
                              <li>
                                Score Neto Segundos 9 Hoyos:{" "}
                                {betResults.puntosNetoSegundos9[player.name]
                                  ? betResults.puntosNetoSegundos9[player.name].toFixed(2)
                                  : "0"}
                              </li>
                              <li>
                                Score Neto Total 18 Hoyos:{" "}
                                {betResults.puntosNetoTotal[player.name]
                                  ? betResults.puntosNetoTotal[player.name].toFixed(2)
                                  : "0"}
                              </li>
                            </ul>

                            <h5 className="font-semibold mt-2 mb-1">Puntos por Birdies</h5>
                            <p>
                              {betResults.puntosBirdies[player.name]
                                ? betResults.puntosBirdies[player.name].toFixed(2)
                                : "0"}
                            </p>
                          </div>
                        )}

                        <div className="overflow-x-auto">
                          <table className="w-full border border-border text-center text-sm">
                            <thead>
                              <tr className="bg-muted border-b border-border">
                                <th className="border border-border px-2 py-1">Hoyo</th>
                                {holeNumbers.map((num) => (
                                  <th key={num} className="border border-border px-2 py-1">{num}</th>
                                ))}
                                <th className="border border-border px-2 py-1 font-bold">Total</th>
                              </tr>
                              <tr className="bg-muted border-b border-border">
                                <th className="border border-border px-2 py-1">Ventaja</th>
                                {holeHandicaps.map((handicap, i) => (
                                  <th key={i} className="border border-border px-2 py-1 font-mono text-purple-700">
                                    {handicap}
                                  </th>
                                ))}
                                <th className="border border-border px-2 py-1"></th>
                              </tr>
                              <tr className="bg-muted border-b border-border">
                                <th className="border border-border px-2 py-1">Par</th>
                                {holePars.map((par, i) => (
                                  <th key={i} className="border border-border px-2 py-1 font-mono">
                                    {par}
                                  </th>
                                ))}
                                <th className="border border-border px-2 py-1 font-bold">
                                  {holePars.reduce((a, b) => a + b, 0)}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-border px-2 py-1 font-semibold text-left">Score</td>
                                {player.scores.map((score, i) => {
                                  const par = holePars[i];
                                  const colorClass = getScoreColor(score, par);
                                  return (
                                    <td key={i} className={`border border-border px-2 py-1 font-mono ${colorClass}`}>
                                      {score !== null ? score : "-"}
                                    </td>
                                  );
                                })}
                                <td className="border border-border px-2 py-1 font-mono font-bold">
                                  {sumScores(player.scores, 0, 18)}
                                </td>
                              </tr>
                              <tr>
                                <td className="border border-border px-2 py-1 font-semibold text-left">Score Neto</td>
                                {netScores.map((score, i) => {
                                  const par = holePars[i];
                                  const colorClass = getScoreColor(score, par);
                                  return (
                                    <td key={i} className={`border border-border px-2 py-1 font-mono ${colorClass}`}>
                                      {score !== null ? score : "-"}
                                    </td>
                                  );
                                })}
                                <td className="border border-border px-2 py-1 font-mono font-bold">
                                  {sumScores(netScores, 0, 18)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </>
      )}

      <div className="pt-6 flex gap-2">
        <Button onClick={() => navigate("/registro-ronda")}>
          Volver a Registro de Ronda
        </Button>
        <Button onClick={() => navigate("/")} variant="secondary">
          Volver a Inicio
        </Button>
      </div>
    </div>
  );
};

export default RondasRegistradas;