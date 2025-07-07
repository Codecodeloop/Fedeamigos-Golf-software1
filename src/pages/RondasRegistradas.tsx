"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useRondas } from "../context/RondasContext";
import { useNavigate } from "react-router-dom";

const holeNumbers = Array.from({ length: 18 }, (_, i) => i + 1);

const RondasRegistradas = () => {
  const { rounds } = useRondas();
  const navigate = useNavigate();

  // Helper to sum scores for holes in a range
  const sumScores = (scores: (number | null)[], start: number, end: number) => {
    return scores
      .slice(start, end)
      .reduce((acc, val) => acc + (val ?? 0), 0);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rondas Registradas</CardTitle>
          <CardDescription>
            Lista de todas las rondas de golf registradas en esta sesión.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rounds.length === 0 ? (
            <p className="text-muted-foreground">No hay rondas registradas.</p>
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

                      return (
                        <Card key={player.name} className="p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-lg">{player.name}</h4>
                            <span className="text-sm text-muted-foreground">
                              Handicap: {player.handicap ?? "-"}
                            </span>
                          </div>

                          <table className="w-full table-fixed border border-border text-center text-sm">
                            <thead>
                              <tr className="bg-muted border-b border-border">
                                <th className="border border-border px-2 py-1">HOLES</th>
                                {holeNumbers.map((num) => (
                                  <th key={num} className="border border-border px-2 py-1">
                                    {num}
                                  </th>
                                ))}
                                <th className="border border-border px-2 py-1">OUT</th>
                                <th className="border border-border px-2 py-1">IN</th>
                                <th className="border border-border px-2 py-1">TOTAL</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-border px-2 py-1 font-semibold">SCORE</td>
                                {player.scores.map((score, i) => (
                                  <td key={i} className="border border-border px-2 py-1 font-mono">
                                    {score !== null ? score : "-"}
                                  </td>
                                ))}
                                <td className="border border-border px-2 py-1 font-mono">{outScore > 0 ? outScore : "-"}</td>
                                <td className="border border-border px-2 py-1 font-mono">{inScore > 0 ? inScore : "-"}</td>
                                <td className="border border-border px-2 py-1 font-mono">{totalScore > 0 ? totalScore : "-"}</td>
                              </tr>
                            </tbody>
                          </table>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="pt-6">
            <Button onClick={() => navigate("/registro-ronda")}>
              Volver a Registro de Ronda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RondasRegistradas;