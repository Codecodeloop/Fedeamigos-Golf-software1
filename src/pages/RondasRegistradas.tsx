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
                  <h3 className="font-semibold mb-2">Fecha: {round.date}</h3>
                  <table className="w-full border-collapse border border-border text-sm">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border p-2 text-left">Jugador</th>
                        <th className="border border-border p-2 text-left">Handicap</th>
                        <th className="border border-border p-2 text-left">Scores (18 hoyos)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {round.players.map((player) => (
                        <tr key={player.name} className="odd:bg-background even:bg-muted/20">
                          <td className="border border-border p-2">{player.name}</td>
                          <td className="border border-border p-2">{player.handicap ?? "-"}</td>
                          <td className="border border-border p-2">
                            {player.scores.map((score, i) =>
                              score !== null ? score : "-"
                            ).join(", ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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