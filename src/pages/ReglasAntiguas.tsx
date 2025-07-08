"use client";

import React from "react";

const ReglasAntiguas = () => {
  return (
    <div className="min-h-screen p-6 bg-[#f9f7f1] text-[#1a1a1a] font-serif max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">🏌 REGLAS DE JUEGO Y APUESTAS – GRUPO DE GOLF</h1>
        <p className="text-gray-600">
          Reglas oficiales para la distribución de puntos y desempates en el grupo de golf.
        </p>
      </header>

      <section className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-2">1. 🎯 TOTAL DE PUNTOS A REPARTIR</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>30 puntos fijos</li>
            <li>+1 punto adicional por cada birdie bruto (no neto)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. ⛳ REPARTO DE LOS 30 PUNTOS</h2>
          <div className="pl-4 space-y-3">
            <div>
              <h3 className="font-semibold text-green-600 mb-1">🟢 A. PUNTOS POR HOYO GANADO (18 puntos)</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Se reparte 1 punto por cada hoyo (total: 18 puntos).</li>
                <li>
                  El ganador del hoyo es quien obtenga el score neto más bajo, calculado como: <br />
                  <em>Score neto = score bruto ajustado con el 75% del hándicap, aplicando las ventajas del campo por hoyo (handicap rating).</em>
                </li>
              </ul>
              <p className="mt-2 font-semibold">🔁 Desempate por hoyo:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Si hay empate en un hoyo, los jugadores empatados desempatan con el score neto del hoyo siguiente.
                </li>
                <li>
                  Si sigue el empate, se continúa con los hoyos sucesivos.
                </li>
                <li>
                  Si el empate ocurre en el hoyo 18, se desempata con el hoyo 1.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-green-600 mb-1">🟢 B. PUNTOS POR DESEMPEÑO GLOBAL (12 puntos)</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  <strong>Score bruto total en 18 hoyos</strong> - Menor bruto → 2 puntos
                </li>
                <li>
                  <strong>Score neto en los primeros 9 hoyos</strong> - Menor neto → 2 puntos, Segundo menor neto → 1 punto
                </li>
                <li>
                  <strong>Score neto en los segundos 9 hoyos</strong> - Menor neto → 2 puntos, Segundo menor neto → 1 punto
                </li>
                <li>
                  <strong>Score neto total en 18 hoyos</strong> - Menor neto → 3 puntos, Segundo menor neto → 1 punto
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. 🤝 EMPATES EN LOS 12 PUNTOS DE DESEMPEÑO</h2>
          <p>
            Si hay empate en primer lugar, se suman los puntos del primero y segundo lugar y se dividen equitativamente entre los empatados. <br />
            → No se otorgan puntos al segundo lugar. <br />
            Si hay empate solo en segundo lugar, se divide el punto del segundo lugar entre los empatados.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. 🟣 PUNTOS POR BIRDIES</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Cada birdie logrado con score bruto (1 golpe menos que el par del hoyo) suma +1 punto adicional individual.
            </li>
            <li>Birdies netos (por efecto del hándicap) no cuentan.</li>
          </ul>
        </section>
      </section>
    </div>
  );
};

export default ReglasAntiguas;