"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reglas de Juego y Apuestas – Grupo de Golf</CardTitle>
          <CardDescription>
            Detalle de las reglas para el sistema de apuestas y puntajes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <section>
            <h2 className="font-semibold text-base mb-2 flex items-center gap-2">
              🎯 Total de puntos a repartir
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>30 puntos fijos</li>
              <li>+1 punto adicional por cada birdie bruto (no neto)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2 flex items-center gap-2">
              ⛳ Reparto de los 30 puntos
            </h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-1 flex items-center gap-2 text-sm">
                  🟢 A. Puntos por hoyo ganado (18 puntos)
                </h3>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                  <li>Se reparte 1 punto por cada hoyo (total: 18 puntos).</li>
                  <li>
                    El ganador del hoyo es quien obtenga el score neto más bajo,
                    calculado como: <br />
                    <em>
                      Score neto = score bruto ajustado con el 75% del hándicap,
                      aplicando las ventajas del campo por hoyo (handicap rating).
                    </em>
                  </li>
                  <li>
                    <strong>Desempate por hoyo:</strong>
                    <ul className="list-disc list-inside ml-5 mt-1 space-y-1 text-xs text-muted-foreground">
                      <li>
                        Si hay empate en un hoyo, los jugadores empatados
                        desempatan con el score neto del hoyo siguiente.
                      </li>
                      <li>
                        Si sigue el empate, se continúa con los hoyos sucesivos.
                      </li>
                      <li>
                        Si el empate ocurre en el hoyo 18, se desempata con el
                        hoyo 1.
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-1 flex items-center gap-2 text-sm">
                  🟢 B. Puntos por desempeño global (12 puntos)
                </h3>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                  <li>
                    <strong>Score bruto total en 18 hoyos</strong> - Menor bruto →
                    2 puntos
                  </li>
                  <li>
                    <strong>Score neto en los primeros 9 hoyos</strong>
                    <ul className="list-disc list-inside ml-5 mt-1 space-y-1">
                      <li>Menor neto → 2 puntos</li>
                      <li>Segundo menor neto → 1 punto</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Score neto en los segundos 9 hoyos</strong>
                    <ul className="list-disc list-inside ml-5 mt-1 space-y-1">
                      <li>Menor neto → 2 puntos</li>
                      <li>Segundo menor neto → 1 punto</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Score neto total en 18 hoyos</strong>
                    <ul className="list-disc list-inside ml-5 mt-1 space-y-1">
                      <li>Menor neto → 3 puntos</li>
                      <li>Segundo menor neto → 1 punto</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2 flex items-center gap-2">
              3. 🤝 Empates en los 12 puntos de desempeño
            </h2>
            <p>
              • Si hay empate en primer lugar, se suman los puntos del primero y
              segundo lugar y se dividen equitativamente entre los empatados.
              <br />
              → No se otorgan puntos al segundo lugar.
              <br />
              • Si hay empate solo en segundo lugar, se divide el punto del
              segundo lugar entre los empatados.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2 flex items-center gap-2">
              4. 🟣 Puntos por birdies
            </h2>
            <p>
              • Cada birdie logrado con score bruto (1 golpe menos que el par del
              hoyo) suma +1 punto adicional individual.
              <br />
              • Birdies netos (por efecto del hándicap) no cuentan.
            </p>
          </section>

          <div className="pt-4">
            <Button onClick={() => navigate("/registro-ronda")}>
              Ir a Registro de Ronda de Golf
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;