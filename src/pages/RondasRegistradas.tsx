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

const RondasRegistradas = () => {
  const { rounds } = useRondas();
  const navigate = useNavigate();

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
      // For extra strokes, subtract an additional stroke on the easiest holes
      // The easiest holes are those with highest holeHandicap number
      // So if extraStrokes > 0, subtract 1 more stroke on holes with holeHandicap > (18 - extraStrokes)
      if (extraStrokes > 0 && holeHandicap > 18 - extraStrokes) {
        strokesToSubtract += 1;
      }
      const netScore = score - strokesToSubtract;
      return netScore > 0 ? netScore : 0;
    });
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
              <h3 className="font-semibold mb-6 text-xl border-b border-border pb-2">
                Fecha: {round.date}
              </h3>
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