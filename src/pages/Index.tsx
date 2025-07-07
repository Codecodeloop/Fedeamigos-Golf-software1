"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const Index = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Reglas básicas de apuestas de golf</CardTitle>
          <CardDescription>
            Estas son las reglas para las apuestas en el Club Campestre de Bucaramanga.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>El handicap se calcula como el promedio de scores menos 72 (par).</li>
            <li>Las apuestas se registran con el nombre del jugador y monto.</li>
            <li>Los resultados se actualizan manualmente en la sección de apuestas.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;