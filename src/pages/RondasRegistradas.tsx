"use client";

import React from "react";
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
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

// Calculate net score per hole based on player handicap and hole handicaps
const calculateNetScores = (scores: (number | null)[], playerHandicap: number | null) => {
  if (playerHandicap === null || playerHandicap <= 0) {
    // No handicap, net score = gross score
    return scores.map((score) => (score !== null ? score : null));
  }

  // Number of full strokes to subtract per hole
  const fullStrokes = Math.floor(playerHandicap);
  // Number of holes to subtract an extra stroke (for fractional handicap)
  const extraStrokes = Math.round((playerHandicap - fullStrokes) * 18);

  return scores.map((score, index) => {
    if (score === null) return null;
    const holeHandicap = holeHandicaps[index];
    let strokesToSubtract = 0;
    if (holeHandicap <= fullStrokes) {
      strokesToSubtract = 1;
    }
    if (extraStrokes > 0 && holeHandicap > 18 - extraStrokes) {
      strokesToSubtract += 1;
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

const RondasRegistradas = () => {
  const { rounds } = useRondas();
  const navigate = useNavigate();

  // Stub function for calculating bets for a round
  const calcularApuestas = (roundId: number) => {
    console.log("Botón Calcular Apuestas clickeado para ronda ID:", roundId);

    const round = rounds.find((r) => r.id === roundId);
    if (!round) {
      console.warn("Ronda no encontrada");
      return;
    }

    console.group(`Cálculo de apuestas para ronda: ${round.date}`);

    // 1. Puntos por hoyo ganado (18 puntos)
    // Para cada hoyo, determinar el score neto más bajo y asignar 1 punto a ese jugador
    // En caso de empate, desempatar con el siguiente hoyo, etc. (circular)
    const puntosPorHoyo: Record<string, number> = {};
    for (let hoyo = 0; hoyo < 18; hoyo++) {
      // Construir array de {name, netScore} para el hoyo
      const scoresHoyo = round.players.map((player) => {
        const netScores = calculateNetScores(player.scores, player.handicap);
        return { name: player.name, netScore: netScores[hoyo] ?? Infinity };
      });

      // Función para desempate circular
      let desempateHoyo = hoyo;
      let minNetScore = Infinity;
      let ganadores: string[] = [];

      while (ganadores.length === 0) {
        // Encontrar min net score en hoyo desempate
        minNetScore = Math.min(
          ...scoresHoyo.map((s) => s.netScore === null ? Infinity : s.netScore)
        );
        // Filtrar jugadores con ese min net score en hoyo desempate
        ganadores = scoresHoyo
          .filter((s) => s.netScore === minNetScore)
          .map((s) => s.name);

        if (ganadores.length === 1) {
          break; // Un solo ganador
        } else {
          // Empate, avanzar al siguiente hoyo (circular)
          desempateHoyo = (desempateHoyo + 1) % 18;
          // Actualizar netScores para desempate hoyo
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

      // Asignar 1 punto a ganador(es)
      ganadores.forEach((g) => {
        puntosPorHoyo[g] = (puntosPorHoyo[g] ?? 0) + 1;
      });
    }

    console.groupCollapsed("Puntos por hoyo ganado (18 puntos)");
    Object.entries(puntosPorHoyo).forEach(([player, pts]) => {
      console.log(`${player}: ${pts} puntos`);
    });
    console.groupEnd();

    // 2. Puntos por desempeño global (12 puntos)
    // Categorías:
    // a) Score bruto total en 18 hoyos - Menor bruto → 2 puntos
    // b) Score neto primeros 9 hoyos - Menor neto → 2 puntos, Segundo menor neto → 1 punto
    // c) Score neto segundos 9 hoyos - Menor neto → 2 puntos, Segundo menor neto → 1 punto
    // d) Score neto total 18 hoyos - Menor neto → 3 puntos, Segundo menor neto → 1 punto

    // Calcular valores para cada jugador
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

    // Distribuir puntos con reglas de empate
    const puntosBrutoTotal = distributePoints(sortWithTies(brutoTotal), 2, 0);
    const puntosNetoPrimeros9 = distributePoints(sortWithTies(netoPrimeros9), 2, 1);
    const puntosNetoSegundos9 = distributePoints(sortWithTies(netoSegundos9), 2, 1);
    const puntosNetoTotal = distributePoints(sortWithTies(netoTotal), 3, 1);

    // Mostrar resultados
    console.groupCollapsed("Puntos por desempeño global (12 puntos)");

    console.group("Score bruto total en 18 hoyos (2 puntos al menor)");
    Object.entries(puntosBrutoTotal).forEach(([player, pts]) => {
      console.log(`${player}: ${pts} puntos`);
    });
    console.groupEnd();

    console.group("Score neto primeros 9 hoyos (2 puntos al menor, 1 al segundo menor)");
    Object.entries(puntosNetoPrimeros9).forEach(([player, pts]) => {
      console.log(`${player}: ${pts} puntos`);
    });
    console.groupEnd();

    console.group("Score neto segundos 9 hoyos (2 puntos al menor, 1 al segundo menor)");
    Object.entries(puntosNetoSegundos9).forEach(([player, pts]) => {
      console.log(`${player}: ${pts} puntos`);
    });
    console.groupEnd();

    console.group("Score neto total en 18 hoyos (3 puntos al menor, 1 al segundo menor)");
    Object.entries(puntosNetoTotal).forEach(([player, pts]) => {
      console.log(`${player}: ${pts} puntos`);
    });
    console.groupEnd();

    console.groupEnd();

    // 3. Puntos por birdies (1 punto por birdie bruto)
    // Birdie bruto = score bruto 1 golpe menos que el par del hoyo
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

    console.groupCollapsed("Puntos por birdies (1 punto por birdie bruto)");
    Object.entries(puntosBirdies).forEach(([player, pts]) => {
      console.log(`${player}: ${pts} puntos`);
    });
    console.groupEnd();

    console.groupEnd();
  };

  return (
    <div className="min-h-screen p-6 bg-[#f9f7f1] text-[#1a1a1a] font-serif max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Rondas Registradas</h1>
        <p className="text-gray-600 mb-4">Lista de todas las rondas de golf registradas en esta sesión.</p>
      </header>

      {rounds.length === 0 ? (
        <p>No hay rondas registradas.</p>
      ) : (
        <div className="space-y-10">
          {rounds.map((round) => (
            <div key={round.id}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-xl border-b border-border pb-2">
                  Fecha: {round.date}
                </h3>
                <Button size="sm" onClick={() => calcularApuestas(round.id)}>
                  Calcular Apuestas
                </Button>
              </div>
              <div className="space-y-8">
                {round.players.map((player) => {
                  const outScore = sumScores(player.scores, 0, 9);
                  const inScore = sumScores(player.scores, 9, 18);
                  const totalScore = outScore + inScore;

                  const netScores = calculateNetScores(player.scores, player.handicap);
                  const outNet = sumScores(netScores, 0, 9);
                  const inNet = sumScores(netScores, 9, 18);
                  const totalNet = outNet + inNet;

                  const handicap75 = player.handicap !== null ? Math.round(player.handicap * 0.75) : null;

                  return (
                    <div key={player.name} className="p-4 border-b border-border last:border-none">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-lg">{player.name}</h4>
                        <span className="text-sm flex items-center gap-2">
                          Handicap: {player.handicap ?? "-"}
                          {handicap75 !== null && (
                            <span className="text-red-600 text-xs font-mono">
                              ({handicap75})
                            </span>
                          )}
                        </span>
                      </div>

                      <table className="w-full table-fixed border border-border text-center text-sm">
                        <thead>
                          <tr className="bg-muted border-b border-border">
                            <th className="border border-border px-3 py-1 text-left w-16">HOLES</th>
                            {holeNumbers.slice(0, 9).map((num) => (
                              <th key={num} className="border border-border px-2 py-1">
                                {num}
                              </th>
                            ))}
                            <th className="border border-border px-2 py-1 font-bold">OUT</th>
                            {holeNumbers.slice(9, 18).map((num) => (
                              <th key={num} className="border border-border px-2 py-1">
                                {num}
                              </th>
                            ))}
                            <th className="border border-border px-2 py-1 font-bold">IN</th>
                            <th className="border border-border px-2 py-1">TOTAL</th>
                          </tr>
                          <tr className="bg-muted border-b border-border">
                            <th className="border border-border px-3 py-1 text-left w-16 font-semibold">PAR</th>
                            {holePars.slice(0, 9).map((par, i) => (
                              <th key={i} className="border border-border px-2 py-1 font-mono">
                                {par}
                              </th>
                            ))}
                            <th className="border border-border px-2 py-1 font-bold">
                              {holePars.slice(0, 9).reduce((a, b) => a + b, 0)}
                            </th>
                            {holePars.slice(9, 18).map((par, i) => (
                              <th key={i + 9} className="border border-border px-2 py-1 font-mono">
                                {par}
                              </th>
                            ))}
                            <th className="border border-border px-2 py-1 font-bold">
                              {holePars.slice(9, 18).reduce((a, b) => a + b, 0)}
                            </th>
                            <th className="border border-border px-2 py-1 font-mono">
                              {holePars.reduce((a, b) => a + b, 0)}
                            </th>
                          </tr>
                          <tr className="bg-muted border-b border-border">
                            <th className="border border-border px-1 py-1 text-left w-16 font-semibold text-purple-700 text-xs leading-tight">VENTAJAS</th>
                            {holeHandicaps.slice(0, 9).map((handicap, i) => (
                              <th key={i} className="border border-border px-2 py-1 font-mono text-purple-700">
                                {handicap}
                              </th>
                            ))}
                            <th className="border border-border px-2 py-1"></th>
                            {holeHandicaps.slice(9, 18).map((handicap, i) => (
                              <th key={i + 9} className="border border-border px-2 py-1 font-mono text-purple-700">
                                {handicap}
                              </th>
                            ))}
                            <th className="border border-border px-2 py-1"></th>
                            <th className="border border-border px-2 py-1"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-border px-3 py-1 font-semibold text-left w-16">SCORE</td>
                            {player.scores.slice(0, 9).map((score, i) => (
                              <td key={i} className="border border-border px-2 py-1 font-mono">
                                {score !== null ? score : "-"}
                              </td>
                            ))}
                            <td className="border border-border px-2 py-1 font-mono font-bold">
                              {outScore > 0 ? outScore : "-"}
                            </td>
                            {player.scores.slice(9, 18).map((score, i) => (
                              <td key={i + 9} className="border border-border px-2 py-1 font-mono">
                                {score !== null ? score : "-"}
                              </td>
                            ))}
                            <td className="border border-border px-2 py-1 font-mono font-bold">
                              {inScore > 0 ? inScore : "-"}
                            </td>
                            <td className="border border-border px-2 py-1 font-mono">
                              {totalScore > 0 ? totalScore : "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-border px-3 py-1 font-semibold text-left w-16">NETO</td>
                            {netScores.slice(0, 9).map((score, i) => (
                              <td key={i} className="border border-border px-2 py-1 font-mono text-green-300">
                                {score !== null ? score : "-"}
                              </td>
                            ))}
                            <td className="border border-border px-2 py-1 font-mono font-bold text-green-300">
                              {outNet > 0 ? outNet : "-"}
                            </td>
                            {netScores.slice(9, 18).map((score, i) => (
                              <td key={i + 9} className="border border-border px-2 py-1 font-mono text-green-300">
                                {score !== null ? score : "-"}
                              </td>
                            ))}
                            <td className="border border-border px-2 py-1 font-mono font-bold text-green-300">
                              {inNet > 0 ? inNet : "-"}
                            </td>
                            <td className="border border-border px-2 py-1 font-mono text-green-300">
                              {totalNet > 0 ? totalNet : "-"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
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