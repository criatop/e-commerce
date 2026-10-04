import { useState } from "react";

export function useColeccion<T>(clave: string) {
  const [datos, setDatos] = useState<T[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(clave) ?? "[]") as T[];
    } catch {
      return [];
    }
  });

  function guardar(nuevos: T[]) {
    localStorage.setItem(clave, JSON.stringify(nuevos));
    setDatos(nuevos);
  }

  return { datos, guardar };
}