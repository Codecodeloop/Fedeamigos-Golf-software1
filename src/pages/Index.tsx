"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f7f1] px-4 text-center">
      <h1 className="text-6xl font-serif font-semibold leading-tight text-[#1a1a1a] mb-4 tracking-wide">
        FEDE VINO
      </h1>
      <p className="text-xl italic text-[#4a4a4a] mb-12 max-w-md">
        The Timeless Art of Vibe Coding
      </p>

      <div className="flex flex-col space-y-6 w-full max-w-xs">
        <Button
          variant="outline"
          className="text-lg font-serif"
          onClick={() => navigate("/")}
        >
          Reglas del Juego y Apuestas - Grupo de Golf
        </Button>
        <Button
          variant="outline"
          className="text-lg font-serif"
          onClick={() => navigate("/registro-ronda")}
        >
          Registro de Ronda de Golf
        </Button>
        <Button
          variant="outline"
          className="text-lg font-serif"
          onClick={() => navigate("/rondas-registradas")}
        >
          Ver Rondas de Golf Registradas
        </Button>
      </div>
    </div>
  );
};

export default Index;