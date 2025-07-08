"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";

export type Player = {
  id?: number;
  name: string;
  handicap: number | null;
  scores: (number | null)[];
};

export type Round = {
  id?: number;
  date: string;
  players: Player[];
};

type RondasContextType = {
  rounds: Round[];
  addRound: (round: Round) => Promise<void>;
  loading: boolean;
};

const RondasContext = createContext<RondasContextType | undefined>(undefined);

export const RondasProvider = ({ children }: { children: ReactNode }) => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);

  // Load rounds from Supabase on mount
  useEffect(() => {
    const fetchRounds = async () => {
      setLoading(true);
      const { data: roundsData, error } = await supabase
        .from("rounds")
        .select("id, date, players(id, name, handicap, scores)")
        .order("date", { ascending: false });

      if (error) {
        console.error("Error loading rounds:", error);
        setLoading(false);
        return;
      }

      if (roundsData) {
        // Map data to Round[]
        const loadedRounds: Round[] = roundsData.map((r: any) => ({
          id: r.id,
          date: r.date,
          players: r.players.map((p: any) => ({
            id: p.id,
            name: p.name,
            handicap: p.handicap,
            scores: p.scores,
          })),
        }));
        setRounds(loadedRounds);
      }
      setLoading(false);
    };

    fetchRounds();
  }, []);

  // Add round and save to Supabase
  const addRound = async (round: Round) => {
    // Insert round
    const { data: roundData, error: roundError } = await supabase
      .from("rounds")
      .insert({ date: round.date })
      .select()
      .single();

    if (roundError || !roundData) {
      console.error("Error inserting round:", roundError);
      throw roundError;
    }

    // Insert players linked to round
    const playersToInsert = round.players.map((p) => ({
      round_id: roundData.id,
      name: p.name,
      handicap: p.handicap,
      scores: p.scores,
    }));

    const { error: playersError } = await supabase.from("players").insert(playersToInsert);

    if (playersError) {
      console.error("Error inserting players:", playersError);
      throw playersError;
    }

    // Update local state
    setRounds((prev) => [
      { ...round, id: roundData.id },
      ...prev,
    ]);
  };

  return (
    <RondasContext.Provider value={{ rounds, addRound, loading }}>
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