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

const holeHandicaps = [
  5, 17, 15, 1, 13, 7, 9, 3, 1,
  18, 2, 14, 6, 12, 10, 8, 4, 16,
];

const RondasRegistradas = () => {
  const { rounds } = useRondas();
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
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
            <div className="space-y-8">
              {rounds.map((round) => (
                <div key={round.id} className="border rounded p-4">
                  <h3 className="font-semibold mb-4 text-lg">Fecha: {round.date}</h3>
                  {round.players.map((player) => (
                    <div
                      key={player.name}
                      className="mb-6 border border-border rounded p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-base">{player.name}</h4>
                        <span className="text-sm text-muted-foreground">
                          Handicap: {player.handicap ?? "-"}
                        </span>
                      </div>

                      {/* Hole numbers and handicaps */}
                      <div className="grid grid-cols-18 text-center border-b border-border pb-1 mb-1 select-none">
                        {holeHandicaps.map((handicap, i) => (
                          <div key={i} className="text-xs font-semibold">
                            <div>{i + 1}</div>
                            <div className="text-red-600 text-[10px] font-mono">
                              {handicap}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Scores */}
                      <div className="grid grid-cols-18 text-center">
                        {player.scores.map((score, i) => (
                          <div key={i} className="text-sm font-mono">
                            {score !== null ? score : "-"}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          <div className="pt-4">
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