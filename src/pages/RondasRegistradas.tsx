"use client";

import React, { useState, useEffect } from "react";
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

  // Distribute strokes per hole
  // If handicap75 <= 18, assign 1 stroke to holes with holeHandicap <= handicap75
  // If handicap75 > 18, assign 1 stroke to all holes, then assign extra strokes to holes with lowest handicap rating
  const strokesPerHole = new Array(18).fill(0);

  if (handicap75 <= 18) {
    for (let i = 0; i < 18; i++) {
      if (holeHandicaps[i] <= handicap75) {
        strokesPerHole[i] = 1;
      }
    }
  } else {
    // Assign 1 stroke to all holes
    for (let i = 0; i < 18; i++) {
      strokesPerHole[i] = 1;
    }
    // Assign extra strokes to holes with lowest handicap rating
    const extraStrokes = handicap75 - 18;

    // Sort holes by handicap rating ascending (lowest first)
    const holesSortedByHandicap = holeHandicaps
      .map((handicap, index) => ({ handicap, index }))
      .sort((a, b) => a.handicap - b.handicap);

    for (let i = 0; i < extraStrokes; i++) {
      const holeIndex = holesSortedByHandicap[i].index;
      strokesPerHole[holeIndex] += 1;
    }
  }

  // Calculate net scores subtracting strokes per hole
  return scores.map((score, index) => {
    if (score === null) return null;
    const netScore = score - strokesPerHole[index];
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

// Get second place players from groups
const getSecondPlacePlayers = (groups: { value: number; players: string[] }[]) => {
  if (groups.length < 2) return [];
  return groups[1].players;
};

type BetResults = {
  puntosPorHoyo: Record<string, number>;
  puntosBrutoTotal: Record<string, number>;
  puntosNetoPrimeros9: Record<string, number>;
  puntosNetoSegundos9: Record<string, number>;
  puntosNetoTotal: Record<string, number>;
  puntosBirdies: Record<string, number>;
  ganadoresPorHoyo: Record<number, string[]>; // hoyo index to winners
  ganadoresDesempeno: {
    brutoTotal: string[];
    netoPrimeros9: string[];
    netoSegundos9: string[];
    netoTotal: string[];
  };
  segundosMejoresDesempeno: {
    netoPrimeros9: string[];
    netoSegundos9: string[];
    netoTotal: string[];
  };
};

const RondasRegistradas = () => {
  const { rounds } = useRondas();
  const navigate = useNavigate();

  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
  const [betResultsByRound, setBetResultsByRound] = useState<Record<number, BetResults | null>>({});
  const [baseValueInput, setBaseValueInput] = useState<string>("");

  // Editable players state for the selected round
  const [editablePlayers, setEditablePlayers] = useState<
    { name: string; handicap: number | null; scores: (number | null)[] }[]
  >([]);

  // Update editablePlayers when selectedRoundId changes
  useEffect(() => {
    if (selectedRoundId === null) {
      setEditablePlayers([]);
      setBetResultsByRound({});
      return;
    }
    const round = rounds.find((r) => r.id === selectedRoundId);
    if (round) {
      // Deep copy players to editable state
      const playersCopy = round.players.map((p) => ({
        name: p.name,
        handicap: p.handicap,
        scores: p.scores.map((s) => s),
      }));
      setEditablePlayers(playersCopy);
      setBetResultsByRound({});
    }
  }, [selectedRoundId, rounds]);

  const calcularApuestas = (roundId: number) => {
    const round = rounds.find((r) => r.id === roundId);
    if (!round) {
      alert("Ronda no encontrada");
      return;
    }
    const baseValue = parseFloat(baseValueInput);
    if (isNaN(baseValue) || baseValue <= 0) {
      alert("Por favor ingresa un valor base válido mayor a 0.");
      return;
    }

    // Use editablePlayers for calculations
    const playersToUse = editablePlayers;

    // 1. Puntos por hoyo ganado (18 puntos)
    const puntosPorHoyo: Record<string, number> = {};
    const ganadoresPorHoyo: Record<number, string[]> = {};

    for (let hoyo = 0; hoyo < 18; hoyo++) {
      // Paso 1: obtener scores netos para el hoyo original
      const netScoresOriginalHoyo = playersToUse.map((player) => {
        const netScores = calculateNetScores(player.scores, player.handicap);
        return { name: player.name, netScore: netScores[hoyo] ?? Infinity };
      });

      // Encontrar score neto mínimo en el hoyo original
      const minNetScoreOriginal = Math.min(
        ...netScoresOriginalHoyo.map((s) => (s.netScore === null ? Infinity : s.netScore))
      );

      // Filtrar jugadores empatados en el hoyo original
      let empatados = netScoresOriginalHoyo
        .filter((s) => s.netScore === minNetScoreOriginal)
        .map((s) => s.name);

      // Si hay un solo ganador, asignar punto y continuar
      if (empatados.length === 1) {
        const ganador = empatados[0];
        puntosPorHoyo[ganador] = (puntosPorHoyo[ganador] ?? 0) + 1;
        ganadoresPorHoyo[hoyo + 1] = [ganador];
        continue;
      }

      // Si hay empate, desempatar recorriendo hoyos sucesivos
      let desempateHoyo = (hoyo + 1) % 18;
      let intentos = 0;
      let ganadorDesempate: string | null = null;

      while (intentos < 18) {
        // Calcular scores netos para el hoyo de desempate actual solo para jugadores empatados
        const scoresDesempate = playersToUse
          .filter((p) => empatados.includes(p.name))
          .map((player) => {
            const netScores = calculateNetScores(player.scores, player.handicap);
            return { name: player.name, netScore: netScores[desempateHoyo] ?? Infinity };
          });

        // Encontrar score neto mínimo en el hoyo de desempate
        const minNetScoreDesempate = Math.min(
          ...scoresDesempate.map((s) => (s.netScore === null ? Infinity : s.netScore))
        );

        // Filtrar jugadores empatados en el hoyo de desempate
        const empatadosDesempate = scoresDesempate
          .filter((s) => s.netScore === minNetScoreDesempate)
          .map((s) => s.name);

        if (empatadosDesempate.length === 1) {
          // Ganador único encontrado en desempate
          ganadorDesempate = empatadosDesempate[0];
          break;
        }

        // Si sigue empate, avanzar al siguiente hoyo
        desempateHoyo = (desempateHoyo + 1) % 18;
        intentos++;
      }

      if (ganadorDesempate) {
        // Asignar punto al ganador del desempate para el hoyo original
        puntosPorHoyo[ganadorDesempate] = (puntosPorHoyo[ganadorDesempate] ?? 0) + 1;
        ganadoresPorHoyo[hoyo + 1] = [ganadorDesempate];
      } else {
        // Si no se encontró ganador único tras 18 hoyos, asignar empate a todos los empatados originales
        empatados.forEach((jugador) => {
          puntosPorHoyo[jugador] = (puntosPorHoyo[jugador] ?? 0) + 1 / empatados.length;
        });
        ganadoresPorHoyo[hoyo + 1] = [...empatados];
      }
    }

    // 2. Puntos por desempeño global (12 puntos)
    const brutoTotal = playersToUse.map((player) => {
      const total = sumScores(player.scores, 0, 18);
      return { name: player.name, value: total };
    });

    const netoPrimeros9 = playersToUse.map((player) => {
      const netScores = calculateNetScores(player.scores, player.handicap);
      const total = sumScores(netScores, 0, 9);
      return { name: player.name, value: total };
    });

    const netoSegundos9 = playersToUse.map((player) => {
      const netScores = calculateNetScores(player.scores, player.handicap);
      const total = sumScores(netScores, 9, 18);
      return { name: player.name, value: total };
    });

    const netoTotal = playersToUse.map((player) => {
      const netScores = calculateNetScores(player.scores, player.handicap);
      const total = sumScores(netScores, 0, 18);
      return { name: player.name, value: total };
    });

    const puntosBrutoTotal = distributePoints(sortWithTies(brutoTotal), 2, 0);
    const puntosNetoPrimeros9 = distributePoints(sortWithTies(netoPrimeros9), 2, 1);
    const puntosNetoSegundos9 = distributePoints(sortWithTies(netoSegundos9), 2, 1);
    const puntosNetoTotal = distributePoints(sortWithTies(netoTotal), 3, 1);

    // Ganadores por desempeño global
    const ganadoresDesempeno = {
      brutoTotal: sortWithTies(brutoTotal)[0]?.players ?? [],
      netoPrimeros9: sortWithTies(netoPrimeros9)[0]?.players ?? [],
      netoSegundos9: sortWithTies(netoSegundos9)[0]?.players ?? [],
      netoTotal: sortWithTies(netoTotal)[0]?.players ?? [],
    };

    // Segundos mejores por desempeño neto
    const segundosMejoresDesempeno = {
      netoPrimeros9: getSecondPlacePlayers(sortWithTies(netoPrimeros9)),
      netoSegundos9: getSecondPlacePlayers(sortWithTies(netoSegundos9)),
      netoTotal: getSecondPlacePlayers(sortWithTies(netoTotal)),
    };

    // 3. Puntos por birdies (1 punto por birdie bruto)
    const puntosBirdies: Record<string, number> = {};
    let totalBirdiesPoints = 0;
    playersToUse.forEach((player) => {
      let birdiesCount = 0;
      player.scores.forEach((score, i) => {
        if (score !== null && score === holePars[i] - 1) {
          birdiesCount++;
        }
      });
      if (birdiesCount > 0) {
        puntosBirdies[player.name] = birdiesCount;
        totalBirdiesPoints += birdiesCount;
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
        ganadoresPorHoyo,
        ganadoresDesempeno,
        segundosMejoresDesempeno,
      },
    }));

    setTotalBirdies(totalBirdiesPoints);
  };

  // Estado para total de puntos por birdies
  const [totalBirdies, setTotalBirdies] = useState(0);

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

  // Calcular puntos totales sumando todas las categorías para cada jugador,
  // incluyendo a todos los jugadores aunque no tengan puntos (0)
  const calcularPuntosTotales = (betResults: BetResults, allPlayers: string[]) => {
    const totales: Record<string, number> = {};

    allPlayers.forEach((jugador) => {
      totales[jugador] =
        (betResults.puntosPorHoyo[jugador] ?? 0) +
        (betResults.puntosBrutoTotal[jugador] ?? 0) +
        (betResults.puntosNetoPrimeros9[jugador] ?? 0) +
        (betResults.puntosNetoSegundos9[jugador] ?? 0) +
        (betResults.puntosNetoTotal[jugador] ?? 0) +
        (betResults.puntosBirdies[jugador] ?? 0);
    });

    return totales;
  };

  // Formatear número con separadores de miles
  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Handle score change for editable players
  const handleScoreChange = (playerIndex: number, holeIndex: number, value: string) => {
    const scoreNum = parseInt(value);
    setEditablePlayers((prev) => {
      const newPlayers = [...prev];
      if (!isNaN(scoreNum) && scoreNum >= 0) {
        newPlayers[playerIndex].scores[holeIndex] = scoreNum;
      } else {
        newPlayers[playerIndex].scores[holeIndex] = null;
      }
      return newPlayers;
    });
  };

  // Handle handicap change for editable players
  const handleHandicapChange = (playerIndex: number, value: string) => {
    const handicapNum = parseFloat(value);
    setEditablePlayers((prev) => {
      const newPlayers = [...prev];
      if (!isNaN(handicapNum) && handicapNum >= 0) {
        newPlayers[playerIndex].handicap = handicapNum;
      } else {
        newPlayers[playerIndex].handicap = null;
      }
      return newPlayers;
    });
  };

  // Save changes to the selected round in local state (simulate update)
  const saveChanges = () => {
    if (selectedRoundId === null) return;
    // Update rounds state locally by replacing players for the selected round
    // (In real app, would update DB)
    // Here just update local editablePlayers and clear bet results to force recalculation
    setBetResultsByRound((prev) => ({
      ...prev,
      [selectedRoundId]: null,
    }));
    alert("Cambios guardados localmente. Por favor, recalcula las apuestas.");
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

      {selectedRoundId !== null && (
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <label htmlFor="baseValue" className="font-semibold">
            Valor base por jugador:
          </label>
          <input
            id="baseValue"
            type="number"
            min={0}
            step={0.01}
            value={baseValueInput}
            onChange={(e) => setBaseValueInput(e.target.value)}
            className="border border-border rounded px-3 py-1 w-32"
            placeholder="Ej: 10,000"
          />
          <Button onClick={() => selectedRoundId !== null && calcularApuestas(selectedRoundId)}>
            Calcular Apuestas
          </Button>
          <Button variant="secondary" onClick={saveChanges}>
            Guardar Cambios
          </Button>
        </div>
      )}

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

            const allPlayerNames = editablePlayers.map((p) => p.name);
            const baseValue = parseFloat(baseValueInput);
            const puntosTotales = betResults && !isNaN(baseValue) ? calcularPuntosTotales(betResults, allPlayerNames) : {};

            // Calcular valor total aportado por todos los jugadores
            const totalAportado = !isNaN(baseValue) && baseValue > 0 ? baseValue * allPlayerNames.length : 0;

            // Total de puntos a repartir: 30 fijos + puntos por birdies
            const totalPuntos = 30 + totalBirdies;

            // Valor del punto
            const valorDelPunto = totalPuntos > 0 ? totalAportado / totalPuntos : 0;

            return (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Ronda del día: {round.date}</h2>
                </div>

                {betResults && (
                  <section className="bg-white border border-border rounded p-4 shadow-sm">
                    <h3 className="text-xl font-semibold mb-4">Detalle de Puntos Ganados</h3>

                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Puntos por Hoyo Ganado</h4>
                      <ul className="list-disc list-inside max-h-48 overflow-y-auto border border-muted rounded p-2">
                        {Object.entries(betResults.ganadoresPorHoyo).map(([hoyo, ganadores]) => (
                          <li key={hoyo}>
                            <strong>Hoyo {hoyo}:</strong> {ganadores.join(", ")}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Ganadores por Desempeño Global</h4>
                      <ul className="list-disc list-inside">
                        <li>
                          <strong>Score Bruto Total:</strong> {betResults.ganadoresDesempeno.brutoTotal.join(", ")}
                        </li>
                        <li>
                          <strong>Score Neto Primeros 9 Hoyos:</strong> {betResults.ganadoresDesempeno.netoPrimeros9.join(", ")}
                        </li>
                        <li>
                          <strong>Segundo Mejor Neto Primeros 9 Hoyos:</strong> {betResults.segundosMejoresDesempeno.netoPrimeros9.join(", ")}
                        </li>
                        <li>
                          <strong>Score Neto Segundos 9 Hoyos:</strong> {betResults.ganadoresDesempeno.netoSegundos9.join(", ")}
                        </li>
                        <li>
                          <strong>Segundo Mejor Neto Segundos 9 Hoyos:</strong> {betResults.segundosMejoresDesempeno.netoSegundos9.join(", ")}
                        </li>
                        <li>
                          <strong>Score Neto Total 18 Hoyos:</strong> {betResults.ganadoresDesempeno.netoTotal.join(", ")}
                        </li>
                        <li>
                          <strong>Segundo Mejor Neto Total 18 Hoyos:</strong> {betResults.segundosMejoresDesempeno.netoTotal.join(", ")}
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Puntos por Birdies</h4>
                      {Object.keys(betResults.puntosBirdies).length === 0 ? (
                        <p>No hay puntos por birdies.</p>
                      ) : (
                        <ul className="list-disc list-inside">
                          {Object.entries(betResults.puntosBirdies).map(([player, puntos]) => (
                            <li key={player}>
                              {player}: {puntos.toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="mt-6 border-t border-border pt-4">
                      <h4 className="font-semibold mb-2">Resumen Total de Puntos y Dinero por Jugador</h4>
                      <p className="mb-2 text-sm text-muted-foreground">
                        Valor base por jugador: ${baseValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="mb-4 text-sm text-muted-foreground">
                        Total aportado por todos los jugadores: ${totalAportado.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="mb-4 text-sm text-muted-foreground">
                        Total de puntos a repartir (30 + birdies): {totalPuntos}
                      </p>
                      <p className="mb-4 text-sm text-muted-foreground font-semibold">
                        Valor del punto: ${valorDelPunto.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      {allPlayerNames.length === 0 ? (
                        <p>No hay jugadores registrados.</p>
                      ) : (
                        <ul className="list-disc list-inside">
                          {allPlayerNames.map((player) => {
                            const puntos = puntosTotales[player] ?? 0;
                            const dinero = puntos * valorDelPunto;
                            return (
                              <li key={player}>
                                {player}: {puntos.toFixed(2)} puntos - ${dinero.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </section>
                )}

                <div className="grid grid-cols-1 gap-6">
                  {editablePlayers.map((player, pIndex) => {
                    const netScores = calculateNetScores(player.scores, player.handicap);
                    const handicap75 = (() => {
                      if (player.handicap === null) return "-";
                      const rawHandicap75 = player.handicap * 0.75;
                      const decimalPart = rawHandicap75 - Math.floor(rawHandicap75);
                      return decimalPart <= 0.5
                        ? Math.floor(rawHandicap75)
                        : Math.ceil(rawHandicap75);
                    })();

                    const outTotal = sumScores(player.scores, 0, 9);
                    const inTotal = sumScores(player.scores, 9, 18);

                    const netOutTotal = sumScores(netScores, 0, 9);
                    const netInTotal = sumScores(netScores, 9, 18);

                    return (
                      <div
                        key={player.name}
                        className="border border-border rounded p-4 bg-white shadow-sm"
                      >
                        <h3 className="text-xl font-semibold mb-2">{player.name}</h3>
                        <div className="mb-2 flex items-center gap-4">
                          <label className="font-semibold" htmlFor={`handicap-${pIndex}`}>
                            Handicap:
                          </label>
                          <input
                            id={`handicap-${pIndex}`}
                            type="number"
                            min={0}
                            step={0.1}
                            value={player.handicap !== null ? player.handicap : ""}
                            onChange={(e) => handleHandicapChange(pIndex, e.target.value)}
                            className="border border-border rounded px-2 py-1 w-20"
                          />
                        </div>
                        <p>
                          <strong>Handicap al 75%:</strong> {handicap75}
                        </p>

                        <div className="overflow-x-auto mt-2">
                          <table className="w-full border border-border text-center text-sm">
                            <thead>
                              <tr className="bg-muted border-b border-border">
                                <th className="border border-border px-2 py-1">Hoyo</th>
                                {holeNumbers.slice(0, 9).map((num) => (
                                  <th key={num} className="border border-border px-2 py-1">{num}</th>
                                ))}
                                <th className="border border-border px-2 py-1 font-bold">OUT</th>
                                {holeNumbers.slice(9).map((num) => (
                                  <th key={num} className="border border-border px-2 py-1">{num}</th>
                                ))}
                                <th className="border border-border px-2 py-1 font-bold">IN</th>
                                <th className="border border-border px-2 py-1 font-bold">Total</th>
                              </tr>
                              <tr className="bg-muted border-b border-border">
                                <th className="border border-border px-2 py-1">Ventaja</th>
                                {holeHandicaps.slice(0, 9).map((handicap, i) => (
                                  <th key={i} className="border border-border px-2 py-1 font-mono text-purple-700">
                                    {handicap}
                                  </th>
                                ))}
                                <th className="border border-border px-2 py-1"></th>
                                {holeHandicaps.slice(9).map((handicap, i) => (
                                  <th key={i} className="border border-border px-2 py-1 font-mono text-purple-700">
                                    {handicap}
                                  </th>
                                ))}
                                <th className="border border-border px-2 py-1"></th>
                                <th className="border border-border px-2 py-1"></th>
                              </tr>
                              <tr className="bg-muted border-b border-border">
                                <th className="border border-border px-2 py-1">Par</th>
                                {holePars.slice(0, 9).map((par, i) => (
                                  <th key={i} className="border border-border px-2 py-1 font-mono">
                                    {par}
                                  </th>
                                ))}
                                <th className="border border-border px-2 py-1 font-bold">
                                  {holePars.slice(0, 9).reduce((a, b) => a + b, 0)}
                                </th>
                                {holePars.slice(9).map((par, i) => (
                                  <th key={i} className="border border-border px-2 py-1 font-mono">
                                    {par}
                                  </th>
                                ))}
                                <th className="border border-border px-2 py-1 font-bold">
                                  {holePars.slice(9).reduce((a, b) => a + b, 0)}
                                </th>
                                <th className="border border-border px-2 py-1 font-bold">
                                  {holePars.reduce((a, b) => a + b, 0)}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-border px-2 py-1 font-semibold text-left">Score Bruto</td>
                                {player.scores.slice(0, 9).map((score, i) => (
                                  <td key={i} className="border border-border px-2 py-1">
                                    <input
                                      type="number"
                                      min={0}
                                      value={score !== null ? score : ""}
                                      onChange={(e) => handleScoreChange(pIndex, i, e.target.value)}
                                      className="w-12 text-center p-1 border border-border rounded"
                                      placeholder="-"
                                    />
                                  </td>
                                ))}
                                <td className="border border-border px-2 py-1 font-bold">
                                  {outTotal}
                                </td>
                                {player.scores.slice(9).map((score, i) => (
                                  <td key={i} className="border border-border px-2 py-1">
                                    <input
                                      type="number"
                                      min={0}
                                      value={score !== null ? score : ""}
                                      onChange={(e) => handleScoreChange(pIndex, i + 9, e.target.value)}
                                      className="w-12 text-center p-1 border border-border rounded"
                                      placeholder="-"
                                    />
                                  </td>
                                ))}
                                <td className="border border-border px-2 py-1 font-bold">
                                  {inTotal}
                                </td>
                                <td className="border border-border px-2 py-1 font-bold">
                                  {sumScores(player.scores, 0, 18)}
                                </td>
                              </tr>
                              <tr>
                                <td className="border border-border px-2 py-1 font-semibold text-left">Score Neto</td>
                                {netScores.slice(0, 9).map((score, i) => {
                                  const par = holePars[i];
                                  const colorClass = getScoreColor(score, par);
                                  return (
                                    <td key={i} className={`border border-border px-2 py-1 font-mono ${colorClass}`}>
                                      {score !== null ? score : "-"}
                                    </td>
                                  );
                                })}
                                <td className="border border-border px-2 py-1 font-mono font-bold">
                                  {netOutTotal}
                                </td>
                                {netScores.slice(9).map((score, i) => {
                                  const par = holePars[i + 9];
                                  const colorClass = getScoreColor(score, par);
                                  return (
                                    <td key={i} className={`border border-border px-2 py-1 font-mono ${colorClass}`}>
                                      {score !== null ? score : "-"}
                                    </td>
                                  );
                                })}
                                <td className="border border-border px-2 py-1 font-mono font-bold">
                                  {netInTotal}
                                </td>
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