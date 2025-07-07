"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type Player = {
  name: string;
  handicap: number | null;
  scores: (number | null)[];
};

export type Round = {
  id: number;
  date: string;
  players: Player[];
};

type RondasContextType = {
  rounds: Round[];
  addRound: (round: Round) => void;
};

const RondasContext = createContext<RondasContextType | undefined>(undefined);

export const RondasProvider = ({ children }: { children: ReactNode }) => {
  const [rounds, setRounds] = useState<Round[]>([]);

  const addRound = (round: Round) => {
    setRounds((prev) => [round, ...prev]);
  };

  return (
    <RondasContext.Provider value={{ rounds, addRound }}>
      {children}
    </RondasContext.Provider>
  );
};

export const useRondas = () => {
  const context = useContext(RondasContext);
  if (!context) {
    throw new Error("useRondas must be used within a RondasProvider");
  }
  return context;
};