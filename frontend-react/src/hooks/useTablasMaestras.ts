import { useColeccion } from "../storage/useColeccion";
import { CHIC_KEYS } from "../storage/claves";
import type { Categoria, Comuna, Region, Rol } from "../types";

export function useTablasMaestras() {
  const categorias = useColeccion<Categoria>(CHIC_KEYS.categorias);
  const regiones = useColeccion<Region>(CHIC_KEYS.regiones);
  const comunas = useColeccion<Comuna>(CHIC_KEYS.comunas);
  const roles = useColeccion<Rol>(CHIC_KEYS.roles);

  function nombreCategoria(id: number): string {
    return categorias.datos.find((c) => c.id === id)?.nombre ?? "";
  }

  function comunasDe(regionId: number): Comuna[] {
    return comunas.datos.filter((c) => c.regionId === regionId);
  }

  return { categorias, regiones, comunas, roles, nombreCategoria, comunasDe };
}
/Actua como una lista de referencia que no depende del usuario/